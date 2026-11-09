import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { apiRequest } from '../../lib/api.ts';
import { NotificationItem } from '../../types/index.ts';
import {
  Bell,
  Database,
  Users,
  HardDrive,
  Sun,
  Moon,
  MapPin
} from 'lucide-react';
import { NavTab } from './Sidebar.tsx';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenRoleSwitcher: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Amloda Panchayat Executive Dashboard', subtitle: 'Real-time overview of village development projects, funds, and citizen welfare' },
  campaigns: { title: 'Village Development Projects & Kanban', subtitle: 'RO clean water plant, solar street lights, school lab, and road works' },
  volunteers: { title: 'Gram Sevaks & Village Roster', subtitle: 'Panchayat members, ward representatives, and local youth volunteers' },
  surveys: { title: 'Amloda Citizen Surveys & Feedback', subtitle: 'Household tap water timing, health center readiness, and road feedback' },
  events: { title: 'Gram Sabha & Village Assemblies', subtitle: 'Open citizen assemblies, free health checkup camps, and kisan melas' },
  units: { title: 'Amloda Ward & Committee Structure', subtitle: 'Gram Panchayat Secretariat, 12 Wards, Water, and Sanitation committees' },
  geography: { title: 'Amloda Village & Ward Map', subtitle: 'Interactive 12-ward territorial map, chaupal square, canal, and farmlands' },
  finances: { title: 'Panchayat Treasury & Expense Audit', subtitle: '15th Finance Commission grants, Jal Jeevan water fund, and expense claims' },
  announcements: { title: 'Amloda Village Announcements', subtitle: 'Official Panchayat notices, water supply timings, and health camp dates' },
  'ai-assist': { title: 'Local AI Administrative Intelligence', subtitle: 'Offline synthesis of Amloda household surveys and village task bottlenecks' },
  reports: { title: 'Gram Vikas Reports & CSV Exports', subtitle: 'Download village project registers, volunteer rosters, and treasury ledgers' },
  'audit-logs': { title: 'Panchayat Security Audit Trail', subtitle: 'Immutable local log of development approvals, logins, and council actions' }
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenRoleSwitcher
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await apiRequest<NotificationItem[]>('/api/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (e) {
      // offline silent
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/api/notifications/read-all', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'info');
    } catch (e) {
      showToast('Failed to update notifications', 'error');
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      // ignore
    }
  };

  const tabInfo = TAB_TITLES[currentTab] || { title: 'Amloda Village Portal', subtitle: 'Gram Panchayat Operations' };

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-1.5 py-0.2 rounded font-mono">
            AMLODA
          </span>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            {tabInfo.title}
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
          {tabInfo.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Village Ward & Local Engine Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
          <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Amloda SQLite Connected</span>
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Quick Role Switcher Button */}
        <button
          onClick={onOpenRoleSwitcher}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Role:</span>
          <span className="text-blue-600 dark:text-blue-400 truncate max-w-[140px]">{user?.role}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Panchayat Notices</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-1.5 py-0.2 rounded font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkOneRead(n.id)}
                      className={`pt-2 pb-1.5 px-2.5 rounded-lg cursor-pointer transition-colors ${
                        n.is_read
                          ? 'opacity-70 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          : 'bg-blue-50/60 dark:bg-slate-800/70 hover:bg-blue-100/60 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${n.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-blue-800 dark:text-blue-300'}`}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

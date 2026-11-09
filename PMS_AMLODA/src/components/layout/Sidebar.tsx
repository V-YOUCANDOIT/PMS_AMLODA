import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Flag,
  Users,
  ClipboardList,
  CalendarDays,
  Building2,
  MapPin,
  CircleDollarSign,
  Megaphone,
  Bot,
  FileSpreadsheet,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'campaigns'
  | 'volunteers'
  | 'surveys'
  | 'events'
  | 'units'
  | 'geography'
  | 'finances'
  | 'announcements'
  | 'ai-assist'
  | 'reports'
  | 'audit-logs';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenRoleSwitcher: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onOpenRoleSwitcher
}) => {
  const { user, logout, isSuperAdmin } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.FC<any>; badge?: string; superAdminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Panchayat Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Village Projects & Tasks', icon: Flag },
    { id: 'volunteers', label: 'Gram Sevaks & Roster', icon: Users },
    { id: 'surveys', label: 'Villager Surveys', icon: ClipboardList },
    { id: 'events', label: 'Gram Sabha & Camps', icon: CalendarDays },
    { id: 'units', label: 'Wards & Committees', icon: Building2 },
    { id: 'geography', label: 'Amloda Ward Map', icon: MapPin },
    { id: 'finances', label: 'Treasury & Expenses', icon: CircleDollarSign },
    { id: 'announcements', label: 'Village Notices', icon: Megaphone },
    { id: 'ai-assist', label: 'Local AI Assistant', icon: Bot, badge: 'Offline' },
    { id: 'reports', label: 'Panchayat Reports', icon: FileSpreadsheet },
    { id: 'audit-logs', label: 'Security Audit', icon: ShieldAlert, superAdminOnly: true }
  ];

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 select-none z-30 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                अ
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white font-sans text-sm block leading-none">
                  AMLODA
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">
                  Gram Panchayat
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              अ
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Active Role Indicator */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Logged-In Profile</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.full_name}</p>
                <span className="inline-block mt-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 px-1.5 py-0.2 rounded truncate max-w-full">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={onOpenRoleSwitcher}
                title="Switch test role"
                className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenRoleSwitcher}
              title={`Switch role (${user?.role})`}
              className="w-8 h-8 mx-auto rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 text-slate-600 dark:text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
          {navItems.map((item) => {
            if (item.superAdminOnly && !isSuperAdmin) return null;
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer group relative ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`} />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-bold ${
                    isActive ? 'bg-blue-800 text-blue-100' : 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

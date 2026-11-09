import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { AMLODA_IMAGES, AMLODA_VILLAGE_INFO } from '../../assets/amlodaAssets.ts';
import {
  Users,
  Flag,
  CalendarDays,
  ClipboardList,
  Building2,
  CircleDollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  Droplet,
  Sun,
  BookOpen
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardStats {
  metrics: {
    totalMembers: number;
    activeVolunteers: number;
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    upcomingEvents: number;
    totalSurveys: number;
    totalResponses: number;
    totalUnits: number;
    pendingTasks: number;
    totalApprovedExpenditure: number;
    totalAllocatedBudget: number;
    pendingApprovalsCount: number;
  };
  charts: {
    campaignBudgets: { id: string; title: string; budget_allocated: number; spent: number }[];
    taskStats: { status: string; count: number }[];
    eventStats: { month: string; count: number }[];
  };
  recentActivities: {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details: string;
    created_at: string;
    user_name: string;
  }[];
  nextEvents: {
    id: string;
    title: string;
    category: string;
    date_time: string;
    venue: string;
    expected_attendance: number;
  }[];
  pendingExpenses: {
    id: string;
    title: string;
    amount: number;
    category: string;
    transaction_date: string;
    submitter_name: string;
    campaign_title: string;
  }[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export const DashboardView: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { user, canManageFinances } = useAuth();
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<DashboardStats>('/api/dashboard/stats');
      setData(res);
    } catch (e: any) {
      showToast(e.message || 'Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickApproveExpense = async (id: string, title: string) => {
    try {
      await apiRequest(`/api/expenses/${id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Approved', approval_notes: 'Approved via Amloda Executive Dashboard' })
      });
      showToast(`Expense "${title}" approved successfully`, 'success');
      fetchStats();
    } catch (e: any) {
      showToast(e.message || 'Approval failed', 'error');
    }
  };

  const handleQuickRejectExpense = async (id: string, title: string) => {
    try {
      await apiRequest(`/api/expenses/${id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Rejected', approval_notes: 'Rejected via Amloda Executive Dashboard' })
      });
      showToast(`Expense "${title}" rejected`, 'warning');
      fetchStats();
    } catch (e: any) {
      showToast(e.message || 'Rejection failed', 'error');
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading Amloda Village SQLite analytics...</p>
        </div>
      </div>
    );
  }

  const m = data?.metrics || {
    totalMembers: 0,
    activeVolunteers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    upcomingEvents: 0,
    totalSurveys: 0,
    totalResponses: 0,
    totalUnits: 0,
    pendingTasks: 0,
    totalApprovedExpenditure: 0,
    totalAllocatedBudget: 0,
    pendingApprovalsCount: 0
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Amloda Village Hero Banner Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Photo banner */}
          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-[260px]">
            <img
              src={AMLODA_IMAGES.hero}
              alt="Amloda Village"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-600 w-fit mb-1.5 shadow">
                Village Spotlight
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">Amloda (अमलोदा)</h3>
              <p className="text-xs text-slate-200 mt-0.5">
                Gram Panchayat · 12 Wards · 820 Households · 4,850 Residents
              </p>
            </div>
          </div>

          {/* Welcome and key village info */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {user?.role}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Gram Panchayat Amloda Central Secretariat</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Namaste, {user?.full_name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                Welcome to the Amloda village development console. Track community water filtration, solar street lighting across all 12 wards, Gram Sabha resolutions, and village treasury outlays.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Sarpanch:</span>
                <span>Rameshwar Prasad Sharma</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-medium">Active Assembly Period</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('campaigns')}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Village Projects</span>
                </button>
                <button
                  onClick={() => onNavigate('geography')}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Ward Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Amloda Village Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Council & Volunteers</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{m.totalMembers}</p>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>●</span> {m.activeVolunteers} active gram sevaks
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vikas Projects</span>
            <Flag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{m.totalCampaigns}</p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
            {m.activeCampaigns} ongoing · {m.completedCampaigns} done
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Upcoming Events</span>
            <CalendarDays className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{m.upcomingEvents}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Gram Sabha & Camps</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Villager Feedback</span>
            <ClipboardList className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{m.totalResponses}</p>
          <p className="text-[10px] text-cyan-700 dark:text-cyan-400 mt-1 font-medium">
            Across {m.totalSurveys} village surveys
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Panchayat Wards</span>
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">12 Wards</p>
          <p className="text-[10px] text-purple-700 dark:text-purple-400 mt-1 font-medium">{m.totalUnits} local committees</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sanctioned Spend</span>
            <CircleDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            ₹{(m.totalApprovedExpenditure / 1000).toFixed(1)}k
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            of ₹{(m.totalAllocatedBudget / 1000).toFixed(1)}k grant
          </p>
        </div>
      </div>

      {/* Visual Cards Row: Amloda Photos & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Panchayat Bhavan Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col sm:flex-row">
          <div className="sm:w-48 h-36 sm:h-auto shrink-0 relative">
            <img
              src={AMLODA_IMAGES.panchayatBhavan}
              alt="Gram Panchayat Bhavan Amloda"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute top-2 left-2 text-[10px] bg-slate-900/80 text-white px-2 py-0.5 rounded font-medium">
              Ward 6 Chaupal
            </span>
          </div>
          <div className="p-4 flex flex-col justify-between space-y-2 flex-1">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Gram Panchayat Community Center</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Headquarters for citizen registrations, notice board updates, village resolution meetings, and public grievance listening hours.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Next Meeting: <strong>May 10 (Gram Sabha)</strong></span>
              <button
                onClick={() => onNavigate('events')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                View Details →
              </button>
            </div>
          </div>
        </div>

        {/* Water Canal & RO Facility Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col sm:flex-row">
          <div className="sm:w-48 h-36 sm:h-auto shrink-0 relative">
            <img
              src={AMLODA_IMAGES.waterCanal}
              alt="Amloda Irrigation Canal & Water Reservoir"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute top-2 left-2 text-[10px] bg-slate-900/80 text-white px-2 py-0.5 rounded font-medium">
              Canal Road Reservoir
            </span>
          </div>
          <div className="p-4 flex flex-col justify-between space-y-2 flex-1">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">5,000L Community RO Clean Water Plant</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Supplying safe drinking water to 820 households across all 12 wards with pressurized pipeline extensions and automated RFID card dispensing.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">TDS: 110 ppm (Lab Certified)</span>
              <button
                onClick={() => onNavigate('campaigns')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                Track Project →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Budgets & Spend (Bar Chart) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Amloda Project Budget vs. Expenditure
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sanctioned grant vs actual disbursements</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded font-semibold">
              Audited in SQLite
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.charts.campaignBudgets.map(c => ({
                  name: c.title.length > 22 ? c.title.substring(0, 20) + '...' : c.title,
                  Allocated: c.budget_allocated,
                  Spent: c.spent
                }))}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: isDark ? '#ffffff' : '#0f172a'
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
                />
                <Bar dataKey="Allocated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Sanctioned Allocation</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Disbursed Expenditure</span>
          </div>
        </div>

        {/* Task Status Distribution (Donut Chart) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Village Tasks Pipeline
              </h3>
              <span className="text-xs font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {m.pendingTasks} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Ward works & civil execution</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.charts.taskStats}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {data?.charts.taskStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {data?.charts.taskStats.map((item, idx) => (
              <div key={item.status} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {item.status}
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Pending Expense Approvals & Recent Audit Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Financial Approvals */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Pending Panchayat Expense Approvals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Claims awaiting Sarpanch / Secretary review</p>
            </div>
            <button
              onClick={() => onNavigate('finances')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(!data?.pendingExpenses || data.pendingExpenses.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                Zero pending expense claims. All accounts reconciled.
              </div>
            ) : (
              data.pendingExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{exp.title}</span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">
                        {exp.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Submitted by <strong className="text-slate-700 dark:text-slate-300">{exp.submitter_name}</strong> · {exp.campaign_title || 'General Fund'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      ₹{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>

                    {canManageFinances ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickApproveExpense(exp.id, exp.title)}
                          title="Approve expense"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleQuickRejectExpense(exp.id, exp.title)}
                          title="Reject expense"
                          className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-red-50 text-slate-700 dark:text-slate-300 hover:text-red-600 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded font-medium">
                        Pending Sarpanch
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Recent Village Activities
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Immutable SQLite audit records</p>
            </div>
            <button
              onClick={() => onNavigate('audit-logs')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Full Log</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {data?.recentActivities.map((act) => (
              <div key={act.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{act.action.replace('_', ' ')}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{act.user_name || 'Sarpanch Engine'}</span> on {act.entity_type}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

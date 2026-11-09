import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { ShieldCheck, Lock, Mail, Users, ArrowRight, Database, KeyRound, HardDrive, MapPin, Sun, Moon } from 'lucide-react';
import { UserRole } from '../../types/index.ts';
import { AMLODA_IMAGES, AMLODA_VILLAGE_INFO } from '../../assets/amlodaAssets.ts';

interface DemoAccount {
  email: string;
  name: string;
  villageRole: string;
  role: UserRole;
  desc: string;
  badgeColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'superadmin@politix.org',
    name: 'Rameshwar Prasad Sharma',
    villageRole: 'Sarpanch (ग्राम प्रधान / सरपंच)',
    role: 'Super Administrator',
    desc: 'Executive head of Amloda Gram Panchayat, oversees council approvals & village development funds',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
  },
  {
    email: 'centraladmin@politix.org',
    name: 'Sunita Devi Gurjar',
    villageRole: 'Up-Sarpanch (उप-सरपंच)',
    role: 'Central Administrator',
    desc: 'Panchayat secretariat, inter-ward resource allocations, and development scheme verifications',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800'
  },
  {
    email: 'statecoord@politix.org',
    name: 'Rajesh Meena',
    villageRole: 'Block Development Officer (BDO)',
    role: 'State Coordinator',
    desc: 'Liaison with district administration, connects state rural welfare schemes to Amloda village',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
  },
  {
    email: 'districtcoord@politix.org',
    name: 'Dr. Mahendra Choudhary',
    villageRole: 'Health & Sanitation Incharge',
    role: 'District Coordinator',
    desc: 'Directs Amloda Sub-Center medical staff, sanitation drives, and free health checkup camps',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
  },
  {
    email: 'constituency@politix.org',
    name: 'Rekha Bai',
    villageRole: 'Ward 3 Panch (वार्ड प्रतिनिधि)',
    role: 'Constituency Manager',
    desc: 'Leads Mahila Mandal and door-to-door household feedback on tap water and street lights',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800'
  },
  {
    email: 'campaignmgr@politix.org',
    name: 'Vikram Singh Shekhawat',
    villageRole: 'Water & Solar Project Director',
    role: 'Campaign Manager',
    desc: 'Lead for Amloda 5000L RO Clean Drinking Water plant and 120 Solar Street Lights installation',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800'
  },
  {
    email: 'volunteer@politix.org',
    name: 'Pooja Saini',
    villageRole: 'Gram Vikas Sevak (ग्राम सेवक)',
    role: 'Volunteer / Ground Worker',
    desc: 'Ground worker executing survey distribution, water token registry, and Gram Sabha staging',
    badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
  }
];

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('superadmin@politix.org');
  const [password, setPassword] = useState('politix2026');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast(`Welcome to Gram POLITIX Amloda! Signed in successfully.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error', 'Authentication Error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword('politix2026');
    setLoading(true);
    try {
      await login(demoEmail, 'politix2026');
      showToast(`Signed in as ${roleName}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Quick login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Top Navbar with Theme Toggle */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
            अ
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">POLITIX AMLODA</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5">ग्राम पंचायत अमलोदा</span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm flex items-center gap-2 text-xs font-medium cursor-pointer"
          title="Toggle light / dark theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
        </button>
      </div>

      {/* Village Banner Card with Photo */}
      <div className="max-w-5xl mx-auto w-full mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Photo side */}
          <div className="md:col-span-5 relative h-52 md:h-auto min-h-[200px]">
            <img
              src={AMLODA_IMAGES.hero}
              alt="Amloda Village Landscape"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-end p-4">
              <div className="text-white">
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-600/90 px-2 py-0.5 rounded-full inline-block mb-1">
                  Verified Local Panchayat
                </span>
                <p className="text-sm font-bold">Amloda (अमलोदा), Rural Jurisdiction</p>
                <p className="text-[11px] text-slate-200">12 Wards · 820 Households · 4,850 Citizens</p>
              </div>
            </div>
          </div>

          {/* Description side */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Gram Panchayat Amloda Governance & Campaign Operations</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Amloda Village Operations Portal
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Centralized platform managing village development schemes, the 5,000L community RO drinking water project, 120 solar street light installations, Gram Sabha assembly resolutions, and ward volunteer rosters.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                100% Local SQLite Database
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Bcrypt Salted & Encrypted
              </span>
              <span>Zero Cloud Dependency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Login & Demo Grid */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side: Login Form */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Panchayat Portal Access
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Log in to manage Amloda village campaigns, water supply, and ward tasks.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Roster Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="sarpanch@amloda.org"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Default password: <code className="text-blue-700 dark:text-blue-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">politix2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Amloda Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
              <Database className="w-3.5 h-3.5" />
              SQLite DB Active
            </span>
            <span>Bcrypt Hashed</span>
          </div>
        </div>

        {/* Right Side: Amloda Village Leadership & Role Testing Cards */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Amloda Village Council & Demonstration Logins
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any role card below to test village governance and role-based clearance:
              </p>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded font-semibold shrink-0">
              7 Amloda Roles
            </span>
          </div>

          <div className="space-y-2 mt-3 max-h-[460px] overflow-y-auto pr-1">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleQuickDemo(acc.email, acc.name)}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{acc.name}</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">({acc.villageRole})</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{acc.desc}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${acc.badgeColor}`}>
                      {acc.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{acc.email}</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white border border-slate-200 dark:border-slate-700 group-hover:border-transparent flex items-center justify-center transition-colors shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        POLITIX Amloda Edition • Gram Panchayat Amloda (अमलोदा) • 100% Local On-Premises
      </div>
    </div>
  );
};

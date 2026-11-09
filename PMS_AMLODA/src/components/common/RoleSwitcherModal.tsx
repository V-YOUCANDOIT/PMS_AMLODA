import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { X, Check, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RoleCard {
  role: UserRole;
  email: string;
  name: string;
  description: string;
  keyPermissions: string[];
}

const ROLES_LIST: RoleCard[] = [
  {
    role: 'Super Administrator',
    email: 'superadmin@politix.org',
    name: 'Rameshwar Prasad Sharma (Sarpanch)',
    description: 'Amloda Gram Panchayat Head. Complete executive control over all 12 village wards, audits, budgets, and resolutions.',
    keyPermissions: ['All Permissions', 'Panchayat Audit Trail', 'Ward Administration', 'Gram Fund Allocations']
  },
  {
    role: 'Central Administrator',
    email: 'centraladmin@politix.org',
    name: 'Sunita Devi Gurjar (Up-Sarpanch)',
    description: 'Vice President of Amloda Panchayat. Approves infrastructure vouchers, oversees ward committees, and reviews schemes.',
    keyPermissions: ['Voucher Sign-off', 'Village Campaigns', 'Ward Allocations', 'Panchayat Metrics']
  },
  {
    role: 'State Coordinator',
    email: 'statecoord@politix.org',
    name: 'Bal Mukund Meena (BDO Liaison)',
    description: 'Amloda Block Development Officer liaison. Coordinates state rural development grants, Jal Jeevan Mission, and PMGSY roads.',
    keyPermissions: ['Block Scheme Oversight', 'District Unit Coordination', 'Gram Sabha Records', 'Grant Requisitions']
  },
  {
    role: 'District Coordinator',
    email: 'districtcoord@politix.org',
    name: 'Harish Chandra Verma (Secretary)',
    description: 'Amloda Panchayat Secretary (Sachiv). Mobilizes ward field workers, tracks citizen grievances, and logs registrations.',
    keyPermissions: ['Ward Field Management', 'Volunteer Mobilization', 'Voter/Resident Records', 'Public Works Logs']
  },
  {
    role: 'Constituency Manager',
    email: 'constituency@politix.org',
    name: 'Kailash Meena (Ward 4 Panch)',
    description: 'Ward 4 Senior Panch & Citizen Forum Lead. Conducts door-to-door water quality surveys, farmer meets, and village sabhas.',
    keyPermissions: ['Ward Household Surveys', 'Panchayat Sabhas', 'Farmer Consultations', 'Grievance Redressal']
  },
  {
    role: 'Campaign Manager',
    email: 'campaignmgr@politix.org',
    name: 'Vikram Singh Shekhawat',
    description: 'Director of Amloda RO Clean Water Project & Solar Streetlight Campaign. Manages Kanban task board and contractor logistics.',
    keyPermissions: ['Kanban Board Control', 'Campaign Budget Claims', 'Milestone Delivery', 'Civil Works Procurement']
  },
  {
    role: 'Volunteer / Ground Worker',
    email: 'volunteer@politix.org',
    name: 'Pooja Choudhary',
    description: 'Amloda Yuva volunteer & ASHA facilitator. Manages medical checkup camp registrations and door-to-door health survey checklists.',
    keyPermissions: ['Execute Ward Tasks', 'Camp Logistics Support', 'Survey Collection', 'Resident Assistance']
  }
];

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { user, quickSwitchUser } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSelectRole = async (email: string, roleName: string) => {
    try {
      await quickSwitchUser(email);
      showToast(`Switched active profile to ${roleName}`, 'success');
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Failed to switch profile', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Switch Amloda Leadership Role</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Instantly switch between Panchayat governance roles to test permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800/40">
          {ROLES_LIST.map((r) => {
            const isCurrent = user?.role === r.role;
            return (
              <div
                key={r.email}
                onClick={() => handleSelectRole(r.email, r.role)}
                className={`pt-3 first:pt-0 p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                  isCurrent
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500/80 dark:border-blue-600/80 shadow-sm'
                    : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{r.role}</span>
                    <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">({r.name})</span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-0.2 rounded-full inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">{r.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.keyPermissions.map((perm) => (
                      <span
                        key={perm}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700/60"
                      >
                        ✓ {perm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 mt-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Local SQLite authentication & password <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">politix2026</code>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

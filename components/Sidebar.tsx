'use client';
import React from 'react';
import {
  DashboardIcon,
  StudentsIcon,
  FeeIcon,
  LedgerIcon,
  DefaulterIcon,
  FacultyIcon,
  ExpenseIcon,
  BotIcon,
  LockIcon,
  UnlockIcon,
} from './Icons';
import { InstitutionMode, UserRole, CollegeTenant } from '../lib/types';

export type NavTab = 
  | 'dashboard'
  | 'receptionist_counter'
  | 'students'
  | 'ledger'
  | 'defaulters'
  | 'fee_collection'
  | 'fee_structure'
  | 'faculty'
  | 'expenses'
  | 'llm_copilot'
  | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  institutionMode: InstitutionMode;
  defaultersCount: number;
  userRole?: UserRole;
  college?: CollegeTenant;
  isPrincipalUnlocked?: boolean;
  onRequestPrincipalUnlock?: (targetTab?: NavTab, tabLabel?: string) => void;
  onLockPrincipal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onBackToSaas?: () => void;
  onLogout?: () => void;
}

const DEFAULT_FALLBACK_COLLEGE: CollegeTenant = {
  id: 'college_hchs_kht',
  code: 'HCHS-KHT',
  name: 'Harmain College of Health Sciences',
  city: 'Kahuta',
  tagline: 'Teaching Hospital & Health Sciences Academy',
  recognizedBy: 'Affiliated with UHS & PMDC Recognized',
};

export default function Sidebar({
  currentTab,
  onTabChange,
  institutionMode,
  defaultersCount,
  userRole = 'PRINCIPAL',
  college,
  isPrincipalUnlocked = false,
  onRequestPrincipalUnlock,
  onLockPrincipal,
  isMobileOpen = false,
  onCloseMobile,
  onBackToSaas,
  onLogout,
}: SidebarProps) {
  const safeCollege = college || DEFAULT_FALLBACK_COLLEGE;
  const safeRole = userRole || 'PRINCIPAL';

  const allNavItems: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
    roles: UserRole[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: <DashboardIcon className="w-4 h-4" />,
      roles: ['PRINCIPAL'],
    },
    {
      id: 'receptionist_counter',
      label: 'Fee Counter Terminal',
      icon: <FeeIcon className="w-4 h-4" />,
      roles: ['RECEPTIONIST'],
    },
    {
      id: 'students',
      label: 'Students Directory (100)',
      icon: <StudentsIcon className="w-4 h-4" />,
      roles: ['PRINCIPAL', 'RECEPTIONIST'],
    },
    {
      id: 'ledger',
      label: '2-Year Fee Ledger (24 Mo)',
      icon: <LedgerIcon className="w-4 h-4" />,
      roles: ['PRINCIPAL', 'RECEPTIONIST'],
    },
    {
      id: 'defaulters',
      label: 'Defaulters & Missed Dues',
      icon: <DefaulterIcon className="w-4 h-4" />,
      badge: defaultersCount,
      badgeColor: 'bg-rose-500 text-white',
      roles: ['PRINCIPAL', 'RECEPTIONIST'],
    },
    {
      id: 'fee_collection',
      label: 'Receive Fee / Counter',
      icon: <FeeIcon className="w-4 h-4" />,
      roles: ['PRINCIPAL', 'RECEPTIONIST'],
    },
    {
      id: 'faculty',
      label: 'Faculty & Staff Payroll',
      icon: <FacultyIcon className="w-4 h-4" />,
      roles: ['PRINCIPAL'], // RESTRICTED: Hidden from Receptionist
    },
    {
      id: 'expenses',
      label: 'Campus & Lab Expenses',
      icon: <ExpenseIcon className="w-4 h-4" />,
      roles: ['PRINCIPAL'], // RESTRICTED: Hidden from Receptionist
    },
    {
      id: 'fee_structure',
      label: 'Fee Structures & Policy',
      icon: <FeeIcon className="w-4 h-4" />,
      roles: ['PRINCIPAL'],
    },
    {
      id: 'llm_copilot',
      label: 'Campus LLM AI Assistant',
      icon: <BotIcon className="w-4 h-4" />,
      badge: 'AI Active',
      badgeColor: 'bg-cyan-600 text-white',
      roles: ['PRINCIPAL', 'RECEPTIONIST'],
    },
  ];

  const principalOnlyItemIds: NavTab[] = ['dashboard', 'faculty', 'expenses', 'fee_structure'];
  const isPrincipalItem = (id: NavTab) => principalOnlyItemIds.includes(id);

  const handleItemClick = (item: { id: NavTab; label: string; roles: UserRole[] }) => {
    if (isPrincipalItem(item.id) && !isPrincipalUnlocked) {
      onRequestPrincipalUnlock?.(item.id, item.label);
    } else {
      onTabChange(item.id);
      onCloseMobile?.();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Dynamic Multi-College Branding Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-teal-900/40">
            {(safeCollege.code || 'HCHS').split('-')[0]}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-black text-sm tracking-wide text-white leading-tight truncate uppercase" title={safeCollege.name}>
              {safeCollege.name || 'Medical College'}
            </h1>
            <p className="text-[11px] text-teal-400 font-semibold">{safeCollege.city || 'Main'} Campus</p>
          </div>
        </div>
        <div className="mt-2 text-[10px] font-semibold text-slate-400 truncate" title={safeCollege.recognizedBy}>
          🏛️ {safeCollege.recognizedBy || 'PMDC Recognized'}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
        {/* Counter / Receptionist Common Menu */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Front-Desk & Academic Menu</span>
            <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono">Open</span>
          </div>

          {allNavItems
            .filter((item) => !isPrincipalItem(item.id))
            .map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-md shadow-teal-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-teal-200' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </div>

        {/* Principal Executive Section (Locked when !isPrincipalUnlocked) */}
        <div className="space-y-1 pt-2 border-t border-slate-900">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
            <span className={isPrincipalUnlocked ? 'text-teal-400' : 'text-amber-400'}>
              👑 Principal Executive
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                isPrincipalUnlocked
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-800/40'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
              }`}
            >
              {isPrincipalUnlocked ? (
                <>
                  <UnlockIcon className="w-2.5 h-2.5 text-teal-300" />
                  <span>Unlocked</span>
                </>
              ) : (
                <>
                  <LockIcon className="w-2.5 h-2.5 text-amber-400" />
                  <span>Locked</span>
                </>
              )}
            </span>
          </div>

          {allNavItems
            .filter((item) => isPrincipalItem(item.id))
            .map((item) => {
              const isActive = currentTab === item.id && isPrincipalUnlocked;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-md shadow-teal-900/30'
                      : isPrincipalUnlocked
                      ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                      : 'text-slate-400 hover:text-amber-200 hover:bg-amber-950/20'
                  }`}
                  title={!isPrincipalUnlocked ? 'Locked: Click to enter PIN and unlock' : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-teal-200' : isPrincipalUnlocked ? 'text-slate-400' : 'text-amber-400/80'}>
                      {item.icon}
                    </span>
                    <span className={!isPrincipalUnlocked ? 'opacity-90' : ''}>{item.label}</span>
                  </div>
                  {!isPrincipalUnlocked && (
                    <span className="p-1 rounded-md bg-amber-950/60 text-amber-400 border border-amber-800/40">
                      <LockIcon className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {/* Current Active Role Badge & Security Status */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Security Clearance Profile
          </div>
          <div className="text-xs font-black text-white mt-1 flex items-center justify-between">
            <span>{isPrincipalUnlocked ? '👑 Principal (Unlocked)' : '👩‍💼 Receptionist (Protected)'}</span>
            {isPrincipalUnlocked ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
            {isPrincipalUnlocked
              ? 'Full Executive Clearance: All financial profits, salaries & expenses unlocked.'
              : 'Principal confidential records are locked behind PIN protection.'}
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-800">
            {isPrincipalUnlocked ? (
              <button
                onClick={onLockPrincipal}
                className="w-full py-1.5 px-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              >
                <LockIcon className="w-3.5 h-3.5" />
                <span>Lock Principal Portal</span>
              </button>
            ) : (
              <button
                onClick={() => onRequestPrincipalUnlock?.()}
                className="w-full py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              >
                <LockIcon className="w-3.5 h-3.5" />
                <span>Enter PIN to Unlock</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Drawer Action Buttons */}
        <div className="p-3 border-t border-slate-900 grid grid-cols-2 gap-2">
          {onBackToSaas && (
            <button
              type="button"
              onClick={() => {
                onCloseMobile?.();
                onBackToSaas();
              }}
              className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-[11px] border border-emerald-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>🌐 SaaS Home</span>
            </button>
          )}
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onCloseMobile?.();
                onLogout();
              }}
              className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-rose-400 font-bold text-[11px] border border-rose-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>🚪 Exit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (hidden on mobile, visible on lg) */}
      <aside className="hidden lg:flex w-64 bg-slate-950 text-slate-300 flex-col shrink-0 border-r border-slate-800 select-none min-h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer (visible on mobile when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
          />
          {/* Slide Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-950 text-slate-300 flex flex-col h-full border-r border-slate-800 shadow-2xl z-10 animate-slideRight">
            <button
              type="button"
              onClick={onCloseMobile}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center text-xs font-bold cursor-pointer"
              aria-label="Close menu"
            >
              ✕
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

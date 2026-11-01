'use client';

import React from 'react';
import { NavTab } from './Sidebar';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenReceiveFee: () => void;
  onOpenMobileMenu: () => void;
  defaultersCount: number;
}

export default function MobileBottomNav({
  currentTab,
  onTabChange,
  onOpenReceiveFee,
  onOpenMobileMenu,
  defaultersCount,
}: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Mobile Bottom App Bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-2 shadow-[0_-12px_30px_rgba(0,0,0,0.6)] select-none"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Tab 1: Front-Desk Counter */}
        <button
          type="button"
          onClick={() => onTabChange('receptionist_counter')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
            currentTab === 'receptionist_counter'
              ? 'text-emerald-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={currentTab === 'receptionist_counter' ? 2.5 : 1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-[10px] tracking-tight">Counter</span>
          {currentTab === 'receptionist_counter' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 shadow-xs" />
          )}
        </button>

        {/* Tab 2: 24-Month Matrix Ledger */}
        <button
          type="button"
          onClick={() => onTabChange('ledger')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
            currentTab === 'ledger'
              ? 'text-teal-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={currentTab === 'ledger' ? 2.5 : 1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[10px] tracking-tight">Matrix</span>
          {currentTab === 'ledger' && (
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-0.5 shadow-xs" />
          )}
        </button>

        {/* Center Floating Action Button: + Receive Fee */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            type="button"
            onClick={onOpenReceiveFee}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/40 border-3 border-slate-950 active:scale-90 transition-transform cursor-pointer"
            title="Receive New Student Fee"
          >
            <span className="text-2xl font-black leading-none">+</span>
            <span className="text-[8px] font-black uppercase tracking-tight -mt-0.5">Fee</span>
          </button>
        </div>

        {/* Tab 3: Defaulters */}
        <button
          type="button"
          onClick={() => onTabChange('defaulters')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
            currentTab === 'defaulters'
              ? 'text-rose-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={currentTab === 'defaulters' ? 2.5 : 1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {defaultersCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-rose-600 text-white font-black text-[8px] leading-tight shadow-xs">
                {defaultersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Defaulters</span>
          {currentTab === 'defaulters' && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-0.5 shadow-xs" />
          )}
        </button>

        {/* Tab 4: More / Full Menu Drawer */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer text-slate-400 hover:text-slate-200 active:scale-95"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}

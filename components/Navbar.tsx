'use client';

import React, { useState } from 'react';
import { InstitutionMode, UserRole, CollegeTenant } from '../lib/types';
import { SearchIcon, BotIcon, LockIcon, UnlockIcon } from './Icons';

interface NavbarProps {
  institutionMode: InstitutionMode;
  onModeChange: (mode: InstitutionMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenReceiveFee: () => void;
  onOpenAI: () => void;
  defaultersCount: number;
  colleges: CollegeTenant[];
  currentCollege: CollegeTenant;
  onSelectCollege: (collegeId: string) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenAddCollegeModal?: () => void;
  isPrincipalUnlocked?: boolean;
  onRequestPrincipalUnlock?: () => void;
  onLockPrincipal?: () => void;
  onLogout?: () => void;
  onBackToSaas?: () => void;
  onToggleMobileMenu?: () => void;
  isMultiTenantIsolated?: boolean;
}

const DEFAULT_FALLBACK_COLLEGE: CollegeTenant = {
  id: 'college_hchs_kht',
  code: 'HCHS-KHT',
  name: 'Harmain College of Health Sciences',
  city: 'Kahuta',
  tagline: 'Teaching Hospital & Health Sciences Academy',
  recognizedBy: 'Affiliated with UHS & PMDC Recognized',
};

export default function Navbar({
  institutionMode,
  onModeChange,
  searchQuery,
  onSearchChange,
  onOpenReceiveFee,
  onOpenAI,
  defaultersCount,
  colleges,
  currentCollege,
  onSelectCollege,
  userRole = 'PRINCIPAL',
  onRoleChange,
  onOpenAddCollegeModal,
  isPrincipalUnlocked = false,
  onRequestPrincipalUnlock,
  onLockPrincipal,
  onLogout,
  onBackToSaas,
  onToggleMobileMenu,
  isMultiTenantIsolated = true,
}: NavbarProps) {
  const safeCollege = currentCollege || (colleges && colleges[0]) || DEFAULT_FALLBACK_COLLEGE;
  const safeColleges = Array.isArray(colleges) && colleges.length > 0 ? colleges : [safeCollege];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
      {/* ========================================================================= */}
      {/* 1. MOBILE NATIVE HEADER (lg:hidden) - STRICTLY 1 CLEAN ROW (NO CLUTTER!) */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex items-center justify-between h-14 px-3.5 gap-2">
        {/* Left: Mobile Drawer Trigger + Compact College Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center text-base font-black shadow-2xs active:scale-95 cursor-pointer shrink-0"
              aria-label="Open Navigation Drawer"
            >
              ☰
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-[42px] h-7 px-1.5 rounded-lg bg-gradient-to-br from-teal-800 to-slate-950 text-white flex items-center justify-center font-black text-[11px] tracking-wider shrink-0 border border-teal-600/40">
              {(safeCollege.code || 'HCHS').split('-')[0]}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 leading-tight truncate">
                {safeCollege.name}
              </div>
              <div className="text-[10px] text-teal-700 font-bold flex items-center gap-1 leading-none mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">{safeCollege.city} Campus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Role Pill & AI Assistant */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (userRole === 'PRINCIPAL') {
                onRoleChange('RECEPTIONIST');
              } else {
                if (isPrincipalUnlocked) {
                  onRoleChange('PRINCIPAL');
                } else {
                  onRequestPrincipalUnlock?.();
                }
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black border flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
              userRole === 'PRINCIPAL'
                ? 'bg-slate-950 text-white border-slate-800 shadow-xs'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs'
            }`}
            title="Tap to switch role or unlock Principal"
          >
            <span>{userRole === 'PRINCIPAL' ? '👑 Principal' : '💳 Cashier'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAI}
            className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center active:scale-95 shadow-2xs cursor-pointer"
            title="Campus AI Copilot"
          >
            <BotIcon className="w-4 h-4 text-teal-700" />
          </button>

          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-sm font-black active:scale-95 cursor-pointer"
              title="More Options"
            >
              ⋮
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP EXECUTIVE NAVBAR (hidden lg:flex) */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2.5 gap-4">
        {/* Left: Isolated College Identity */}
        <div className="flex items-center gap-3">
          {isMultiTenantIsolated ? (
            <div className="flex items-center gap-2.5 bg-slate-100/90 border border-slate-300/80 px-3.5 py-1.5 rounded-2xl shadow-2xs">
              <div className="min-w-[48px] h-8 px-2 rounded-xl bg-gradient-to-br from-teal-800 to-slate-900 text-white flex items-center justify-center font-black text-xs tracking-wider shadow-xs border border-teal-600/40">
                {(safeCollege.code || 'HCHS').split('-')[0]}
              </div>
              <div>
                <div className="text-xs md:text-sm font-black text-slate-900 flex items-center gap-1.5 leading-tight">
                  <span>🏥 {safeCollege.name}</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded border border-teal-200">
                    {safeCollege.city}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold truncate max-w-xs">
                  Private Workspace • {safeCollege.recognizedBy || 'PMDC Recognized'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <span className="pl-2 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Active Campus:
              </span>
              <select
                value={safeCollege.id}
                onChange={(e) => onSelectCollege(e.target.value)}
                className="bg-white text-slate-900 font-black text-xs md:text-sm py-1.5 px-3 rounded-xl border border-slate-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
              >
                {safeColleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏥 {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Institution Program Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => onModeChange('medical_college')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                institutionMode === 'medical_college'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MBBS / BDS
            </button>
            <button
              onClick={() => onModeChange('medical_school')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                institutionMode === 'medical_school'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nursing / DPT
            </button>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="relative flex-1 max-w-md mx-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${currentCollege.code} students, roll no, father name...`}
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Role Switcher & Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 shrink-0">
          {/* ROLE ACCESS SWITCHER WITH PRINCIPAL SECURITY LOCK */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-300 shadow-2xs">
            {userRole === 'PRINCIPAL' ? (
              <div className="flex items-center gap-1.5 bg-slate-950 text-white pl-3 pr-1 py-1 rounded-xl shadow-xs">
                <span className="text-xs font-black flex items-center gap-1">
                  <span>👑 Principal</span>
                  <span className="text-[10px] text-teal-400 font-semibold bg-teal-900/60 px-1.5 py-0.5 rounded">Unlocked</span>
                </span>
                <button
                  onClick={onLockPrincipal}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Lock Principal Section now"
                >
                  <LockIcon className="w-3 h-3" />
                  <span>Lock</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (isPrincipalUnlocked) {
                    onRoleChange('PRINCIPAL');
                  } else {
                    onRequestPrincipalUnlock?.();
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-200 cursor-pointer"
                title="Principal section is PIN protected. Click to unlock."
              >
                <LockIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>👑 Principal (Locked)</span>
              </button>
            )}

            <button
              onClick={() => onRoleChange('RECEPTIONIST')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                userRole === 'RECEPTIONIST'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Receptionist / Cashier Counter (Fee collection only)"
            >
              <span>👩‍💼 Receptionist Desk</span>
            </button>
          </div>

          {/* Medical College LLM Copilot Trigger */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-700 to-cyan-800 text-white hover:opacity-95 shadow-xs transition-all cursor-pointer"
          >
            <BotIcon className="w-3.5 h-3.5 text-teal-200" />
            <span>Campus LLM</span>
          </button>

          {/* Quick Receive Fee button */}
          <button
            onClick={onOpenReceiveFee}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-all cursor-pointer"
          >
            <span>+ Receive Fee</span>
          </button>

          {/* Defaulter Alert Badge */}
          <div
            title={`${defaultersCount} Students with Pending Dues`}
            className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs"
          >
            <span>🔔</span>
            {defaultersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs">
                {defaultersCount}
              </span>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-xs ${
              userRole === 'PRINCIPAL' ? 'bg-slate-900' : 'bg-emerald-700'
            }`}>
              {userRole === 'PRINCIPAL' ? 'PR' : 'RC'}
            </div>
          </div>

          {/* SaaS Website Button */}
          {onBackToSaas && (
            <button
              onClick={onBackToSaas}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs transition-all cursor-pointer"
              title="SaaS Landing Page par wapas jayein"
            >
              <span>🌐 SaaS Website</span>
            </button>
          )}

          {/* Exit / Logout from College Portal */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 shadow-2xs transition-all cursor-pointer"
              title="Log out of this College Workspace"
            >
              <span>🚪 Exit Portal</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

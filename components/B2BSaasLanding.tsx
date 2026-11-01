'use client';

import React, { useState } from 'react';
import { CollegeTenant, UserRole } from '../lib/types';
import { BotIcon, SearchIcon, CheckCircleIcon, PrinterIcon, LockIcon } from './Icons';

interface B2BSaasLandingProps {
  colleges: CollegeTenant[];
  currentCollege: CollegeTenant;
  onEnterPortal: (collegeId: string, role: UserRole) => void;
}

export default function B2BSaasLanding({
  colleges,
  currentCollege,
  onEnterPortal,
}: B2BSaasLandingProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'CASHIER' | 'LEDGER' | 'DEFAULTERS' | 'PAYROLL' | 'LAB' | 'AI'>('CASHIER');

  // Login Modal State
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(
    currentCollege?.id || (colleges && colleges[0]?.id) || 'college_hchs_kht'
  );
  const [selectedRole, setSelectedRole] = useState<UserRole>('PRINCIPAL');

  // Demo Booking Modal State
  const [demoForm, setDemoForm] = useState({
    name: '',
    collegeName: '',
    city: '',
    phone: '',
    studentCount: '500-1500',
    notes: '',
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const handleLaunchPortal = (collegeId?: string, role?: UserRole) => {
    onEnterPortal(collegeId || selectedCollegeId, role || selectedRole);
    setIsLoginModalOpen(false);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoSubmitted(false);
      setIsDemoModalOpen(false);
      setDemoForm({ name: '', collegeName: '', city: '', phone: '', studentCount: '500-1500', notes: '' });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* 1. TOP GLOBAL EXECUTIVE ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 border-b border-emerald-500/30 py-2.5 px-4 text-center text-xs">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider">
            B2B SaaS Release 3.0
          </span>
          <span className="text-emerald-100 font-medium">
            Pakistan's #1 AI-Powered Operating System for Medical, Nursing & Allied Health Colleges.
          </span>
          <button
            type="button"
            onClick={() => handleLaunchPortal('college_hchs_kht', 'PRINCIPAL')}
            className="text-emerald-300 hover:text-white underline font-bold transition-colors cursor-pointer ml-1 inline-flex items-center gap-1"
          >
            <span>Live Harmain College Demo dekhein</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE B2B NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/25 border border-emerald-300/40">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                  MedixCampus<span className="text-emerald-400">OS</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  B2B SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Medical & Health Sciences ERP Platform
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Core Modules</a>
            <a href="#interactive-preview" className="hover:text-emerald-400 transition-colors">Live Matrix</a>
            <a href="#compliance" className="hover:text-emerald-400 transition-colors">PMDC & UHS Compliance</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing (PKR)</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="hidden sm:inline-flex px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold transition-all cursor-pointer hover:border-slate-500"
            >
              Book Private Demo
            </button>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>🏛️ Login to College Portal</span>
              <span className="text-base font-bold">→</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (ANIMATED & IMPACTFUL) */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-10 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Multi-Tenant Enterprise SaaS for Pakistani Medical Colleges</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              The Operating System for Modern{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Medical & Health Science Colleges
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
              24-Month Continuous Fee Matrix, Zero-Tolerance Defaulter Recovery, Biometric Faculty Payroll & Shift Rules, Lab Asset Inventories, aur On-Premise Campus AI Copilot — Sab kuch aik unified portal mein.
            </p>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleLaunchPortal('college_hchs_kht', 'PRINCIPAL')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>🚀 Launch Harmain College Portal (Live)</span>
              <span>→</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm sm:text-base border border-slate-700 shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>🔑 Choose Role & Enter ERP</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-sm border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📅 Book Demo Meeting</span>
            </button>
          </div>

          {/* Live Metrics Ticker Banner */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
              <div className="text-xs font-bold text-slate-400 mt-1">Audit-Ready 24-Month Matrix</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Automated Year 1 & 2 reconciliation</div>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-teal-400">99.4%</div>
              <div className="text-xs font-bold text-slate-400 mt-1">On-Time Fee Recovery</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Instant WhatsApp reminder engine</div>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">0 Mismatches</div>
              <div className="text-xs font-bold text-slate-400 mt-1">Computerized Bank Vouchers</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Cash, Meezan, HBL & Alfalah sync</div>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">PMDC / UHS</div>
              <div className="text-xs font-bold text-slate-400 mt-1">Regulatory Standards</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Compliant degree & fee structures</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE FEATURE MODULE EXPLORER */}
      <section id="features" className="py-20 bg-slate-900/40 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Enterprise Feature Suite
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Medical Colleges Ke Tamam Critical Departments Ka Hal
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Medical college chalana aam school se mukhtalif hota hai. Hamari SaaS khas tor par 24-month clinical sessions, dynamic PMDC fee structures, aur lab asset inventory ke liye design ki gayi hai.
            </p>
          </div>

          {/* Module Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {[
              { id: 'CASHIER', label: '💳 Front-Desk Cashier Counter', tag: 'Fast Billing' },
              { id: 'LEDGER', label: '📊 24-Month Matrix Ledger', tag: 'Audit Safe' },
              { id: 'DEFAULTERS', label: '⚠️ Defaulter Recovery Hub', tag: 'WhatsApp Sync' },
              { id: 'PAYROLL', label: '🧑‍🏫 Faculty & Staff Payroll', tag: 'Biometric Duty' },
              { id: 'LAB', label: '🔬 Lab Inventory & Assets', tag: 'Low Stock Alert' },
              { id: 'AI', label: '🤖 Campus AI Copilot (LLM)', tag: 'Voice Query' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFeatureTab(tab.id as any)}
                className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  activeFeatureTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25 font-black'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                  activeFeatureTab === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.tag}
                </span>
              </button>
            ))}
          </div>

          {/* Active Tab Detailed Showcase */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {activeFeatureTab === 'CASHIER' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-bold border border-emerald-400/20">
                    <span>Front-Desk Multi-Channel Terminal</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Cashier & Student Billing Counter
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Student admission form number, roll number, ya CNIC search karein. 1-click mein monthly fees collect karein aur automatic computerized official bank deposit receipts issue karein.
                  </p>
                  <ul className="space-y-3 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Real-time instant student search across Form #, Roll No, CNIC, aur Name</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Thermal POS & Standard A4 Computerized Bank Deposit Receipt Printing</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Multi-payment channels: Cash, Meezan Bank, HBL, Bank Alfalah, Online Transfer</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Daily Cashier Day-End Journal & total counter collection summary</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchPortal('college_hchs_kht', 'RECEPTIONIST')}
                      className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <span>Open Cashier Counter Live Demo</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-slate-400">Cashier Counter View Simulation</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">LIVE SYNC</span>
                  </div>
                  <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">Hamza Tariq (DPT-24-001)</span>
                      <span className="text-xs font-bold text-emerald-400">Paid: Rs. 45,000</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Admission Form: HCHS-2026-0105 • Session 2026-27
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20 text-[10px]">
                      <span className="text-slate-400">Method: Meezan Bank Deposit</span>
                      <span className="text-emerald-300 font-bold">Voucher # HCHS-VCH-8821</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Today Collection</div>
                      <div className="text-lg font-black text-emerald-400 mt-0.5">Rs. 385,000</div>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Vouchers Issued</div>
                      <div className="text-lg font-black text-white mt-0.5">14 Receipts</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'LEDGER' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/10 text-teal-400 text-xs font-bold border border-teal-400/20">
                    <span>Audit-Ready Financial Architecture</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    2-Year Continuous Fee Matrix (24 Months)
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Medical colleges ke 2-year clinical degree programs ka mukammal mahina-ba-mahina audit ledger. Year 1 aur Year 2 ke tamam 24 mahinay live track hotay hain.
                  </p>
                  <ul className="space-y-3 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2.5">
                      <span className="text-teal-400 font-bold">✓</span>
                      <span>Dedicated Year Switcher: Both Years (24 Mo), Year 1 (12 Mo), Year 2 (12 Mo)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-teal-400 font-bold">✓</span>
                      <span>Color-coded cell statuses: Cleared (Green), Upcoming (Slate), Missed / Defaulter (Red)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-teal-400 font-bold">✓</span>
                      <span>Instant scholarship & concession calculator (10% to 50% automated adjustment)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-teal-400 font-bold">✓</span>
                      <span>Full 2-Year printable Student Financial Clearance Certificate</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchPortal('college_hchs_kht', 'PRINCIPAL')}
                      className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <span>Explore 24-Month Matrix Live</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner space-y-3">
                  <div className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2 flex justify-between">
                    <span>24-Month Timeline Matrix</span>
                    <span className="text-teal-400 font-mono">Session 2026-2028</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-300">Year 1 (Sep '26 - Aug '27)</div>
                    <div className="grid grid-cols-6 gap-1.5 text-center text-[10px] font-bold">
                      <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Sep (Paid)</span>
                      <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Oct (Paid)</span>
                      <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">Nov (Due)</span>
                      <span className="p-1.5 rounded-lg bg-slate-800 text-slate-400">Dec</span>
                      <span className="p-1.5 rounded-lg bg-slate-800 text-slate-400">Jan</span>
                      <span className="p-1.5 rounded-lg bg-slate-800 text-slate-400">Feb</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-300 pt-2">Year 2 (Sep '27 - Aug '28)</div>
                    <div className="grid grid-cols-6 gap-1.5 text-center text-[10px] font-bold">
                      <span className="p-1.5 rounded-lg bg-slate-850 text-slate-500 border border-slate-800">Sep</span>
                      <span className="p-1.5 rounded-lg bg-slate-850 text-slate-500 border border-slate-800">Oct</span>
                      <span className="p-1.5 rounded-lg bg-slate-850 text-slate-500 border border-slate-800">Nov</span>
                      <span className="p-1.5 rounded-lg bg-slate-850 text-slate-500 border border-slate-800">Dec</span>
                      <span className="p-1.5 rounded-lg bg-slate-850 text-slate-500 border border-slate-800">Jan</span>
                      <span className="p-1.5 rounded-lg bg-slate-850 text-slate-500 border border-slate-800">Feb</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 mt-2">
                    💡 Har payment par system automatically purane pending months ko pehle clear karta hai taake zero accounting dispute ho.
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'DEFAULTERS' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-400/10 text-rose-400 text-xs font-bold border border-rose-400/20">
                    <span>Revenue Recovery Automation</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Zero-Defaulter Recovery Hub
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    200+ students mein se un bachon ko dhoondiye jinki fees pending hai. 1-Click WhatsApp reminder engine ke zariye parents ko unka baqi balance foran send karein.
                  </p>
                  <ul className="space-y-3 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2.5">
                      <span className="text-rose-400 font-bold">✓</span>
                      <span>Dedicated Fast Search: Filter by Student Name, Roll No, Father Name, Phone, CNIC</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-rose-400 font-bold">✓</span>
                      <span>Severity tagging: Critical (3+ Months Overdue), High Risk, aur Moderate Arrears</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-rose-400 font-bold">✓</span>
                      <span>1-Click Direct WhatsApp Alert to Parents with pre-formatted balance amount & bank account</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-rose-400 font-bold">✓</span>
                      <span>Printable Legal / Warning Notices for College Board & Examinations bar</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchPortal('college_hchs_kht', 'PRINCIPAL')}
                      className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <span>Check Defaulter Search Engine</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-rose-400">1-Click WhatsApp Notice Preview</span>
                    <span className="text-[10px] text-slate-400 font-mono">Automated Dispatch</span>
                  </div>
                  <div className="bg-emerald-950/30 border border-emerald-600/30 p-4 rounded-xl space-y-2 text-xs text-slate-200">
                    <div className="font-bold text-emerald-300">📲 WhatsApp to: +92 300 1234567 (Father)</div>
                    <div className="text-[11px] leading-relaxed text-slate-300 bg-black/40 p-3 rounded-lg border border-emerald-500/20">
                      "Mohtaram Parent, Harmain College of Health Sciences Kahuta ki janib se muttala kiya jata hai ke aapke bache (Ayesha Bibi, Roll # BSN-2024-002) ki October aur November ki total Rs. 90,000 fee baqi hai. Barah-e-karam bank mein jama karwayein."
                    </div>
                  </div>
                  <div className="text-[11px] text-center text-slate-400 font-semibold pt-1">
                    ⚡ 85% parents WhatsApp notice milne ke 48 ghanton ke andar fees clear kar dete hain.
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'PAYROLL' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-400/10 text-indigo-400 text-xs font-bold border border-indigo-400/20">
                    <span>Clinical Staff & Doctor Management</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Faculty & Staff Monthly Payroll Register
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Professors, Doctors, Lecturers, Lab Technologists aur Administrative staff ki basic salary, allowances, duty hours aur biometric attendance ko manage karein.
                  </p>
                  <ul className="space-y-3 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2.5">
                      <span className="text-indigo-400 font-bold">✓</span>
                      <span>Biometric sync with Automated Late Arrival Penalty (e.g. 10 AM shift par 12 PM arrival = Half-Day cut)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-indigo-400 font-bold">✓</span>
                      <span>Advance Salary Loan disbursements aur monthly recovery deductions tracking</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-indigo-400 font-bold">✓</span>
                      <span>Allowances breakdown: House Rent, Medical, Conveyance, Special Dean Allowance</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-indigo-400 font-bold">✓</span>
                      <span>Individual Official Printable Salary Slips (PDF) & Master Monthly Register</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchPortal('college_hchs_kht', 'PRINCIPAL')}
                      className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <span>View Faculty Payroll Demo</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner space-y-3">
                  <div className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
                    Automated Shift & Loan Engine
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Shift Duty Rule:</span>
                      <span className="text-indigo-400 font-bold">10:00 AM - 04:00 PM</span>
                    </div>
                    <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                      ⚠️ 12:00 PM (2-3 ghante late) = 1 Half-Day deduction automated apply hota hai.
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Advance Loan Recovery:</span>
                      <span className="text-emerald-400 font-bold">-Rs. 50,000 / month auto-deduct</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'LAB' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 text-xs font-bold border border-cyan-400/20">
                    <span>Clinical Lab & Asset Security</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Campus & Lab Inventory & Expenses Hub
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Pathology microscopes, Anatomy chemical drums, surgical dissection kits, library books, aur campus generator fuel bills ka complete ledger aur real-time stock alert system.
                  </p>
                  <ul className="space-y-3 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2.5">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>Real-time stock adjusters (+ / -) with instant Low-Stock & Out-of-Stock warnings</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>Supplier purchase invoice tracking with invoice numbers and warranty locations</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>Categorization: Lab Equipment, Anatomy Reagents, Hospital Consumables, Library</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>Audit-proof printable PDF Campus Expense & Lab Valuation Reports</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchPortal('college_hchs_kht', 'PRINCIPAL')}
                      className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <span>Explore Lab Hub Live</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner space-y-3">
                  <div className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
                    Live Tracked Lab Items
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Olympus CX23 Microscopes</div>
                        <div className="text-[10px] text-slate-400">Pathology Practical Hall</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        In Stock (12 Units)
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Formalin 37% Drums</div>
                        <div className="text-[10px] text-slate-400">Anatomy Chemical Cold Storage</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Low Stock (2 Drums)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'AI' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-bold border border-emerald-400/20">
                    <span>Next-Gen Intelligence</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Campus AI Copilot (LLM)
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    College Principal ya Executive Director ko reports dekhne ke liye excel files kholne ki zaroorat nahi. Seedha voice ya text mein sawal poochein, aur AI foran financial calculation karke bata dega.
                  </p>
                  <ul className="space-y-3 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Natural Urdu/English Queries: "Kitne students ki fee rehti hai?", "Pathology lab ka total kharcha kitna hua?"</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Instant Voice Search & Dictation support</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Executive financial anomaly & revenue leakage detection</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchPortal('college_hchs_kht', 'PRINCIPAL')}
                      className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <span>Try AI Copilot Demo</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2">
                    <BotIcon className="w-4 h-4" />
                    <span>Campus AI Copilot Query Simulation</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-200">
                      <span className="text-slate-500 font-bold">Principal: </span>
                      "Harmain College ke DPT batch mein critical defaulters kitne hain?"
                    </div>
                    <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-emerald-200 leading-relaxed text-[11px]">
                      <span className="text-emerald-400 font-bold">Campus AI: </span>
                      "Harmain College of Health Sciences Kahuta mein is waqt DPT batch mein 3 critical fee defaulters hain jinki 3+ mahinon ki fees pending hai. Total outstanding balance Rs. 245,000 banta hai. Aap unke parents ko 1-Click WhatsApp notice bhej saktay hain."
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. REGULATORY COMPLIANCE & ACCREDITATIONS */}
      <section id="compliance" className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Standardized For Health Education
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Built for Pakistani Regulatory Councils & Medical Universities
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Hamara system Pakistan Medical & Dental Council (PMDC), University of Health Sciences (UHS), Pakistan Nursing Council (PNC), aur Pharmacy Council ke rules ke mutabiq hai.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">🏛️</div>
              <div className="text-sm font-black text-white">PMDC</div>
              <div className="text-[11px] text-slate-400">Recognized Medical & Dental Academic Framework</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">🎓</div>
              <div className="text-sm font-black text-white">UHS Lahore</div>
              <div className="text-[11px] text-slate-400">Allied Health Sciences & Clinical Examination Sync</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">💉</div>
              <div className="text-sm font-black text-white">PNC Council</div>
              <div className="text-[11px] text-slate-400">BS Nursing (Generic) & Post-RN Curriculum Formats</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">💊</div>
              <div className="text-sm font-black text-white">Pharmacy Council</div>
              <div className="text-[11px] text-slate-400">Pharmacy Technician (Category B) Lab Regulations</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. B2B PRICING TIERS (PKR) */}
      <section id="pricing" className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Transparent B2B Investment
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Predictable Campus SaaS Pricing (PKR)
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Bina kisi hidden charges ke. Unlimited receptionists, cashiers aur teachers shamil hain.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'MONTHLY' ? 'bg-slate-800 text-white font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'ANNUAL' ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950/20 uppercase font-black">2 Mo Free</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Tier 1: Starter Institute */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-7 space-y-6 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">Starter Health Academy</h3>
                  <p className="text-xs text-slate-400 mt-1">Small nursing, MLT ya pharmacy technician institutes ke liye</p>
                </div>
                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">
                      Rs. {billingCycle === 'ANNUAL' ? '20,000' : '25,000'}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                    {billingCycle === 'ANNUAL' ? 'Billed annually (Save Rs. 60,000/yr)' : 'Flexible month-to-month'}
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 font-medium pt-3 border-t border-slate-800/80">
                  <li className="flex items-center gap-2">✓ Up to 300 Enrolled Students</li>
                  <li className="flex items-center gap-2">✓ Front-Desk Cashier Counter</li>
                  <li className="flex items-center gap-2">✓ 12-Month Single Year Fee Ledger</li>
                  <li className="flex items-center gap-2">✓ Defaulters List & WhatsApp Notices</li>
                  <li className="flex items-center gap-2">✓ 2 User Accounts (Admin + Cashier)</li>
                  <li className="flex items-center gap-2 text-slate-500">✗ 24-Month Clinical Ledger Matrix</li>
                  <li className="flex items-center gap-2 text-slate-500">✗ Lab Asset Inventory Hub</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                Choose Starter Academy
              </button>
            </div>

            {/* Tier 2: Medical College Campus (Featured) */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-emerald-500/70 rounded-3xl p-7 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-emerald-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                MOST POPULAR FOR COLLEGES
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">Medical & Allied College</h3>
                  <p className="text-xs text-slate-400 mt-1">DPT, BS Nursing, Allied Health & Medical Colleges</p>
                </div>
                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-emerald-400">
                      Rs. {billingCycle === 'ANNUAL' ? '55,000' : '65,000'}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                    {billingCycle === 'ANNUAL' ? 'Billed annually (Save Rs. 120,000/yr)' : 'Month-to-month billing'}
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-200 font-medium pt-3 border-t border-slate-800/80">
                  <li className="flex items-center gap-2">✓ <span className="font-bold text-white">Up to 1,500 Enrolled Students</span></li>
                  <li className="flex items-center gap-2">✓ <span className="font-bold text-white">24-Month Matrix Fee Ledger</span></li>
                  <li className="flex items-center gap-2">✓ Front-Desk Cashier with Voucher Printing</li>
                  <li className="flex items-center gap-2">✓ Instant Defaulter WhatsApp Reminders</li>
                  <li className="flex items-center gap-2">✓ Biometric Faculty & Staff Payroll</li>
                  <li className="flex items-center gap-2">✓ Campus & Lab Inventory Hub (Microscopes & Chemicals)</li>
                  <li className="flex items-center gap-2">✓ Dynamic PMDC Course & Fee Manager</li>
                  <li className="flex items-center gap-2">✓ Campus AI Copilot (LLM)</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchPortal('college_hchs_kht', 'PRINCIPAL')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                Launch Live College Experience →
              </button>
            </div>

            {/* Tier 3: Enterprise University Network */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-7 space-y-6 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">Enterprise University</h3>
                  <p className="text-xs text-slate-400 mt-1">Multi-campus medical universities & teaching hospitals</p>
                </div>
                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">Custom</span>
                    <span className="text-xs text-slate-400">/ quote</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">
                    Multi-campus dedicated server deployment
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 font-medium pt-3 border-t border-slate-800/80">
                  <li className="flex items-center gap-2">✓ Unlimited Students & Multiple Campuses</li>
                  <li className="flex items-center gap-2">✓ Dedicated Private Cloud Server (Pakistan Data Center)</li>
                  <li className="flex items-center gap-2">✓ Custom ERP & LMS Integration with Bank APIs</li>
                  <li className="flex items-center gap-2">✓ Full 24-Month Matrix across all degrees</li>
                  <li className="flex items-center gap-2">✓ Biometric Fingerprint API Hardwiring</li>
                  <li className="flex items-center gap-2">✓ 24/7 Dedicated Account Manager & SLA</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                Request Enterprise Quote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA SECTION */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-emerald-950/40 border-t border-slate-800/80 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <span>Seamless Transition & Data Setup</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Apne Medical College Ko Aaj Hi Modern Banayein
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto font-normal">
            Purani Excel sheets aur manual fee books se nijat payein. 1-Click live login se check karein ya apne campus ke liye custom demo schedule karein.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => handleLaunchPortal('college_hchs_kht', 'PRINCIPAL')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Open Harmain College Portal (Live Demo) →
            </button>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 transition-all cursor-pointer"
            >
              Client Login Gateway
            </button>
          </div>
        </div>
      </section>

      {/* 8. B2B SAAS FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm">
              🏥
            </div>
            <div>
              <span className="font-extrabold text-white text-sm">MedixCampus OS</span>
              <p className="text-[10px] text-slate-500">B2B SaaS Medical ERP Platform • Built for Pakistan</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-slate-400 font-semibold">
            <a href="#features" className="hover:text-emerald-400">Core Modules</a>
            <a href="#compliance" className="hover:text-emerald-400">PMDC & UHS</a>
            <a href="#pricing" className="hover:text-emerald-400">Pricing</a>
            <button type="button" onClick={() => setIsLoginModalOpen(true)} className="hover:text-emerald-400">Client Login</button>
          </div>
          <div className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} MedixCampus OS. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: CLIENT PORTAL LOGIN GATEWAY */}
      {/* ========================================================================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-6">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-2xl text-emerald-400">
                🏛️
              </div>
              <h3 className="text-xl font-black text-white">Client Portal Login</h3>
              <p className="text-xs text-slate-400">
                Apna college workspace aur authorized access role select karein:
              </p>
            </div>

            <div className="space-y-4">
              {/* College Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select College Campus:
                </label>
                <select
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city}) - [{c.code}]
                    </option>
                  ))}
                  {colleges.length === 0 && (
                    <option value="college_hchs_kht">
                      Harmain College of Health Sciences (Kahuta) [HCHS-KHT]
                    </option>
                  )}
                </select>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Your Access Role:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { role: 'PRINCIPAL', label: '👑 Principal / Director', desc: 'Full Campus Authority' },
                    { role: 'RECEPTIONIST', label: '💳 Front-Desk Cashier', desc: 'Billing & Fee Collection' },
                  ].map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setSelectedRole(item.role as UserRole)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === item.role
                          ? 'bg-emerald-500/15 border-emerald-400 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleLaunchPortal(selectedCollegeId, selectedRole)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Enter College Workspace Portal →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BOOK A PRIVATE DEMO CONSULTATION */}
      {/* ========================================================================= */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                1-on-1 Consultation
              </span>
              <h3 className="text-xl font-black text-white">Book College ERP Demo</h3>
              <p className="text-xs text-slate-400">
                Apne medical college ya nursing institute ke liye live walkthrough schedule karein.
              </p>
            </div>

            {demoSubmitted ? (
              <div className="p-8 text-center bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="text-3xl">✅</div>
                <h4 className="text-base font-black text-emerald-400">Demo Request Mosool Ho Gayi!</h4>
                <p className="text-xs text-slate-300">
                  Hamari technical onboarding team aap se 2 ghanton ke andar WhatsApp ya call par raabta karegi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Aap Ka Naam:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Tariq Mahmood / Principal"
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Medical College / Institute:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Harmain College"
                      value={demoForm.collegeName}
                      onChange={(e) => setDemoForm({ ...demoForm, collegeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Sheher (City):</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kahuta, Rawalpindi"
                      value={demoForm.city}
                      onChange={(e) => setDemoForm({ ...demoForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">WhatsApp / Phone Number:</label>
                    <input
                      type="tel"
                      required
                      placeholder="0300-1234567"
                      value={demoForm.phone}
                      onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Estimated Students:</label>
                    <select
                      value={demoForm.studentCount}
                      onChange={(e) => setDemoForm({ ...demoForm, studentCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="100-300">100 - 300 Students</option>
                      <option value="500-1500">500 - 1,500 Students</option>
                      <option value="2000+">2,000+ Students (University)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Koi Khas Zaroorat / Notes (Optional):</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Humne DPT aur BS Nursing ke liye fee matrix aur biometric payroll dekhna hai..."
                    value={demoForm.notes}
                    onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Submit Demo Request →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

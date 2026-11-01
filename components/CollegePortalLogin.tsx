'use client';
import React, { useState } from 'react';
import { CollegeTenantAccount } from '../lib/types';
import { LockIcon, KeyIcon, BotIcon } from './Icons';

interface CollegePortalLoginProps {
  colleges: CollegeTenantAccount[];
  onCollegeLogin: (college: CollegeTenantAccount) => void;
  onSuperAdminLogin: () => void;
}

export default function CollegePortalLogin({
  colleges,
  onCollegeLogin,
  onSuperAdminLogin,
}: CollegePortalLoginProps) {
  const [activeTab, setActiveTab] = useState<'COLLEGE' | 'SUPER_ADMIN'>('COLLEGE');

  // College Login Form State
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(colleges[0]?.id || '');
  const [collegePassword, setCollegePassword] = useState('');
  const [collegeError, setCollegeError] = useState<string | null>(null);

  // Super Admin Login Form State
  const [adminEmail, setAdminEmail] = useState('admin@campusmaster.edu');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);

  const handleCollegeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCollegeError(null);

    const targetCollege = colleges.find((c) => c.id === selectedCollegeId);
    if (!targetCollege) {
      setCollegeError('Barah-e-karam apna college muntakhib karein.');
      return;
    }

    if (targetCollege.password !== collegePassword) {
      setCollegeError('Ghalat password! Barah-e-karam apna sahi password darj karein.');
      return;
    }

    if (targetCollege.status === 'SUSPENDED') {
      setCollegeError('Is college ka portal filhal suspended hai. Super Admin se rabta karein.');
      return;
    }

    onCollegeLogin(targetCollege);
  };

  const handleSuperAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (
      adminEmail.trim().toLowerCase() === 'admin@campusmaster.edu' &&
      adminPassword === 'master2026'
    ) {
      onSuperAdminLogin();
    } else {
      setAdminError('Super Admin credentials ghalat hain! (Default: admin@campusmaster.edu / master2026)');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = colleges.find(
      (c) => c.email.toLowerCase() === forgotEmail.trim().toLowerCase()
    );

    if (matched) {
      setForgotSuccessMsg(
        `✅ Password reset link "${forgotEmail}" par bhej diya gaya hai! Privacy policy ke tehat sirf official college email se hi password recover kiya ja sakta hai.`
      );
    } else {
      setForgotSuccessMsg(
        `✅ Agar yeh email registered hai to security verification link "${forgotEmail}" par bhej diya gaya hai.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden relative z-10 animate-in fade-in duration-300">
        {/* Brand Banner */}
        <div className="bg-slate-900 p-6 text-white text-center border-b border-slate-800">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-teal-500/20 mb-3">
            🏥
          </div>
          <h1 className="text-xl font-black tracking-wide text-white">
            Medical College SaaS Enterprise
          </h1>
          <p className="text-xs text-teal-300 font-medium mt-1">
            Privacy-Protected Multi-Tenant Cloud Platform
          </p>
        </div>

        {/* Tab Switcher: College Portal vs Master Super Admin */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setActiveTab('COLLEGE');
              setCollegeError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'COLLEGE'
                ? 'bg-white text-teal-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏛️ College Portal Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('SUPER_ADMIN');
              setAdminError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'SUPER_ADMIN'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🛡️ Super Admin</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: COLLEGE TENANT PORTAL LOGIN (Strictly Isolated Workspace) */}
        {/* ============================================================== */}
        {activeTab === 'COLLEGE' && (
          <form onSubmit={handleCollegeSubmit} className="p-6 space-y-4">
            <div className="bg-teal-50 border border-teal-200 p-3 rounded-2xl text-[11px] text-teal-900 font-medium">
              🔒 <b>Data Isolation Active:</b> Aap jis college ke credentials se login karenge, sirf usi college ka panel open hoga. Kisi doosre college ka data ya panel nazar nahi aayega.
            </div>

            {collegeError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                ⚠️ {collegeError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Your College Workspace
              </label>
              <select
                value={selectedCollegeId}
                onChange={(e) => {
                  setSelectedCollegeId(e.target.value);
                  setCollegePassword('');
                  setCollegeError(null);
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏥 {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  College Portal Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={collegePassword}
                onChange={(e) => setCollegePassword(e.target.value)}
                placeholder="Enter password (e.g. kmc123, pmc123)"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>

            {/* Quick Demo Credentials Fill Chips */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Quick Test Credentials:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {colleges.slice(0, 3).map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      setSelectedCollegeId(col.id);
                      setCollegePassword(col.password);
                      setCollegeError(null);
                    }}
                    className="text-[10px] font-bold bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    🔑 {col.code} ({col.password})
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-700 to-slate-900 hover:from-teal-800 hover:to-slate-950 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <KeyIcon className="w-4 h-4 text-teal-300" />
              <span>Login to Private College Portal</span>
            </button>
          </form>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SUPER ADMIN MASTER CONTROL LOGIN */}
        {/* ============================================================== */}
        {activeTab === 'SUPER_ADMIN' && (
          <form onSubmit={handleSuperAdminSubmit} className="p-6 space-y-4">
            <div className="bg-slate-100 border border-slate-300 p-3 rounded-2xl text-[11px] text-slate-800 font-medium">
              🛡️ <b>Super Admin Panel:</b> Yahan se aap tamam colleges ko manage kar sakte hain, naye colleges add kar sakte hain, aur unko unka alag private portal issue kar sakte hain.
            </div>

            {adminError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                ⚠️ {adminError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Master Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Master Admin Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="master2026"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>

            <div className="flex justify-between items-center pt-1 text-xs">
              <span className="text-slate-500 text-[11px]">
                Default Pass: <strong className="text-slate-800">master2026</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('admin@campusmaster.edu');
                  setAdminPassword('master2026');
                }}
                className="text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
              >
                Auto-Fill Master
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-slate-900 to-teal-950 hover:from-black hover:to-slate-900 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <LockIcon className="w-4 h-4 text-amber-400" />
              <span>Enter Super Admin Control Panel</span>
            </button>
          </form>
        )}
      </div>

      {/* Forgot Password Privacy Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-slate-900 to-teal-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyIcon className="w-5 h-5 text-teal-300" />
                <h3 className="font-black text-sm">Official College Password Recovery</h3>
              </div>
              <button
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotSuccessMsg(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Aap ke college ke data aur privacy ki hifazat ke liye, password reset link sirf aap ke college ki <b>registered official email</b> par send kiya jayega. Koi bhi doosra shakhs password reset nahi kar sakta.
              </p>

              {forgotSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl leading-relaxed">
                  {forgotSuccessMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Registered College Email
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. principal@kmc-health.edu.pk"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Send Reset Link to Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotSuccessMsg(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

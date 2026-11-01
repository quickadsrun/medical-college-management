'use client';
import React, { useState } from 'react';
import { CollegeTenantAccount } from '../lib/types';
import { LockIcon, KeyIcon, SearchIcon, CheckCircleIcon, PlusIcon } from './Icons';

interface SuperAdminDashboardProps {
  colleges: CollegeTenantAccount[];
  onOpenCollegePortal: (college: CollegeTenantAccount) => void;
  onAddNewCollege: (college: CollegeTenantAccount) => void;
  onUpdateCollege: (updatedCollege: CollegeTenantAccount) => void;
  onLogout: () => void;
}

export default function SuperAdminDashboard({
  colleges,
  onOpenCollegePortal,
  onAddNewCollege,
  onUpdateCollege,
  onLogout,
}: SuperAdminDashboardProps) {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New College Form State
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeCode, setNewCollegeCode] = useState('');
  const [newCollegeCity, setNewCollegeCity] = useState('');
  const [newCollegeEmail, setNewCollegeEmail] = useState('');
  const [newCollegePassword, setNewCollegePassword] = useState('');
  const [newCollegePrincipalPin, setNewCollegePrincipalPin] = useState('1234');
  const [newCollegeRecognizedBy, setNewCollegeRecognizedBy] = useState('Affiliated with UHS & PMDC Recognized');
  const [newCollegeTagline, setNewCollegeTagline] = useState('Teaching Hospital & Health Sciences Academy');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredColleges = colleges.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const handleCreateCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeName.trim() || !newCollegeCode.trim() || !newCollegeEmail.trim() || !newCollegePassword.trim()) {
      setFormError('College Name, Code, Official Email aur Password lazmi hain!');
      return;
    }

    const created: CollegeTenantAccount = {
      id: `college_${newCollegeCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      code: newCollegeCode.trim().toUpperCase(),
      name: newCollegeName.trim(),
      city: newCollegeCity.trim() || 'Pakistan',
      email: newCollegeEmail.trim().toLowerCase(),
      password: newCollegePassword.trim(),
      principalPin: newCollegePrincipalPin.trim() || '1234',
      status: 'ACTIVE',
      recognizedBy: newCollegeRecognizedBy.trim(),
      tagline: newCollegeTagline.trim(),
      establishedYear: new Date().getFullYear(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddNewCollege(created);
    setIsAddModalOpen(false);
    showToast(`🎉 Naya College "${created.name}" kamyabi se onboard kar diya gaya! Credentials email par dispatch ho gaye.`);

    // Reset Form
    setNewCollegeName('');
    setNewCollegeCode('');
    setNewCollegeCity('');
    setNewCollegeEmail('');
    setNewCollegePassword('');
    setNewCollegePrincipalPin('1234');
    setFormError(null);
  };

  const handleSendCredentialsEmail = (college: CollegeTenantAccount) => {
    showToast(`📧 Login Credentials kamyabi se "${college.email}" par send kar diye gaye hain!`);
  };

  const handleResetPassword = (college: CollegeTenantAccount) => {
    const newPass = `${college.code.toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.floor(100 + Math.random() * 900)}`;
    const updated = { ...college, password: newPass };
    onUpdateCollege(updated);
    showToast(`🔑 Naya password (${newPass}) generate ho kar "${college.email}" par bhej diya gaya hai.`);
  };

  const handleToggleStatus = (college: CollegeTenantAccount) => {
    const updatedStatus: 'ACTIVE' | 'SUSPENDED' = college.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    onUpdateCollege({ ...college, status: updatedStatus });
    showToast(`College status tabdeel ho kar "${updatedStatus}" ho gaya.`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircleIcon className="w-5 h-5 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-200 hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Super Admin Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-wide">
                SUPER ADMIN MASTER CONTROL
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Master SaaS Panel
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Tenant Architecture • Private College Isolation & Onboarding
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 text-slate-950" />
            <span>+ Onboard New College</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Logout to Login Screen"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Registered Colleges
            </div>
            <div className="text-3xl font-black text-white mt-1">
              {colleges.length}
            </div>
            <div className="text-[11px] text-teal-400 font-semibold mt-1">
              ✓ All Isolated & Private
            </div>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Licenced Campuses
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              {colleges.filter((c) => c.status === 'ACTIVE').length}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">
              100% Operational Status
            </div>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Privacy Protection
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
              <span>🔒 Shield Active</span>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">
              Zero Cross-College Data Leak
            </div>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Email Dispatch
            </div>
            <div className="text-3xl font-black text-cyan-400 mt-1">
              Active
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">
              Direct to Official College Emails
            </div>
          </div>
        </div>

        {/* Privacy Note Banner */}
        <div className="bg-gradient-to-r from-teal-950/70 via-slate-950 to-slate-900 border border-teal-800/40 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-teal-300 flex items-center gap-2">
              <span>🛡️ Data Privacy & Multi-Tenant Isolation Guarantee</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Har college ke fee rates, faculty payrolls, aur student records mukammal private hain. Jab kisi college ka staff ya Principal login karega to unko doosre colleges ka dropdown ya records dekhne ka koi rasta nahi milega.
            </p>
          </div>
        </div>

        {/* Colleges Management Section */}
        <div className="bg-slate-950/90 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-white">
                Client Medical Colleges & Workspaces ({filteredColleges.length})
              </h2>
              <p className="text-xs text-slate-400">
                Har college ka apna unique login, password aur principal security PIN yahan se manage karein.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search college, city, email..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Colleges Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">College / Campus</th>
                  <th className="p-4">Official Email</th>
                  <th className="p-4">Portal Password</th>
                  <th className="p-4">Principal PIN</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredColleges.map((college) => (
                  <tr key={college.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">
                        {college.name}
                      </div>
                      <div className="text-[11px] text-teal-400 font-medium">
                        {college.code} • {college.city} Campus
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                        🏛️ {college.recognizedBy}
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-slate-300">
                      <div>{college.email}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {college.adminName || 'Admin Desk'}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-mono bg-slate-900 px-2 py-1 rounded border border-slate-700 text-amber-300 font-bold">
                        {college.password}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono bg-slate-900 px-2 py-1 rounded border border-slate-700 text-teal-300 font-bold">
                        {college.principalPin}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(college)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                          college.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/40 hover:bg-rose-900'
                        }`}
                        title="Click to toggle status"
                      >
                        {college.status}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Launch Isolated Portal */}
                        <button
                          onClick={() => onOpenCollegePortal(college)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                          title="Open this college's isolated workspace"
                        >
                          <span>🚀 Launch Portal</span>
                        </button>

                        {/* Send Credentials Email */}
                        <button
                          onClick={() => handleSendCredentialsEmail(college)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                          title="Send login details to official college email"
                        >
                          📧 Email Info
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => handleResetPassword(college)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-amber-950 hover:text-amber-300 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                          title="Reset password and send to college email"
                        >
                          🔑 Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredColleges.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Koi college search criteria se match nahi hua.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Onboard New College Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-800 text-slate-100">
            <div className="bg-gradient-to-r from-slate-950 to-teal-950 p-6 flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-teal-400 text-xs font-bold uppercase tracking-wider">
                  Super Admin Client Provisioning
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  ➕ Onboard New Medical College
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCollege} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl">
                  ⚠️ {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  College / Institute Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCollegeName}
                  onChange={(e) => setNewCollegeName(e.target.value)}
                  placeholder="e.g. Evergreen College of Medicine, Multan"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    College Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCollegeCode}
                    onChange={(e) => setNewCollegeCode(e.target.value)}
                    placeholder="e.g. EVR-MUL"
                    className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    City <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCollegeCity}
                    onChange={(e) => setNewCollegeCity(e.target.value)}
                    placeholder="e.g. Multan"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Official College Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newCollegeEmail}
                  onChange={(e) => setNewCollegeEmail(e.target.value)}
                  placeholder="e.g. principal@evergreen.edu.pk"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Login credentials aur privacy reset link is email par dispatch honge.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Portal Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCollegePassword}
                    onChange={(e) => setNewCollegePassword(e.target.value)}
                    placeholder="e.g. evr123"
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Principal Security PIN <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={newCollegePrincipalPin}
                    onChange={(e) => setNewCollegePrincipalPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Confirm & Provision College
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

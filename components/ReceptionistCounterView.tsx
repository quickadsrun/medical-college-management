'use client';
import React, { useState, useMemo } from 'react';
import { Student, PaymentTransaction, CollegeTenant } from '../lib/types';
import { FeeIcon, StudentsIcon, SearchIcon, PrinterIcon, CheckCircleIcon, AlertCircleIcon, BotIcon } from './Icons';

interface ReceptionistCounterViewProps {
  college: CollegeTenant;
  students: Student[];
  transactions: PaymentTransaction[];
  onOpenReceiveFee: (student?: Student) => void;
  onOpenLedger: (student: Student) => void;
  onPrintReceipt: (txn: PaymentTransaction, student?: Student) => void;
  onOpenAI: () => void;
  onOpenAdmissionForm?: () => void;
  isPrincipal?: boolean;
  onDeleteTransaction?: (transactionId: string) => void;
}

export default function ReceptionistCounterView({
  college,
  students,
  transactions,
  onOpenReceiveFee,
  onOpenLedger,
  onPrintReceipt,
  onOpenAI,
  onOpenAdmissionForm,
  isPrincipal,
  onDeleteTransaction,
}: ReceptionistCounterViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerSearchQuery, setBannerSearchQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Counter transactions for today
  const todayTransactions = useMemo(() => {
    return transactions.filter((t) => t.paymentDate === todayStr);
  }, [transactions, todayStr]);

  const todayCounterCollection = useMemo(() => {
    return todayTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [todayTransactions]);

  const defaultersCount = useMemo(() => {
    return students.filter((s) => s.unpaidMonthsCount > 0).length;
  }, [students]);

  // Filter students based on counter search
  const searchedStudents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q) ||
        (s.applicationFormNo && s.applicationFormNo.toLowerCase().includes(q)) ||
        (s.cnic && s.cnic.toLowerCase().includes(q)) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.program.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [students, searchQuery]);

  // Quick banner instant search matches
  const bannerMatches = useMemo(() => {
    if (!bannerSearchQuery.trim()) return [];
    const q = bannerSearchQuery.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q) ||
        (s.applicationFormNo && s.applicationFormNo.toLowerCase().includes(q)) ||
        (s.cnic && s.cnic.toLowerCase().includes(q)) ||
        s.fatherName.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [students, bannerSearchQuery]);

  const safeCollege = college || {
    id: 'college_hchs_kht',
    code: 'HCHS-KHT',
    name: 'Harmain College of Health Sciences',
    city: 'Kahuta',
    tagline: 'Teaching Hospital & Health Sciences Academy',
    recognizedBy: 'Affiliated with UHS & PMDC Recognized',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Front-Desk Receptionist Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-emerald-500/30 relative overflow-hidden">
        {/* Soft background ambient glow accents */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Left: Branding & Counter Status */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Front-Desk Counter
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-emerald-200 border border-white/10">
                🏛️ {safeCollege.name} ({safeCollege.city})
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-950/60 border border-emerald-300/30 shrink-0">
                💳
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Cashier & Student Billing Counter
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5 max-w-xl font-medium">
                  Student search karein, monthly fee collect karein, aur official bank deposit receipts print karein. Har entry live sync ho rahi hai.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Structured Command Deck (Search & Action Buttons) */}
          <div className="flex flex-col gap-3 w-full xl:w-auto xl:min-w-[440px]">
            {/* Quick Search Input inside Banner */}
            <div className="relative w-full">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <SearchIcon className="w-4 h-4 text-emerald-400/80" />
                </div>
                <input
                  type="text"
                  placeholder="🔍 Quick search Form #, Roll No, CNIC, Naam..."
                  value={bannerSearchQuery}
                  onChange={(e) => setBannerSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-black/40 border border-white/20 hover:border-emerald-400/50 rounded-xl text-xs font-semibold text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:bg-slate-900/90 transition-all shadow-inner"
                />
                {bannerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setBannerSearchQuery('')}
                    className="absolute right-3 text-xs text-white/70 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Instant Banner Dropdown suggestions */}
              {bannerSearchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 max-h-60 overflow-y-auto">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
                    Matched Students ({bannerMatches.length}):
                  </div>
                  {bannerMatches.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500 font-medium">
                      Koi student match nahi hua
                    </div>
                  ) : (
                    bannerMatches.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onOpenReceiveFee(s);
                          setBannerSearchQuery('');
                        }}
                        className="p-2.5 rounded-xl hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition-colors border border-transparent hover:border-emerald-200"
                      >
                        <div>
                          <div className="font-extrabold text-slate-950 flex items-center gap-1.5">
                            <span>{s.name}</span>
                            <span className="font-mono text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                              {s.studentNo}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {s.applicationFormNo ? `Form: ${s.applicationFormNo} • ` : ''}
                            {s.cnic ? `CNIC: ${s.cnic} • ` : ''}
                            {s.program}
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                          Receive Fee →
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Structured Action Buttons Row */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenReceiveFee()}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-950/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <span className="text-sm font-bold">+</span>
                <span>Receive New Fee</span>
              </button>

              {onOpenAdmissionForm && (
                <button
                  type="button"
                  onClick={onOpenAdmissionForm}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-rose-500/40 active:scale-[0.98]"
                >
                  <span>📝 Admission Form</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenAI}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/15 active:scale-[0.98]"
                title="AI Fee Assistant"
              >
                <BotIcon className="w-4 h-4 text-emerald-300" />
                <span>AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receptionist Quick KPI Counter Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Counter Collection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>TODAY'S COUNTER COLLECTION</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">💵</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            Rs. {todayCounterCollection.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cash & bank vouchers cleared today</div>
        </div>

        {/* Receipts Issued Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>TODAY'S TRANSACTIONS</span>
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">🧾</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {todayTransactions.length} Receipts
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Computer vouchers issued</div>
        </div>

        {/* Defaulter Students with Pending Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>STUDENTS WITH PENDING DUES</span>
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800">⚠️</span>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            {defaultersCount} Students
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Require fee clearance</div>
        </div>

        {/* Total Active Campus Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>TOTAL CAMPUS STUDENTS</span>
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">🧑‍🎓</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {students.length} Enrolled
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all Health Sciences & Allied batches</div>
        </div>
      </div>

      {/* Front-Desk Quick Student Search & Fee Terminal */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🔍</span> Quick Student Fee Counter Search
            </h2>
            <p className="text-xs text-slate-500">
              Student ka naam ya roll number likhein taake foran fee collect ya 12-month ledger check kar sakein:
            </p>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type Admission Form # (e.g. HCHS-2026-0105), Roll No, CNIC (35201-...), or Student Name..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Results Cards */}
        {searchQuery.trim() && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-600">
              Search Results ({searchedStudents.length} found):
            </div>
            {searchedStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
                Koi student match nahi hua. Barah-e-karam sahi Admission Form #, Roll No, CNIC ya Naam darj karein.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchedStudents.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-500 transition-all flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 text-sm">{s.name}</span>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                            {s.studentNo}
                          </span>
                          {s.applicationFormNo && (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200">
                              📋 {s.applicationFormNo}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-600">
                          <span>{s.program}</span>
                          <span>•</span>
                          <span>S/D of {s.fatherName}</span>
                          {s.cnic && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-700 bg-slate-100 px-1 rounded">
                                CNIC: {s.cnic}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          s.unpaidMonthsCount > 0
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {s.unpaidMonthsCount > 0 ? `DUE: Rs. ${s.totalOutstandingAnnual.toLocaleString()}` : 'ALL PAID'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => onOpenReceiveFee(s)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>💳 Receive Fee</span>
                      </button>
                      <button
                        onClick={() => onOpenLedger(s)}
                        className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        View Ledger
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Today's Counter Receipts Journal */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Today's Counter Payment Receipts
            </h2>
            <p className="text-xs text-slate-500">
              Aaj counter par receive ki gayi fees aur unke printable vouchers ({todayTransactions.length} transactions)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Months Cleared</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount (PKR)</th>
                <th className="py-3 px-4 text-center">Print Voucher</th>
                {onDeleteTransaction && (
                  <th className="py-3 px-4 text-center">
                    {isPrincipal ? 'Principal Action' : 'Action'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayTransactions.length === 0 ? (
                <tr>
                  <td colSpan={onDeleteTransaction ? 8 : 7} className="py-8 text-center text-slate-400">
                    <p className="text-xs font-semibold">Aaj abhi tak counter par koi fee transaction record nahi hui.</p>
                  </td>
                </tr>
              ) : (
                todayTransactions.map((t) => {
                  const student = students.find((s) => s.id === t.studentId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">{t.receiptNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{t.studentName}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{t.studentNo}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {t.monthNames && t.monthNames.length > 0 ? t.monthNames.join(', ') : 'Fee Clearance'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{t.method}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">
                        Rs. {t.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onPrintReceipt(t, student)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                        >
                          <PrinterIcon className="w-3.5 h-3.5" />
                          <span>Print Voucher</span>
                        </button>
                      </td>
                      {onDeleteTransaction && (
                        <td className="py-3 px-4 text-center">
                          {isPrincipal ? (
                            <button
                              type="button"
                              onClick={() => onDeleteTransaction(t.id)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-lg font-bold text-[11px] shadow-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
                              title="Principal Authority: Yeh receipt delete karein"
                            >
                              <span>🗑️ Delete</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onDeleteTransaction(t.id)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg font-bold text-[11px] shadow-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
                              title="Sirf Principal ke paas receipt delete karne ka ikhtiyar hai (PIN darkar hoga)"
                            >
                              <span>🔒 Delete (PIN)</span>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

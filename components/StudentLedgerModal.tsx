'use client';
import React, { useState } from 'react';
import { Student, FeeHeadItem } from '../lib/types';
import { CheckCircleIcon, AlertCircleIcon, PrinterIcon } from './Icons';
import { normalizeStudentAcademicCycle } from '../lib/data';

interface StudentLedgerModalProps {
  student: Student | null;
  onClose: () => void;
  onCollectFee: (student: Student) => void;
  onPrintStatement: (student: Student) => void;
  onQuickPayMonth?: (studentId: string, monthName: string) => void;
  onQuickPayFeeHead?: (studentId: string, feeHeadId: string) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onDeleteStudent?: (studentId: string, studentName: string) => void;
  userRole?: 'PRINCIPAL' | 'RECEPTIONIST';
  isPrincipalUnlocked?: boolean;
  onRequestPrincipalUnlock?: () => void;
}

const AVAILABLE_PROGRAMS = [
  'F.Sc Medical Lab Technology (MLT)',
  'General Nursing / B.Sc Nursing',
  'Lady Health Visitor (LHV Nursing)',
  'Certified Nursing Assistant (CNA)',
  'Pharmacy Technician (Category-B)',
  'Operation Theater Technology (OTT)',
  'Dispenser / Clinical Assistant',
  'Radiography & Imaging Technology (RIT)',
  'Dental Hygiene & Tech (BDS Diploma)',
  'Doctor of Physical Therapy (DPT)',
  'MBBS Medical College Program',
  'BDS Dental Surgery Program',
];

export default function StudentLedgerModal({
  student,
  onClose,
  onCollectFee,
  onPrintStatement,
  onQuickPayMonth,
  onQuickPayFeeHead,
  onUpdateStudent,
  onDeleteStudent,
  userRole,
  isPrincipalUnlocked,
  onRequestPrincipalUnlock,
}: StudentLedgerModalProps) {
  const isPrincipal = userRole === 'PRINCIPAL' || !!isPrincipalUnlocked;

  const [selectedYearTab, setSelectedYearTab] = useState<'ALL' | 'Year 1' | 'Year 2'>('ALL');
  const [activeLedgerSection, setActiveLedgerSection] = useState<'ALL' | 'HEADS' | 'TUITION'>('ALL');

  // Program Transfer (Principal Authority) states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [targetProgram, setTargetProgram] = useState(student?.program || 'General Nursing / B.Sc Nursing');
  const [targetYearLevel, setTargetYearLevel] = useState(student?.yearLevel || '1st Year');
  const [transferReason, setTransferReason] = useState('Student requested course transfer. Approved by Principal.');

  // Monthly Tuition Fee Structure Adjustment (Principal Authority) states
  const [isFeeAdjustModalOpen, setIsFeeAdjustModalOpen] = useState(false);
  const [newMonthlyFeeRate, setNewMonthlyFeeRate] = useState<number>(student?.monthlyFee || 3500);
  const [newConcessionPercent, setNewConcessionPercent] = useState<number>(student?.concessionPercent || 0);
  const [feeRevisionReason, setFeeRevisionReason] = useState<string>('Monthly tuition rate revised by Principal.');

  // Custom Head addition states
  const [isAddingCustomHead, setIsAddingCustomHead] = useState(false);
  const [customHeadTitle, setCustomHeadTitle] = useState('');
  const [customHeadCategory, setCustomHeadCategory] = useState('Certificate / Diploma');
  const [customHeadAmount, setCustomHeadAmount] = useState<number>(6000);

  // Editing existing head states
  const [editingHeadId, setEditingHeadId] = useState<string | null>(null);
  const [editingHeadAmount, setEditingHeadAmount] = useState<number>(0);
  const [editingHeadTitle, setEditingHeadTitle] = useState<string>('');

  if (!student) return null;
  const currentStudent = normalizeStudentAcademicCycle(student);

  const year1Fees = currentStudent.monthlyFees.filter(m => m.academicYear === 'Year 1');
  const year2Fees = currentStudent.monthlyFees.filter(m => m.academicYear === 'Year 2');

  const displayedFees = selectedYearTab === 'ALL' 
    ? currentStudent.monthlyFees 
    : (selectedYearTab === 'Year 1' ? year1Fees : year2Fees);

  const feeHeads = student.feeHeads || [];
  const pendingHeads = feeHeads.filter(f => f.status === 'DUE' || f.status === 'PARTIAL');
  const totalHeadsExpected = feeHeads.reduce((s, f) => s + f.amount, 0);
  const totalHeadsPaid = feeHeads.reduce((s, f) => s + f.paidAmount, 0);
  const totalHeadsDue = totalHeadsExpected - totalHeadsPaid;

  const startEditingHead = (fh: FeeHeadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingHeadId(fh.id);
    setEditingHeadAmount(fh.amount);
    setEditingHeadTitle(fh.title);
  };

  const cancelEditingHead = () => {
    setEditingHeadId(null);
  };

  const saveEditingHead = (headId: string) => {
    if (!student || !student.feeHeads) return;

    const updatedHeads = student.feeHeads.map((fh) => {
      if (fh.id === headId) {
        const newAmt = Math.max(0, editingHeadAmount);
        const newPaid = Math.min(fh.paidAmount, newAmt);
        const newStatus =
          newAmt <= 0
            ? ('WAIVED' as const)
            : newPaid >= newAmt
            ? ('PAID' as const)
            : newPaid > 0
            ? ('PARTIAL' as const)
            : ('DUE' as const);
        return {
          ...fh,
          title: editingHeadTitle.trim() || fh.title,
          amount: newAmt,
          paidAmount: newPaid,
          status: newStatus,
        };
      }
      return fh;
    });

    const totalTuitionPayable = student.monthlyFees.reduce((acc, m) => acc + m.payableAmount, 0);
    const totalTuitionPaid = student.monthlyFees.reduce((acc, m) => acc + m.paidAmount, 0);
    const totalHeadsPayable = updatedHeads.reduce((acc, f) => acc + f.amount, 0);
    const totalHeadsPaid = updatedHeads.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalExpectedAnnual = totalTuitionPayable + totalHeadsPayable;
    const totalPaidAnnual = totalTuitionPaid + totalHeadsPaid;
    const totalOutstandingAnnual = totalExpectedAnnual - totalPaidAnnual;
    const pendingH = updatedHeads.filter((f) => f.status === 'DUE' || f.status === 'PARTIAL');

    const updatedStudent: Student = {
      ...student,
      feeHeads: updatedHeads,
      pendingFeeHeadsCount: pendingH.length,
      totalExpectedAnnual,
      totalPaidAnnual,
      totalOutstandingAnnual,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
    setEditingHeadId(null);
  };

  const handleAddCustomHead = () => {
    if (!student || !customHeadTitle.trim() || customHeadAmount <= 0) return;

    const newId = `head_${Date.now()}`;
    const newHead: FeeHeadItem = {
      id: newId,
      title: customHeadTitle.trim(),
      code: `CST-${Math.floor(10 + Math.random() * 90)}`,
      category: customHeadCategory,
      amount: customHeadAmount,
      paidAmount: 0,
      status: 'DUE',
      dueDate: new Date().toISOString().split('T')[0],
    };

    const existingHeads = student.feeHeads || [];
    const updatedHeads = [...existingHeads, newHead];

    const totalTuitionPayable = student.monthlyFees.reduce((acc, m) => acc + m.payableAmount, 0);
    const totalTuitionPaid = student.monthlyFees.reduce((acc, m) => acc + m.paidAmount, 0);
    const totalHeadsPayable = updatedHeads.reduce((acc, f) => acc + f.amount, 0);
    const totalHeadsPaid = updatedHeads.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalExpectedAnnual = totalTuitionPayable + totalHeadsPayable;
    const totalPaidAnnual = totalTuitionPaid + totalHeadsPaid;
    const totalOutstandingAnnual = totalExpectedAnnual - totalPaidAnnual;
    const pendingH = updatedHeads.filter((f) => f.status === 'DUE' || f.status === 'PARTIAL');

    const updatedStudent: Student = {
      ...student,
      feeHeads: updatedHeads,
      pendingFeeHeadsCount: pendingH.length,
      totalExpectedAnnual,
      totalPaidAnnual,
      totalOutstandingAnnual,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    setCustomHeadTitle('');
    setCustomHeadAmount(6000);
    setIsAddingCustomHead(false);
  };

  const handleDeleteHead = (headId: string) => {
    if (!student || !student.feeHeads) return;

    const updatedHeads = student.feeHeads.filter((fh) => fh.id !== headId);
    const totalTuitionPayable = student.monthlyFees.reduce((acc, m) => acc + m.payableAmount, 0);
    const totalTuitionPaid = student.monthlyFees.reduce((acc, m) => acc + m.paidAmount, 0);
    const totalHeadsPayable = updatedHeads.reduce((acc, f) => acc + f.amount, 0);
    const totalHeadsPaid = updatedHeads.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalExpectedAnnual = totalTuitionPayable + totalHeadsPayable;
    const totalPaidAnnual = totalTuitionPaid + totalHeadsPaid;
    const totalOutstandingAnnual = totalExpectedAnnual - totalPaidAnnual;
    const pendingH = updatedHeads.filter((f) => f.status === 'DUE' || f.status === 'PARTIAL');

    const updatedStudent: Student = {
      ...student,
      feeHeads: updatedHeads,
      pendingFeeHeadsCount: pendingH.length,
      totalExpectedAnnual,
      totalPaidAnnual,
      totalOutstandingAnnual,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };

  // Confirm Course / Program Migration (Principal Authority)
  const handleConfirmProgramTransfer = () => {
    if (!student) return;
    if (!targetProgram || targetProgram === student.program) {
      alert('Barah-e-karam koi mukhtalif naya course / program select karein.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const migrationLog = `[Course Transferred: "${student.program}" ➔ "${targetProgram}" (${targetYearLevel}) by Principal on ${today}]`;

    const updatedStudent: Student = {
      ...student,
      program: targetProgram,
      yearLevel: targetYearLevel,
      remarks: student.remarks ? `${student.remarks} | ${migrationLog}` : migrationLog,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    setIsTransferModalOpen(false);
    alert(`✅ Course Transfer Kamyab!\n\nStudent: ${student.name} (${student.studentNo})\nNaya Program: ${targetProgram} (${targetYearLevel})\n\nStudent ka fee structure aur tamaam pichla 2-saal ka ledger record barqarar hai.`);
  };

  // Principal Security Checks
  const handleAttemptOpenTransfer = () => {
    if (!isPrincipal) {
      if (onRequestPrincipalUnlock) {
        onRequestPrincipalUnlock();
      } else {
        alert('⚠️ Course / Program Transfer sirf Principal ki authority hai.');
      }
      return;
    }
    setTargetProgram(student.program);
    setTargetYearLevel(student.yearLevel || '1st Year');
    setIsTransferModalOpen(true);
  };

  const handleAttemptDeleteStudent = () => {
    if (!isPrincipal) {
      if (onRequestPrincipalUnlock) {
        onRequestPrincipalUnlock();
      } else {
        alert('⚠️ Student record delete karna sirf Principal ki authority hai.');
      }
      return;
    }
    if (onDeleteStudent && student) {
      onDeleteStudent(student.id, student.name);
    }
  };

  const handleAttemptAddCustomHead = () => {
    if (!isPrincipal) {
      if (onRequestPrincipalUnlock) {
        onRequestPrincipalUnlock();
      } else {
        alert('⚠️ Naya Fee Head shamil karna sirf Principal ki authority hai.');
      }
      return;
    }
    setIsAddingCustomHead(!isAddingCustomHead);
  };

  const handleAttemptEditHead = (fh: FeeHeadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPrincipal) {
      if (onRequestPrincipalUnlock) {
        onRequestPrincipalUnlock();
      } else {
        alert('⚠️ Fee Head amount edit karna sirf Principal ki authority hai.');
      }
      return;
    }
    startEditingHead(fh, e);
  };

  const handleAttemptDeleteHead = (headId: string) => {
    if (!isPrincipal) {
      if (onRequestPrincipalUnlock) {
        onRequestPrincipalUnlock();
      } else {
        alert('⚠️ Fee Head delete karna sirf Principal ki authority hai.');
      }
      return;
    }
    handleDeleteHead(headId);
  };

  const handleAttemptOpenFeeAdjust = () => {
    if (!isPrincipal) {
      if (onRequestPrincipalUnlock) {
        onRequestPrincipalUnlock();
      } else {
        alert('⚠️ Student ki Monthly Tuition Fee tabdeel karna sirf Principal ki authority hai. Receptionist ke liye admission rate locked hai.');
      }
      return;
    }
    setNewMonthlyFeeRate(student.monthlyFee || 3500);
    setNewConcessionPercent(student.concessionPercent || 0);
    setIsFeeAdjustModalOpen(true);
  };

  // Principal Fee Structure Revision: updates student.monthlyFee and recalibrates all remaining unpaid months!
  const handleConfirmFeeRevision = () => {
    if (!student) return;
    if (newMonthlyFeeRate <= 0) {
      alert('Barah-e-karam durust monthly tuition fee darj karein.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const oldFee = student.monthlyFee;
    const concessionFactor = 1 - (newConcessionPercent / 100);

    // Apply new monthly rate to all unpaid/due/partial months
    const updatedMonthlyFees = student.monthlyFees.map((mf) => {
      if (mf.status === 'PAID') {
        return mf; // Keep already paid historical months as-is
      }
      const newPayable = Math.round(newMonthlyFeeRate * concessionFactor);
      const remainingDue = Math.max(0, newPayable - mf.paidAmount);
      const newStatus = mf.paidAmount >= newPayable ? ('PAID' as const) : (mf.paidAmount > 0 ? ('PARTIAL' as const) : ('DUE' as const));
      return {
        ...mf,
        originalAmount: newMonthlyFeeRate,
        concessionAmount: Math.round(newMonthlyFeeRate * (newConcessionPercent / 100)),
        payableAmount: newPayable,
        status: newStatus,
      };
    });

    const feeHeads = student.feeHeads || [];
    const totalTuitionPayable = updatedMonthlyFees.reduce((acc, m) => acc + m.payableAmount, 0);
    const totalTuitionPaid = updatedMonthlyFees.reduce((acc, m) => acc + m.paidAmount, 0);
    const totalHeadsPayable = feeHeads.reduce((acc, f) => acc + f.amount, 0);
    const totalHeadsPaid = feeHeads.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalExpectedAnnual = totalTuitionPayable + totalHeadsPayable;
    const totalPaidAnnual = totalTuitionPaid + totalHeadsPaid;
    const totalOutstandingAnnual = totalExpectedAnnual - totalPaidAnnual;
    const unpaid = updatedMonthlyFees.filter((m) => m.status === 'DUE' || m.status === 'PARTIAL');

    const revisionLog = `[Tuition Revised: Rs. ${oldFee} ➔ Rs. ${newMonthlyFeeRate}/mo by Principal on ${today}. Reason: ${feeRevisionReason}]`;

    const updatedStudent: Student = {
      ...student,
      monthlyFee: newMonthlyFeeRate,
      concessionPercent: newConcessionPercent,
      concessionType: newConcessionPercent > 0 ? (student.concessionType !== 'None' ? student.concessionType : 'Merit Scholarship') : 'None',
      monthlyFees: updatedMonthlyFees,
      totalExpectedAnnual,
      totalPaidAnnual,
      totalOutstandingAnnual,
      unpaidMonthsCount: unpaid.length,
      unpaidMonthNames: unpaid.map((m) => m.monthName),
      remarks: student.remarks ? `${student.remarks} | ${revisionLog}` : revisionLog,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    setIsFeeAdjustModalOpen(false);
    alert(`✅ Student Monthly Tuition Fee Kamyabi Se Tabdeel Kar Di Gayi!\n\nNayi Monthly Fee: Rs. ${newMonthlyFeeRate.toLocaleString()}/month\nTamam baaqi ${unpaid.length} mahinon par nayi fee structure laagu ho gayi hai.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-lg">
              {student.gender === 'Female' ? '👩‍⚕️' : '👨‍⚕️'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold">{student.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {student.studentNo}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  student.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {student.status}
                </span>
                {student.cnic && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-teal-300 border border-slate-700">
                    CNIC: {student.cnic}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-2 mt-1">
                <span className="font-extrabold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  🎓 {student.program}
                </span>
                <span>•</span>
                <span>{student.yearLevel}</span>
                <span>•</span>
                <span>S/D of {student.fatherName}</span>
                <span>•</span>
                <span>📞 {student.phone}</span>
              </p>

              {/* Course Transfer, Monthly Fee Adjustment & Student Management Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleAttemptOpenFeeAdjust}
                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  <span>💰 Adjust Monthly Fee (Principal Authority)</span>
                </button>

                <button
                  type="button"
                  onClick={handleAttemptOpenTransfer}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  <span>🎓 Change Course / Transfer Program</span>
                </button>

                {onDeleteStudent && (
                  <button
                    type="button"
                    onClick={handleAttemptDeleteStudent}
                    className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                    title="Delete student record if duplicate"
                  >
                    <span>🗑️ Delete / Duplicate Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Financial KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs shrink-0">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-semibold">Institutional Heads</span>
            <div className="text-sm font-bold text-slate-900 mt-1">
              Due: <span className={totalHeadsDue > 0 ? 'text-rose-600 font-extrabold' : 'text-emerald-700'}>Rs. {totalHeadsDue.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-slate-500">
              Paid: Rs. {totalHeadsPaid.toLocaleString()} / {totalHeadsExpected.toLocaleString()}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-semibold">Total 2-Yr Expected (All)</span>
            <div className="text-sm font-bold text-slate-900 mt-1">Rs. {student.totalExpectedAnnual.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400">Tuition + 9 Institutional Heads</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-emerald-700 font-semibold">Total Paid to Date</span>
            <div className="text-sm font-bold text-emerald-700 mt-1">Rs. {student.totalPaidAnnual.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Cleared to date</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-rose-700 font-semibold">Current Overdue Arrears</span>
            <div className="text-sm font-bold text-rose-700 mt-1">Rs. {(student.currentOverdueAmount || 0).toLocaleString()}</div>
            <span className="text-[10px] text-rose-600 font-bold">
              {(student.currentOverdueAmount || 0) > 0
                ? `${student.unpaidMonthsCount} Mo Overdue`
                : 'Zero Dues (Cleared)'}
            </span>
          </div>
        </div>

        {/* Section Navigation Tabs: All vs Institutional Heads vs Tuition */}
        <div className="px-5 pt-3 flex items-center gap-1.5 bg-slate-50 border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveLedgerSection('ALL')}
            className={`py-1.5 px-3 rounded-t-lg font-bold text-xs transition-all cursor-pointer ${
              activeLedgerSection === 'ALL'
                ? 'bg-white text-slate-900 border-t-2 border-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Complete Overview (All)
          </button>
          <button
            type="button"
            onClick={() => setActiveLedgerSection('HEADS')}
            className={`py-1.5 px-3 rounded-t-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              activeLedgerSection === 'HEADS'
                ? 'bg-white text-emerald-900 border-t-2 border-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <span>🏛️ Institutional Heads (9)</span>
            {pendingHeads.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {pendingHeads.length} Due
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveLedgerSection('TUITION')}
            className={`py-1.5 px-3 rounded-t-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              activeLedgerSection === 'TUITION'
                ? 'bg-white text-teal-900 border-t-2 border-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-teal-900'
            }`}
          >
            <span>📅 Monthly Tuition (24 Mo)</span>
            {student.unpaidMonthsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                {student.unpaidMonthsCount} Due
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* SECTION 1: Institutional & Academic Fee Heads */}
          {(activeLedgerSection === 'ALL' || activeLedgerSection === 'HEADS') && feeHeads.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase">
                      Institutional & Academic Heads ({feeHeads.length})
                    </span>
                    <span>Registration, Exam, Admission, Diploma, Card & Training</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Har fee head ki amount ko apni marzi se edit kar saktay hain ya naya head add kar saktay hain.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAttemptAddCustomHead}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] shadow-xs cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <span>➕ Add Custom Fee Head</span>
                  </button>
                  <span className="text-xs font-bold text-slate-700">
                    Total: <span className="font-mono text-slate-900">Rs. {totalHeadsExpected.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Form to Add New Custom Fee Head */}
              {isAddingCustomHead && (
                <div className="mb-3.5 p-3 bg-white rounded-xl border-2 border-emerald-600 shadow-md animate-fadeIn">
                  <div className="font-bold text-xs text-emerald-900 mb-2 flex items-center justify-between">
                    <span>➕ Add New Fee Head to Student Record</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomHead(false)}
                      className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Fee Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Certificate / Diploma Fee, Student Card Fee"
                        value={customHeadTitle}
                        onChange={(e) => setCustomHeadTitle(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Category</label>
                      <select
                        value={customHeadCategory}
                        onChange={(e) => setCustomHeadCategory(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="Certificate / Diploma">Certificate / Diploma</option>
                        <option value="Card">Student ID Card</option>
                        <option value="Admission">Admission / Registration</option>
                        <option value="Examination">Examination / Midterm</option>
                        <option value="Academic">Academic / Books / Labs</option>
                        <option value="Clinical">Hospital Training / Clinical</option>
                        <option value="Administrative">Administrative / Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Amount (PKR)</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          placeholder="Amount in PKR"
                          value={customHeadAmount}
                          onChange={(e) => setCustomHeadAmount(Number(e.target.value))}
                          className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomHead}
                          disabled={!customHeadTitle.trim() || customHeadAmount <= 0}
                          className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm whitespace-nowrap cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fee Heads Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 mb-4">
                {feeHeads.map((fh) => {
                  const isPaid = fh.status === 'PAID';
                  const remaining = fh.amount - fh.paidAmount;
                  const isCurrentlyEditing = editingHeadId === fh.id;

                  // Inline Edit Box for this Head
                  if (isCurrentlyEditing) {
                    return (
                      <div
                        key={fh.id}
                        className="p-3 rounded-xl border-2 border-emerald-600 bg-white shadow-md col-span-1 sm:col-span-2 space-y-1.5 animate-fadeIn"
                      >
                        <div className="text-[10px] font-bold text-emerald-800 flex items-center justify-between">
                          <span>✏️ Edit Fee Head & Amount</span>
                          <button
                            type="button"
                            onClick={() => cancelEditingHead()}
                            className="text-slate-400 hover:text-slate-700 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingHeadTitle}
                            onChange={(e) => setEditingHeadTitle(e.target.value)}
                            className="flex-1 p-1.5 border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                            placeholder="Fee Head Title"
                          />
                          <input
                            type="number"
                            value={editingHeadAmount}
                            onChange={(e) => setEditingHeadAmount(Number(e.target.value))}
                            className="w-28 p-1.5 border border-slate-300 rounded text-xs font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                            placeholder="Amount"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => cancelEditingHead()}
                            className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditingHead(fh.id)}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold rounded shadow-xs cursor-pointer"
                          >
                            ✓ Save Amount
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={fh.id}
                      className={`p-3 rounded-xl border-2 flex flex-col justify-between transition-all ${
                        isPaid
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50/70 border-rose-300 text-rose-950 ring-1 ring-rose-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/70 text-slate-700 border border-slate-200">
                            {fh.category}
                          </span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                            isPaid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {isPaid ? '✓ PAID' : 'DUE'}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 leading-snug">
                          {fh.title}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Fee:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">Rs. {fh.amount.toLocaleString()}</span>
                            <button
                              type="button"
                              onClick={(e) => handleAttemptEditHead(fh, e)}
                              className="text-[9px] text-slate-400 hover:text-slate-800 font-bold px-1 rounded bg-white border border-slate-200"
                              title={isPrincipal ? 'Edit fee amount' : 'Principal PIN required'}
                            >
                              ✏️ Edit
                            </button>
                            {fh.id.startsWith('head_') && (
                              <button
                                type="button"
                                onClick={() => handleAttemptDeleteHead(fh.id)}
                                className="text-[9px] text-rose-600 hover:text-rose-800 font-bold px-1 rounded bg-white border border-rose-200"
                                title={isPrincipal ? 'Delete fee head' : 'Principal PIN required'}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                        {!isPaid && (
                          <div className="flex items-center justify-between text-xs mt-0.5">
                            <span className="text-rose-600 font-bold">Due:</span>
                            <span className="font-black text-rose-600">Rs. {remaining.toLocaleString()}</span>
                          </div>
                        )}
                        {isPaid && fh.paidDate && (
                          <div className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                            Cleared: {fh.paidDate}
                          </div>
                        )}

                        {!isPaid && onQuickPayFeeHead && (
                          <button
                            type="button"
                            onClick={() => onQuickPayFeeHead(student.id, fh.id)}
                            className="mt-2 w-full py-1 px-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                            title={`Click to mark ${fh.title} as Paid`}
                          >
                            <span>✓</span> Quick Pay Head
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: 2-Year (24-Month) Detailed Timeline */}
          {(activeLedgerSection === 'ALL' || activeLedgerSection === 'TUITION') && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <span>Academic Cycle: 2-Year Tuition Ledger (24 Months)</span>
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">Year 1 & Year 2</span>
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-600">
                    Decided Tuition Rate: <strong className="text-slate-900 font-mono">Rs. {student.monthlyFee.toLocaleString()}/mo</strong>
                  </span>
                  <span className="text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.2 rounded-full" title="Locked at admission. Only Principal can modify.">
                    🔒 Decided Rate Locked (24 Months)
                  </span>
                  <button
                    type="button"
                    onClick={handleAttemptOpenFeeAdjust}
                    className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>💰 Adjust Monthly Fee (Principal Authority)</span>
                  </button>
                </div>
              </div>

            {/* Year Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedYearTab('ALL')}
                className={`py-1 px-2.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                  selectedYearTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📋 Both Years (24 Mo)
              </button>
              <button
                type="button"
                onClick={() => setSelectedYearTab('Year 1')}
                className={`py-1 px-2.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                  selectedYearTab === 'Year 1'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-900'
                }`}
              >
                🎓 Year 1 (2026-27)
              </button>
              <button
                type="button"
                onClick={() => setSelectedYearTab('Year 2')}
                className={`py-1 px-2.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                  selectedYearTab === 'Year 2'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-900'
                }`}
              >
                🎓 Year 2 (2027-28)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
            {displayedFees.map((mf) => {
              const isPaid = mf.status === 'PAID';
              const isDue = mf.status === 'DUE';
              const isPartial = mf.status === 'PARTIAL';
              const isUpcoming = mf.status === 'UPCOMING';
              const shortName = mf.shortMonth || mf.monthName.split(' ')[0];

              return (
                <div
                  key={mf.monthName}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    isPaid
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                      : isPartial
                      ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs ring-1 ring-amber-300'
                      : isUpcoming
                      ? 'bg-slate-50 border-slate-300 text-slate-700 shadow-2xs'
                      : 'bg-rose-50 border-rose-400 text-rose-950 shadow-sm shadow-rose-100 ring-1 ring-rose-300 animate-pulse-subtle'
                  }`}
                >
                  <div className="text-xs font-extrabold tracking-wider uppercase mb-1 flex items-center justify-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-600' : isPartial ? 'bg-amber-500' : isUpcoming ? 'bg-slate-400' : 'bg-rose-600'}`}></span>
                    {shortName} {mf.year}
                  </div>
                  <div
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black mb-1 ${
                      isPaid
                        ? 'bg-emerald-600 text-white'
                        : isPartial
                        ? 'bg-amber-500 text-white'
                        : isUpcoming
                        ? 'bg-slate-200 text-slate-700 border border-slate-300'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isUpcoming ? 'UPCOMING' : mf.status}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Rs. {mf.paidAmount.toLocaleString()} / {mf.payableAmount.toLocaleString()}
                  </div>
                  {isDue && (
                    <div className="text-[10px] text-rose-600 font-semibold mt-1">
                      Due: Rs. {mf.payableAmount.toLocaleString()}
                    </div>
                  )}
                  {isUpcoming && (
                    <div className="text-[10px] text-slate-500 font-medium mt-1">
                      Scheduled (Advance)
                    </div>
                  )}
                  {isPaid && (
                    <div className="text-[9px] text-emerald-700 font-medium mt-1">
                      Paid: {mf.paidDate}
                    </div>
                  )}
                  {(isDue || isPartial) && onQuickPayMonth && (
                    <button
                      type="button"
                      onClick={() => onQuickPayMonth(student.id, mf.monthName)}
                      className="mt-2 w-full py-1 px-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                      title={`Click to mark ${mf.monthName} as Paid`}
                    >
                      <span>✓</span> Quick Pay
                    </button>
                  )}
                  {isUpcoming && onQuickPayMonth && (
                    <button
                      type="button"
                      onClick={() => onQuickPayMonth(student.id, mf.monthName)}
                      className="mt-2 w-full py-1 px-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                      title={`Pay ${mf.monthName} in advance`}
                    >
                      <span>📅</span> Pay Advance
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Table Representation */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Year / Month</th>
                  <th className="py-2.5 px-3">Base Amount</th>
                  <th className="py-2.5 px-3">Concession</th>
                  <th className="py-2.5 px-3">Payable</th>
                  <th className="py-2.5 px-3">Paid Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Transaction / Date</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedFees.map((mf) => (
                  <tr key={mf.monthName} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-bold text-slate-800 flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        mf.academicYear === 'Year 1' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {mf.academicYear || (mf.year === 2026 ? 'Year 1' : 'Year 2')}
                      </span>
                      <span>{mf.monthName}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">Rs. {mf.originalAmount.toLocaleString()}</td>
                    <td className="py-2 px-3 text-teal-700 font-semibold">
                      {mf.concessionAmount > 0 ? `- Rs. ${mf.concessionAmount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900">Rs. {mf.payableAmount.toLocaleString()}</td>
                    <td className="py-2 px-3 font-bold text-emerald-700">Rs. {mf.paidAmount.toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mf.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : mf.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : mf.status === 'UPCOMING'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {mf.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                      {mf.transactionRef ? `${mf.transactionRef} (${mf.paymentMethod})` : 'Pending'}
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      {(mf.status === 'DUE' || mf.status === 'PARTIAL') && onQuickPayMonth ? (
                        <button
                          type="button"
                          onClick={() => onQuickPayMonth(student.id, mf.monthName)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs cursor-pointer inline-flex items-center gap-1 transition-all"
                          title={`Directly clear ${mf.monthName} fee`}
                        >
                          <span>✓</span> Mark Paid
                        </button>
                      ) : mf.status === 'UPCOMING' && onQuickPayMonth ? (
                        <button
                          type="button"
                          onClick={() => onQuickPayMonth(student.id, mf.monthName)}
                          className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[10px] shadow-xs cursor-pointer inline-flex items-center gap-1 transition-all"
                          title={`Pay ${mf.monthName} in advance`}
                        >
                          <span>📅</span> Pay Advance
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-bold">✓ Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => onPrintStatement(student)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <PrinterIcon className="w-4 h-4 text-slate-500" />
            <span>Print Student Ledger Statement</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onCollectFee(student);
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
            >
              + Collect Pending Fee
            </button>
          </div>
        </div>
      </div>

      {/* Course / Program Migration Dialog (Principal Authority) */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-900 rounded-xl text-lg">🎓</span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Transfer Course / Change Program
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Principal Authority Action • Fee ledger will remain intact
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Student info strip */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <strong className="text-slate-900">{student.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Roll / Admission No:</span>
                <strong className="font-mono text-indigo-700">{student.studentNo}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Enrolled Program:</span>
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {student.program} ({student.yearLevel})
                </span>
              </div>
            </div>

            {/* Transfer Selection */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Select New Course / Program *
                </label>
                <select
                  value={targetProgram}
                  onChange={(e) => setTargetProgram(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  {AVAILABLE_PROGRAMS.map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Class / Year Level *
                </label>
                <select
                  value={targetYearLevel}
                  onChange={(e) => setTargetYearLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Transfer Authority Notes / Reason
                </label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g. Student requested shift to Nursing after 2 months. Approved by Principal."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              {/* Important Policy Note */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <b className="flex items-center gap-1 font-bold">
                  <span>ℹ️</span> Principal Policy Note:
                </b>
                <p className="leading-relaxed">
                  Student ka course badal diya jaye ga. Pichli tamam payments, fee vouchers, aur 2-saal ka billing schedule waisa hi barqarar rahe ga bina kisi loss ke.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmProgramTransfer}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-amber-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <span>✓ Confirm Course Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Tuition Fee Revision Modal (Principal / Executive Authority Only) */}
      {isFeeAdjustModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border-2 border-emerald-600 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Adjust Monthly Tuition Fee (Principal Authority)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Admission ke waqt tay shuda mahana fee ko tabdeel karein
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFeeAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Student Info Strip */}
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Student:</span>
                <strong className="text-slate-900">{student.name} ({student.studentNo})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Current Decided Fee:</span>
                <span className="font-bold text-rose-700 font-mono">
                  Rs. {student.monthlyFee.toLocaleString()}/month
                  {student.concessionPercent > 0 && ` (-${student.concessionPercent}%)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Remaining Unpaid Months:</span>
                <span className="font-black text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full">
                  {student.unpaidMonthsCount} Months Due
                </span>
              </div>
            </div>

            {/* Adjustment Form */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    New Monthly Tuition Fee (PKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 font-bold text-emerald-800 text-xs">Rs.</span>
                    <input
                      type="number"
                      value={newMonthlyFeeRate}
                      onChange={(e) => setNewMonthlyFeeRate(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
                      min={0}
                      step={500}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Scholarship / Concession (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newConcessionPercent}
                      onChange={(e) => setNewConcessionPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
                      min={0}
                      max={100}
                    />
                    <span className="absolute right-3 top-2 font-bold text-slate-400 text-xs">%</span>
                  </div>
                </div>
              </div>

              {/* Net Calculated Rate */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Net Student Payable Per Month:</span>
                <span className="font-mono font-black text-emerald-800 text-sm">
                  Rs. {Math.round(newMonthlyFeeRate * (1 - newConcessionPercent / 100)).toLocaleString()}/mo
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Revision Reason / Principal Authorization Note
                </label>
                <input
                  type="text"
                  value={feeRevisionReason}
                  onChange={(e) => setFeeRevisionReason(e.target.value)}
                  placeholder="e.g. Fee concession approved by Principal / Merit discount applied."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs"
                />
              </div>

              {/* Security Policy Note */}
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                <b className="flex items-center gap-1 font-bold">
                  <span>🔒</span> Principal Authority Policy:
                </b>
                <p className="leading-relaxed">
                  Yeh nayi fee student ke aane wale tamam <strong>{student.unpaidMonthsCount} unpaid months</strong> par automatically laagu ho jayegi. Counter par cashier/receptionist ko yahi updated fee show hogi. Purane ada shuda months ka record mehfooz rahe ga.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFeeAdjustModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFeeRevision}
                disabled={newMonthlyFeeRate <= 0}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-700/20 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <span>✓ Update Fee Structure</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

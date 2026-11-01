'use client';
import React, { useState } from 'react';
import { Student, PaymentMethod, PaymentTransaction, FeeHeadItem } from '../lib/types';
import { normalizeStudentAcademicCycle } from '../lib/data';

interface ReceiveFeeModalProps {
  students: Student[];
  preselectedStudent: Student | null;
  onClose: () => void;
  onPaymentSuccess: (transaction: PaymentTransaction, updatedStudent: Student, shouldPrint?: boolean) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onOpenAdmissionForm?: () => void;
  userRole?: 'PRINCIPAL' | 'RECEPTIONIST';
  isPrincipalUnlocked?: boolean;
  onRequestPrincipalUnlock?: () => void;
}

export default function ReceiveFeeModal({
  students,
  preselectedStudent,
  onClose,
  onPaymentSuccess,
  onUpdateStudent,
  onOpenAdmissionForm,
  userRole,
  isPrincipalUnlocked,
  onRequestPrincipalUnlock,
}: ReceiveFeeModalProps) {
  const isPrincipal = userRole === 'PRINCIPAL' || !!isPrincipalUnlocked;
  const normalizedStudents = React.useMemo(() => {
    return (students || []).map(normalizeStudentAcademicCycle);
  }, [students]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudent ? preselectedStudent.id : normalizedStudents[0]?.id || ''
  );
  const [studentSearchFilter, setStudentSearchFilter] = useState('');

  const filteredStudents = React.useMemo(() => {
    if (!studentSearchFilter.trim()) return normalizedStudents;
    const q = studentSearchFilter.toLowerCase().trim();
    return normalizedStudents.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.studentNo.toLowerCase().includes(q) ||
      (s.applicationFormNo && s.applicationFormNo.toLowerCase().includes(q)) ||
      (s.cnic && s.cnic.toLowerCase().includes(q)) ||
      s.fatherName.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    );
  }, [normalizedStudents, studentSearchFilter]);
  
  const currentStudent = normalizedStudents.find((s) => s.id === selectedStudentId) || normalizedStudents[0];
  
  // Pending months for this student
  const pendingMonths = currentStudent?.monthlyFees.filter(
    (m) => m.status === 'DUE' || m.status === 'PARTIAL'
  ) || [];

  const [selectedYearTab, setSelectedYearTab] = useState<'ALL' | 'Year 1' | 'Year 2'>('ALL');
  const [activeFeeCategory, setActiveFeeCategory] = useState<'ALL' | 'HEADS' | 'TUITION'>('ALL');

  // Custom Head addition states
  const [isAddingCustomHead, setIsAddingCustomHead] = useState(false);
  const [customHeadTitle, setCustomHeadTitle] = useState('');
  const [customHeadCategory, setCustomHeadCategory] = useState('Certificate / Diploma');
  const [customHeadAmount, setCustomHeadAmount] = useState<number>(6000);

  // Editing existing head states
  const [editingHeadId, setEditingHeadId] = useState<string | null>(null);
  const [editingHeadAmount, setEditingHeadAmount] = useState<number>(0);
  const [editingHeadTitle, setEditingHeadTitle] = useState<string>('');

  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  const pendingFeeHeads = currentStudent?.feeHeads?.filter(
    (fh) => fh.status === 'DUE' || fh.status === 'PARTIAL'
  ) || [];

  const [selectedFeeHeadIds, setSelectedFeeHeadIds] = useState<string[]>([]);

  const calculateTotalToPay = (months: string[] = selectedMonths, feeHeadIds: string[] = selectedFeeHeadIds) => {
    if (!currentStudent) return 0;
    const monthsTotal = months.reduce((sum, mName) => {
      const rec = currentStudent.monthlyFees.find((m) => m.monthName === mName);
      if (!rec) return sum;
      return sum + (rec.payableAmount - rec.paidAmount);
    }, 0);
    const headsTotal = feeHeadIds.reduce((sum, fId) => {
      const rec = currentStudent.feeHeads?.find((f) => f.id === fId);
      if (!rec) return sum;
      return sum + (rec.amount - rec.paidAmount);
    }, 0);
    return monthsTotal + headsTotal;
  };

  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [refNo, setRefNo] = useState<string>(`HBL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [note, setNote] = useState<string>('Tuition & institutional fees cleared at bursar office');

  const toggleMonth = (mName: string) => {
    let updated: string[];
    if (selectedMonths.includes(mName)) {
      updated = selectedMonths.filter((m) => m !== mName);
    } else {
      updated = [...selectedMonths, mName];
    }
    setSelectedMonths(updated);
    setAmountPaid(calculateTotalToPay(updated, selectedFeeHeadIds));
  };

  const toggleFeeHead = (fId: string) => {
    let updated: string[];
    if (selectedFeeHeadIds.includes(fId)) {
      updated = selectedFeeHeadIds.filter((id) => id !== fId);
    } else {
      updated = [...selectedFeeHeadIds, fId];
    }
    setSelectedFeeHeadIds(updated);
    setAmountPaid(calculateTotalToPay(selectedMonths, updated));
  };

  const selectAllPending = () => {
    if (!currentStudent) return;
    const allPending = currentStudent.monthlyFees
      .filter((m) => m.status === 'DUE' || m.status === 'PARTIAL')
      .map((m) => m.monthName);
    setSelectedMonths(allPending);
    setAmountPaid(calculateTotalToPay(allPending, selectedFeeHeadIds));
  };

  const selectAllPendingHeads = () => {
    if (!currentStudent || !currentStudent.feeHeads) return;
    const allPendingHeads = currentStudent.feeHeads
      .filter((fh) => fh.status === 'DUE' || fh.status === 'PARTIAL')
      .map((fh) => fh.id);
    const merged = Array.from(new Set([...selectedFeeHeadIds, ...allPendingHeads]));
    setSelectedFeeHeadIds(merged);
    setAmountPaid(calculateTotalToPay(selectedMonths, merged));
  };

  const selectYearPending = (yearFilter: 'Year 1' | 'Year 2') => {
    if (!currentStudent) return;
    const yrPending = currentStudent.monthlyFees
      .filter((m) => m.academicYear === yearFilter && (m.status === 'DUE' || m.status === 'PARTIAL'))
      .map((m) => m.monthName);
    
    const merged = Array.from(new Set([...selectedMonths, ...yrPending]));
    setSelectedMonths(merged);
    setAmountPaid(calculateTotalToPay(merged, selectedFeeHeadIds));
  };

  const deselectAll = () => {
    setSelectedMonths([]);
    setSelectedFeeHeadIds([]);
    setAmountPaid(0);
  };

  const handleAttemptEditHead = (fh: FeeHeadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPrincipal) {
      if (onRequestPrincipalUnlock) {
        onRequestPrincipalUnlock();
      } else {
        alert('⚠️ Fee Head Amount edit karna sirf Principal ki authority hai. Receptionist ke liye student ki admission fee fixed hai.');
      }
      return;
    }
    startEditingHead(fh, e);
  };

  const handleAttemptAddCustomHead = () => {
    if (!isPrincipal) {
      if (onRequestPrincipalUnlock) {
        onRequestPrincipalUnlock();
      } else {
        alert('⚠️ Naya Fee Head add karna sirf Principal / Director ki authority hai.');
      }
      return;
    }
    setIsAddingCustomHead(!isAddingCustomHead);
  };

  const startEditingHead = (fh: FeeHeadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingHeadId(fh.id);
    setEditingHeadAmount(fh.amount);
    setEditingHeadTitle(fh.title);
  };

  const cancelEditingHead = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingHeadId(null);
  };

  const saveEditingHead = (headId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStudent || !currentStudent.feeHeads) return;

    const updatedHeads = currentStudent.feeHeads.map((fh) => {
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

    const totalTuitionPayable = currentStudent.monthlyFees.reduce((acc, m) => acc + m.payableAmount, 0);
    const totalTuitionPaid = currentStudent.monthlyFees.reduce((acc, m) => acc + m.paidAmount, 0);
    const totalHeadsPayable = updatedHeads.reduce((acc, f) => acc + f.amount, 0);
    const totalHeadsPaid = updatedHeads.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalExpectedAnnual = totalTuitionPayable + totalHeadsPayable;
    const totalPaidAnnual = totalTuitionPaid + totalHeadsPaid;
    const totalOutstandingAnnual = totalExpectedAnnual - totalPaidAnnual;
    const pendingHeads = updatedHeads.filter((f) => f.status === 'DUE' || f.status === 'PARTIAL');

    const updatedStudent: Student = {
      ...currentStudent,
      feeHeads: updatedHeads,
      pendingFeeHeadsCount: pendingHeads.length,
      totalExpectedAnnual,
      totalPaidAnnual,
      totalOutstandingAnnual,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
    setEditingHeadId(null);
    setAmountPaid(calculateTotalToPay(selectedMonths, selectedFeeHeadIds));
  };

  const handleAddCustomHead = () => {
    if (!currentStudent || !customHeadTitle.trim() || customHeadAmount <= 0) return;

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

    const existingHeads = currentStudent.feeHeads || [];
    const updatedHeads = [...existingHeads, newHead];

    const totalTuitionPayable = currentStudent.monthlyFees.reduce((acc, m) => acc + m.payableAmount, 0);
    const totalTuitionPaid = currentStudent.monthlyFees.reduce((acc, m) => acc + m.paidAmount, 0);
    const totalHeadsPayable = updatedHeads.reduce((acc, f) => acc + f.amount, 0);
    const totalHeadsPaid = updatedHeads.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalExpectedAnnual = totalTuitionPayable + totalHeadsPayable;
    const totalPaidAnnual = totalTuitionPaid + totalHeadsPaid;
    const totalOutstandingAnnual = totalExpectedAnnual - totalPaidAnnual;
    const pendingHeads = updatedHeads.filter((f) => f.status === 'DUE' || f.status === 'PARTIAL');

    const updatedStudent: Student = {
      ...currentStudent,
      feeHeads: updatedHeads,
      pendingFeeHeadsCount: pendingHeads.length,
      totalExpectedAnnual,
      totalPaidAnnual,
      totalOutstandingAnnual,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    // Auto-select newly added head
    const nextSelectedHeads = [...selectedFeeHeadIds, newId];
    setSelectedFeeHeadIds(nextSelectedHeads);
    setAmountPaid(calculateTotalToPay(selectedMonths, nextSelectedHeads));

    // Reset form
    setCustomHeadTitle('');
    setCustomHeadAmount(6000);
    setIsAddingCustomHead(false);
  };

  const handleDeleteHead = (headId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPrincipal) {
      if (onRequestPrincipalUnlock) {
        onRequestPrincipalUnlock();
      } else {
        alert('⚠️ Fee Head delete karna sirf Principal / Director ki authority hai.');
      }
      return;
    }
    if (!currentStudent || !currentStudent.feeHeads) return;

    const updatedHeads = currentStudent.feeHeads.filter((fh) => fh.id !== headId);
    const totalTuitionPayable = currentStudent.monthlyFees.reduce((acc, m) => acc + m.payableAmount, 0);
    const totalTuitionPaid = currentStudent.monthlyFees.reduce((acc, m) => acc + m.paidAmount, 0);
    const totalHeadsPayable = updatedHeads.reduce((acc, f) => acc + f.amount, 0);
    const totalHeadsPaid = updatedHeads.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalExpectedAnnual = totalTuitionPayable + totalHeadsPayable;
    const totalPaidAnnual = totalTuitionPaid + totalHeadsPaid;
    const totalOutstandingAnnual = totalExpectedAnnual - totalPaidAnnual;
    const pendingHeads = updatedHeads.filter((f) => f.status === 'DUE' || f.status === 'PARTIAL');

    const updatedStudent: Student = {
      ...currentStudent,
      feeHeads: updatedHeads,
      pendingFeeHeadsCount: pendingHeads.length,
      totalExpectedAnnual,
      totalPaidAnnual,
      totalOutstandingAnnual,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    const nextSelectedHeads = selectedFeeHeadIds.filter((id) => id !== headId);
    setSelectedFeeHeadIds(nextSelectedHeads);
    setAmountPaid(calculateTotalToPay(selectedMonths, nextSelectedHeads));
  };

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    setSelectedMonths([]);
    setSelectedFeeHeadIds([]);
    setAmountPaid(0);
  };

  const handleProcessPayment = (shouldPrint: boolean = false) => {
    const finalAmount = calculateTotalToPay(selectedMonths, selectedFeeHeadIds);
    if (!currentStudent || (selectedMonths.length === 0 && selectedFeeHeadIds.length === 0) || finalAmount <= 0) return;

    // 1. Clone and update monthly fees
    const updatedMonthlyFees = currentStudent.monthlyFees.map((mf) => {
      if (selectedMonths.includes(mf.monthName)) {
        return {
          ...mf,
          paidAmount: mf.payableAmount,
          status: 'PAID' as const,
          paidDate: new Date().toISOString().split('T')[0],
          paymentMethod: method,
          transactionRef: refNo,
        };
      }
      return mf;
    });

    // 2. Clone and update fee heads
    const updatedFeeHeads = (currentStudent.feeHeads || []).map((fh) => {
      if (selectedFeeHeadIds.includes(fh.id)) {
        return {
          ...fh,
          paidAmount: fh.amount,
          status: 'PAID' as const,
          paidDate: new Date().toISOString().split('T')[0],
          paymentMethod: method,
          transactionRef: refNo,
        };
      }
      return fh;
    });

    const totalTuitionPayable = updatedMonthlyFees.reduce((acc, m) => acc + m.payableAmount, 0);
    const totalTuitionPaid = updatedMonthlyFees.reduce((acc, m) => acc + m.paidAmount, 0);
    const totalHeadsPayable = updatedFeeHeads.reduce((acc, f) => acc + f.amount, 0);
    const totalHeadsPaid = updatedFeeHeads.reduce((acc, f) => acc + f.paidAmount, 0);

    const totalExpectedAnnual = totalTuitionPayable + totalHeadsPayable;
    const totalPaidAnnual = totalTuitionPaid + totalHeadsPaid;
    const totalOutstandingAnnual = totalExpectedAnnual - totalPaidAnnual;
    const unpaid = updatedMonthlyFees.filter((m) => m.status === 'DUE' || m.status === 'PARTIAL');
    const pendingHeads = updatedFeeHeads.filter((f) => f.status === 'DUE' || f.status === 'PARTIAL');
    const currentOverdueAmount = unpaid.reduce((acc, m) => acc + (m.payableAmount - m.paidAmount), 0) +
      pendingHeads.reduce((acc, f) => acc + (f.amount - f.paidAmount), 0);

    const updatedStudent: Student = normalizeStudentAcademicCycle({
      ...currentStudent,
      monthlyFees: updatedMonthlyFees,
      feeHeads: updatedFeeHeads,
      totalPaidAnnual,
    });

    // Itemized breakdown for printed voucher
    const itemizedBreakdown: { description: string; amount: number; category?: string }[] = [];
    selectedMonths.forEach((mName) => {
      const rec = currentStudent.monthlyFees.find((m) => m.monthName === mName);
      if (rec) {
        itemizedBreakdown.push({
          description: `${rec.monthName} Tuition Fee`,
          amount: rec.payableAmount - rec.paidAmount,
          category: 'Tuition'
        });
      }
    });
    selectedFeeHeadIds.forEach((fId) => {
      const rec = currentStudent.feeHeads?.find((f) => f.id === fId);
      if (rec) {
        itemizedBreakdown.push({
          description: rec.title,
          amount: rec.amount - rec.paidAmount,
          category: rec.category
        });
      }
    });

    const paidFeeHeadTitles = selectedFeeHeadIds.map(
      (id) => currentStudent.feeHeads?.find((f) => f.id === id)?.title || id
    );

    const newTxn: PaymentTransaction = {
      id: `txn_${Date.now()}`,
      receiptNo: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentNo: currentStudent.studentNo,
      program: `${currentStudent.program} ${currentStudent.yearLevel}`,
      amount: finalAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      method,
      referenceNo: refNo,
      monthNames: selectedMonths,
      feeHeadTitles: paidFeeHeadTitles,
      itemizedBreakdown,
      collectedBy: 'Bursar & Accounts Desk',
      note,
    };

    onPaymentSuccess(newTxn, updatedStudent, shouldPrint);
  };

  const y1DueSum = currentStudent?.monthlyFees
    .filter((m) => m.academicYear === 'Year 1' && (m.status === 'DUE' || m.status === 'PARTIAL'))
    .reduce((sum, m) => sum + (m.payableAmount - m.paidAmount), 0) || 0;

  const y2DueSum = currentStudent?.monthlyFees
    .filter((m) => m.academicYear === 'Year 2' && (m.status === 'DUE' || m.status === 'PARTIAL'))
    .reduce((sum, m) => sum + (m.payableAmount - m.paidAmount), 0) || 0;

  if (!currentStudent || normalizedStudents.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-3xl font-black">
            🎓
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900">Koi Student Mojood Nahi Hai</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Tamam dummy content saaf kar diya gaya hai. Fee receive karne se pehle naya student register karein.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Band Karein
            </button>
            {onOpenAdmissionForm && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmissionForm();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>📝</span> Naya Student Add Karein
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-2 sm:p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[94vh] max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Top Header Bar */}
        <div className="p-3 sm:px-5 sm:py-3 bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-base shrink-0">💳</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-xs sm:text-base font-bold text-white tracking-wide truncate">
                  <span className="sm:hidden">Receive Student Fee</span>
                  <span className="hidden sm:inline">Receive Fee / Cashier Counter</span>
                </h2>
                <span className="text-[9px] sm:text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  2026–2028
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-emerald-200/90 truncate">
                Single Synchronized Window • 24-Month Tuition & Fee Collection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer shrink-0 active:scale-95"
            title="Close window"
          >
            ✕
          </button>
        </div>

        {/* Student Quick-Selector & Info Bar (Fixed Sub-header) */}
        <div className="bg-emerald-50/80 px-4 py-2.5 border-b border-emerald-200 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            {/* Search Input & Student Dropdown */}
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="🔍 Type Admission Form #, Roll No, CNIC, or Name..."
                  value={studentSearchFilter}
                  onChange={(e) => setStudentSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-inner"
                />
                <span className="absolute left-2.5 top-2 text-[11px] text-slate-400">🔎</span>
                {studentSearchFilter && (
                  <button
                    type="button"
                    onClick={() => setStudentSearchFilter('')}
                    className="absolute right-2 top-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕
                  </button>
                )}

                {/* Instant Floating Search Results */}
                {studentSearchFilter.trim() && (
                  <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white border-2 border-emerald-500 rounded-xl p-1 shadow-2xl z-40 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5">
                      Matching Students ({filteredStudents.length}):
                    </div>
                    {filteredStudents.length === 0 ? (
                      <div className="p-2 text-center text-slate-400 text-xs font-medium">
                        Koi student match nahi hua.
                      </div>
                    ) : (
                      filteredStudents.slice(0, 7).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            handleStudentChange(s.id);
                            setStudentSearchFilter('');
                          }}
                          className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            s.id === selectedStudentId
                              ? 'bg-emerald-100 text-emerald-950 font-bold'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-slate-900 truncate">{s.name}</span>
                            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1 rounded shrink-0">
                              {s.studentNo}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            s.unpaidMonthsCount > 0 ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'
                          }`}>
                            {s.unpaidMonthsCount > 0 ? `Due: Rs. ${(s.currentOverdueAmount || s.totalOutstandingAnnual).toLocaleString()}` : 'Clear'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Standard Dropdown */}
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="max-w-[260px] py-1.5 px-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs truncate"
              >
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studentNo} — {s.name} ({s.program})
                  </option>
                ))}
              </select>

              {onOpenAdmissionForm && (
                <button
                  type="button"
                  onClick={onOpenAdmissionForm}
                  className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0 whitespace-nowrap"
                >
                  <span>📝 Naya Admission</span>
                </button>
              )}
            </div>

            {/* Current Student Dues Badges */}
            {currentStudent && (
              <div className="flex items-center gap-3 shrink-0 text-xs">
                <div className="hidden sm:block text-right">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{currentStudent.name}</span>
                    <span className="text-[11px] text-slate-500 font-normal">({currentStudent.program})</span>
                  </div>
                  <div className="text-[10px] text-slate-600 flex items-center justify-end gap-1.5">
                    <span>Decided Tuition: <strong className="text-slate-900 font-mono">Rs. {currentStudent.monthlyFee.toLocaleString()}/mo</strong></span>
                    <span className="text-[9px] bg-amber-50 text-amber-900 border border-amber-300 px-1 py-0.2 rounded font-black tracking-tight" title="Decided at admission. Cannot be altered by Receptionist.">
                      🔒 Decided Rate Locked
                    </span>
                    {currentStudent.concessionType !== 'None' && (
                      <span className="text-teal-700 font-bold ml-0.5">
                        (-{currentStudent.concessionPercent}%)
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white px-3 py-1 rounded-xl border border-emerald-300 flex items-center gap-3 shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Active Overdue:</span>
                    <span className="font-black text-sm text-rose-600">
                      Rs. {(currentStudent.currentOverdueAmount ?? y1DueSum).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 border-l border-slate-200 pl-2 space-y-0.5">
                    <div>Y1 Due: <span className="font-bold text-slate-800">Rs. {y1DueSum.toLocaleString()}</span></div>
                    <div>Y2 Due: <span className="font-bold text-slate-800">Rs. {y2DueSum.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Workspace: 2-Column Split Synchronized View */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-100/50">
          {/* LEFT COLUMN: Dues & Months Selection (Col Span 8) */}
          <div className="lg:col-span-8 flex flex-col min-h-0 border-r border-slate-200 bg-white">
            {/* Filter Toolbar (Sticky at top of left panel) */}
            <div className="p-3 bg-slate-50/90 border-b border-slate-200 space-y-2 shrink-0">
              {/* Row 1: Categories */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveFeeCategory('ALL')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    activeFeeCategory === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📋 All Heads ({selectedFeeHeadIds.length + selectedMonths.length} Selected)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFeeCategory('HEADS')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeFeeCategory === 'HEADS'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>🏛️ Institutional Fees (9)</span>
                  {pendingFeeHeads.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                      {pendingFeeHeads.length} Due
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFeeCategory('TUITION')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeFeeCategory === 'TUITION'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>📅 Monthly Tuition (24 Mo)</span>
                  {pendingMonths.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                      {pendingMonths.length} Due
                    </span>
                  )}
                </button>
              </div>

              {/* Row 2: Year Switcher & Quick Select Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Year Tabs */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedYearTab('ALL')}
                    className={`py-1 px-2.5 rounded-md font-bold text-[11px] cursor-pointer transition-all ${
                      selectedYearTab === 'ALL'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Both Years (24 Mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedYearTab('Year 1')}
                    className={`py-1 px-2.5 rounded-md font-bold text-[11px] cursor-pointer transition-all flex items-center gap-1 ${
                      selectedYearTab === 'Year 1'
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Year 1 (2026-27)</span>
                    {(() => {
                      const y1Due = currentStudent?.monthlyFees.filter(m => m.academicYear === 'Year 1' && (m.status === 'DUE' || m.status === 'PARTIAL')).length || 0;
                      return y1Due > 0 ? (
                        <span className="text-[9px] bg-rose-500 text-white px-1 rounded-full font-black">{y1Due}</span>
                      ) : null;
                    })()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedYearTab('Year 2')}
                    className={`py-1 px-2.5 rounded-md font-bold text-[11px] cursor-pointer transition-all flex items-center gap-1 ${
                      selectedYearTab === 'Year 2'
                        ? 'bg-purple-700 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Year 2 (2027-28)</span>
                    {(() => {
                      const y2Due = currentStudent?.monthlyFees.filter(m => m.academicYear === 'Year 2' && (m.status === 'DUE' || m.status === 'PARTIAL')).length || 0;
                      return y2Due > 0 ? (
                        <span className="text-[9px] bg-rose-500 text-white px-1 rounded-full font-black">{y2Due}</span>
                      ) : null;
                    })()}
                  </button>
                </div>

                {/* Quick Selection Buttons */}
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={selectAllPending}
                    className="text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                  >
                    Select All Pending ({pendingMonths.length})
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => selectYearPending('Year 1')}
                    className="text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                  >
                    Y1 Pending
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => selectYearPending('Year 2')}
                    className="text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                  >
                    Y2 Pending
                  </button>
                  {(selectedMonths.length > 0 || selectedFeeHeadIds.length > 0) && (
                    <>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Center: Fee Heads & 24 Months Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4">
              {/* SECTION 1: Institutional & Academic Dues */}
              {(activeFeeCategory === 'ALL' || activeFeeCategory === 'HEADS') && currentStudent?.feeHeads && (
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-800 text-white">
                        Institutional Heads
                      </span>
                      <span className="font-bold text-xs text-slate-800">
                        Registration, Exam, Admission, Diploma & Books
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={handleAttemptAddCustomHead}
                        className="px-2 py-0.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>➕ Add Head</span>
                      </button>
                      <button
                        type="button"
                        onClick={selectAllPendingHeads}
                        className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                      >
                        Select Pending ({pendingFeeHeads.length})
                      </button>
                    </div>
                  </div>

                  {/* Add Custom Head Inline Form */}
                  {isAddingCustomHead && (
                    <div className="mb-3 p-2.5 bg-white rounded-xl border-2 border-emerald-600 shadow-md animate-fadeIn">
                      <div className="font-bold text-xs text-emerald-900 mb-1.5 flex items-center justify-between">
                        <span>➕ Add New Fee Head</span>
                        <button
                          type="button"
                          onClick={() => setIsAddingCustomHead(false)}
                          className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Title (e.g. Diploma Fee)"
                          value={customHeadTitle}
                          onChange={(e) => setCustomHeadTitle(e.target.value)}
                          className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                        <select
                          value={customHeadCategory}
                          onChange={(e) => setCustomHeadCategory(e.target.value)}
                          className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        >
                          <option value="Certificate / Diploma">Certificate / Diploma</option>
                          <option value="Card">Student ID Card</option>
                          <option value="Admission">Admission / Registration</option>
                          <option value="Examination">Examination / Midterm</option>
                          <option value="Academic">Academic / Books / Labs</option>
                          <option value="Clinical">Hospital Training / Clinical</option>
                          <option value="Administrative">Administrative / Others</option>
                        </select>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="Amount (PKR)"
                            value={customHeadAmount}
                            onChange={(e) => setCustomHeadAmount(Number(e.target.value))}
                            className="flex-1 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomHead}
                            disabled={!customHeadTitle.trim() || customHeadAmount <= 0}
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fee Heads Compact Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {currentStudent.feeHeads.map((fh) => {
                      const isSelected = selectedFeeHeadIds.includes(fh.id);
                      const isPaid = fh.status === 'PAID';
                      const remainingDue = fh.amount - fh.paidAmount;
                      const isCurrentlyEditing = editingHeadId === fh.id;

                      if (isCurrentlyEditing) {
                        return (
                          <div
                            key={fh.id}
                            className="p-2 rounded-xl border-2 border-emerald-600 bg-white shadow-md col-span-2 space-y-1.5"
                          >
                            <div className="text-[10px] font-bold text-emerald-800 flex items-center justify-between">
                              <span>✏️ Edit Head & Amount</span>
                              <button
                                type="button"
                                onClick={(e) => cancelEditingHead(e)}
                                className="text-slate-400 hover:text-slate-700 font-bold"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={editingHeadTitle}
                                onChange={(e) => setEditingHeadTitle(e.target.value)}
                                className="flex-1 p-1 border border-slate-300 rounded text-xs font-semibold"
                              />
                              <input
                                type="number"
                                value={editingHeadAmount}
                                onChange={(e) => setEditingHeadAmount(Number(e.target.value))}
                                className="w-24 p-1 border border-slate-300 rounded text-xs font-bold text-emerald-800"
                              />
                            </div>
                            <div className="flex items-center justify-end gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={(e) => cancelEditingHead(e)}
                                className="px-2 py-0.5 text-[10px] text-slate-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={(e) => saveEditingHead(fh.id, e)}
                                className="px-2.5 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        );
                      }

                      if (isPaid) {
                        return (
                          <div
                            key={fh.id}
                            className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900 select-none flex flex-col justify-between"
                          >
                            <div className="font-bold text-[11px] truncate flex items-center justify-between">
                              <span className="truncate pr-1">{fh.title}</span>
                              <span className="text-emerald-700 font-black">✓</span>
                            </div>
                            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center justify-between">
                              <span>Paid: Rs. {fh.paidAmount.toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={(e) => handleAttemptEditHead(fh, e)}
                                className="text-[9px] text-slate-400 hover:text-slate-800 px-1 rounded bg-white border border-slate-200"
                                title={isPrincipal ? 'Edit amount' : 'Principal PIN required'}
                              >
                                ✏️
                              </button>
                            </div>
                          </div>
                        );
                      }

                      if (isSelected) {
                        return (
                          <div
                            key={fh.id}
                            onClick={() => toggleFeeHead(fh.id)}
                            className="p-1.5 rounded-xl border-2 border-emerald-800 bg-emerald-700 text-white shadow-sm cursor-pointer select-none flex flex-col justify-between"
                          >
                            <div className="font-bold text-[11px] truncate flex items-center justify-between">
                              <span className="truncate pr-1">✓ {fh.title}</span>
                              <span className="text-[9px] bg-white/20 px-1 rounded">{fh.category.slice(0, 7)}</span>
                            </div>
                            <div className="text-[10px] font-black text-emerald-100 mt-0.5 flex items-center justify-between">
                              <span>Pay: Rs. {remainingDue.toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={(e) => handleAttemptEditHead(fh, e)}
                                className="text-[9px] bg-white/30 text-emerald-950 font-bold px-1 rounded"
                                title={isPrincipal ? 'Edit amount' : 'Principal PIN required'}
                              >
                                ✏️
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={fh.id}
                          onClick={() => toggleFeeHead(fh.id)}
                          className="p-1.5 rounded-xl border-2 border-rose-300 hover:border-rose-400 bg-rose-50/80 hover:bg-rose-100 text-slate-800 transition-all cursor-pointer shadow-2xs select-none flex flex-col justify-between"
                        >
                          <div className="font-bold text-[11px] truncate flex items-center justify-between">
                            <span className="text-slate-900 truncate pr-1">{fh.title}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                          </div>
                          <div className="text-[10px] font-black text-rose-600 mt-0.5 flex items-center justify-between">
                            <span>Due: Rs. {remainingDue.toLocaleString()}</span>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={(e) => handleAttemptEditHead(fh, e)}
                                className="text-[9px] text-slate-500 hover:text-slate-900 px-1 rounded bg-white border border-slate-200"
                                title={isPrincipal ? 'Edit amount' : 'Principal PIN required'}
                              >
                                ✏️
                              </button>
                              {fh.id.startsWith('head_') && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteHead(fh.id, e)}
                                  className="text-[9px] text-rose-600 px-1 rounded bg-white border border-rose-200"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: Academic Tuition (24 Months: Sep 2026 - Aug 2028) */}
              {(activeFeeCategory === 'ALL' || activeFeeCategory === 'TUITION') && (
                <div className="space-y-3">
                  {/* Compact Color Guide */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 uppercase">Guide:</span>
                    <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-100/70 px-2 py-0.2 rounded-full border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                      Red = Overdue (Defaulter)
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.2 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Green = Paid
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-700 font-bold bg-slate-200/80 px-2 py-0.2 rounded-full border border-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      Slate = Upcoming (Advance)
                    </span>
                    <span className="inline-flex items-center gap-1 text-white font-bold bg-emerald-700 px-2 py-0.2 rounded-full">
                      ✓ Dark Green = Selected
                    </span>
                  </div>

                  {/* Year 1 & Year 2 Month Grids */}
                  {(['Year 1', 'Year 2'] as const).map((yrGroup) => {
                    if (selectedYearTab !== 'ALL' && selectedYearTab !== yrGroup) return null;

                    const yrFees = currentStudent?.monthlyFees.filter(
                      (m) => m.academicYear === yrGroup
                    ) || [];
                    const yrDueCount = yrFees.filter((m) => m.status === 'DUE' || m.status === 'PARTIAL').length;
                    const sessionLabel = yrGroup === 'Year 1' ? 'Session 2026–2027 (Sep \'26 – Aug \'27)' : 'Session 2027–2028 (Sep \'27 – Aug \'28)';

                    return (
                      <div key={yrGroup} className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200">
                        {/* Group Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                              yrGroup === 'Year 1' ? 'bg-blue-700' : 'bg-purple-700'
                            }`}>
                              {yrGroup}
                            </span>
                            <span className="text-[11px] text-slate-600 font-semibold">{sessionLabel}</span>
                          </div>
                          <span className={`text-[10px] font-bold ${yrDueCount > 0 ? 'text-rose-600' : yrGroup === 'Year 2' ? 'text-slate-600' : 'text-emerald-700'}`}>
                            {yrDueCount > 0 
                              ? `${yrDueCount} Months Overdue` 
                              : (yrGroup === 'Year 2' ? 'Upcoming Session (Scheduled)' : '✓ Current Session Clear')}
                          </span>
                        </div>

                        {/* 12 Months Grid: 6 columns x 2 rows */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {yrFees.map((mf) => {
                            const isSelected = selectedMonths.includes(mf.monthName);
                            const isAlreadyPaid = mf.status === 'PAID';
                            const isPartial = mf.status === 'PARTIAL';
                            const isUpcoming = mf.status === 'UPCOMING';
                            const remainingDue = mf.payableAmount - mf.paidAmount;
                            const shortName = mf.shortMonth || mf.monthName.split(' ')[0];

                            if (isAlreadyPaid) {
                              return (
                                <div
                                  key={mf.monthName}
                                  className="py-2 px-1 rounded-xl text-center border border-emerald-200 bg-emerald-50/70 text-emerald-800 select-none cursor-not-allowed"
                                  title={`${mf.monthName}: Fee Already Paid`}
                                >
                                  <div className="font-bold text-xs text-emerald-950 flex items-center justify-center gap-1">
                                    {shortName}
                                    <span className="text-[9px] text-slate-400 font-normal">'{String(mf.year).slice(-2)}</span>
                                  </div>
                                  <div className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-0.5 mt-0.5">
                                    <span>✓</span> Paid
                                  </div>
                                </div>
                              );
                            }

                            if (isSelected) {
                              return (
                                <button
                                  type="button"
                                  key={mf.monthName}
                                  onClick={() => toggleMonth(mf.monthName)}
                                  className="py-2 px-1 rounded-xl text-center border-2 border-emerald-800 bg-emerald-700 text-white shadow-sm font-bold text-xs cursor-pointer select-none transition-all"
                                  title={`Selected (${mf.monthName}): Click to unselect`}
                                >
                                  <div className="flex items-center justify-center gap-1 font-black">
                                    <span>✓</span> {shortName}
                                    <span className="text-[9px] text-emerald-200 font-normal">'{String(mf.year).slice(-2)}</span>
                                  </div>
                                  <div className="text-[10px] font-extrabold text-emerald-100 mt-0.5 truncate">
                                    Selected
                                  </div>
                                </button>
                              );
                            }

                            if (isUpcoming) {
                              return (
                                <button
                                  type="button"
                                  key={mf.monthName}
                                  onClick={() => toggleMonth(mf.monthName)}
                                  className="py-2 px-1 rounded-xl text-center border border-dashed border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400 text-slate-700 transition-all cursor-pointer shadow-2xs select-none"
                                  title={`Click to select ${mf.monthName}`}
                                >
                                  <div className="flex items-center justify-center gap-1 font-bold text-xs text-slate-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                    {shortName}
                                    <span className="text-[9px] text-slate-400 font-normal">'{String(mf.year).slice(-2)}</span>
                                  </div>
                                  <div className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
                                    Upcoming
                                  </div>
                                </button>
                              );
                            }

                            // Due / Overdue month
                            return (
                              <button
                                type="button"
                                key={mf.monthName}
                                onClick={() => toggleMonth(mf.monthName)}
                                className={`py-2 px-1 rounded-xl text-center border-2 transition-all cursor-pointer shadow-2xs select-none ${
                                  isPartial
                                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-400 text-amber-900'
                                    : 'bg-rose-50/90 hover:bg-rose-100 border-rose-400 text-rose-950 ring-1 ring-rose-200'
                                }`}
                                title={`Click to select ${mf.monthName}`}
                              >
                                <div className="flex items-center justify-center gap-1 font-black text-xs">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isPartial ? 'bg-amber-500' : 'bg-rose-600 animate-pulse'}`}></span>
                                  {shortName}
                                  <span className="text-[9px] text-slate-500 font-normal">'{String(mf.year).slice(-2)}</span>
                                </div>
                                <div className={`text-[10px] font-extrabold mt-0.5 truncate ${isPartial ? 'text-amber-700' : 'text-rose-600'}`}>
                                  {isPartial ? 'Partial' : 'Due'}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Payment Desk & Checkout Summary (Col Span 4) */}
          <div className="lg:col-span-4 flex flex-col min-h-0 bg-white border-t lg:border-t-0 border-slate-200">
            {/* Header */}
            <div className="p-3 bg-emerald-800 text-white flex items-center justify-between shrink-0">
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>🛒 Payment Desk / Bill Summary</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
                {selectedMonths.length + selectedFeeHeadIds.length} Selected
              </span>
            </div>

            {/* Selected Items List (Scrollable) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5 bg-slate-50/50">
              {selectedMonths.length === 0 && selectedFeeHeadIds.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <span className="text-3xl mb-1">👈</span>
                  <p className="text-xs font-bold text-slate-600">Koi Month ya Head select nahi kiya gaya</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                    Left side se fee heads ya months par click karein taake yahan bill generate ho sakay.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
                    <span>Item Breakdown</span>
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="text-rose-600 hover:text-rose-800 underline text-[10px]"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Selected Heads */}
                  {selectedFeeHeadIds.map((fId) => {
                    const rec = currentStudent?.feeHeads?.find((f) => f.id === fId);
                    if (!rec) return null;
                    const dueAmt = rec.amount - rec.paidAmount;
                    return (
                      <div
                        key={fId}
                        className="p-1.5 bg-white border border-emerald-200 rounded-lg flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="truncate pr-1">
                          <span className="font-bold text-slate-800 block truncate">{rec.title}</span>
                          <span className="text-[9px] text-emerald-700 font-semibold">{rec.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-black text-emerald-800 text-xs">Rs. {dueAmt.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => toggleFeeHead(fId)}
                            className="w-4 h-4 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center font-bold text-[10px]"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Selected Months */}
                  {selectedMonths.map((mName) => {
                    const rec = currentStudent?.monthlyFees.find((m) => m.monthName === mName);
                    if (!rec) return null;
                    const dueAmt = rec.payableAmount - rec.paidAmount;
                    return (
                      <div
                        key={mName}
                        className="p-1.5 bg-white border border-teal-200 rounded-lg flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="truncate pr-1">
                          <span className="font-bold text-slate-800 block truncate">{mName} Tuition</span>
                          <span className="text-[9px] text-teal-700 font-semibold">{rec.academicYear}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-black text-teal-800 text-xs">Rs. {dueAmt.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => toggleMonth(mName)}
                            className="w-4 h-4 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center font-bold text-[10px]"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Fields (Fixed at bottom of right column) */}
            <div className="p-3 bg-white border-t border-slate-200 space-y-2.5 shrink-0">
              {/* Amount to Collect (Auto-Calculated & Locked) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <span>Total Amount to Collect</span>
                    <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                      🔒 Auto-Calculated
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {selectedMonths.length} Mo + {selectedFeeHeadIds.length} Head(s)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={`Rs. ${calculateTotalToPay().toLocaleString()}`}
                    className="w-full px-3 py-2 bg-emerald-50/90 border-2 border-emerald-600 rounded-xl font-black text-base text-emerald-950 shadow-inner cursor-not-allowed select-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-700">PKR</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Raqam select kiye gaye heads aur mahinon ke mutabiq automatic aati hai (khud se tabdeel nahi ki ja sakti).
                </p>
              </div>

              {/* Payment Method & Ref in 2 cols */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="ONLINE_PORTAL">Online Portal</option>
                    <option value="CASH">Cash Counter</option>
                    <option value="CHEQUE">Pay Order / Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ref / Cheque #</label>
                  <input
                    type="text"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    placeholder="e.g. HBL-992144"
                    className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Note / Remarks</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Tuition fee cleared"
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleProcessPayment(false)}
                  disabled={(selectedMonths.length === 0 && selectedFeeHeadIds.length === 0) || calculateTotalToPay() <= 0}
                  className="w-full py-2 px-3 rounded-xl font-black bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 transition-all text-xs"
                >
                  <span>✅ Confirm & Mark Paid (OK)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessPayment(true)}
                  disabled={(selectedMonths.length === 0 && selectedFeeHeadIds.length === 0) || calculateTotalToPay() <= 0}
                  className="w-full py-1.5 px-3 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 transition-all text-xs"
                >
                  <span>🖨️ Pay & Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

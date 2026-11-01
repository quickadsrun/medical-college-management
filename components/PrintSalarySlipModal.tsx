'use client';
import React, { useState } from 'react';
import { FacultyStaff, CollegeTenant } from '../lib/types';
import { PrinterIcon } from './Icons';

interface PrintSalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyMember: FacultyStaff | null;
  allFaculty?: FacultyStaff[];
  college: CollegeTenant | null;
}

// Convert numbers to English words helper for salary slips
function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  }

  if (num < 100) return inWords(num) + ' Rupees Only';
  if (num < 1000) {
    return (
      a[Math.floor(num / 100)] +
      ' Hundred' +
      (num % 100 ? ' ' + inWords(num % 100) : '') +
      ' Rupees Only'
    );
  }
  if (num < 100000) {
    const thousands = Math.floor(num / 1000);
    const rest = num % 1000;
    return (
      inWords(thousands) +
      ' Thousand' +
      (rest ? ' ' + (rest < 100 ? inWords(rest) : inWords(Math.floor(rest / 100)) + ' Hundred ' + inWords(rest % 100)) : '') +
      ' Rupees Only'
    );
  }
  if (num < 10000000) {
    const lakhs = Math.floor(num / 100000);
    const rest = num % 100000;
    const thousands = Math.floor(rest / 1000);
    const rem = rest % 1000;
    return (
      inWords(lakhs) +
      ' Lakh' +
      (thousands ? ' ' + inWords(thousands) + ' Thousand' : '') +
      (rem ? ' ' + inWords(rem) : '') +
      ' Rupees Only'
    );
  }

  return `${num.toLocaleString()} Rupees Only`;
}

export default function PrintSalarySlipModal({
  isOpen,
  onClose,
  facultyMember,
  allFaculty = [],
  college,
}: PrintSalarySlipModalProps) {
  const [viewMode, setViewMode] = useState<'SINGLE_SLIP' | 'FULL_REGISTER'>('SINGLE_SLIP');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(facultyMember?.id || allFaculty[0]?.id || '');

  if (!isOpen) return null;

  const currentStaff =
    (allFaculty.length > 0 && allFaculty.find((f) => f.id === selectedStaffId)) ||
    facultyMember ||
    allFaculty[0];

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-xs animate-fadeIn print:static print:inset-auto print:bg-white print:p-0 print:m-0 print:block print:w-full print:h-auto print:overflow-visible">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:max-w-none print:w-full print:h-auto print:rounded-none print:border-none print:shadow-none print:overflow-visible print:block">
        
        {/* NON-PRINTING TOOLBAR */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <div>
              <h2 className="text-sm font-extrabold text-white">
                Faculty Salary Pay Slip & Payroll Statement
              </h2>
              <p className="text-[11px] text-slate-400">
                Official Letterhead format with Attendance, Advance loan tracking, and Signatures
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('SINGLE_SLIP')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'SINGLE_SLIP' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📄 Individual Pay Slip
              </button>
              <button
                type="button"
                onClick={() => setViewMode('FULL_REGISTER')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'FULL_REGISTER' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📑 Full Faculty Register
              </button>
            </div>

            {/* Quick Staff Selector when in Single Slip Mode */}
            {viewMode === 'SINGLE_SLIP' && allFaculty.length > 0 && (
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {allFaculty.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.employeeNo})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer transition-all"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* PRINTABLE CONTENT AREA */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-slate-900 bg-white print:p-6 print:m-0 print:overflow-visible print:block">
          
          {/* ========================================================================= */}
          {/* VIEW 1: INDIVIDUAL SALARY PAY SLIP */}
          {/* ========================================================================= */}
          {viewMode === 'SINGLE_SLIP' && currentStaff && (
            <div className="space-y-6">
              {/* Official College Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black text-xl shadow-sm">
                    {college?.code?.split('-')[0] || 'HCHS'}
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      {college?.name || 'Harmain College of Health Sciences'}
                    </h1>
                    <p className="text-xs font-semibold text-slate-600">
                      {college?.tagline || 'Teaching Hospital & Postgraduate Health Sciences Academy'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {college?.recognizedBy || 'PMDC Recognized & UHS Affiliated Institution'} • Campus: {college?.city || 'Kahuta, Pakistan'}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="inline-block px-3 py-1 rounded-lg bg-indigo-950 text-white font-extrabold text-xs uppercase tracking-wider">
                    Official Salary Pay Slip
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    Pay Period: <span className="font-extrabold text-indigo-900">{currentStaff.month || 'September 2026'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Date: {currentDate}</div>
                </div>
              </div>

              {/* Employee Particulars & Attendance Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Staff Particulars */}
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Employee Name</span>
                      <span className="text-sm font-black text-slate-900">{currentStaff.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Employee No / ID</span>
                      <span className="font-mono font-black text-indigo-900 text-xs">{currentStaff.employeeNo}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Department:</span>
                      <span className="font-bold text-slate-800">{currentStaff.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Designation:</span>
                      <span className="font-bold text-slate-800">{currentStaff.designation}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Subject (سبجیکٹ):</span>
                      <span className="font-bold text-indigo-900">{currentStaff.subjectSpecialization || currentStaff.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Medical Term / Year:</span>
                      <span className="font-semibold text-slate-800">{currentStaff.teachingTerm || 'All Medical Terms'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">CNIC:</span>
                      <span className="font-mono font-semibold text-slate-700">{currentStaff.cnic || '35202-XXXXXXX-X'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Bank Account:</span>
                      <span className="font-mono font-semibold text-slate-700">
                        {currentStaff.bankName ? `${currentStaff.bankName} (${currentStaff.accountNo || 'N/A'})` : 'Cash Voucher'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Monthly Attendance Card (کتنے دن آئے ہیں) */}
                <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 text-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-900 block tracking-wider">
                        📅 Duty & Attendance Summary
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        Shift: {currentStaff.shiftTiming || '10:00 AM - 04:00 PM'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-900">
                      {currentStaff.attendanceScore}% Hazri
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 my-2 text-center text-[10px]">
                    <div className="bg-white p-1.5 rounded-xl border border-emerald-100">
                      <span className="text-slate-500 block">Total Days</span>
                      <span className="font-black text-slate-900 text-xs">
                        {currentStaff.workingDays || 30} Days
                      </span>
                    </div>

                    <div className="bg-white p-1.5 rounded-xl border border-emerald-200">
                      <span className="text-emerald-700 font-bold block">Present (حاضر)</span>
                      <span className="font-black text-emerald-800 text-xs">
                        {currentStaff.presentDays || 30} Days
                      </span>
                    </div>

                    <div className="bg-white p-1.5 rounded-xl border border-rose-200">
                      <span className="text-rose-600 block">Absent</span>
                      <span className="font-black text-rose-700 text-xs">
                        {currentStaff.absentDays || 0} Days
                      </span>
                    </div>

                    <div className="bg-white p-1.5 rounded-xl border border-amber-200">
                      <span className="text-amber-600 block">Leaves</span>
                      <span className="font-black text-amber-700 text-xs">
                        {currentStaff.leaveDays || 0} Days
                      </span>
                    </div>
                  </div>

                  {(currentStaff.halfDaysCount || 0) > 0 ? (
                    <div className="text-center bg-amber-100/90 py-1 px-2 rounded-lg border border-amber-300">
                      <span className="text-[10px] font-black text-amber-950">
                        ⚠️ Late Arrivals: {currentStaff.halfDaysCount} Half Days (10 AM shift arriving 12 PM)
                      </span>
                    </div>
                  ) : (
                    <div className="text-center bg-emerald-100/80 py-1 rounded-lg">
                      <span className="text-[10px] font-bold text-emerald-900">
                        Attendance Optimal (No Late Half-Days)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Side-by-Side Earnings vs Deductions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. EARNINGS COLUMN */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="bg-slate-900 text-white px-4 py-2.5 font-black uppercase text-[11px] flex justify-between items-center">
                    <span>1. Earnings & Allowances (آمدنی)</span>
                    <span>Amount (PKR)</span>
                  </div>

                  <div className="p-4 space-y-2.5 divide-y divide-slate-100">
                    <div className="flex justify-between items-center pt-1 font-bold">
                      <span className="text-slate-800">Basic Monthly Salary</span>
                      <span className="font-mono text-slate-900">Rs. {currentStaff.basicSalary.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-slate-600">
                      <span>House Rent Allowance (HRA)</span>
                      <span className="font-mono">+ Rs. {(currentStaff.houseRentAllowance || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-slate-600">
                      <span>Medical Allowance</span>
                      <span className="font-mono">+ Rs. {(currentStaff.medicalAllowance || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-slate-600">
                      <span>Conveyance / Transport</span>
                      <span className="font-mono">+ Rs. {(currentStaff.conveyanceAllowance || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-slate-600">
                      <span>Special / Clinical Allowance</span>
                      <span className="font-mono">+ Rs. {(currentStaff.specialAllowance || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-3 font-extrabold bg-slate-50 px-2 py-2 rounded-xl text-slate-900 border border-slate-200">
                      <span>TOTAL GROSS EARNINGS</span>
                      <span className="font-mono text-sm text-indigo-950">
                        Rs. {(currentStaff.grossSalary || (currentStaff.basicSalary + currentStaff.allowances)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. DEDUCTIONS COLUMN (کس مد میں کٹوتی ہوئی) */}
                <div className="border border-rose-200 rounded-2xl overflow-hidden text-xs bg-rose-50/20">
                  <div className="bg-rose-900 text-white px-4 py-2.5 font-black uppercase text-[11px] flex justify-between items-center">
                    <span>2. Deductions Breakdown (کٹوتیاں)</span>
                    <span>Amount (PKR)</span>
                  </div>

                  <div className="p-4 space-y-2.5 divide-y divide-rose-100">
                    {/* Advance Salary Loan Recovery */}
                    <div className="pt-1">
                      <div className="flex justify-between items-center font-bold text-rose-900">
                        <span className="flex items-center gap-1">
                          <span>💳 Advance Salary / Loan Installment</span>
                        </span>
                        <span className="font-mono">
                          - Rs. {(currentStaff.advanceDeductionThisMonth || 0).toLocaleString()}
                        </span>
                      </div>
                      {(currentStaff.advanceTotalLoan || 0) > 0 && (
                        <div className="text-[10px] text-amber-800 mt-0.5 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 font-medium">
                          Total Advance: Rs. {(currentStaff.advanceTotalLoan || 0).toLocaleString()} • Remaining Balance: <b className="text-amber-950 font-bold">Rs. {(currentStaff.advanceRemainingBalance || 0).toLocaleString()}</b>
                        </div>
                      )}
                    </div>

                    {/* Absenteeism Penalty */}
                    <div className="flex justify-between items-center pt-2 text-slate-700">
                      <span>
                        Absenteeism Deduction
                        {(currentStaff.absentDays || 0) > 0 && ` (${currentStaff.absentDays} Days)`}
                      </span>
                      <span className="font-mono text-rose-800">
                        - Rs. {(currentStaff.absenteeismDeduction || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Late Arrival / Half Day Deduction */}
                    {((currentStaff.halfDayDeduction || 0) > 0 || (currentStaff.halfDaysCount || 0) > 0) && (
                      <div className="pt-2 text-rose-900">
                        <div className="flex justify-between items-center font-bold">
                          <span>
                            ⏰ Late Arrival / Half Day Deduction
                            {(currentStaff.halfDaysCount || 0) > 0 && ` (${currentStaff.halfDaysCount} Half Days)`}
                          </span>
                          <span className="font-mono">
                            - Rs. {(currentStaff.halfDayDeduction || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-800 italic mt-0.5">
                          2-3 ghante late aane par (10 AM shift arriving 12 PM) Half Day wage cut
                        </div>
                      </div>
                    )}

                    {/* Income Tax (WHT) */}
                    <div className="flex justify-between items-center pt-2 text-slate-700">
                      <span>Income Tax (Govt Withholding Tax)</span>
                      <span className="font-mono text-rose-800">
                        - Rs. {(currentStaff.taxDeduction || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Provident Fund / EOBI */}
                    <div className="flex justify-between items-center pt-2 text-slate-700">
                      <span>Provident Fund / EOBI Contribution</span>
                      <span className="font-mono text-rose-800">
                        - Rs. {(currentStaff.providentFundDeduction || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Other Deductions */}
                    <div className="pt-2 text-slate-700">
                      <div className="flex justify-between items-center">
                        <span>Other Deductions / Sundry</span>
                        <span className="font-mono text-rose-800">
                          - Rs. {(currentStaff.otherDeductions || 0).toLocaleString()}
                        </span>
                      </div>
                      {currentStaff.otherDeductionsNote && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5">
                          Note: {currentStaff.otherDeductionsNote}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 font-extrabold bg-rose-100/70 px-2 py-2 rounded-xl text-rose-950 border border-rose-200">
                      <span>TOTAL DEDUCTIONS</span>
                      <span className="font-mono text-sm text-rose-900">
                        - Rs. {currentStaff.deductions.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NET SALARY PAYABLE BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold block">
                    Net Take-Home Monthly Salary (ادا شدہ خالص رقم)
                  </span>
                  <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                    Rs. {currentStaff.netSalary.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-200 italic">
                    Amount in Words: {numberToWords(currentStaff.netSalary)}
                  </span>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-300 font-medium">Disbursement Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        currentStaff.salaryStatus === 'PAID'
                          ? 'bg-emerald-400 text-emerald-950 shadow-sm'
                          : 'bg-amber-300 text-amber-950'
                      }`}
                    >
                      {currentStaff.salaryStatus === 'PAID' ? '✅ PAID & CLEARED' : '⏳ PENDING'}
                    </span>
                  </div>
                  {currentStaff.transactionRef && (
                    <span className="text-[10px] text-emerald-300 font-mono mt-1">
                      Ref: {currentStaff.transactionRef} • {currentStaff.paymentMethod || 'Bank Transfer'}
                    </span>
                  )}
                </div>
              </div>

              {/* ADVANCE SALARY / LOAN LEDGER RECOVERY STATUS (Special Box) */}
              {(currentStaff.advanceTotalLoan || 0) > 0 && (
                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-300 text-xs">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-2">
                    <span className="font-extrabold text-amber-950 flex items-center gap-1.5 uppercase">
                      <span>💳 Advance Salary / Institutional Loan Account</span>
                    </span>
                    <span className="text-[11px] font-bold text-amber-900">
                      Reason: {currentStaff.advanceReason || 'Advance Salary Request'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="bg-white p-2 rounded-xl border border-amber-200">
                      <span className="text-slate-400 block text-[10px]">Total Advance Loan</span>
                      <span className="font-black text-slate-900">
                        Rs. {(currentStaff.advanceTotalLoan || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-amber-200">
                      <span className="text-rose-600 block text-[10px]">Deducted This Month</span>
                      <span className="font-black text-rose-700">
                        Rs. {(currentStaff.advanceDeductionThisMonth || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-amber-200">
                      <span className="text-emerald-700 block text-[10px]">Total Repaid So Far</span>
                      <span className="font-black text-emerald-800">
                        Rs. {(
                          (currentStaff.advanceTotalLoan || 0) -
                          (currentStaff.advanceRemainingBalance || 0)
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-amber-100 p-2 rounded-xl border border-amber-300">
                      <span className="text-amber-900 font-bold block text-[10px]">Remaining Loan Due</span>
                      <span className="font-black text-amber-950">
                        Rs. {(currentStaff.advanceRemainingBalance || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Institutional Attendance & Late Rule Banner */}
              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2 leading-relaxed">
                <span className="text-base leading-none">📌</span>
                <div>
                  <b className="font-black text-amber-950 uppercase tracking-wide">
                    Institutional Attendance & Punctuality Policy:
                  </b>{' '}
                  Agar staff ka duty time <b>10:00 AM</b> ho aur wo <b>12:00 PM (2 se 3 ghante late)</b> report karein, to biometric system unka <b>Half Day (Aadha Din)</b> count karega aur half day wage deduct hogi.
                </div>
              </div>

              {/* Official Verification Signatures */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="border-b border-slate-400 pb-1 h-12 flex items-end justify-center font-script text-slate-600 italic">
                    {currentStaff.name.split(' ')[0]}
                  </div>
                  <span className="font-extrabold text-slate-900 block mt-1">
                    Faculty Member Signature
                  </span>
                  <span className="text-[10px] text-slate-400">حصول کنندہ کے دستخط</span>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-1 h-12 flex items-end justify-center font-serif text-slate-700 font-bold">
                    Asif Nadeem (CFO)
                  </div>
                  <span className="font-extrabold text-slate-900 block mt-1">
                    Bursar / Accounts Officer
                  </span>
                  <span className="text-[10px] text-slate-400">شعبہ مالیات و فنانس</span>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-1 h-12 flex items-end justify-center font-serif text-slate-700 font-bold">
                    Official Institutional Seal
                  </div>
                  <span className="font-extrabold text-slate-900 block mt-1">
                    Principal / Dean Verification
                  </span>
                  <span className="text-[10px] text-slate-400">پرنسپل / ڈائریکٹر مہر و دستخط</span>
                </div>
              </div>

              {/* Security & System Tracking Footer */}
              <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Computer Generated Payroll Voucher • Verified by Campus Management System</span>
                <span>Ref: HCHS-PR-{currentStaff.employeeNo}-{Date.now().toString().slice(-6)}</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: FULL MONTHLY FACULTY PAYROLL REGISTER */}
          {/* ========================================================================= */}
          {viewMode === 'FULL_REGISTER' && (
            <div className="space-y-6">
              {/* Register Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 text-center">
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                  {college?.name || 'Harmain College of Health Sciences'}
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  Monthly Faculty, Professors & Officers Payroll Register
                </p>
                <p className="text-[11px] text-slate-500 font-bold mt-1">
                  Disbursement Month: September 2026 • Campus: {college?.city || 'Kahuta'}
                </p>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">Total Faculty</span>
                  <span className="font-black text-slate-900 text-sm">{allFaculty.length} Staff</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">Gross Payroll</span>
                  <span className="font-black text-slate-900 text-sm">
                    Rs. {allFaculty.reduce((acc, f) => acc + (f.grossSalary || (f.basicSalary + f.allowances)), 0).toLocaleString()}
                  </span>
                </div>
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <span className="text-rose-700 text-[10px] block font-semibold">Total Deductions</span>
                  <span className="font-black text-rose-800 text-sm">
                    - Rs. {allFaculty.reduce((acc, f) => acc + f.deductions, 0).toLocaleString()}
                  </span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-emerald-800 text-[10px] block font-semibold">Net Disbursed</span>
                  <span className="font-black text-emerald-900 text-sm">
                    Rs. {allFaculty.reduce((acc, f) => acc + f.netSalary, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Full Register Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Emp ID</th>
                      <th className="py-2.5 px-3">Name & Designation</th>
                      <th className="py-2.5 px-2 text-center">Attendance</th>
                      <th className="py-2.5 px-3 text-right">Basic</th>
                      <th className="py-2.5 px-3 text-right">Allowances</th>
                      <th className="py-2.5 px-3 text-right text-amber-300">Adv. Loan</th>
                      <th className="py-2.5 px-3 text-right text-rose-300">Total Deductions</th>
                      <th className="py-2.5 px-3 text-right font-black">Net Salary</th>
                      <th className="py-2.5 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allFaculty.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-500">{f.employeeNo}</td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900">{f.name}</div>
                          <div className="text-[10px] text-slate-500">{f.designation} • {f.department}</div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                            {f.presentDays || 30}/{f.workingDays || 30} ({f.attendanceScore}%)
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono">Rs. {f.basicSalary.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-700">+Rs. {f.allowances.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono text-amber-700">
                          {f.advanceDeductionThisMonth ? `-Rs. ${f.advanceDeductionThisMonth.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-rose-600">-Rs. {f.deductions.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono font-extrabold text-slate-900">
                          Rs. {f.netSalary.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              f.salaryStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {f.salaryStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-b border-slate-400 pb-1 h-12 flex items-end justify-center font-serif text-slate-700 font-bold">
                    Accounts Bursar & CFO
                  </div>
                  <span className="font-extrabold text-slate-900 block mt-1">Prepared & Verified By</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-1 h-12 flex items-end justify-center font-serif text-slate-700 font-bold">
                    Dean Academic & Principal
                  </div>
                  <span className="font-extrabold text-slate-900 block mt-1">Approved for Disbursement</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

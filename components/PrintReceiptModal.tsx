'use client';
import React from 'react';
import { PaymentTransaction, Student, CollegeTenant } from '../lib/types';
import { PrinterIcon } from './Icons';

interface PrintReceiptModalProps {
  transaction?: PaymentTransaction | null;
  student?: Student | null;
  college?: CollegeTenant | null;
  onClose: () => void;
}

export default function PrintReceiptModal({
  transaction,
  student,
  college,
  onClose,
}: PrintReceiptModalProps) {
  if (!transaction && !student) return null;

  const itemizedSum = transaction?.itemizedBreakdown?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const receiptAmount = transaction
    ? (itemizedSum > 0 ? itemizedSum : transaction.amount)
    : (student ? student.totalPaidAnnual : 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn print:static print:inset-auto print:bg-white print:p-0 print:m-0 print:block print:w-full print:h-auto print:overflow-visible">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:overflow-visible print:m-0 print:p-0">
        {/* Modal Top Bar (Screen only, hidden on print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print print:hidden">
          <span className="text-xs font-bold flex items-center gap-2">
            <PrinterIcon className="w-4 h-4 text-teal-400" />
            Official Fee Receipt / Bank Voucher
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PrinterIcon className="w-3.5 h-3.5" />
              Print Slip
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 font-sans text-xs print:p-8 print:border-2 print:border-slate-800 print:rounded-xl print:w-full print:max-w-[660px] print:mx-auto print:box-border print:overflow-visible print:my-6 print:shadow-none">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <div className="text-2xl font-black tracking-wide text-slate-900 uppercase">
              {college ? college.name : 'HARMAIN COLLEGE OF HEALTH SCIENCES'}
            </div>
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
              {college ? college.tagline : 'Teaching Hospital & Health Sciences Academy'} ({college ? college.city : 'Kahuta Campus'})
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {college ? college.recognizedBy : 'Affiliated with University of Health Sciences (UHS) & PMDC Recognized'}
            </div>
            <div className="inline-block mt-2.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 border border-slate-300 text-slate-800">
              Student / Bank Fee Deposit Slip (Office Copy)
            </div>
          </div>

          {/* Meta Info: Receipt No & Issue Date with guaranteed margins */}
          <div className="flex items-center justify-between gap-4 mb-4 text-[11px] pb-2 border-b border-slate-200 px-1">
            <div>
              <span className="text-slate-500 font-semibold">Receipt No: </span>
              <span className="font-mono font-black text-slate-900">
                {transaction ? transaction.receiptNo : `STMT-${Date.now().toString().slice(-6)}`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-semibold">Issue Date: </span>
              <span className="font-bold text-slate-900">
                {transaction ? transaction.paymentDate : new Date().toISOString().split('T')[0]}
              </span>
            </div>
          </div>

          {/* Student Details Box */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-4 space-y-2 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-slate-500 font-semibold">Student Name: </span>
                <span className="font-bold text-slate-900">
                  {transaction ? transaction.studentName : student?.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-semibold">Roll No: </span>
                <span className="font-bold font-mono text-slate-900">
                  {transaction ? transaction.studentNo : student?.studentNo}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-slate-500 font-semibold">Program / Class: </span>
                <span className="font-semibold text-slate-800">
                  {transaction ? transaction.program : `${student?.program} (${student?.yearLevel})`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-semibold">Batch / Session: </span>
                <span className="font-semibold text-slate-800">2024-2029 (Regular)</span>
              </div>
            </div>

            {student && (
              <div>
                <span className="text-slate-500 font-semibold">Father Name: </span>
                <span className="font-semibold text-slate-800">{student.fatherName}</span>
              </div>
            )}
          </div>

          {/* Fee Itemization Table */}
          <table className="w-full border-collapse border border-slate-300 text-left mb-4 text-[11px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-300 p-2 font-bold text-slate-800">Fee Head / Description</th>
                <th className="border border-slate-300 p-2 font-bold text-slate-800">Category / Period</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-800">Status</th>
                <th className="border border-slate-300 p-2 text-right font-bold text-slate-800">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {/* CASE 1: Individual Transaction Receipt */}
              {transaction ? (
                transaction.itemizedBreakdown && transaction.itemizedBreakdown.length > 0 ? (
                  transaction.itemizedBreakdown.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="border border-slate-300 p-2 font-semibold text-slate-900">
                        {item.description}
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-600">
                        {item.category || 'Institutional / Tuition'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          PAID
                        </span>
                      </td>
                      <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">
                        Rs. {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    {transaction.feeHeadTitles && transaction.feeHeadTitles.length > 0 && (
                      <tr className="bg-white">
                        <td className="border border-slate-300 p-2 font-semibold text-slate-900">
                          Institutional Fee Heads: {transaction.feeHeadTitles.join(', ')}
                        </td>
                        <td className="border border-slate-300 p-2 text-slate-600">Institutional Dues</td>
                        <td className="border border-slate-300 p-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">PAID</span>
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">
                          —
                        </td>
                      </tr>
                    )}
                    {transaction.monthNames && transaction.monthNames.length > 0 && (
                      <tr className="bg-slate-50/50">
                        <td className="border border-slate-300 p-2 font-semibold text-slate-900">
                          Tuition Fee ({transaction.monthNames.join(', ')})
                        </td>
                        <td className="border border-slate-300 p-2 text-slate-600">Monthly Tuition</td>
                        <td className="border border-slate-300 p-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">PAID</span>
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">
                          Rs. {transaction.amount.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </>
                )
              ) : student ? (
                /* CASE 2: Complete Student Fee Voucher / Ledger Statement */
                <>
                  {/* Part A: Institutional & Academic Fee Heads */}
                  <tr className="bg-emerald-900 text-white font-bold text-[10px] uppercase">
                    <td colSpan={4} className="border border-emerald-950 px-2 py-1 tracking-wider">
                      Part A: Institutional, Examination & Clinical Dues
                    </td>
                  </tr>
                  {(student.feeHeads && student.feeHeads.length > 0
                    ? student.feeHeads
                    : [
                        { id: 'fh_adm', title: 'Admission Fee', category: 'Admission', amount: 50000, paidAmount: 0, status: 'DUE' },
                        { id: 'fh_reg', title: 'Registration Fee', category: 'Registration', amount: 25000, paidAmount: 0, status: 'DUE' },
                        { id: 'fh_exam', title: 'Examination Fee', category: 'Examination', amount: 20000, paidAmount: 0, status: 'DUE' },
                        { id: 'fh_mid', title: 'Midterm Fee', category: 'Midterm', amount: 10000, paidAmount: 0, status: 'DUE' },
                        { id: 'fh_bks', title: 'Books & Syllabi Material', category: 'Books', amount: 12000, paidAmount: 0, status: 'DUE' },
                        { id: 'fh_prac', title: 'Practical / Lab Fee', category: 'Practical', amount: 15000, paidAmount: 0, status: 'DUE' },
                        { id: 'fh_proc', title: 'Processing Fee', category: 'Processing', amount: 5000, paidAmount: 0, status: 'DUE' },
                        { id: 'fh_hosp', title: 'Hospital Training Fee', category: 'Hospital Training', amount: 35000, paidAmount: 0, status: 'DUE' },
                        { id: 'fh_cert', title: 'Certificate / Diploma Fee', category: 'Certificate / Diploma', amount: 6000, paidAmount: 0, status: 'DUE' },
                        { id: 'fh_crd', title: 'Student Card Fee', category: 'Card', amount: 2000, paidAmount: 0, status: 'DUE' },
                        { id: 'fh_oth', title: 'Others / Campus Fund', category: 'Others', amount: 8000, paidAmount: 0, status: 'DUE' },
                      ]
                  ).map((fh, idx) => (
                    <tr key={fh.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="border border-slate-300 p-2 font-medium text-slate-900">
                        {fh.title}
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-600">
                        {fh.category}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          fh.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fh.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {fh.status === 'PAID' ? 'PAID' : fh.status === 'PARTIAL' ? 'PARTIAL' : 'DUE'}
                        </span>
                      </td>
                      <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">
                        Rs. {fh.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {/* Part B: Tuition Fee Summary (2-Year) */}
                  <tr className="bg-teal-900 text-white font-bold text-[10px] uppercase">
                    <td colSpan={4} className="border border-teal-950 px-2 py-1 tracking-wider">
                      Part B: Tuition Fee Structure (2-Year / 24 Months)
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-slate-300 p-2 font-medium text-slate-900">
                      Year 1 Tuition (12 Months • 2025)
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-600">Academic Year 1</td>
                    <td className="border border-slate-300 p-2 text-center">
                      <span className="text-[10px] font-bold text-slate-700">
                        {student.monthlyFees.filter(m => (m.year === 2025 || m.academicYear === 'Year 1') && m.status === 'PAID').length} / 12 Paid
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">
                      Rs. {student.monthlyFees.filter(m => m.year === 2025 || m.academicYear === 'Year 1').reduce((s, m) => s + m.payableAmount, 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="border border-slate-300 p-2 font-medium text-slate-900">
                      Year 2 Tuition (12 Months • 2026)
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-600">Academic Year 2</td>
                    <td className="border border-slate-300 p-2 text-center">
                      <span className="text-[10px] font-bold text-slate-700">
                        {student.monthlyFees.filter(m => (m.year === 2026 || m.academicYear === 'Year 2') && m.status === 'PAID').length} / 12 Paid
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">
                      Rs. {student.monthlyFees.filter(m => m.year === 2026 || m.academicYear === 'Year 2').reduce((s, m) => s + m.payableAmount, 0).toLocaleString()}
                    </td>
                  </tr>
                </>
              ) : null}
            </tbody>
            <tfoot className="bg-slate-50 font-bold">
              {/* Receipt Total Received */}
              <tr className="bg-emerald-50/90 border-t-2 border-emerald-600">
                <td colSpan={3} className="border border-slate-300 p-2.5 text-right font-black text-slate-900 text-xs">
                  {transaction ? 'TOTAL AMOUNT RECEIVED IN THIS RECEIPT (WASOOL SHUDA RAQAM):' : 'TOTAL AMOUNT PAID TO DATE:'}
                </td>
                <td className="border border-slate-300 p-2.5 text-right text-emerald-800 font-black text-sm font-mono">
                  Rs. {receiptAmount.toLocaleString()}
                </td>
              </tr>

              {/* Current Overdue Arrears (Wajib-ul-Ada) */}
              {student && (
                <tr className={(student.currentOverdueAmount || 0) > 0 ? 'bg-rose-50/70' : 'bg-slate-50'}>
                  <td colSpan={3} className="border border-slate-300 p-2 text-right font-bold text-slate-800">
                    CURRENT OVERDUE ARREARS (WAJIB-UL-ADA / DUE NOW):
                  </td>
                  <td className="border border-slate-300 p-2 text-right font-black text-xs font-mono">
                    {(student.currentOverdueAmount || 0) > 0 ? (
                      <span className="text-rose-700 font-black">
                        Rs. {(student.currentOverdueAmount || 0).toLocaleString()}
                        <span className="block text-[9px] text-rose-600 font-medium">({student.unpaidMonthsCount} mo overdue)</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-black">Rs. 0 (Nil / All Current Dues Cleared)</span>
                    )}
                  </td>
                </tr>
              )}

              {/* 2-Year Program Ledger Summary */}
              {student && (
                <>
                  <tr className="bg-slate-100/60 text-slate-600 text-[10px]">
                    <td colSpan={3} className="border border-slate-300 p-1.5 text-right font-semibold">
                      Total 2-Year Program Package (24 Months + Institutional Heads):
                    </td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-bold text-slate-800">
                      Rs. {student.totalExpectedAnnual.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-slate-100/60 text-slate-600 text-[10px]">
                    <td colSpan={3} className="border border-slate-300 p-1.5 text-right font-semibold">
                      Future Scheduled Installments (Advance Program Balance):
                    </td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-bold text-slate-800">
                      Rs. {Math.max(0, student.totalOutstandingAnnual - (student.currentOverdueAmount || 0)).toLocaleString()}
                    </td>
                  </tr>
                </>
              )}
            </tfoot>
          </table>

          {/* Payment Method Details */}
          {transaction && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] mb-4 space-y-1">
              <div>
                <span className="font-semibold text-slate-600">Payment Mode: </span>
                <span className="font-bold text-slate-900">{transaction.method}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Instrument / Bank Ref: </span>
                <span className="font-mono font-bold text-slate-900">{transaction.referenceNo}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Counter Desk: </span>
                <span className="text-slate-800">{transaction.collectedBy}</span>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-4 border-t border-dashed border-slate-300 text-[10px] text-center">
            <div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-semibold text-slate-700">
                Depositor / Student
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-semibold text-slate-700">
                Accounts Officer / Cashier
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">(Official Stamp)</div>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-400 mt-6 pt-2 border-t border-slate-100">
            System generated computer voucher • No physical alteration is valid without authorized stamp.
          </div>
        </div>
      </div>
    </div>
  );
}

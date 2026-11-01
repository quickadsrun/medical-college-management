'use client';
import React, { useState } from 'react';
import { Expense, CollegeTenant } from '../lib/types';
import { PrinterIcon } from './Icons';

interface PrintInventoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  college: CollegeTenant | null;
  initialDepartment?: string;
  initialCategory?: string;
}

export default function PrintInventoryReportModal({
  isOpen,
  onClose,
  expenses,
  college,
  initialDepartment = 'ALL',
  initialCategory = 'ALL',
}: PrintInventoryReportModalProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialDepartment);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  // Sync state whenever modal is opened with new filter props
  React.useEffect(() => {
    if (isOpen) {
      setSelectedDepartment(initialDepartment);
      setSelectedCategory(initialCategory);
    }
  }, [isOpen, initialDepartment, initialCategory]);

  if (!isOpen) return null;

  // Extract all distinct departments and categories from current expenses
  const allDepartments = Array.from(new Set(expenses.map((e) => e.department).filter(Boolean)));
  const allCategories = Array.from(new Set(expenses.map((e) => e.category).filter(Boolean)));

  // Filter items based on selected scope (case-insensitive)
  const filteredItems = expenses.filter((e) => {
    const matchDept =
      selectedDepartment === 'ALL' ||
      e.department?.trim().toLowerCase() === selectedDepartment.trim().toLowerCase();
    const matchCat =
      selectedCategory === 'ALL' ||
      e.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
    return matchDept && matchCat;
  });

  const totalAmount = filteredItems.reduce((sum, item) => sum + item.amount, 0);
  const totalUnits = filteredItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalStockAvailable = filteredItems.reduce(
    (sum, item) => sum + (item.currentStock !== undefined ? item.currentStock : item.quantity || 1),
    0
  );
  const lowStockCount = filteredItems.filter(
    (item) => item.stockStatus === 'LOW_STOCK' || item.stockStatus === 'OUT_OF_STOCK'
  ).length;

  const handlePrint = () => {
    window.print();
  };

  const reportDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-sm animate-fadeIn print:static print:inset-auto print:bg-white print:p-0 print:m-0 print:block print:w-full print:h-auto print:overflow-visible">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:overflow-visible print:m-0 print:p-0 print:max-h-none">
        {/* Top Control Bar (Screen Only - Hidden in Print/PDF) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg">
              <PrinterIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-xs text-white">Lab & Department Inventory / Expense Report</h3>
              <p className="text-[10px] text-slate-300">
                Alag alag lab, department ya category ka print / PDF export karein.
              </p>
            </div>
          </div>

          {/* Quick Selectors & Print Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">🏢 All Labs & Depts</option>
              {allDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  🔬 {dept}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-emerald-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">🏷️ All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <PrinterIcon className="w-3.5 h-3.5" />
              <span>🖨️ Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 font-sans text-xs overflow-y-auto flex-1 print:p-6 print:overflow-visible print:w-full print:max-w-none print:m-0 print:border-none">
          {/* Official Letterhead Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <div className="text-2xl font-black tracking-wide text-slate-900 uppercase">
              {college ? college.name : 'HARMAIN COLLEGE OF HEALTH SCIENCES'}
            </div>
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
              {college ? college.tagline : 'Teaching Hospital & Health Sciences Academy'} ({college ? college.city : 'Kahuta Campus'})
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {college ? college.recognizedBy : 'Affiliated with University of Health Sciences (UHS) & PMDC Recognized'}
            </div>
            <div className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 border border-slate-300 text-slate-900">
              Departmental Inventory, Lab Asset & Expenditure Audit Statement
            </div>
          </div>

          {/* Audit Metadata Banner */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Department / Lab</span>
              <span className="font-extrabold text-slate-900 text-xs">
                {selectedDepartment === 'ALL' ? 'All College Departments & Labs' : selectedDepartment}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Category Head</span>
              <span className="font-bold text-teal-800 text-xs">
                {selectedCategory === 'ALL' ? 'All Expenditure Heads' : selectedCategory}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Statement Date</span>
              <span className="font-bold text-slate-900">{reportDate}</span>
            </div>
            <div className="text-right sm:text-left">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Audit Ref No.</span>
              <span className="font-mono font-bold text-slate-900">
                AUD-2026-{(filteredItems.length * 179 + 1042).toString().slice(0, 6)}
              </span>
            </div>
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="border border-slate-200 p-2.5 rounded-lg text-center bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Total Line Items</span>
              <span className="text-sm font-black text-slate-900">{filteredItems.length} Items</span>
            </div>
            <div className="border border-slate-200 p-2.5 rounded-lg text-center bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Purchased Quantity</span>
              <span className="text-sm font-black text-teal-800">{totalUnits.toLocaleString()} Units</span>
            </div>
            <div className="border border-slate-200 p-2.5 rounded-lg text-center bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Available Stock</span>
              <span className="text-sm font-black text-emerald-700">{totalStockAvailable.toLocaleString()} In-Hand</span>
            </div>
            <div className="border border-slate-200 p-2.5 rounded-lg text-center bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Total Lab Capital Cost</span>
              <span className="text-sm font-black text-rose-700">Rs. {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Itemized Inventory & Expense Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-4">
            <table className="w-full border-collapse text-left text-[11px]">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 text-center w-8">#</th>
                  <th className="p-2 border-r border-slate-300 whitespace-nowrap">SKU / Code</th>
                  <th className="p-2 border-r border-slate-300">Item Description & Specifications</th>
                  <th className="p-2 border-r border-slate-300 whitespace-nowrap">Category</th>
                  <th className="p-2 border-r border-slate-300 text-center whitespace-nowrap">Qty & Unit</th>
                  <th className="p-2 border-r border-slate-300 text-right whitespace-nowrap">Unit Rate</th>
                  <th className="p-2 border-r border-slate-300 text-right whitespace-nowrap">Total (PKR)</th>
                  <th className="p-2 border-r border-slate-300 whitespace-nowrap">Storage Location</th>
                  <th className="p-2 border-r border-slate-300 whitespace-nowrap">Supplier / Bill</th>
                  <th className="p-2 text-center whitespace-nowrap">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 font-semibold">
                      Is Lab ya Category ke tehat koi inventory item ya expense record mojood nahi hai.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => {
                    const isEven = index % 2 === 0;
                    return (
                      <tr key={item.id} className={isEven ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-600">
                          {index + 1}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-mono text-[10px] text-slate-700 whitespace-nowrap">
                          {item.itemCode || `INV-${String(index + 1).padStart(3, '0')}`}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                          <div>{item.title}</div>
                          {selectedDepartment === 'ALL' && (
                            <span className="text-[10px] text-slate-500 font-normal">
                              Dept: {item.department}
                            </span>
                          )}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-slate-700 whitespace-nowrap">
                          {item.category}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-800 whitespace-nowrap">
                          {item.quantity || 1} {item.unit || 'Units'}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono text-slate-700 whitespace-nowrap">
                          Rs. {(item.unitPrice || Math.round(item.amount / (item.quantity || 1))).toLocaleString()}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono font-black text-slate-900 whitespace-nowrap">
                          Rs. {item.amount.toLocaleString()}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-slate-600 text-[10px] whitespace-nowrap">
                          {item.storageLocation || 'General Store'}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-slate-600 text-[10px] whitespace-nowrap">
                          {item.supplier ? `${item.supplier.slice(0, 20)}...` : 'Local Purchase'}
                          {item.invoiceNo && <span className="block font-mono text-slate-400 text-[9px]">#{item.invoiceNo}</span>}
                        </td>
                        <td className="p-2 text-center whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                              item.stockStatus === 'OUT_OF_STOCK'
                                ? 'bg-rose-100 text-rose-800'
                                : item.stockStatus === 'LOW_STOCK'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.stockStatus === 'OUT_OF_STOCK'
                              ? 'OUT OF STOCK'
                              : item.stockStatus === 'LOW_STOCK'
                              ? `LOW (${item.currentStock || 0})`
                              : `IN STOCK (${item.currentStock ?? item.quantity ?? 1})`}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="p-2.5 text-right font-black text-slate-900">
                    TOTAL AUDITED EXPENDITURE ({selectedDepartment === 'ALL' ? 'ALL LABS' : selectedDepartment.toUpperCase()}):
                  </td>
                  <td className="p-2.5 text-center font-black text-slate-900">
                    {totalUnits.toLocaleString()} Units
                  </td>
                  <td className="p-2.5 text-right font-bold text-slate-500">—</td>
                  <td className="p-2.5 text-right font-black text-rose-700 text-xs">
                    Rs. {totalAmount.toLocaleString()}
                  </td>
                  <td colSpan={3} className="p-2.5 text-center text-slate-600 text-[10px]">
                    Available Physical Stock: {totalStockAvailable.toLocaleString()} Units
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Departmental Inventory Notes */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-6 text-[10px] text-slate-600">
            <span className="font-bold text-slate-800 block mb-0.5">Verification & Stock Integrity Notes:</span>
            <span>
              Tamam equipment, computers, reagents, aur lab assets physical inspection ke mutabiq verify shuda hain. 
              Kisi bhi item ki kharabi ya shortage ki soorat mein HOD aur Director Finance ko foran muttala karein.
            </span>
          </div>

          {/* Formal Verification Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-dashed border-slate-300 text-[10px] text-center">
            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1 font-bold text-slate-800">
                Lab Incharge / Store Keeper
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">(Physical Verification)</div>
            </div>

            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1 font-bold text-slate-800">
                Head of Department (HOD)
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {selectedDepartment === 'ALL' ? 'Respective HODs' : selectedDepartment}
              </div>
            </div>

            <div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-bold text-slate-800">
                Director Finance / Principal
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">(Executive Approval & Stamp)</div>
            </div>
          </div>

          {/* Footer Computer Generated Notice */}
          <div className="text-center text-[9px] text-slate-400 mt-6 pt-2 border-t border-slate-200">
            System generated Computer Inventory & Financial Audit Sheet • Campus Management ERP • No manual tampering valid.
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { Expense } from '../lib/types';

interface ExpenseModalProps {
  isOpen: boolean;
  mode: 'ADD' | 'EDIT';
  expenseToEdit?: Expense | null;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}

const DEFAULT_CATEGORIES = [
  'Lab Equipment',
  'Anatomy & Dissection',
  'Hospital Consumables',
  'Pathology & Lab Chemicals',
  'Library & Books',
  'Surgical Instruments',
  'Campus Maintenance',
  'Software & IT',
  'Pharmacy & Medicines',
  'Stationery & Printing',
  'Faculty & Staff Amenities',
];

const INVENTORY_UNITS = [
  'Units',
  'Pieces (Pcs)',
  'Boxes',
  'Kits',
  'Packs',
  'Liters (L)',
  'Drums (25L)',
  'Bottles',
  'Sets',
  'Pairs',
  'Kg',
  'Cartons',
  'Custom Unit',
];

const DEPARTMENTS = [
  'Pathology Lab',
  'Anatomy Hall',
  'Biochemistry Lab',
  'Pharmacology Lab',
  'Microbiology Lab',
  'Teaching Hospital',
  'Central Medical Library',
  'IT Operations',
  'Administration',
  'Forensic Medicine Lab',
  'Physiology Lab',
  'Hostel & Campus Facilities',
];

export default function ExpenseModal({
  isOpen,
  mode,
  expenseToEdit,
  onClose,
  onSave,
}: ExpenseModalProps) {
  const [title, setTitle] = useState('');
  
  // Category state (supports custom category)
  const [category, setCategory] = useState<string>('Lab Equipment');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryText, setCustomCategoryText] = useState('');

  const [department, setDepartment] = useState('Pathology Lab');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [approvedBy, setApprovedBy] = useState('Dean Academic');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING'>('PAID');

  // Inventory Management Fields
  const [isInventoryItem, setIsInventoryItem] = useState(true);
  const [itemCode, setItemCode] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [unit, setUnit] = useState('Units');
  const [customUnitText, setCustomUnitText] = useState('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [currentStock, setCurrentStock] = useState<number | ''>(10);
  const [stockStatus, setStockStatus] = useState<'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'CONSUMED'>('IN_STOCK');
  const [supplier, setSupplier] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [minReorderLevel, setMinReorderLevel] = useState<number | ''>(3);

  const [error, setError] = useState('');

  // Auto-calculate Total Amount when Qty or Unit Price changes
  const handleQuantityChange = (val: number | '') => {
    setQuantity(val);
    if (val !== '' && unitPrice !== '') {
      setAmount(Number(val) * Number(unitPrice));
    }
    if (val !== '') {
      setCurrentStock(val);
    }
  };

  const handleUnitPriceChange = (val: number | '') => {
    setUnitPrice(val);
    if (quantity !== '' && val !== '') {
      setAmount(Number(quantity) * Number(val));
    }
  };

  useEffect(() => {
    if (mode === 'EDIT' && expenseToEdit) {
      setTitle(expenseToEdit.title);
      
      if (DEFAULT_CATEGORIES.includes(expenseToEdit.category)) {
        setCategory(expenseToEdit.category);
        setIsCustomCategory(false);
        setCustomCategoryText('');
      } else {
        setCategory('CUSTOM');
        setIsCustomCategory(true);
        setCustomCategoryText(expenseToEdit.category);
      }

      setDepartment(expenseToEdit.department);
      setDate(expenseToEdit.date);
      setAmount(expenseToEdit.amount);
      setApprovedBy(expenseToEdit.approvedBy);
      setPaymentStatus(expenseToEdit.paymentStatus);

      // Inventory
      setIsInventoryItem(expenseToEdit.isInventoryItem !== false);
      setItemCode(expenseToEdit.itemCode || `INV-${Math.floor(100 + Math.random() * 900)}`);
      setQuantity(expenseToEdit.quantity ?? 1);
      
      if (expenseToEdit.unit && INVENTORY_UNITS.includes(expenseToEdit.unit)) {
        setUnit(expenseToEdit.unit);
        setCustomUnitText('');
      } else if (expenseToEdit.unit) {
        setUnit('Custom Unit');
        setCustomUnitText(expenseToEdit.unit);
      } else {
        setUnit('Units');
      }

      setUnitPrice(expenseToEdit.unitPrice ?? (expenseToEdit.quantity ? Math.round(expenseToEdit.amount / expenseToEdit.quantity) : expenseToEdit.amount));
      setCurrentStock(expenseToEdit.currentStock ?? expenseToEdit.quantity ?? 1);
      setStockStatus(expenseToEdit.stockStatus || 'IN_STOCK');
      setSupplier(expenseToEdit.supplier || '');
      setInvoiceNo(expenseToEdit.invoiceNo || '');
      setStorageLocation(expenseToEdit.storageLocation || '');
      setMinReorderLevel(expenseToEdit.minReorderLevel ?? 2);
    } else {
      // Reset for ADD
      setTitle('');
      setCategory('Lab Equipment');
      setIsCustomCategory(false);
      setCustomCategoryText('');
      setDepartment('Pathology Lab');
      setDate(new Date().toISOString().split('T')[0]);
      setAmount(50000);
      setApprovedBy('Dean Academic');
      setPaymentStatus('PAID');

      // Default inventory item values
      setIsInventoryItem(true);
      setItemCode(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
      setQuantity(10);
      setUnit('Units');
      setCustomUnitText('');
      setUnitPrice(5000);
      setCurrentStock(10);
      setStockStatus('IN_STOCK');
      setSupplier('MedTech Scientific & Surgical Supplies');
      setInvoiceNo(`INV-${Math.floor(10000 + Math.random() * 90000)}`);
      setStorageLocation('Central Lab Store Rack B');
      setMinReorderLevel(2);
    }
    setError('');
  }, [mode, expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Barah-e-karam item / expense title darj karein.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategoryText.trim() : category;
    if (!finalCategory) {
      setError('Barah-e-karam category muntakhib ya darj karein.');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Barah-e-karam valid total amount (PKR) darj karein.');
      return;
    }

    const finalUnit = unit === 'Custom Unit' ? (customUnitText.trim() || 'Units') : unit;

    const expenseData: Expense = {
      id: mode === 'EDIT' && expenseToEdit ? expenseToEdit.id : `exp_${Date.now()}`,
      title: title.trim(),
      category: finalCategory,
      department: department.trim(),
      date,
      amount: Number(amount),
      approvedBy: approvedBy.trim(),
      paymentStatus,

      // Inventory fields
      isInventoryItem,
      itemCode: itemCode.trim() || `INV-${Date.now().toString().slice(-4)}`,
      quantity: quantity !== '' ? Number(quantity) : 1,
      unit: finalUnit,
      unitPrice: unitPrice !== '' ? Number(unitPrice) : (quantity !== '' ? Math.round(Number(amount) / Number(quantity)) : Number(amount)),
      currentStock: currentStock !== '' ? Number(currentStock) : (quantity !== '' ? Number(quantity) : 1),
      stockStatus,
      supplier: supplier.trim(),
      invoiceNo: invoiceNo.trim(),
      storageLocation: storageLocation.trim(),
      minReorderLevel: minReorderLevel !== '' ? Number(minReorderLevel) : 2,
    };

    onSave(expenseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-teal-300 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-white/10 border border-white/20">
                {mode === 'ADD' ? 'Inventory & Expense Management' : 'Inventory Record Update'}
              </span>
              <span className="text-[10px] text-teal-200 font-medium">Qty, Rate, Category & Stock</span>
            </div>
            <h2 className="text-lg font-black mt-1 flex items-center gap-2">
              <span>{mode === 'ADD' ? '📦 Add Lab / Campus Expense & Inventory' : '✏️ Edit Expense & Stock Item'}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-base font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {/* Section 1: Item / Expense Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Item / Expense Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pathology Compound Microscopes, Surgical Gloves, Formalin Solution, Chemistry Kits..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900 font-semibold placeholder-slate-400"
            />
          </div>

          {/* Section 2: Category (Customizable - Apne hisab se category add karein) */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-800 uppercase">
                Category <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(!isCustomCategory);
                  if (!isCustomCategory) {
                    setCustomCategoryText('');
                  }
                }}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer flex items-center gap-1"
              >
                <span>{isCustomCategory ? '← Select Standard Category' : '➕ Apni Custom Category Likhein'}</span>
              </button>
            </div>

            {!isCustomCategory ? (
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === 'CUSTOM') {
                    setIsCustomCategory(true);
                    setCustomCategoryText('');
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="CUSTOM">➕ Other / Custom Category (Nayi Category)...</option>
              </select>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  required
                  value={customCategoryText}
                  onChange={(e) => setCustomCategoryText(e.target.value)}
                  placeholder="Apni marzi ki category likhein (e.g. Surgical Blades, Glassware, Hostel Bedding, Gym Equipment)..."
                  className="w-full px-3.5 py-2 text-xs bg-white border-2 border-teal-600 rounded-xl font-bold text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs placeholder-slate-400"
                  autoFocus
                />
                <span className="text-[10px] text-teal-700 font-medium">
                  ✓ Yeh nayi category inventory filters aur expense report mein auto-save ho jayegi.
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Inventory Management Box (Qty, Unit, Rate, Stock) */}
          <div className="bg-emerald-50/50 border-2 border-emerald-300/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <span className="text-base">📦</span>
                <div>
                  <span className="font-bold text-xs text-emerald-950">Inventory & Stock Tracking</span>
                  <span className="text-[10px] text-emerald-700 ml-2 font-medium">Quantity, Rate & Storage</span>
                </div>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-emerald-900 select-none">
                <input
                  type="checkbox"
                  checked={isInventoryItem}
                  onChange={(e) => setIsInventoryItem(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Manage Stock</span>
              </label>
            </div>

            {isInventoryItem && (
              <>
                {/* Quantity, Unit, Unit Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      Quantity (Qty) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required={isInventoryItem}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 10"
                      className="w-full p-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      Unit (Measurement)
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {INVENTORY_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    {unit === 'Custom Unit' && (
                      <input
                        type="text"
                        placeholder="e.g. Vials, Bundles"
                        value={customUnitText}
                        onChange={(e) => setCustomUnitText(e.target.value)}
                        className="mt-1 w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      Unit Price / Rate (PKR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={unitPrice}
                      onChange={(e) => handleUnitPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 5000"
                      className="w-full p-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>
                </div>

                {/* SKU Code, Storage Location, Reorder Level */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      Item Code / SKU
                    </label>
                    <input
                      type="text"
                      value={itemCode}
                      onChange={(e) => setItemCode(e.target.value)}
                      placeholder="e.g. INV-PATH-01"
                      className="w-full p-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      Storage Location / Shelf
                    </label>
                    <input
                      type="text"
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      placeholder="e.g. Pathology Lab Rack 2, Shelf B"
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      Stock Status
                    </label>
                    <select
                      value={stockStatus}
                      onChange={(e) => setStockStatus(e.target.value as any)}
                      className="w-full p-2 text-xs font-bold bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="IN_STOCK">🟢 In Stock (Available)</option>
                      <option value="LOW_STOCK">🟡 Low Stock Alert</option>
                      <option value="OUT_OF_STOCK">🔴 Out of Stock</option>
                      <option value="CONSUMED">⚪ Fully Consumed</option>
                    </select>
                  </div>
                </div>

                {/* Supplier & Invoice */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      Vendor / Supplier Name
                    </label>
                    <input
                      type="text"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      placeholder="e.g. MedTech Scientific Supplies Ltd."
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      Bill / Invoice Reference No.
                    </label>
                    <input
                      type="text"
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      placeholder="e.g. INV-991204"
                      className="w-full p-2 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Section 4: Total Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Total Expense Amount (PKR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 50000"
                  className="w-full px-3.5 py-2.5 text-sm font-extrabold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-rose-600 placeholder-slate-400"
                />
                {isInventoryItem && quantity && unitPrice && (
                  <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-slate-500">
                    ({quantity} × Rs. {Number(unitPrice).toLocaleString()})
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Date of Purchase / Expense
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900 font-semibold"
              />
            </div>
          </div>

          {/* Section 5: Department & Authorization */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Department / Lab
              </label>
              <input
                type="text"
                list="dept-options"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Pathology Lab"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900"
              />
              <datalist id="dept-options">
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Authorized By
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="e.g. Dean Academic, Principal, HOD"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as 'PAID' | 'PENDING')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900 font-bold"
              >
                <option value="PAID">PAID (Clear)</option>
                <option value="PENDING">PENDING (Unpaid / In Process)</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">
              * Total amount and inventory stock will sync in real-time.
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-md shadow-teal-800/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{mode === 'ADD' ? '💾 Save Expense & Inventory Item' : '✓ Update Record'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

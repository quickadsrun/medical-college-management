'use client';
import React, { useState, useEffect } from 'react';
import { FacultyStaff } from '../lib/types';
import { CheckCircleIcon, TrashIcon } from './Icons';
import ManageFacultyCategoriesModal from './ManageFacultyCategoriesModal';
import {
  DEFAULT_DEPARTMENTS,
  DEFAULT_MEDICAL_TERMS,
  getStoredDepartments,
  getStoredTerms,
} from '../lib/facultySettings';

export const MEDICAL_DEPARTMENTS = DEFAULT_DEPARTMENTS;
export const MEDICAL_TERMS = DEFAULT_MEDICAL_TERMS;

interface FacultySalaryModalProps {
  isOpen: boolean;
  mode?: 'ADD' | 'EDIT';
  facultyMember: FacultyStaff | null;
  onClose: () => void;
  onSave: (facultyData: FacultyStaff) => void;
  onDelete?: (facultyId: string) => void;
  totalFacultyCount?: number;
  departments?: string[];
  medicalTerms?: string[];
  onAddDepartment?: (name: string) => void;
  onEditDepartment?: (oldName: string, newName: string) => void;
  onDeleteDepartment?: (name: string) => void;
  onAddTerm?: (name: string) => void;
  onEditTerm?: (oldName: string, newName: string) => void;
  onDeleteTerm?: (name: string) => void;
  onResetDepartments?: () => void;
  onResetTerms?: () => void;
}

export default function FacultySalaryModal({
  isOpen,
  mode = 'EDIT',
  facultyMember,
  onClose,
  onSave,
  onDelete,
  totalFacultyCount = 8,
  departments: propDepartments,
  medicalTerms: propMedicalTerms,
  onAddDepartment: propOnAddDepartment,
  onEditDepartment: propOnEditDepartment,
  onDeleteDepartment: propOnDeleteDepartment,
  onAddTerm: propOnAddTerm,
  onEditTerm: propOnEditTerm,
  onDeleteTerm: propOnDeleteTerm,
  onResetDepartments: propOnResetDepartments,
  onResetTerms: propOnResetTerms,
}: FacultySalaryModalProps) {
  // Category Manager Modal state
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [manageCategoriesInitialTab, setManageCategoriesInitialTab] = useState<'DEPTS' | 'TERMS'>('DEPTS');

  // Local fallback if props not provided
  const [localDepartments, setLocalDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [localTerms, setLocalTerms] = useState<string[]>(DEFAULT_MEDICAL_TERMS);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalDepartments(getStoredDepartments());
      setLocalTerms(getStoredTerms());
    }
  }, [isOpen]);

  const activeDepartments = propDepartments && propDepartments.length > 0 ? propDepartments : localDepartments;
  const activeTerms = propMedicalTerms && propMedicalTerms.length > 0 ? propMedicalTerms : localTerms;

  // Profile, Academic Subject & Medical Term
  const [name, setName] = useState('');
  const [employeeNo, setEmployeeNo] = useState('');
  const [department, setDepartment] = useState('General Surgery');
  const [customDepartment, setCustomDepartment] = useState('');
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [designation, setDesignation] = useState('Assistant Professor');
  const [subjectSpecialization, setSubjectSpecialization] = useState('');
  const [teachingTerm, setTeachingTerm] = useState('1st Year MBBS (Pre-Clinical)');
  const [joiningDate, setJoiningDate] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<'ACTIVE' | 'RESIGNED' | 'ON_LEAVE' | 'TERMINATED'>('ACTIVE');
  const [resignationDate, setResignationDate] = useState('');
  const [resignationReason, setResignationReason] = useState('');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');

  // Attendance & Shift
  const [workingDays, setWorkingDays] = useState(30);
  const [presentDays, setPresentDays] = useState(30);
  const [absentDays, setAbsentDays] = useState(0);
  const [leaveDays, setLeaveDays] = useState(0);
  const [halfDaysCount, setHalfDaysCount] = useState(0);
  const [shiftTiming, setShiftTiming] = useState('10:00 AM - 04:00 PM');

  // Earnings
  const [basicSalary, setBasicSalary] = useState(200000);
  const [houseRentAllowance, setHouseRentAllowance] = useState(20000);
  const [medicalAllowance, setMedicalAllowance] = useState(10000);
  const [conveyanceAllowance, setConveyanceAllowance] = useState(10000);
  const [specialAllowance, setSpecialAllowance] = useState(10000);

  // Advance Salary / Loan Tracking
  const [advanceTotalLoan, setAdvanceTotalLoan] = useState(0);
  const [advanceDeductionThisMonth, setAdvanceDeductionThisMonth] = useState(0);
  const [advanceReason, setAdvanceReason] = useState('');

  // Other Deductions
  const [absenteeismDeduction, setAbsenteeismDeduction] = useState(0);
  const [halfDayDeduction, setHalfDayDeduction] = useState(0);
  const [taxDeduction, setTaxDeduction] = useState(5000);
  const [providentFundDeduction, setProvidentFundDeduction] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [otherDeductionsNote, setOtherDeductionsNote] = useState('');

  // Payment Status
  const [salaryStatus, setSalaryStatus] = useState<'PAID' | 'PENDING'>('PAID');
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CASH' | 'CHEQUE'>('BANK_TRANSFER');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [month, setMonth] = useState('September 2026');

  // Handlers for Add/Edit/Delete Dept & Terms
  const handleAddDept = (deptName: string) => {
    if (propOnAddDepartment) {
      propOnAddDepartment(deptName);
    } else {
      setLocalDepartments((prev) => [deptName, ...prev]);
    }
    setDepartment(deptName);
  };

  const handleEditDept = (oldName: string, newName: string) => {
    if (propOnEditDepartment) {
      propOnEditDepartment(oldName, newName);
    } else {
      setLocalDepartments((prev) => prev.map((d) => (d === oldName ? newName : d)));
    }
    if (department === oldName) setDepartment(newName);
  };

  const handleDeleteDept = (deptName: string) => {
    if (propOnDeleteDepartment) {
      propOnDeleteDepartment(deptName);
    } else {
      setLocalDepartments((prev) => prev.filter((d) => d !== deptName));
    }
    if (department === deptName) {
      const remaining = activeDepartments.filter((d) => d !== deptName);
      if (remaining.length > 0) setDepartment(remaining[0]);
    }
  };

  const handleAddTerm = (termName: string) => {
    if (propOnAddTerm) {
      propOnAddTerm(termName);
    } else {
      setLocalTerms((prev) => [termName, ...prev]);
    }
    setTeachingTerm(termName);
  };

  const handleEditTerm = (oldName: string, newName: string) => {
    if (propOnEditTerm) {
      propOnEditTerm(oldName, newName);
    } else {
      setLocalTerms((prev) => prev.map((t) => (t === oldName ? newName : t)));
    }
    if (teachingTerm === oldName) setTeachingTerm(newName);
  };

  const handleDeleteTerm = (termName: string) => {
    if (propOnDeleteTerm) {
      propOnDeleteTerm(termName);
    } else {
      setLocalTerms((prev) => prev.filter((t) => t !== termName));
    }
    if (teachingTerm === termName) {
      const remaining = activeTerms.filter((t) => t !== termName);
      if (remaining.length > 0) setTeachingTerm(remaining[0]);
    }
  };

  const handleResetDepartments = () => {
    if (propOnResetDepartments) propOnResetDepartments();
    else setLocalDepartments(DEFAULT_DEPARTMENTS);
  };

  const handleResetTerms = () => {
    if (propOnResetTerms) propOnResetTerms();
    else setLocalTerms(DEFAULT_MEDICAL_TERMS);
  };

  // Quick action buttons right next to dropdowns
  const handleQuickAddDept = () => {
    const name = window.prompt('➕ Naya Medical College Department ka naam likhein:');
    if (name && name.trim()) {
      handleAddDept(name.trim());
    }
  };

  const handleQuickRenameDept = () => {
    if (!department) return;
    const newName = window.prompt(`✏️ Department "${department}" ka naya naam likhein:`, department);
    if (newName && newName.trim() && newName.trim() !== department) {
      handleEditDept(department, newName.trim());
    }
  };

  const handleQuickDeleteDept = () => {
    if (!department) return;
    if (activeDepartments.length <= 1) {
      alert('Kam az kam ek department hona zaroori hai!');
      return;
    }
    const confirmDel = window.confirm(`🗑️ Kya aap waqai Department "${department}" ko list se delete karna chahte hain?`);
    if (confirmDel) {
      handleDeleteDept(department);
    }
  };

  const handleQuickAddTerm = () => {
    const name = window.prompt('➕ Nayi Medical Class / Term ka naam likhein (e.g. 1st Year MBBS, BDS Final Year):');
    if (name && name.trim()) {
      handleAddTerm(name.trim());
    }
  };

  const handleQuickRenameTerm = () => {
    if (!teachingTerm) return;
    const newName = window.prompt(`✏️ Class / Term "${teachingTerm}" ka naya naam likhein:`, teachingTerm);
    if (newName && newName.trim() && newName.trim() !== teachingTerm) {
      handleEditTerm(teachingTerm, newName.trim());
    }
  };

  const handleQuickDeleteTerm = () => {
    if (!teachingTerm) return;
    if (activeTerms.length <= 1) {
      alert('Kam az kam ek medical class / term hona zaroori hai!');
      return;
    }
    const confirmDel = window.confirm(`🗑️ Kya aap waqai Class/Term "${teachingTerm}" ko list se delete karna chahte hain?`);
    if (confirmDel) {
      handleDeleteTerm(teachingTerm);
    }
  };

  // Populate data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'EDIT' && facultyMember) {
        setName(facultyMember.name || '');
        setEmployeeNo(facultyMember.employeeNo || '');
        
        const isStandard = activeDepartments.includes(facultyMember.department || '');
        if (isStandard) {
          setDepartment(facultyMember.department || activeDepartments[0] || 'General Surgery');
          setIsCustomDept(false);
          setCustomDepartment('');
        } else {
          setDepartment(facultyMember.department || activeDepartments[0] || 'General Surgery');
          setIsCustomDept(false);
          setCustomDepartment('');
        }

        setDesignation(facultyMember.designation || 'Assistant Professor');
        setSubjectSpecialization(facultyMember.subjectSpecialization || '');
        setTeachingTerm(facultyMember.teachingTerm || '1st Year MBBS (Pre-Clinical)');
        setJoiningDate(facultyMember.joiningDate || '2024-01-01');
        setEmploymentStatus(facultyMember.employmentStatus || 'ACTIVE');
        setResignationDate(facultyMember.resignationDate || '');
        setResignationReason(facultyMember.resignationReason || '');

        setPhone(facultyMember.phone || '');
        setEmail(facultyMember.email || '');
        setCnic(facultyMember.cnic || '');
        setBankName(facultyMember.bankName || '');
        setAccountNo(facultyMember.accountNo || '');

        setWorkingDays(facultyMember.workingDays !== undefined ? facultyMember.workingDays : 30);
        setPresentDays(facultyMember.presentDays !== undefined ? facultyMember.presentDays : 30);
        setAbsentDays(facultyMember.absentDays !== undefined ? facultyMember.absentDays : 0);
        setLeaveDays(facultyMember.leaveDays !== undefined ? facultyMember.leaveDays : 0);
        setHalfDaysCount(facultyMember.halfDaysCount !== undefined ? facultyMember.halfDaysCount : 0);
        setShiftTiming(facultyMember.shiftTiming || '10:00 AM - 04:00 PM');

        setBasicSalary(facultyMember.basicSalary || 0);
        setHouseRentAllowance(facultyMember.houseRentAllowance || 0);
        setMedicalAllowance(facultyMember.medicalAllowance || 0);
        setConveyanceAllowance(facultyMember.conveyanceAllowance || 0);
        setSpecialAllowance(facultyMember.specialAllowance || 0);

        setAdvanceTotalLoan(facultyMember.advanceTotalLoan || 0);
        setAdvanceDeductionThisMonth(facultyMember.advanceDeductionThisMonth || 0);
        setAdvanceReason(facultyMember.advanceReason || '');

        setAbsenteeismDeduction(facultyMember.absenteeismDeduction || 0);
        setHalfDayDeduction(facultyMember.halfDayDeduction || 0);
        setTaxDeduction(facultyMember.taxDeduction || 0);
        setProvidentFundDeduction(facultyMember.providentFundDeduction || 0);
        setOtherDeductions(facultyMember.otherDeductions || 0);
        setOtherDeductionsNote(facultyMember.otherDeductionsNote || '');

        setSalaryStatus(facultyMember.salaryStatus || 'PAID');
        setPaymentMethod(facultyMember.paymentMethod || 'BANK_TRANSFER');
        setTransactionRef(facultyMember.transactionRef || '');
        setPaymentDate(facultyMember.paymentDate || new Date().toISOString().split('T')[0]);
        setMonth(facultyMember.month || 'September 2026');
      } else {
        // ADD NEW TEACHER FRESH VALUES
        setName('');
        const nextId = `FAC-${String(totalFacultyCount + 1).padStart(3, '0')}`;
        setEmployeeNo(nextId);
        setDepartment('General Surgery');
        setIsCustomDept(false);
        setCustomDepartment('');
        setDesignation('Assistant Professor');
        setSubjectSpecialization('');
        setTeachingTerm('1st Year MBBS (Pre-Clinical)');
        setJoiningDate(new Date().toISOString().split('T')[0]);
        setEmploymentStatus('ACTIVE');
        setResignationDate('');
        setResignationReason('');

        setPhone('+92 300 ');
        setEmail('');
        setCnic('');
        setBankName('Habib Bank Limited (HBL)');
        setAccountNo('');

        setWorkingDays(30);
        setPresentDays(30);
        setAbsentDays(0);
        setLeaveDays(0);
        setHalfDaysCount(0);
        setShiftTiming('10:00 AM - 04:00 PM');

        setBasicSalary(220000);
        setHouseRentAllowance(25000);
        setMedicalAllowance(15000);
        setConveyanceAllowance(10000);
        setSpecialAllowance(10000);

        setAdvanceTotalLoan(0);
        setAdvanceDeductionThisMonth(0);
        setAdvanceReason('');

        setAbsenteeismDeduction(0);
        setHalfDayDeduction(0);
        setTaxDeduction(8000);
        setProvidentFundDeduction(0);
        setOtherDeductions(0);
        setOtherDeductionsNote('');

        setSalaryStatus('PENDING');
        setPaymentMethod('BANK_TRANSFER');
        setTransactionRef('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setMonth('September 2026');
      }
    }
  }, [facultyMember, isOpen, mode, totalFacultyCount]);

  if (!isOpen) return null;

  // Live Auto-Calculations
  const totalAllowances =
    Number(houseRentAllowance || 0) +
    Number(medicalAllowance || 0) +
    Number(conveyanceAllowance || 0) +
    Number(specialAllowance || 0);

  const grossSalary = Number(basicSalary || 0) + totalAllowances;

  const advanceRemainingBalance = Math.max(
    0,
    Number(advanceTotalLoan || 0) - Number(advanceDeductionThisMonth || 0)
  );

  const totalDeductions =
    Number(advanceDeductionThisMonth || 0) +
    Number(absenteeismDeduction || 0) +
    Number(halfDayDeduction || 0) +
    Number(taxDeduction || 0) +
    Number(providentFundDeduction || 0) +
    Number(otherDeductions || 0);

  const netSalary = Math.max(0, grossSalary - totalDeductions);

  const attendanceScore = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 100;

  // Auto calculate absent deduction helper
  const handleAutoCalcAbsenteeism = () => {
    if (workingDays > 0 && absentDays > 0 && basicSalary > 0) {
      const perDaySalary = Math.round(basicSalary / workingDays);
      setAbsenteeismDeduction(perDaySalary * absentDays);
    }
  };

  // Auto calculate half-day late arrival deduction (2-3 hours late) helper
  const handleAutoCalcHalfDay = () => {
    if (workingDays > 0 && halfDaysCount > 0 && basicSalary > 0) {
      const perDaySalary = basicSalary / workingDays;
      setHalfDayDeduction(Math.round(perDaySalary * 0.5 * halfDaysCount));
    }
  };

  const finalDepartment = isCustomDept ? customDepartment.trim() || 'General Faculty' : department;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Baraye meharbani Teacher / Faculty member ka naam darj karein!');
      return;
    }

    const updated: FacultyStaff = {
      id: mode === 'EDIT' && facultyMember ? facultyMember.id : `emp_${Date.now()}`,
      name: name.trim(),
      employeeNo: employeeNo.trim() || `FAC-${Math.floor(100 + Math.random() * 900)}`,
      department: finalDepartment,
      designation: designation.trim() || 'Lecturer',
      subjectSpecialization: subjectSpecialization.trim() || finalDepartment,
      teachingTerm,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      employmentStatus,
      resignationDate: employmentStatus === 'RESIGNED' ? resignationDate || new Date().toISOString().split('T')[0] : undefined,
      resignationReason: employmentStatus === 'RESIGNED' ? resignationReason : undefined,
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/[^a-z]/g, '')}@medcollege.edu.pk`,
      cnic: cnic.trim(),
      bankName: bankName.trim(),
      accountNo: accountNo.trim(),
      workingDays: Number(workingDays),
      presentDays: Number(presentDays),
      absentDays: Number(absentDays),
      leaveDays: Number(leaveDays),
      halfDaysCount: Number(halfDaysCount),
      shiftTiming,
      attendanceScore,
      basicSalary: Number(basicSalary),
      houseRentAllowance: Number(houseRentAllowance),
      medicalAllowance: Number(medicalAllowance),
      conveyanceAllowance: Number(conveyanceAllowance),
      specialAllowance: Number(specialAllowance),
      allowances: totalAllowances,
      grossSalary,
      advanceTotalLoan: Number(advanceTotalLoan),
      advanceDeductionThisMonth: Number(advanceDeductionThisMonth),
      advanceRemainingBalance,
      advanceReason,
      absenteeismDeduction: Number(absenteeismDeduction),
      halfDayDeduction: Number(halfDayDeduction),
      taxDeduction: Number(taxDeduction),
      providentFundDeduction: Number(providentFundDeduction),
      otherDeductions: Number(otherDeductions),
      otherDeductionsNote,
      deductions: totalDeductions,
      netSalary,
      salaryStatus,
      paymentMethod,
      transactionRef,
      paymentDate,
      month,
    };

    onSave(updated);
    onClose();
  };

  const handleDeleteTeacher = () => {
    if (!facultyMember || !onDelete) return;
    const confirmDelete = window.confirm(
      `⚠️ Kya aap waqai ${facultyMember.name} ko system se delete ya close karna chahte hain?`
    );
    if (confirmDelete) {
      onDelete(facultyMember.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-5 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{mode === 'ADD' ? '➕' : '👨‍🏫'}</span>
              <h2 className="text-base font-extrabold">
                {mode === 'ADD'
                  ? 'Add New Medical College Teacher / Faculty Member'
                  : 'Edit Faculty Record, Subject, Attendance & Payroll'}
              </h2>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              {mode === 'ADD'
                ? 'Naye teacher ka taqarur, subject specialization, medical term/class aur salary structure'
                : `${facultyMember?.name || ''} • ${facultyMember?.employeeNo || ''} • ${month}`}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Gross Salary</span>
              <span className="font-extrabold text-slate-900 text-sm">Rs. {grossSalary.toLocaleString()}</span>
            </div>
            <span className="text-slate-300 font-bold text-base">−</span>
            <div>
              <span className="text-rose-600 font-semibold block text-[10px] uppercase">Total Deductions</span>
              <span className="font-extrabold text-rose-700 text-sm">Rs. {totalDeductions.toLocaleString()}</span>
            </div>
            <span className="text-slate-300 font-bold text-base">=</span>
            <div>
              <span className="text-emerald-700 font-bold block text-[10px] uppercase">Net Take-Home Salary</span>
              <span className="font-black text-emerald-800 text-base">Rs. {netSalary.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                employmentStatus === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : employmentStatus === 'RESIGNED'
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {employmentStatus === 'ACTIVE'
                ? '🟢 Active Faculty'
                : employmentStatus === 'RESIGNED'
                ? '🔴 Left / Resigned'
                : '🟡 On Leave'}
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* SECTION 1: TEACHER HIRING, SUBJECT & MEDICAL TERM (نیا ٹیچر اور سبجیکٹ / ٹرم) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <span>🎓 1. Teacher Academic Particulars & Hiring Status</span>
                <span className="text-indigo-800 font-bold lowercase">(Subject, Term & Designation)</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900">
                Medical College Academic Roster
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Teacher Full Name & Qualifications *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Dr. Tariq Mahmood (FRCS)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Employee ID / No *</label>
                <input
                  type="text"
                  placeholder="e.g. FAC-009"
                  value={employeeNo}
                  onChange={(e) => setEmployeeNo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 font-mono font-bold text-indigo-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Designation / Academic Post *</label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Head of Department & Professor">Head of Department & Professor</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Senior Registrar">Senior Registrar</option>
                  <option value="Lecturer / Senior Demonstrator">Lecturer / Senior Demonstrator</option>
                  <option value="Demonstrator">Demonstrator</option>
                  <option value="Clinical Instructor / Supervisor">Clinical Instructor / Supervisor</option>
                  <option value="Medical Officer (MO)">Medical Officer (MO)</option>
                  <option value="Nursing Superintendent">Nursing Superintendent</option>
                  <option value="Chief Financial Officer & Bursar">Chief Financial Officer & Bursar</option>
                </select>
              </div>
            </div>

            {/* Department Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">Department *</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleQuickAddDept}
                      title="Naya department add karein"
                      className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200 cursor-pointer"
                    >
                      ➕ Add
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickRenameDept}
                      title="Selected department ka naam edit karein"
                      className="text-[10px] text-slate-700 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300 cursor-pointer"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickDeleteDept}
                      title="Selected department ko list se delete karein"
                      className="text-[10px] text-rose-700 hover:text-rose-900 font-bold bg-rose-50 hover:bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 cursor-pointer"
                    >
                      🗑️ Del
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManageCategoriesInitialTab('DEPTS');
                        setIsManageCategoriesOpen(true);
                      }}
                      title="Saare departments dekhein, add karein ya faltu delete karein"
                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold bg-purple-50 hover:bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200 cursor-pointer"
                    >
                      ⚙️ Manage
                    </button>
                  </div>
                </div>

                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600"
                >
                  {activeDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>{activeDepartments.length} depts mojood</span>
                  <button
                    type="button"
                    onClick={() => {
                      setManageCategoriesInitialTab('DEPTS');
                      setIsManageCategoriesOpen(true);
                    }}
                    className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                  >
                    Baqi departments delete karein →
                  </button>
                </div>
              </div>

              {/* Subject Specialization */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Subject / Specialization (کونسا سبجیکٹ پڑھاتے ہیں) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. General Surgery, Gross Anatomy, Physiology, Pathology..."
                  value={subjectSpecialization}
                  onChange={(e) => setSubjectSpecialization(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 font-bold text-slate-900"
                  required
                />
                <span className="text-[10px] text-slate-400">Teacher ka specialized subject (open text)</span>
              </div>

              {/* Medical Term / Class Taught */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">
                    Medical Term / Class *
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleQuickAddTerm}
                      title="Nayi class ya term add karein"
                      className="text-[10px] text-sky-700 hover:text-sky-900 font-bold bg-sky-50 hover:bg-sky-100 px-1.5 py-0.5 rounded border border-sky-200 cursor-pointer"
                    >
                      ➕ Add
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickRenameTerm}
                      title="Selected term ka naam edit karein"
                      className="text-[10px] text-slate-700 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300 cursor-pointer"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickDeleteTerm}
                      title="Selected term ko list se delete karein"
                      className="text-[10px] text-rose-700 hover:text-rose-900 font-bold bg-rose-50 hover:bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 cursor-pointer"
                    >
                      🗑️ Del
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManageCategoriesInitialTab('TERMS');
                        setIsManageCategoriesOpen(true);
                      }}
                      title="Saari classes dekhein, add karein ya faltu delete karein"
                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold bg-purple-50 hover:bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200 cursor-pointer"
                    >
                      ⚙️ Manage
                    </button>
                  </div>
                </div>

                <select
                  value={teachingTerm}
                  onChange={(e) => setTeachingTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600"
                >
                  {activeTerms.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>{activeTerms.length} terms/classes</span>
                  <button
                    type="button"
                    onClick={() => {
                      setManageCategoriesInitialTab('TERMS');
                      setIsManageCategoriesOpen(true);
                    }}
                    className="text-sky-600 hover:underline font-semibold cursor-pointer"
                  >
                    Baqi classes delete karein →
                  </button>
                </div>
              </div>
            </div>

            {/* Employment Status & Hiring / Departure Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Employment Status (سروس اسٹیٹس) *
                </label>
                <select
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl font-bold border ${
                    employmentStatus === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : employmentStatus === 'RESIGNED'
                      ? 'bg-rose-50 text-rose-900 border-rose-300'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  <option value="ACTIVE">🟢 ACTIVE (Currently Teaching / On Duty)</option>
                  <option value="RESIGNED">🔴 RESIGNED (College Chhor Gaya / Istifa)</option>
                  <option value="ON_LEAVE">🟡 ON_LEAVE (Long Leave / Sabbatical)</option>
                  <option value="TERMINATED">⚪ TERMINATED / RELIEVED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Date of Joining / Appointment (تعیناتی کی تاریخ)
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            {/* If Resigned / Chhor gaya hai: Show Details */}
            {employmentStatus === 'RESIGNED' && (
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 animate-fadeIn">
                <div>
                  <label className="block text-rose-900 font-bold mb-1">
                    Date of Departure / Relieving (چھوڑنے کی تاریخ)
                  </label>
                  <input
                    type="date"
                    value={resignationDate}
                    onChange={(e) => setResignationDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-rose-900 font-bold mb-1">
                    Resignation Reason / Clearance Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Higher studies abroad / Joined foreign hospital..."
                    value={resignationReason}
                    onChange={(e) => setResignationReason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: ATTENDANCE & SHIFT POLICY (کتنے دن آئے ہیں + آدھا دن رول) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <span>📅 2. Monthly Attendance & Shift Record</span>
                <span className="text-slate-400 font-normal lowercase">(Hazri aur chhutiyan)</span>
              </h3>
              <button
                type="button"
                onClick={handleAutoCalcAbsenteeism}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                ⚡ Auto-calculate Absenteeism Deduction
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Total Working Days</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-800 font-bold mb-1">Present Days (حاضری)</label>
                <input
                  type="number"
                  min="0"
                  max={workingDays}
                  value={presentDays}
                  onChange={(e) => setPresentDays(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl focus:ring-2 focus:ring-emerald-600 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-rose-700 font-bold mb-1">Absent Days (غیر حاضر)</label>
                <input
                  type="number"
                  min="0"
                  max={workingDays}
                  value={absentDays}
                  onChange={(e) => setAbsentDays(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl focus:ring-2 focus:ring-rose-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-amber-700 font-bold mb-1">Approved Leaves (چھٹیاں)</label>
                <input
                  type="number"
                  min="0"
                  max={workingDays}
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl focus:ring-2 focus:ring-amber-600 font-bold"
                />
              </div>
            </div>

            {/* Late Arrival / Half Day Rule & Counter */}
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-300 space-y-2 mt-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-800 font-extrabold text-xs">
                    ⏰ Late Arrival & Half Day Policy (آدھا دن)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-200 text-amber-900">
                    2-3 Hours Late = Half Day
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoCalcHalfDay}
                  className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer self-start sm:self-auto"
                >
                  ⚡ Auto-calculate Half-Day Wage Deduction
                </button>
              </div>

              <p className="text-[11px] text-amber-900/90 font-medium leading-relaxed">
                📌 <b>Official College Rule:</b> Agar teacher ka shift time <b>10:00 AM</b> hai aur wo <b>12:00 PM (2 se 3 ghante late)</b> aayein, to biometric system unka <b>Half Day (Aadha Din)</b> count karega aur 0.5 day salary deduct hogi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Standard Shift Duty Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 04:00 PM"
                    value={shiftTiming}
                    onChange={(e) => setShiftTiming(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-amber-950 font-bold mb-1">
                    Late Arrivals / Half Days Count (آدھے دن)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={workingDays}
                    value={halfDaysCount}
                    onChange={(e) => setHalfDaysCount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 text-amber-950 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                  <span className="text-[10px] text-amber-800">2-3 ghante late aane walay din</span>
                </div>

                <div>
                  <label className="block text-rose-800 font-bold mb-1">
                    Half-Day Deduction Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    value={halfDayDeduction}
                    onChange={(e) => setHalfDayDeduction(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-rose-300 text-rose-900 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold"
                  />
                  <span className="text-[10px] text-rose-700">Salary se aadhe din ki kutootee</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: BASIC SALARY & ALLOWANCES (آمدنی) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <span>💰 3. Basic Salary & Allowances (آمدنی اور مراعات)</span>
              </h3>
              <span className="font-extrabold text-slate-800 text-xs">
                Gross: Rs. {grossSalary.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Basic Monthly Salary (Rs.) *</label>
                <input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">House Rent Allowance (HRA)</label>
                <input
                  type="number"
                  value={houseRentAllowance}
                  onChange={(e) => setHouseRentAllowance(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Medical Allowance</label>
                <input
                  type="number"
                  value={medicalAllowance}
                  onChange={(e) => setMedicalAllowance(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Conveyance / Transport</label>
                <input
                  type="number"
                  value={conveyanceAllowance}
                  onChange={(e) => setConveyanceAllowance(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Special / Clinical Allowance</label>
                <input
                  type="number"
                  value={specialAllowance}
                  onChange={(e) => setSpecialAllowance(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="bg-indigo-100/60 p-2.5 rounded-xl border border-indigo-200 flex flex-col justify-center">
                <span className="text-[10px] text-indigo-900 font-bold uppercase">Total Allowances</span>
                <span className="text-sm font-black text-indigo-950">+ Rs. {totalAllowances.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: ADVANCE SALARY / LOAN RECOVERY (ایڈوانس کٹوتی کا حساب) */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <span>💳 4. Advance Salary / Loan Tracking System</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
                Monthly Recovery Cut
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  Total Advance / Loan Granted (Rs.)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500000 (5 Lakh)"
                  value={advanceTotalLoan}
                  onChange={(e) => setAdvanceTotalLoan(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-rose-800 font-bold mb-1">
                  Is Mahine Ki Kutootee (This Month Cut)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000 ya 10000"
                  value={advanceDeductionThisMonth}
                  onChange={(e) => setAdvanceDeductionThisMonth(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-rose-300 text-rose-900 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold"
                />
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-300 flex flex-col justify-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Remaining Loan Balance</span>
                <span className="text-sm font-black text-amber-900">
                  Rs. {advanceRemainingBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-amber-950 font-semibold mb-1">
                Advance Lene Ki Wajah / Reason (Advance Note)
              </label>
              <input
                type="text"
                placeholder="e.g. 2 Months Advance Salary for Personal Need / Medical Emergency"
                value={advanceReason}
                onChange={(e) => setAdvanceReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* SECTION 5: OTHER DEDUCTIONS (دیگر کٹوتیاں) */}
          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-rose-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <span>✂️ 5. Other Itemized Deductions (دیگر کٹوتیاں)</span>
              </h3>
              <span className="font-extrabold text-rose-900 text-xs">
                Total Cuts: - Rs. {totalDeductions.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Absenteeism (Rs.)</label>
                <input
                  type="number"
                  value={absenteeismDeduction}
                  onChange={(e) => setAbsenteeismDeduction(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Ghair hazri</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Half Day / Late (Rs.)</label>
                <input
                  type="number"
                  value={halfDayDeduction}
                  onChange={(e) => setHalfDayDeduction(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">10 ke bajaye 12 PM</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Income Tax (WHT)</label>
                <input
                  type="number"
                  value={taxDeduction}
                  onChange={(e) => setTaxDeduction(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Govt Tax</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Provident Fund / EOBI</label>
                <input
                  type="number"
                  value={providentFundDeduction}
                  onChange={(e) => setProvidentFundDeduction(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Retirement</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Other Deductions (Rs.)</label>
                <input
                  type="number"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Canteen/Fine</span>
              </div>
            </div>

            {otherDeductions > 0 && (
              <div>
                <label className="block text-rose-900 font-semibold mb-1">
                  Other Deduction Details / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hospital staff canteen billing, damaged equipment penalty..."
                  value={otherDeductionsNote}
                  onChange={(e) => setOtherDeductionsNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}
          </div>

          {/* SECTION 6: DISBURSEMENT STATUS & BANK DETAILS */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              🏦 6. Disbursement & Bank Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Status</label>
                <select
                  value={salaryStatus}
                  onChange={(e) => setSalaryStatus(e.target.value as 'PAID' | 'PENDING')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="PAID">✅ PAID (Clear)</option>
                  <option value="PENDING">⏳ PENDING (Under Review)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="BANK_TRANSFER">Bank Online Transfer</option>
                  <option value="CASH">Cash Voucher</option>
                  <option value="CHEQUE">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Bank Name & Branch</label>
                <input
                  type="text"
                  placeholder="e.g. Habib Bank Limited"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Account / IBAN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0124-78901234"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            {mode === 'EDIT' && onDelete ? (
              <button
                type="button"
                onClick={handleDeleteTeacher}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <TrashIcon className="w-4 h-4 text-rose-600" />
                <span>Teacher Chhor Gaya (Delete / Close Record)</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold rounded-xl shadow-md shadow-indigo-700/20 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>{mode === 'ADD' ? '➕ Hire & Appoint New Teacher' : 'Save Faculty Record'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Categories & Medical Terms Manager Modal */}
      <ManageFacultyCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        departments={activeDepartments}
        medicalTerms={activeTerms}
        onAddDepartment={handleAddDept}
        onEditDepartment={handleEditDept}
        onDeleteDepartment={handleDeleteDept}
        onAddTerm={handleAddTerm}
        onEditTerm={handleEditTerm}
        onDeleteTerm={handleDeleteTerm}
        onResetDepartments={handleResetDepartments}
        onResetTerms={handleResetTerms}
        initialTab={manageCategoriesInitialTab}
      />
    </div>
  );
}

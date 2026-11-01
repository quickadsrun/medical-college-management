'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar, { NavTab } from '../components/Sidebar';
import StudentLedgerModal from '../components/StudentLedgerModal';
import ReceiveFeeModal from '../components/ReceiveFeeModal';
import PrintReceiptModal from '../components/PrintReceiptModal';
import ExpenseModal from '../components/ExpenseModal';
import PrintInventoryReportModal from '../components/PrintInventoryReportModal';
import FacultySalaryModal from '../components/FacultySalaryModal';
import PrintSalarySlipModal from '../components/PrintSalarySlipModal';
import ManageFacultyCategoriesModal from '../components/ManageFacultyCategoriesModal';
import AdmissionFormModal from '../components/AdmissionFormModal';
import ManageProgramsModal from '../components/ManageProgramsModal';
import {
  CollegeProgramFee,
  DEFAULT_COLLEGE_PROGRAMS,
  getStoredPrograms,
  saveStoredPrograms,
} from '../lib/programsData';
import {
  DEFAULT_DEPARTMENTS,
  DEFAULT_MEDICAL_TERMS,
  getStoredDepartments,
  saveStoredDepartments,
  getStoredTerms,
  saveStoredTerms,
} from '../lib/facultySettings';
import { safeLocalStorageSet, cleanupOldStorageVersions } from '../lib/safeStorage';
import AICopilotDrawer from '../components/AICopilotDrawer';
import ReceptionistCounterView from '../components/ReceptionistCounterView';
import PrincipalLockModal from '../components/PrincipalLockModal';
import CollegePortalLogin from '../components/CollegePortalLogin';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import B2BSaasLanding from '../components/B2BSaasLanding';
import MobileBottomNav from '../components/MobileBottomNav';
import {
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_EXPENSES,
  INITIAL_TRANSACTIONS,
  INITIAL_COLLEGES,
  INITIAL_COLLEGE_ACCOUNTS,
  SUPER_ADMIN_DEFAULT,
  getCollegeStorageKey,
  calculateFinancialSummary,
  MONTH_NAMES,
  normalizeStudentAcademicCycle,
  ACADEMIC_CYCLE_MONTHS,
} from '../lib/data';
import {
  Student,
  PaymentTransaction,
  InstitutionMode,
  Expense,
  FacultyStaff,
  UserRole,
  CollegeTenant,
  CollegeTenantAccount,
  PortalMode,
} from '../lib/types';
import {
  DashboardIcon,
  StudentsIcon,
  FeeIcon,
  LedgerIcon,
  DefaulterIcon,
  FacultyIcon,
  ExpenseIcon,
  BotIcon,
  SearchIcon,
  PrinterIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  LockIcon,
  KeyIcon,
} from '../components/Icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function Home() {
  // SaaS Multi-Tenant Authentication & Session Mode
  const [portalMode, setPortalMode] = useState<PortalMode>('SAAS_LANDING');
  const [collegeAccounts, setCollegeAccounts] = useState<CollegeTenantAccount[]>(INITIAL_COLLEGE_ACCOUNTS);
  const [activeCollegeAccount, setActiveCollegeAccount] = useState<CollegeTenantAccount | null>(null);

  const [institutionMode, setInstitutionMode] = useState<InstitutionMode>('medical_college');
  const [currentTab, setCurrentTab] = useState<NavTab>('receptionist_counter');
  const [currentCollegeId, setCurrentCollegeId] = useState<string>(INITIAL_COLLEGE_ACCOUNTS[0].id);
  const [userRole, setUserRole] = useState<UserRole>('RECEPTIONIST');
  const [isAddCollegeModalOpen, setIsAddCollegeModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Principal Security Lock State (PIN Protected)
  const [isPrincipalUnlocked, setIsPrincipalUnlocked] = useState(false);
  const [isPrincipalLockModalOpen, setIsPrincipalLockModalOpen] = useState(false);
  const [pendingPrincipalTargetTab, setPendingPrincipalTargetTab] = useState<NavTab | null>(null);
  const [pendingPrincipalTargetLabel, setPendingPrincipalTargetLabel] = useState<string | undefined>(undefined);

  const currentCollege = useMemo(() => {
    return (
      activeCollegeAccount ||
      collegeAccounts.find((c) => c.id === currentCollegeId) ||
      collegeAccounts[0] ||
      INITIAL_COLLEGE_ACCOUNTS[0]
    );
  }, [activeCollegeAccount, collegeAccounts, currentCollegeId]);

  // Persistent State (Saved to localStorage per College Tenant)
  const [students, setStudents] = useState<Student[]>(() => INITIAL_STUDENTS.map(normalizeStudentAcademicCycle));
  const [faculty, setFaculty] = useState(INITIAL_FACULTY);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Helper: Load isolated dataset for a college
  const loadCollegeData = (collegeId: string, currentCollegeList: CollegeTenantAccount[]) => {
    try {
      const targetCollege = currentCollegeList.find((c) => c.id === collegeId) || currentCollegeList[0] || INITIAL_COLLEGE_ACCOUNTS[0];

      // 1. Students (Validated for 2-Year 24-Month Structure starting September 2026)
      let savedStudents = localStorage.getItem(getCollegeStorageKey(collegeId, 'students'));
      if (!savedStudents && (collegeId === 'college_hchs_kht' || collegeId === 'college_hbs_kht' || collegeId === 'college_aimc_kht')) {
        savedStudents = localStorage.getItem('pmc_college_hchs_kht_students_v12_clean') ||
                        localStorage.getItem('pmc_college_hbs_kht_students_v12_clean') ||
                        localStorage.getItem('pmc_college_aimc_kht_students_v12_clean') ||
                        localStorage.getItem('pmc_college_pmc_lhr_students_v12_clean');
      }
      if (savedStudents) {
        try {
          const parsed = JSON.parse(savedStudents);
          if (Array.isArray(parsed)) {
            setStudents(parsed.map(normalizeStudentAcademicCycle));
          } else {
            setStudents([]);
          }
        } catch {
          setStudents([]);
        }
      } else {
        setStudents([]);
        safeLocalStorageSet(getCollegeStorageKey(collegeId, 'students'), []);
      }

      // 2. Transactions
      let savedTxns = localStorage.getItem(getCollegeStorageKey(collegeId, 'transactions'));
      if (!savedTxns && (collegeId === 'college_hchs_kht' || collegeId === 'college_hbs_kht' || collegeId === 'college_aimc_kht')) {
        savedTxns = localStorage.getItem('pmc_college_hchs_kht_transactions_v12_clean') ||
                    localStorage.getItem('pmc_college_hbs_kht_transactions_v12_clean') ||
                    localStorage.getItem('pmc_college_aimc_kht_transactions_v12_clean') ||
                    localStorage.getItem('pmc_college_pmc_lhr_transactions_v12_clean');
      }
      if (savedTxns) {
        try {
          const parsedTxns = JSON.parse(savedTxns);
          setTransactions(Array.isArray(parsedTxns) ? parsedTxns : []);
        } catch {
          setTransactions([]);
        }
      } else {
        setTransactions([]);
        safeLocalStorageSet(getCollegeStorageKey(collegeId, 'transactions'), []);
      }

      // 3. Expenses & Inventory
      // Purge old dummy storage if present
      localStorage.removeItem(`pmc_college_hchs_kht_expenses_v12_clean`);
      const savedExpenses = localStorage.getItem(getCollegeStorageKey(collegeId, 'expenses'));
      if (savedExpenses) {
        try {
          const parsedExp = JSON.parse(savedExpenses);
          if (Array.isArray(parsedExp)) {
            setExpenses(parsedExp);
          } else {
            setExpenses([]);
            safeLocalStorageSet(getCollegeStorageKey(collegeId, 'expenses'), []);
          }
        } catch {
          setExpenses([]);
        }
      } else {
        setExpenses([]);
        safeLocalStorageSet(getCollegeStorageKey(collegeId, 'expenses'), []);
      }

      // 4. Faculty & Staff Payroll
      // Purge old dummy storage if present
      localStorage.removeItem(`pmc_college_hchs_kht_faculty_v12_clean`);
      const savedFaculty = localStorage.getItem(getCollegeStorageKey(collegeId, 'faculty'));
      if (savedFaculty) {
        try {
          const parsedFaculty = JSON.parse(savedFaculty);
          if (Array.isArray(parsedFaculty)) {
            setFaculty(parsedFaculty);
          } else {
            setFaculty([]);
            safeLocalStorageSet(getCollegeStorageKey(collegeId, 'faculty'), []);
          }
        } catch {
          setFaculty([]);
        }
      } else {
        setFaculty([]);
        safeLocalStorageSet(getCollegeStorageKey(collegeId, 'faculty'), []);
      }
    } catch (e) {
      console.error('Failed to load college data', e);
    }
  };

  // Load initial settings on client mount
  useEffect(() => {
    // Purge outdated versions to free up localStorage quota
    cleanupOldStorageVersions();

    let accounts: CollegeTenantAccount[] = INITIAL_COLLEGE_ACCOUNTS;

    try {
      const savedAccounts = localStorage.getItem('pmc_college_accounts_v3');
      if (savedAccounts) {
        try {
          accounts = JSON.parse(savedAccounts);
        } catch {
          accounts = INITIAL_COLLEGE_ACCOUNTS;
        }
      } else {
        const oldV2 = localStorage.getItem('pmc_college_accounts_v2');
        if (oldV2) {
          try {
            const parsed = JSON.parse(oldV2);
            if (Array.isArray(parsed) && parsed.length > 0) {
              accounts = parsed;
            }
          } catch {
            accounts = INITIAL_COLLEGE_ACCOUNTS;
          }
        }
      }

      // Automatically migrate any legacy PMC Lahore / AIMC / HBS entries to Harmain College of Health Sciences Kahuta
      accounts = accounts.map((acc) => {
        if (
          acc.id === 'college_pmc_lhr' ||
          acc.id === 'college_aimc_kht' ||
          acc.id === 'college_hbs_kht' ||
          acc.name === 'Pakistan Medical College' ||
          acc.name === 'Allama Iqbal Medical College' ||
          acc.name === 'HBS College of Health Sciences' ||
          acc.city === 'Lahore'
        ) {
          return {
            ...acc,
            id: 'college_hchs_kht',
            code: 'HCHS-KHT',
            name: 'Harmain College of Health Sciences',
            city: 'Kahuta',
            email: 'admin@hchs.edu.pk',
            contactPhone: '+92 51 3311792',
          };
        }
        return acc;
      });

      setCollegeAccounts(accounts);
      safeLocalStorageSet('pmc_college_accounts_v3', accounts);

      const savedPortalMode = sessionStorage.getItem('pmc_portal_mode_v2') as PortalMode;
      let savedActiveCollegeId = sessionStorage.getItem('pmc_active_college_id_v2');
      if (
        savedActiveCollegeId === 'college_pmc_lhr' ||
        savedActiveCollegeId === 'college_aimc_kht' ||
        savedActiveCollegeId === 'college_hbs_kht'
      ) {
        savedActiveCollegeId = 'college_hchs_kht';
        sessionStorage.setItem('pmc_active_college_id_v2', 'college_hchs_kht');
      }

      if (savedPortalMode === 'SUPER_ADMIN') {
        setPortalMode('SUPER_ADMIN');
      } else if (savedPortalMode === 'COLLEGE_PORTAL' && savedActiveCollegeId) {
        const found = accounts.find((c) => c.id === savedActiveCollegeId) || accounts[0];
        setActiveCollegeAccount(found);
        setCurrentCollegeId(found.id);
        setPortalMode('COLLEGE_PORTAL');
        loadCollegeData(found.id, accounts);

        const isUnlockedSession = sessionStorage.getItem('pmc_principal_unlocked_v1') === 'true';
        if (isUnlockedSession) {
          setIsPrincipalUnlocked(true);
          setUserRole('PRINCIPAL');
          setCurrentTab('dashboard');
        } else {
          setIsPrincipalUnlocked(false);
          setUserRole('RECEPTIONIST');
          setCurrentTab('receptionist_counter');
        }
      } else if (savedPortalMode === 'PORTAL_LOGIN') {
        setPortalMode('PORTAL_LOGIN');
      } else {
        setPortalMode('SAAS_LANDING');
      }
    } catch (e) {
      console.error('Failed to load initial settings from localStorage', e);
    }

    setIsClientLoaded(true);
  }, []);

  // Save changes per-college whenever state updates
  useEffect(() => {
    if (isClientLoaded && currentCollegeId) {
      safeLocalStorageSet(getCollegeStorageKey(currentCollegeId, 'students'), students);
    }
  }, [students, currentCollegeId, isClientLoaded]);

  useEffect(() => {
    if (isClientLoaded && currentCollegeId) {
      safeLocalStorageSet(getCollegeStorageKey(currentCollegeId, 'transactions'), transactions);
    }
  }, [transactions, currentCollegeId, isClientLoaded]);

  useEffect(() => {
    if (isClientLoaded && currentCollegeId) {
      safeLocalStorageSet(getCollegeStorageKey(currentCollegeId, 'expenses'), expenses);
    }
  }, [expenses, currentCollegeId, isClientLoaded]);

  useEffect(() => {
    if (isClientLoaded && currentCollegeId) {
      safeLocalStorageSet(getCollegeStorageKey(currentCollegeId, 'faculty'), faculty);
    }
  }, [faculty, currentCollegeId, isClientLoaded]);

  // Multi-Tenant Authentication & Session Handlers
  const handleCollegeLogin = (collegeOrId: CollegeTenantAccount | string, role?: UserRole) => {
    let college: CollegeTenantAccount | undefined;
    if (typeof collegeOrId === 'string') {
      college = collegeAccounts.find((c) => c.id === collegeOrId) || collegeAccounts[0];
    } else {
      college = collegeOrId;
    }

    if (!college) return;

    setActiveCollegeAccount(college);
    setCurrentCollegeId(college.id);
    setPortalMode('COLLEGE_PORTAL');
    sessionStorage.setItem('pmc_portal_mode_v2', 'COLLEGE_PORTAL');
    sessionStorage.setItem('pmc_active_college_id_v2', college.id);

    if (role === 'PRINCIPAL') {
      setIsPrincipalUnlocked(true);
      setUserRole('PRINCIPAL');
      setCurrentTab('dashboard');
      sessionStorage.setItem('pmc_principal_unlocked_v1', 'true');
    } else {
      setUserRole('RECEPTIONIST');
      setCurrentTab('receptionist_counter');
      setIsPrincipalUnlocked(false);
      sessionStorage.removeItem('pmc_principal_unlocked_v1');
    }

    loadCollegeData(college.id, collegeAccounts);
    setPaymentSuccessToast(`🏥 Logged in to ${college.name} Workspace`);
    setTimeout(() => setPaymentSuccessToast(null), 4000);
  };

  const handleBackToSaas = () => {
    sessionStorage.setItem('pmc_portal_mode_v2', 'SAAS_LANDING');
    setPortalMode('SAAS_LANDING');
  };

  const handleSuperAdminLogin = () => {
    setPortalMode('SUPER_ADMIN');
    sessionStorage.setItem('pmc_portal_mode_v2', 'SUPER_ADMIN');
    setPaymentSuccessToast('🛡️ Welcome to Super Admin Master Control');
    setTimeout(() => setPaymentSuccessToast(null), 4000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pmc_portal_mode_v2');
    sessionStorage.removeItem('pmc_active_college_id_v2');
    sessionStorage.removeItem('pmc_principal_unlocked_v1');
    setPortalMode('SAAS_LANDING');
    setActiveCollegeAccount(null);
    setIsPrincipalUnlocked(false);
    setPaymentSuccessToast('🚪 Logged out. Wapis SaaS Homepage par switch kar diya gaya.');
    setTimeout(() => setPaymentSuccessToast(null), 4000);
  };

  const handleSuperAdminAddNewCollege = (newCollege: CollegeTenantAccount) => {
    const updated = [...collegeAccounts, newCollege];
    setCollegeAccounts(updated);
    safeLocalStorageSet('pmc_college_accounts_v2', updated);
    loadCollegeData(newCollege.id, updated);
  };

  const handleSuperAdminUpdateCollege = (updated: CollegeTenantAccount) => {
    const updatedList = collegeAccounts.map((c) => (c.id === updated.id ? updated : c));
    setCollegeAccounts(updatedList);
    safeLocalStorageSet('pmc_college_accounts_v2', updatedList);
    if (activeCollegeAccount?.id === updated.id) {
      setActiveCollegeAccount(updated);
    }
  };

  // Principal Security Lock & PIN Handlers
  const handleRequestPrincipalUnlock = (targetTab?: NavTab, label?: string) => {
    setPendingPrincipalTargetTab(targetTab || 'dashboard');
    setPendingPrincipalTargetLabel(label);
    setIsPrincipalLockModalOpen(true);
  };

  const handlePrincipalUnlockSuccess = () => {
    setIsPrincipalUnlocked(true);
    setIsPrincipalLockModalOpen(false);
    setUserRole('PRINCIPAL');
    sessionStorage.setItem('pmc_principal_unlocked_v1', 'true');
    localStorage.setItem('pmc_user_role_v1', 'PRINCIPAL');
    setPaymentSuccessToast('🔓 Principal / Director Access Unlock ho gaya!');
    setTimeout(() => setPaymentSuccessToast(null), 4000);

    if (pendingPrincipalTargetTab) {
      setCurrentTab(pendingPrincipalTargetTab);
      setPendingPrincipalTargetTab(null);
    } else if (currentTab === 'receptionist_counter') {
      setCurrentTab('dashboard');
    }
  };

  const handleLockPrincipal = () => {
    setIsPrincipalUnlocked(false);
    setUserRole('RECEPTIONIST');
    sessionStorage.removeItem('pmc_principal_unlocked_v1');
    localStorage.setItem('pmc_user_role_v1', 'RECEPTIONIST');
    setCurrentTab('receptionist_counter');
    setPaymentSuccessToast('🔒 Principal Panel dobara lock kar diya gaya!');
    setTimeout(() => setPaymentSuccessToast(null), 4000);
  };

  // Role Switcher Handler
  const handleRoleChange = (role: UserRole) => {
    if (role === 'PRINCIPAL') {
      if (!isPrincipalUnlocked) {
        handleRequestPrincipalUnlock('dashboard', 'Executive Dashboard');
        return;
      }
      setUserRole('PRINCIPAL');
      if (currentTab === 'receptionist_counter') {
        setCurrentTab('dashboard');
      }
    } else {
      setUserRole('RECEPTIONIST');
      setCurrentTab('receptionist_counter');
    }
  };

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterProgram, setFilterProgram] = useState<string>('ALL');
  const [filterDefaulterMonth, setFilterDefaulterMonth] = useState<string>('ALL');
  const [filterDefaulterSeverity, setFilterDefaulterSeverity] = useState<'ALL' | 'CHRONIC' | 'MISSED_MONTHS'>('ALL');
  const [defaulterSearchQuery, setDefaulterSearchQuery] = useState<string>('');
  const [defaulterProgramFilter, setDefaulterProgramFilter] = useState<string>('ALL');

  // 2-Year Filter States
  const [chartYear, setChartYear] = useState<number>(2026);
  const [ledgerYearTab, setLedgerYearTab] = useState<'Year 2' | 'Year 1' | 'ALL'>('Year 1');

  // Modals & Drawers: Use ID so open ledger ALWAYS updates reactively!
  const [selectedStudentIdForLedger, setSelectedStudentIdForLedger] = useState<string | null>(null);
  const selectedStudentForLedger = useMemo(() => {
    return students.find((s) => s.id === selectedStudentIdForLedger) || null;
  }, [students, selectedStudentIdForLedger]);
  const setSelectedStudentForLedger = (s: Student | null) => setSelectedStudentIdForLedger(s ? s.id : null);

  const [isReceiveFeeOpen, setIsReceiveFeeOpen] = useState(false);
  const [studentForReceiveFee, setStudentForReceiveFee] = useState<Student | null>(null);
  const [isAdmissionFormOpen, setIsAdmissionFormOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{ transaction?: PaymentTransaction | null; student?: Student | null } | null>(null);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  const handleSaveNewStudent = (newStudent: Student, shouldReceiveFee: boolean = false) => {
    const normalized = normalizeStudentAcademicCycle(newStudent, -1);
    setStudents((prev) => [normalized, ...prev.filter((s) => s.id !== normalized.id)]);
    setPaymentSuccessToast(`✅ Naya Student "${normalized.name}" (${normalized.applicationFormNo || normalized.studentNo}) kamyabi se admit ho gaya!`);
    setTimeout(() => setPaymentSuccessToast(null), 4000);

    if (shouldReceiveFee) {
      setStudentForReceiveFee(normalized);
      setIsReceiveFeeOpen(true);
    }
  };

  // Financial summary
  const summary = useMemo(() => calculateFinancialSummary(students, faculty, expenses), [students, faculty, expenses]);

  // Defaulters list based on active overdue months
  const allDefaulters = useMemo(() => students.filter((s) => s.unpaidMonthsCount > 0), [students]);
  const chronicDefaulters = useMemo(() => students.filter((s) => s.unpaidMonthsCount >= 2), [students]);
  const occasionalDefaulters = useMemo(() => students.filter((s) => s.unpaidMonthsCount === 1), [students]);

  // Filtered students for Directory & Ledger
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = globalSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q) ||
        (s.applicationFormNo && s.applicationFormNo.toLowerCase().includes(q)) ||
        (s.cnic && s.cnic.toLowerCase().includes(q)) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.program.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q);

      const matchesProgram = filterProgram === 'ALL' || s.program.includes(filterProgram);

      return matchesSearch && matchesProgram;
    });
  }, [students, globalSearch, filterProgram]);

  // Filtered Defaulters with dedicated search & program filter
  const filteredDefaulters = useMemo(() => {
    return allDefaulters.filter((s) => {
      const q = (defaulterSearchQuery || globalSearch).toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q) ||
        (s.applicationFormNo && s.applicationFormNo.toLowerCase().includes(q)) ||
        (s.cnic && s.cnic.toLowerCase().includes(q)) ||
        (s.fatherName && s.fatherName.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q)) ||
        (s.program && s.program.toLowerCase().includes(q));

      const matchesProgram =
        defaulterProgramFilter === 'ALL'
          ? filterProgram === 'ALL' || s.program.includes(filterProgram)
          : s.program.toLowerCase().includes(defaulterProgramFilter.toLowerCase());

      const matchesMonth =
        filterDefaulterMonth === 'ALL' ||
        s.unpaidMonthNames.includes(filterDefaulterMonth) ||
        s.unpaidMonthNames.some((m) => m.toLowerCase().includes(filterDefaulterMonth.toLowerCase()));

      const matchesSeverity =
        filterDefaulterSeverity === 'ALL' ||
        (filterDefaulterSeverity === 'CHRONIC' && s.unpaidMonthsCount >= 2) ||
        (filterDefaulterSeverity === 'MISSED_MONTHS' && s.unpaidMonthsCount === 1);

      return matchesSearch && matchesProgram && matchesMonth && matchesSeverity;
    });
  }, [allDefaulters, defaulterSearchQuery, globalSearch, defaulterProgramFilter, filterProgram, filterDefaulterMonth, filterDefaulterSeverity]);

  const filteredDefaultersTotals = useMemo(() => {
    return filteredDefaulters.reduce(
      (acc, s) => ({
        totalArrears: acc.totalArrears + (s.currentOverdueAmount || s.totalOutstandingAnnual || 0),
        totalMonths: acc.totalMonths + s.unpaidMonthsCount,
      }),
      { totalArrears: 0, totalMonths: 0 }
    );
  }, [filteredDefaulters]);

  const allDefaulterPrograms = useMemo(() => {
    return Array.from(new Set(allDefaulters.map((s) => s.program).filter(Boolean)));
  }, [allDefaulters]);

  // Handle successful fee payment
  const handlePaymentSuccess = (
    newTxn: PaymentTransaction,
    updatedStudent: Student,
    autoOpenPrintSlip: boolean = false
  ) => {
    const normalized = normalizeStudentAcademicCycle(updatedStudent);
    setTransactions((prev) => [newTxn, ...prev]);
    setStudents((prev) => prev.map((s) => (s.id === normalized.id ? normalized : s)));
    setIsReceiveFeeOpen(false);

    setPaymentSuccessToast(`✅ ${normalized.name} ki fee (${newTxn.monthNames.join(', ')}) Rs. ${newTxn.amount.toLocaleString()} kamyabi se mark/clear ho gayi!`);
    setTimeout(() => setPaymentSuccessToast(null), 5000);

    if (autoOpenPrintSlip) {
      setReceiptData({ transaction: newTxn, student: normalized });
    }
  };

  // Direct quick pay a single month from ledger
  const handleQuickPayMonth = (studentId: string, monthName: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const targetMonth = student.monthlyFees.find((m) => m.monthName === monthName);
    if (!targetMonth || targetMonth.status === 'PAID') return;

    const remainingDue = targetMonth.payableAmount - targetMonth.paidAmount;

    const updatedMonthlyFees = student.monthlyFees.map((mf) => {
      if (mf.monthName === monthName) {
        return {
          ...mf,
          paidAmount: mf.payableAmount,
          status: 'PAID' as const,
          paidDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'CASH' as const,
          transactionRef: `REC-${Date.now().toString().slice(-6)}`,
        };
      }
      return mf;
    });

    const updatedStudent: Student = normalizeStudentAcademicCycle({
      ...student,
      monthlyFees: updatedMonthlyFees,
    });

    const newTxn: PaymentTransaction = {
      id: `txn_${Date.now()}`,
      receiptNo: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: student.id,
      studentName: student.name,
      studentNo: student.studentNo,
      program: `${student.program} ${student.yearLevel}`,
      amount: remainingDue,
      paymentDate: new Date().toISOString().split('T')[0],
      method: 'CASH',
      referenceNo: `DIRECT-CLEAR`,
      monthNames: [monthName],
      itemizedBreakdown: [
        {
          description: `${monthName} Tuition Fee`,
          amount: remainingDue,
          category: 'Tuition',
        },
      ],
      collectedBy: 'Accounts Bursar Desk',
      note: `${monthName} fee direct cleared`,
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    setPaymentSuccessToast(`✅ ${student.name} ki ${monthName} ki fee ada ho gayi hai!`);
    setTimeout(() => setPaymentSuccessToast(null), 5000);
  };

  // Direct quick pay a single institutional fee head from ledger
  const handleQuickPayFeeHead = (studentId: string, feeHeadId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student || !student.feeHeads) return;

    const targetHead = student.feeHeads.find((f) => f.id === feeHeadId);
    if (!targetHead || targetHead.status === 'PAID') return;

    const remainingDue = targetHead.amount - targetHead.paidAmount;

    const updatedFeeHeads = student.feeHeads.map((fh) => {
      if (fh.id === feeHeadId) {
        return {
          ...fh,
          paidAmount: fh.amount,
          status: 'PAID' as const,
          paidDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'CASH' as const,
          transactionRef: `REC-${Date.now().toString().slice(-6)}`,
        };
      }
      return fh;
    });

    const totalTuitionPaid = student.monthlyFees.reduce((acc, m) => acc + m.paidAmount, 0);
    const totalHeadsPaid = updatedFeeHeads.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalPaidAnnual = totalTuitionPaid + totalHeadsPaid;
    const totalOutstandingAnnual = student.totalExpectedAnnual - totalPaidAnnual;
    const pendingHeads = updatedFeeHeads.filter((f) => f.status === 'DUE' || f.status === 'PARTIAL');

    const updatedStudent: Student = {
      ...student,
      feeHeads: updatedFeeHeads,
      pendingFeeHeadsCount: pendingHeads.length,
      totalPaidAnnual,
      totalOutstandingAnnual,
    };

    const newTxn: PaymentTransaction = {
      id: `txn_${Date.now()}`,
      receiptNo: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: student.id,
      studentName: student.name,
      studentNo: student.studentNo,
      program: `${student.program} ${student.yearLevel}`,
      amount: remainingDue,
      paymentDate: new Date().toISOString().split('T')[0],
      method: 'CASH',
      referenceNo: `DIRECT-CLEAR`,
      monthNames: [],
      feeHeadTitles: [targetHead.title],
      itemizedBreakdown: [
        {
          description: targetHead.title,
          amount: remainingDue,
          category: targetHead.category,
        },
      ],
      collectedBy: 'Accounts Bursar Desk',
      note: `${targetHead.title} fee direct cleared`,
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    setPaymentSuccessToast(`✅ ${student.name} ki ${targetHead.title} ada ho gayi hai!`);
    setTimeout(() => setPaymentSuccessToast(null), 5000);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    setPaymentSuccessToast(`✅ ${updatedStudent.name} ka record / fee structure kamyabi se update ho gaya!`);
    setTimeout(() => setPaymentSuccessToast(null), 4000);
  };

  // Delete student record (e.g. duplicate test entries or cancelled admissions)
  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (window.confirm(`Kya aap waqai student "${studentName}" ka record mukammal tor par delete karna chahte hain?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setTransactions((prev) => prev.filter((t) => t.studentId !== studentId));
      setSelectedStudentForLedger(null);
      setPaymentSuccessToast(`🗑️ Student "${studentName}" aur unki tamam receipts delete kar di gayi hain!`);
      setTimeout(() => setPaymentSuccessToast(null), 4000);
    }
  };

  // Delete payment receipt / transaction with Principal Authority
  const handleDeleteTransaction = (transactionId: string) => {
    const isPrincipal = isPrincipalUnlocked && userRole === 'PRINCIPAL';
    if (!isPrincipal) {
      handleRequestPrincipalUnlock(currentTab, 'Receipt Delete Karne Ke Liye Principal PIN Enter Karein');
      return;
    }

    const txn = transactions.find((t) => t.id === transactionId);
    if (!txn) return;

    if (
      !window.confirm(
        `Kya aap waqai Receipt #${txn.receiptNo} (Student: ${txn.studentName}, Amount: Rs. ${txn.amount.toLocaleString()}) delete karna chahte hain?`
      )
    ) {
      return;
    }

    // 1. If student still exists, revert the fee status of the months paid in this transaction
    if (txn.studentId) {
      const student = students.find((s) => s.id === txn.studentId);
      if (student) {
        let updatedMonthlyFees = [...student.monthlyFees];
        if (txn.monthNames && txn.monthNames.length > 0) {
          updatedMonthlyFees = updatedMonthlyFees.map((mf) => {
            if (txn.monthNames.includes(mf.monthName)) {
              return {
                ...mf,
                paidAmount: 0,
                status: 'DUE' as const,
                paidDate: undefined,
                paymentMethod: undefined,
                transactionRef: undefined,
              };
            }
            return mf;
          });
        }

        const normalized = normalizeStudentAcademicCycle({
          ...student,
          monthlyFees: updatedMonthlyFees,
        });

        setStudents((prev) => prev.map((s) => (s.id === normalized.id ? normalized : s)));
      }
    }

    // 2. Remove the transaction
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    setPaymentSuccessToast(`🗑️ Receipt #${txn.receiptNo} kamyabi se delete kar di gayi!`);
    setTimeout(() => setPaymentSuccessToast(null), 4000);
  };

  // Quick Open Receive Fee for a specific student
  const openFeeCollectionForStudent = (student: Student) => {
    setStudentForReceiveFee(student);
    setIsReceiveFeeOpen(true);
  };

  // Faculty & Staff Payroll States & Handlers
  const [selectedFacultyForEdit, setSelectedFacultyForEdit] = useState<FacultyStaff | null>(null);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [facultyModalMode, setFacultyModalMode] = useState<'ADD' | 'EDIT'>('EDIT');
  const [facultyStatusFilter, setFacultyStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESIGNED'>('ALL');
  const [selectedFacultyForPaySlip, setSelectedFacultyForPaySlip] = useState<FacultyStaff | null>(null);
  const [isPrintSalarySlipModalOpen, setIsPrintSalarySlipModalOpen] = useState(false);
  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [facultyDepartmentFilter, setFacultyDepartmentFilter] = useState('ALL');
  const [facultyViewMode, setFacultyViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // Dynamic & Persistent Departments & Medical Terms
  const [facultyDepartments, setFacultyDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [facultyTerms, setFacultyTerms] = useState<string[]>(DEFAULT_MEDICAL_TERMS);
  const [isManageFacultyCategoriesOpen, setIsManageFacultyCategoriesOpen] = useState(false);
  const [manageFacultyCategoriesInitialTab, setManageFacultyCategoriesInitialTab] = useState<'DEPTS' | 'TERMS'>('DEPTS');

  // Academic Programs & Fee Structures State
  const [collegePrograms, setCollegePrograms] = useState<CollegeProgramFee[]>(DEFAULT_COLLEGE_PROGRAMS);
  const [isManageProgramsModalOpen, setIsManageProgramsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFacultyDepartments(getStoredDepartments());
      setFacultyTerms(getStoredTerms());
      setCollegePrograms(getStoredPrograms());
    }
  }, []);

  const handleSavePrograms = (updated: CollegeProgramFee[]) => {
    setCollegePrograms(updated);
    saveStoredPrograms(updated);
    setPaymentSuccessToast('🎓 Academic Programs & Fee Structures kamyabi se save ho gaye!');
    setTimeout(() => setPaymentSuccessToast(null), 3500);
  };

  const handleResetPrograms = () => {
    setCollegePrograms(DEFAULT_COLLEGE_PROGRAMS);
    saveStoredPrograms(DEFAULT_COLLEGE_PROGRAMS);
    setPaymentSuccessToast('🔄 Standard Health Programs restore ho gaye!');
    setTimeout(() => setPaymentSuccessToast(null), 3500);
  };

  const handleAddDepartment = (newDept: string) => {
    setFacultyDepartments((prev) => {
      const updated = [newDept, ...prev.filter((d) => d.toLowerCase() !== newDept.toLowerCase())];
      saveStoredDepartments(updated);
      return updated;
    });
    setPaymentSuccessToast(`🏢 Department "${newDept}" add ho gaya!`);
    setTimeout(() => setPaymentSuccessToast(null), 3000);
  };

  const handleEditDepartment = (oldName: string, newName: string) => {
    setFacultyDepartments((prev) => {
      const updated = prev.map((d) => (d === oldName ? newName : d));
      saveStoredDepartments(updated);
      return updated;
    });
    setFaculty((prev) =>
      prev.map((f) => (f.department === oldName ? { ...f, department: newName } : f))
    );
    setPaymentSuccessToast(`✏️ Department rename ho gaya: "${newName}"`);
    setTimeout(() => setPaymentSuccessToast(null), 3000);
  };

  const handleDeleteDepartment = (deptName: string) => {
    setFacultyDepartments((prev) => {
      const updated = prev.filter((d) => d !== deptName);
      saveStoredDepartments(updated);
      return updated;
    });
    setPaymentSuccessToast(`🗑️ Department "${deptName}" delete kar diya gaya!`);
    setTimeout(() => setPaymentSuccessToast(null), 3000);
  };

  const handleResetDepartments = () => {
    setFacultyDepartments(DEFAULT_DEPARTMENTS);
    saveStoredDepartments(DEFAULT_DEPARTMENTS);
    setPaymentSuccessToast('🔄 Standard Departments list restore ho gayi!');
    setTimeout(() => setPaymentSuccessToast(null), 3000);
  };

  const handleAddTerm = (newTerm: string) => {
    setFacultyTerms((prev) => {
      const updated = [newTerm, ...prev.filter((t) => t.toLowerCase() !== newTerm.toLowerCase())];
      saveStoredTerms(updated);
      return updated;
    });
    setPaymentSuccessToast(`🎓 Class / Term "${newTerm}" add ho gayi!`);
    setTimeout(() => setPaymentSuccessToast(null), 3000);
  };

  const handleEditTerm = (oldName: string, newName: string) => {
    setFacultyTerms((prev) => {
      const updated = prev.map((t) => (t === oldName ? newName : t));
      saveStoredTerms(updated);
      return updated;
    });
    setFaculty((prev) =>
      prev.map((f) => (f.teachingTerm === oldName ? { ...f, teachingTerm: newName } : f))
    );
    setPaymentSuccessToast(`✏️ Class / Term rename ho gayi: "${newName}"`);
    setTimeout(() => setPaymentSuccessToast(null), 3000);
  };

  const handleDeleteTerm = (termName: string) => {
    setFacultyTerms((prev) => {
      const updated = prev.filter((t) => t !== termName);
      saveStoredTerms(updated);
      return updated;
    });
    setPaymentSuccessToast(`🗑️ Class / Term "${termName}" delete kar di gayi!`);
    setTimeout(() => setPaymentSuccessToast(null), 3000);
  };

  const handleResetTerms = () => {
    setFacultyTerms(DEFAULT_MEDICAL_TERMS);
    saveStoredTerms(DEFAULT_MEDICAL_TERMS);
    setPaymentSuccessToast('🔄 Standard Medical Terms restore ho gaye!');
    setTimeout(() => setPaymentSuccessToast(null), 3000);
  };

  const handleOpenAddFaculty = () => {
    setSelectedFacultyForEdit(null);
    setFacultyModalMode('ADD');
    setIsFacultyModalOpen(true);
  };

  const handleOpenEditFaculty = (facultyItem: FacultyStaff) => {
    setSelectedFacultyForEdit(facultyItem);
    setFacultyModalMode('EDIT');
    setIsFacultyModalOpen(true);
  };

  const handleOpenSalarySlip = (facultyItem: FacultyStaff) => {
    setSelectedFacultyForPaySlip(facultyItem);
    setIsPrintSalarySlipModalOpen(true);
  };

  const handleOpenAllFacultyRegister = () => {
    setSelectedFacultyForPaySlip(faculty[0] || null);
    setIsPrintSalarySlipModalOpen(true);
  };

  const handleSaveFaculty = (updated: FacultyStaff) => {
    setFaculty((prev) => {
      const exists = prev.some((f) => f.id === updated.id);
      if (exists) {
        return prev.map((f) => (f.id === updated.id ? updated : f));
      }
      return [updated, ...prev];
    });
    setPaymentSuccessToast(`✅ ${updated.name} (${updated.subjectSpecialization || updated.department}) ka record kamyabi se save ho gaya!`);
    setTimeout(() => setPaymentSuccessToast(null), 4000);
  };

  const handleDeleteFaculty = (facultyId: string) => {
    setFaculty((prev) => prev.filter((f) => f.id !== facultyId));
    setPaymentSuccessToast(`🗑️ Teacher ka record close / remove kar diya gaya!`);
    setTimeout(() => setPaymentSuccessToast(null), 4000);
  };

  const allFacultyDepartments = useMemo(() => {
    const set = new Set([...facultyDepartments, ...faculty.map((f) => f.department).filter(Boolean)]);
    return Array.from(set);
  }, [facultyDepartments, faculty]);

  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const query = facultySearchQuery.toLowerCase();
      const matchesSearch =
        f.name.toLowerCase().includes(query) ||
        f.employeeNo.toLowerCase().includes(query) ||
        f.department.toLowerCase().includes(query) ||
        f.designation.toLowerCase().includes(query) ||
        (f.subjectSpecialization && f.subjectSpecialization.toLowerCase().includes(query)) ||
        (f.teachingTerm && f.teachingTerm.toLowerCase().includes(query));

      const matchesDept =
        facultyDepartmentFilter === 'ALL' ||
        f.department.trim().toLowerCase() === facultyDepartmentFilter.trim().toLowerCase();

      const status = f.employmentStatus || 'ACTIVE';
      const matchesStatus =
        facultyStatusFilter === 'ALL' ||
        (facultyStatusFilter === 'ACTIVE' && status === 'ACTIVE') ||
        (facultyStatusFilter === 'RESIGNED' && (status === 'RESIGNED' || status === 'TERMINATED'));

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [faculty, facultySearchQuery, facultyDepartmentFilter, facultyStatusFilter]);

  const facultyMetrics = useMemo(() => {
    const totalDisbursement = faculty.reduce((acc, f) => acc + f.netSalary, 0);
    const totalGross = faculty.reduce((acc, f) => acc + (f.grossSalary || (f.basicSalary + f.allowances)), 0);
    const totalDeductions = faculty.reduce((acc, f) => acc + f.deductions, 0);
    const totalActiveLoans = faculty.reduce((acc, f) => acc + (f.advanceRemainingBalance || 0), 0);
    const totalLoanDeductionsThisMonth = faculty.reduce((acc, f) => acc + (f.advanceDeductionThisMonth || 0), 0);
    const avgAttendance = faculty.length > 0
      ? Math.round(faculty.reduce((acc, f) => acc + (f.attendanceScore || 95), 0) / faculty.length)
      : 100;
    const paidCount = faculty.filter((f) => f.salaryStatus === 'PAID').length;
    const pendingCount = faculty.length - paidCount;

    return {
      totalDisbursement,
      totalGross,
      totalDeductions,
      totalActiveLoans,
      totalLoanDeductionsThisMonth,
      avgAttendance,
      paidCount,
      pendingCount,
    };
  }, [faculty]);

  const filteredFacultyTotals = useMemo(() => {
    return filteredFaculty.reduce(
      (acc, f) => ({
        basic: acc.basic + f.basicSalary,
        allowances: acc.allowances + f.allowances,
        deductions: acc.deductions + f.deductions,
        net: acc.net + f.netSalary,
      }),
      { basic: 0, allowances: 0, deductions: 0, net: 0 }
    );
  }, [filteredFaculty]);

  // Expenses Modal State & Handlers
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseModalMode, setExpenseModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedExpenseToEdit, setSelectedExpenseToEdit] = useState<Expense | null>(null);
  const [expenseNotification, setExpenseNotification] = useState<string | null>(null);

  // Expenses & Inventory Filter States
  const [expenseFilterTab, setExpenseFilterTab] = useState<'ALL' | 'INVENTORY' | 'OPERATIONAL' | 'LOW_STOCK'>('ALL');
  const [expenseDepartmentFilter, setExpenseDepartmentFilter] = useState<string>('ALL');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('ALL');
  const [expenseSearchQuery, setExpenseSearchQuery] = useState<string>('');
  const [expenseViewMode, setExpenseViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [isPrintInventoryModalOpen, setIsPrintInventoryModalOpen] = useState(false);

  const handleQuickAdjustStock = (expenseId: string, delta: number) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id === expenseId && e.currentStock !== undefined) {
          const newStock = Math.max(0, e.currentStock + delta);
          const min = e.minReorderLevel || 2;
          const status = newStock === 0 ? 'OUT_OF_STOCK' : newStock <= min ? 'LOW_STOCK' : 'IN_STOCK';
          return {
            ...e,
            currentStock: newStock,
            stockStatus: status,
          };
        }
        return e;
      })
    );
  };

  const allExpenseCategories = useMemo(() => {
    return Array.from(new Set(expenses.map((e) => e.category).filter(Boolean)));
  }, [expenses]);

  const allExpenseDepartments = useMemo(() => {
    return Array.from(new Set(expenses.map((e) => e.department).filter(Boolean)));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
        e.department.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
        (e.itemCode && e.itemCode.toLowerCase().includes(expenseSearchQuery.toLowerCase())) ||
        (e.supplier && e.supplier.toLowerCase().includes(expenseSearchQuery.toLowerCase())) ||
        e.category.toLowerCase().includes(expenseSearchQuery.toLowerCase());

      const matchesDept =
        expenseDepartmentFilter === 'ALL' ||
        e.department?.trim().toLowerCase() === expenseDepartmentFilter.trim().toLowerCase();

      const matchesCategory =
        expenseCategoryFilter === 'ALL' ||
        e.category?.trim().toLowerCase() === expenseCategoryFilter.trim().toLowerCase();

      let matchesTab = true;
      if (expenseFilterTab === 'INVENTORY') {
        matchesTab = e.isInventoryItem !== false;
      } else if (expenseFilterTab === 'OPERATIONAL') {
        matchesTab = e.isInventoryItem === false;
      } else if (expenseFilterTab === 'LOW_STOCK') {
        matchesTab = e.stockStatus === 'LOW_STOCK' || e.stockStatus === 'OUT_OF_STOCK';
      }

      return matchesSearch && matchesDept && matchesCategory && matchesTab;
    });
  }, [expenses, expenseSearchQuery, expenseDepartmentFilter, expenseCategoryFilter, expenseFilterTab]);

  const inventoryMetrics = useMemo(() => {
    const inventoryItems = expenses.filter((e) => e.isInventoryItem !== false);
    const totalInventoryUnits = inventoryItems.reduce((acc, curr) => acc + (curr.currentStock || curr.quantity || 0), 0);
    const lowStockCount = inventoryItems.filter((e) => e.stockStatus === 'LOW_STOCK' || e.stockStatus === 'OUT_OF_STOCK').length;
    const totalInventoryValue = inventoryItems.reduce((acc, curr) => acc + curr.amount, 0);
    return {
      inventoryItemsCount: inventoryItems.length,
      totalInventoryUnits,
      lowStockCount,
      totalInventoryValue,
    };
  }, [expenses]);

  const filteredExpensesTotals = useMemo(() => {
    return filteredExpenses.reduce(
      (acc, e) => ({
        totalCost: acc.totalCost + e.amount,
        totalUnits: acc.totalUnits + (e.currentStock !== undefined ? e.currentStock : (e.quantity || 0)),
      }),
      { totalCost: 0, totalUnits: 0 }
    );
  }, [filteredExpenses]);

  const handleOpenAddExpense = () => {
    setSelectedExpenseToEdit(null);
    setExpenseModalMode('ADD');
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (expense: Expense) => {
    setSelectedExpenseToEdit(expense);
    setExpenseModalMode('EDIT');
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (savedExpense: Expense) => {
    if (expenseModalMode === 'ADD') {
      setExpenses((prev) => [savedExpense, ...prev]);
      setExpenseNotification(`Naya expense / inventory "${savedExpense.title}" kamyabi se add kar diya gaya!`);
    } else {
      setExpenses((prev) => prev.map((e) => (e.id === savedExpense.id ? savedExpense : e)));
      setExpenseNotification(`Expense / inventory "${savedExpense.title}" kamyabi se update kar diya gaya!`);
    }
    setTimeout(() => setExpenseNotification(null), 4000);
  };

  const handleDeleteExpense = (expenseId: string, title: string) => {
    if (window.confirm(`Kya aap waqai "${title}" delete karna chahte hain?`)) {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      setExpenseNotification(`"${title}" delete kar diya gaya.`);
      setTimeout(() => setExpenseNotification(null), 4000);
    }
  };

  // Chart data
  const monthlyChartData = useMemo(() => {
    return MONTH_NAMES.map((mName) => {
      const collectedInMonth = students.reduce((acc, s) => {
        const rec = s.monthlyFees.find((m) => (m.year === chartYear || m.academicYear === (chartYear === 2025 ? 'Year 1' : 'Year 2')) && (m.shortMonth === mName || m.monthName.startsWith(mName)));
        return acc + (rec ? rec.paidAmount : 0);
      }, 0);
      const expectedInMonth = students.reduce((acc, s) => {
        const rec = s.monthlyFees.find((m) => (m.year === chartYear || m.academicYear === (chartYear === 2025 ? 'Year 1' : 'Year 2')) && (m.shortMonth === mName || m.monthName.startsWith(mName)));
        return acc + (rec ? rec.payableAmount : 0);
      }, 0);
      return {
        month: mName,
        Collected: Math.round(collectedInMonth / 1000000 * 100) / 100, // in Millions PKR
        Expected: Math.round(expectedInMonth / 1000000 * 100) / 100,
      };
    });
  }, [students, chartYear]);

  const defaultersByProgramData = useMemo(() => {
    const counts: Record<string, number> = {};
    allDefaulters.forEach((s) => {
      counts[s.program] = (counts[s.program] || 0) + 1;
    });
    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    }));
  }, [allDefaulters]);

  const COLORS = ['#0f766e', '#0284c7', '#f59e0b', '#e11d48', '#8b5cf6'];

  const renderPrincipalLockedScreen = (sectionTitle: string) => (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 p-8 md:p-12 rounded-3xl text-center space-y-5 max-w-2xl mx-auto shadow-2xl relative overflow-hidden my-6">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-3xl shadow-inner">
        <LockIcon className="w-8 h-8" />
      </div>
      <div>
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
          Security Protected
        </span>
        <h3 className="text-xl md:text-2xl font-black text-white mt-2">
          {sectionTitle} is Locked
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
          Yeh section Principal / Executive Director ke liye makhsoos hai. Confidential financials, salaries ya policies access karne ke liye 4-digit Security PIN enter karein.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => handleRequestPrincipalUnlock(currentTab, sectionTitle)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <KeyIcon className="w-4 h-4 text-slate-950" />
          <span>Enter PIN to Unlock</span>
        </button>
        <button
          onClick={() => setCurrentTab('receptionist_counter')}
          className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition-all"
        >
          Front-Desk Counter par jayein
        </button>
      </div>

      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        Default Security PIN: <strong className="text-teal-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">1234</strong>
      </div>
    </div>
  );

  if (!isClientLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 font-bold text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Campus Security & Tenant Workspace...</span>
        </div>
      </div>
    );
  }

  // 0. B2B SaaS Animated Landing Page (Public Face)
  if (portalMode === 'SAAS_LANDING') {
    return (
      <B2BSaasLanding
        colleges={collegeAccounts}
        currentCollege={activeCollegeAccount || collegeAccounts[0]}
        onEnterPortal={handleCollegeLogin}
      />
    );
  }

  // 1. Dedicated Portal Login Terminal
  if (portalMode === 'PORTAL_LOGIN') {
    return (
      <CollegePortalLogin
        colleges={collegeAccounts}
        onCollegeLogin={handleCollegeLogin}
        onSuperAdminLogin={handleSuperAdminLogin}
      />
    );
  }

  // 2. Master Super Admin Control Center
  if (portalMode === 'SUPER_ADMIN') {
    return (
      <SuperAdminDashboard
        colleges={collegeAccounts}
        onOpenCollegePortal={handleCollegeLogin}
        onAddNewCollege={handleSuperAdminAddNewCollege}
        onUpdateCollege={handleSuperAdminUpdateCollege}
        onLogout={handleLogout}
      />
    );
  }

  // 3. Isolated College Workspace (portalMode === 'COLLEGE_PORTAL')
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 print:bg-white print:block">
      {/* Main App Layout (Hidden during voucher printing) */}
      <div className="flex flex-1 min-w-0 print:hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          institutionMode={institutionMode}
          defaultersCount={allDefaulters.length}
          userRole={userRole}
          college={currentCollege}
          isPrincipalUnlocked={isPrincipalUnlocked}
          onRequestPrincipalUnlock={handleRequestPrincipalUnlock}
          onLockPrincipal={handleLockPrincipal}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          onBackToSaas={handleBackToSaas}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            institutionMode={institutionMode}
            onModeChange={setInstitutionMode}
            searchQuery={globalSearch}
            onSearchChange={setGlobalSearch}
            onOpenReceiveFee={() => {
              setStudentForReceiveFee(null);
              setIsReceiveFeeOpen(true);
            }}
            onOpenAI={() => setIsAICopilotOpen(true)}
            defaultersCount={allDefaulters.length}
            colleges={[currentCollege]}
            currentCollege={currentCollege}
            onSelectCollege={() => {}}
            userRole={userRole}
            onRoleChange={handleRoleChange}
            isPrincipalUnlocked={isPrincipalUnlocked}
            onRequestPrincipalUnlock={() => handleRequestPrincipalUnlock('dashboard', 'Executive Dashboard')}
            onLockPrincipal={handleLockPrincipal}
            onLogout={handleLogout}
            onBackToSaas={handleBackToSaas}
            onToggleMobileMenu={() => setIsMobileNavOpen((prev) => !prev)}
            isMultiTenantIsolated={true}
          />

        <main className="flex-1 p-3 sm:p-6 md:p-8 pb-28 sm:pb-8 max-w-7xl w-full mx-auto space-y-6">
          {/* USER SCENARIO SHOWCASE BANNER (Visible on Desktop for Principal Dashboard) */}
          {userRole === 'PRINCIPAL' && isPrincipalUnlocked && currentTab === 'dashboard' && (
            <div className="hidden lg:block bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-5 rounded-2xl shadow-lg border border-teal-800/40 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500 text-slate-950">
                      Live Campus: {currentCollege.name} ({currentCollege.city})
                    </span>
                    <span className="text-xs text-teal-300 font-medium">{currentCollege.code} | Session 2025-2026</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black mt-1">
                    Medical College & School Finance + AI Copilot System
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Total {students.length} students registered: <b className="text-emerald-300">{students.filter(s => s.totalPaidAnnual > 0).length} students</b> ne fee pay ki hai, <b className="text-amber-300">{occasionalDefaulters.length} students</b> ke overdue dues hain, aur <b className="text-rose-300">{chronicDefaulters.length} students</b> critical fee defaulters hain. Har student ka fee status live update hota hai!
                  </p>
                </div>

                {/* Quick Filter Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setCurrentTab('defaulters');
                      setFilterDefaulterSeverity('CHRONIC');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-600/90 hover:bg-rose-600 text-white shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <span>⚠️ {chronicDefaulters.length} Defaulters</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('defaulters');
                      setFilterDefaulterSeverity('MISSED_MONTHS');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/90 hover:bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <span>🗓️ {occasionalDefaulters.length} Missed Months</span>
                  </button>
                  <button
                    onClick={() => setIsAICopilotOpen(true)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <BotIcon className="w-4 h-4 text-slate-950" />
                    <span>Ask Campus LLM</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 0: RECEPTIONIST FRONT-DESK BILLING TERMINAL */}
          {/* ========================================================================= */}
          {currentTab === 'receptionist_counter' && (
            <ReceptionistCounterView
              college={currentCollege}
              students={students}
              transactions={transactions}
              isPrincipal={isPrincipalUnlocked && userRole === 'PRINCIPAL'}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenReceiveFee={(student) => {
                setStudentForReceiveFee(student || null);
                setIsReceiveFeeOpen(true);
              }}
              onOpenLedger={(student) => {
                setSelectedStudentForLedger(student);
              }}
              onPrintReceipt={(txn, student) => {
                setReceiptData({
                  transaction: txn,
                  student: student || students.find((s) => s.id === txn.studentId) || null,
                });
              }}
              onOpenAI={() => setIsAICopilotOpen(true)}
              onOpenAdmissionForm={() => setIsAdmissionFormOpen(true)}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 1: EXECUTIVE DASHBOARD VIEW (PRINCIPAL ONLY) */}
          {/* ========================================================================= */}
          {currentTab === 'dashboard' && (!isPrincipalUnlocked || userRole !== 'PRINCIPAL') && (
            renderPrincipalLockedScreen('Executive Financial Dashboard')
          )}

          {currentTab === 'dashboard' && isPrincipalUnlocked && userRole === 'PRINCIPAL' && (
            <div className="space-y-6">
              {/* Executive KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>TOTAL STUDENTS</span>
                    <StudentsIcon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">{students.length}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Registered Active Students</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                    <span>PAID THIS MONTH</span>
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    {summary.currentMonthPaidCount} Students
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1">
                    {summary.currentMonthPartialCount} Partial Payments
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-rose-600 font-bold">
                    <span>UNPAID / DEFAULTERS</span>
                    <AlertCircleIcon className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-2xl font-black text-rose-700 mt-2">
                    {allDefaulters.length} Students
                  </div>
                  <div className="text-[11px] text-rose-600 mt-1 font-semibold">
                    {chronicDefaulters.length} Chronic + {occasionalDefaulters.length} Occasional
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>SEPTEMBER COLLECTION</span>
                    <FeeIcon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    Rs. {(summary.currentMonthCollected / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-[11px] text-teal-600 mt-1 font-medium">
                    {summary.collectionRateMonth.toFixed(1)}% Collection Rate
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>TOTAL ANNUAL REVENUE</span>
                    <LedgerIcon className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="text-2xl font-black text-teal-900 mt-2">
                    Rs. {(summary.totalPaidAnnual / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Cleared to date</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-rose-600 font-bold">
                    <span>TOTAL OVERDUE ARREARS</span>
                    <AlertCircleIcon className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-2xl font-black text-rose-600 mt-2">
                    Rs. {(summary.totalOverdueArrears || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-rose-600 mt-1 font-medium">
                    {(summary.totalOverdueArrears || 0) === 0 ? 'All students clear (No arrears)' : 'Overdue from elapsed months'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-teal-700 font-bold">
                    <span>SCHOLARSHIPS / AID</span>
                    <SparklesIcon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    Rs. {(summary.totalConcessionsGranted / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-[11px] text-teal-700 mt-1">Merit & Need Based Aid</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>FACULTY & LAB EXPENSES</span>
                    <FacultyIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    Rs. {((summary.totalFacultyMonthlyPayroll + summary.totalMonthlyExpenses) / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Monthly Operational Cost</div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2-Year Fee Collection Trends */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>Monthly Fee Collection vs Target</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white ${chartYear === 2025 ? 'bg-blue-700' : 'bg-purple-700'}`}>
                          {chartYear === 2025 ? 'Year 1 (2025)' : 'Year 2 (2026)'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">Amounts shown in Millions PKR (M) across 2-Year Program</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setChartYear(2025)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          chartYear === 2025 ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Year 1 (2025)
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartYear(2026)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          chartYear === 2026 ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Year 2 (2026)
                      </button>
                    </div>
                  </div>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} unit="M" />
                        <Tooltip />
                        <Bar dataKey="Collected" fill="#0f766e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expected" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-3 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-teal-800">
                      <span className="w-3 h-3 rounded bg-teal-700"></span> Actual Collected
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-3 h-3 rounded bg-slate-300"></span> Expected Target
                    </span>
                  </div>
                </div>

                {/* Defaulters Breakdown Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Defaulters by Medical Program</h3>
                    <p className="text-xs text-slate-500 mb-2">Unpaid fees distribution</p>
                  </div>
                  <div style={{ height: 210 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={defaultersByProgramData}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {defaultersByProgramData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                    {defaultersByProgramData.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          ></span>
                          {item.name}
                        </span>
                        <span className="font-bold text-slate-800">{item.value} students</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Critical Defaulters Quick Alert Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                      Critical Defaulters Notice Board
                    </h3>
                    <p className="text-xs text-slate-500">Students with highest pending arrears</p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('defaulters')}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800"
                  >
                    View All {allDefaulters.length} Defaulters & Missed Months →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Student & ID</th>
                        <th className="py-3 px-4">Program</th>
                        <th className="py-3 px-4">Missed Months</th>
                        <th className="py-3 px-4 text-right">Total Outstanding</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {chronicDefaulters.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            <p className="font-bold text-xs text-emerald-800">Zero Defaulters</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Tamam students ke fee records clear hain.</p>
                          </td>
                        </tr>
                      ) : chronicDefaulters.slice(0, 6).map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="font-mono text-[11px] text-slate-500">{student.studentNo}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {student.program} ({student.yearLevel})
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              {student.unpaidMonthsCount} Months: {student.unpaidMonthNames.slice(0, 4).join(', ')}...
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-rose-600">
                            Rs. {(student.currentOverdueAmount ?? student.totalOutstandingAnnual).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              student.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedStudentForLedger(student)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                              >
                                Ledger
                              </button>
                              <button
                                onClick={() => openFeeCollectionForStudent(student)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                              >
                                Receive
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: STUDENTS DIRECTORY (ALL 100 STUDENTS) */}
          {/* ========================================================================= */}
          {currentTab === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Students Directory ({students.length} Students)</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    A to Z complete records: Roll numbers, programs, contacts, and financial standings
                  </p>
                </div>

                {/* Actions & Filter by Program */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdmissionFormOpen(true)}
                    className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-700/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <span>📝 Naya Admission Form</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-600 shrink-0">Program:</span>
                    <select
                      value={filterProgram}
                      onChange={(e) => setFilterProgram(e.target.value)}
                      className="w-full sm:w-auto p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="ALL">All Programs ({students.length})</option>
                      <option value="MBBS">MBBS (Medicine & Surgery)</option>
                      <option value="BDS">BDS (Dental Surgery)</option>
                      <option value="DPT">DPT (Physical Therapy)</option>
                      <option value="Pharm-D">Pharm-D (Pharmacy)</option>
                      <option value="Nursing">B.Sc Nursing</option>
                      <option value="Technology">Allied Health Tech</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* MOBILE CARDS VIEW (md:hidden) */}
              <div className="md:hidden space-y-3">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-2">
                      👥
                    </div>
                    <p className="font-bold text-sm text-slate-600">Koi Student Mojood Nahi Hai</p>
                    <p className="text-xs text-slate-400 mt-1">Upar diye gaye '+ Naya Admission Form' se pehla student add karein.</p>
                  </div>
                ) : (
                  filteredStudents.map((s) => (
                    <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{s.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                              {s.studentNo}
                            </span>
                            {s.applicationFormNo && (
                              <span className="font-mono text-[9px] text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                                📋 {s.applicationFormNo}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 font-medium">
                              {s.program} ({s.yearLevel})
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {(s.currentOverdueAmount || 0) > 0 ? (
                            <div>
                              <span className="text-rose-600 font-black font-mono text-sm">
                                Rs. {(s.currentOverdueAmount || 0).toLocaleString()}
                              </span>
                              <span className="block text-[9px] text-rose-600 font-bold">
                                {s.unpaidMonthsCount} mo due
                              </span>
                            </div>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Cleared
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>S/O: <b>{s.fatherName}</b></span>
                          <span className="font-mono text-slate-500">{s.phone}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-slate-500">
                          <span>Fee: <b className="text-slate-800">Rs. {s.monthlyFee.toLocaleString()}/mo</b></span>
                          {s.concessionType !== 'None' && (
                            <span className="text-teal-700 font-bold text-[10px] bg-teal-50 px-1.5 py-0.2 rounded">
                              {s.concessionPercent}% Off ({s.concessionType})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForLedger(s)}
                          className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                        >
                          📄 View Ledger
                        </button>
                        <button
                          type="button"
                          onClick={() => openFeeCollectionForStudent(s)}
                          className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                        >
                          💳 + Pay Fee
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* DESKTOP STUDENTS TABLE (hidden md:block) */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Student ID & Form #</th>
                        <th className="py-3 px-4">Student Name & CNIC</th>
                        <th className="py-3 px-4">Father Name</th>
                        <th className="py-3 px-4">Program & Year</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Monthly Fee</th>
                        <th className="py-3 px-4">Concession</th>
                        <th className="py-3 px-4 text-right">Outstanding</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-2">
                              👥
                            </div>
                            <p className="font-bold text-sm text-slate-600">Koi Student Mojood Nahi Hai</p>
                            <p className="text-xs text-slate-400 mt-1">Tamam dummy data saaf ho chuka hai. Upar diye gaye '+ Naya Admission Form' se pehla student add karein.</p>
                          </td>
                        </tr>
                      ) : filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-bold">
                            <div className="text-teal-700">{s.studentNo}</div>
                            {s.applicationFormNo && (
                              <span className="font-mono text-[9px] text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200 inline-block mt-0.5">
                                📋 {s.applicationFormNo}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {s.cnic ? `🪪 CNIC: ${s.cnic}` : s.email}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{s.fatherName}</td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {s.program} <span className="text-slate-400">({s.yearLevel})</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{s.phone}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            Rs. {s.monthlyFee.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            {s.concessionType !== 'None' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                {s.concessionPercent}% ({s.concessionType})
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold">
                            {(s.currentOverdueAmount || 0) > 0 ? (
                              <div>
                                <span className="text-rose-600 font-black">
                                  Rs. {(s.currentOverdueAmount || 0).toLocaleString()}
                                </span>
                                {s.unpaidMonthsCount > 0 && (
                                  <span className="block text-[10px] text-rose-500 font-bold">
                                    {s.unpaidMonthsCount} mo overdue
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Cleared (Rs. 0)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedStudentForLedger(s)}
                                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px]"
                              >
                                View Ledger
                              </button>
                              <button
                                onClick={() => openFeeCollectionForStudent(s)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                              >
                                + Pay
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: 2-YEAR FEE LEDGER MATRIX (24 MONTHS) */}
          {/* ========================================================================= */}
          {currentTab === 'ledger' && (() => {
            const displayedColumns = ledgerYearTab === 'Year 1'
              ? ACADEMIC_CYCLE_MONTHS.filter((m) => m.academicYear === 'Year 1').map((m) => ({
                  key: m.monthName,
                  label: m.shortMonth,
                  sub: `'${String(m.year).slice(-2)}`,
                  year: m.year,
                  month: m.shortMonth,
                }))
              : ledgerYearTab === 'Year 2'
              ? ACADEMIC_CYCLE_MONTHS.filter((m) => m.academicYear === 'Year 2').map((m) => ({
                  key: m.monthName,
                  label: m.shortMonth,
                  sub: `'${String(m.year).slice(-2)}`,
                  year: m.year,
                  month: m.shortMonth,
                }))
              : ACADEMIC_CYCLE_MONTHS.map((m) => ({
                  key: m.monthName,
                  label: m.shortMonth,
                  sub: `'${String(m.year).slice(-2)}`,
                  year: m.year,
                  month: m.shortMonth,
                }));

            return (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  {/* Top Row: Title & Academic Session Info */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        <h2 className="text-base sm:text-lg font-black text-slate-900">
                          Comprehensive 2-Year Fee Ledger Matrix (24 Months)
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Harmain College of Health Sciences • Complete 24-month student tuition ledger & payment status
                      </p>
                    </div>

                    {/* Clean Academic Session Badge */}
                    <div className="flex items-center gap-2.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 px-4 py-2 rounded-2xl shrink-0 shadow-2xs">
                      <span className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                        📅
                      </span>
                      <div>
                        <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
                          Active Academic Session
                        </span>
                        <span className="text-xs font-black text-teal-950 font-mono">
                          {ledgerYearTab === 'ALL'
                            ? 'Both Years: Sep 2026 – Aug 2028 (24 Mo)'
                            : ledgerYearTab === 'Year 1'
                            ? '1st Year: Session 2026–2027 (Sep–Aug)'
                            : '2nd Year: Session 2027–2028 (Sep–Aug)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Year Switcher & Status Legend */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    {/* Year Switcher Buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setLedgerYearTab('ALL')}
                        className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                          ledgerYearTab === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>🗓️</span>
                        <span>Both Years (24 Mo)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLedgerYearTab('Year 1')}
                        className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                          ledgerYearTab === 'Year 1' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-teal-900'
                        }`}
                      >
                        <span>📘</span>
                        <span>Year 1 (Session 2026-27)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLedgerYearTab('Year 2')}
                        className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                          ledgerYearTab === 'Year 2' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-purple-900'
                        }`}
                      >
                        <span>📙</span>
                        <span>Year 2 (Session 2027-28)</span>
                      </button>
                    </div>

                    {/* Status Color Legend */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                      <span className="flex items-center gap-1.5 text-emerald-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs"></span> PAID
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs"></span> DUE
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs"></span> PARTIAL
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-2xs"></span> UPCOMING
                      </span>
                    </div>
                  </div>
                </div>

                {/* Full Matrix Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900 text-white font-bold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-3">Student & Roll</th>
                          <th className="py-3 px-3">Program</th>
                          {displayedColumns.map((col) => (
                            <th key={col.key} className="py-3 px-1 text-center text-[10px] font-mono whitespace-nowrap">
                              <div>{col.label}</div>
                              <div className="text-[8px] text-slate-400 font-normal">{col.sub}</div>
                            </th>
                          ))}
                          <th className="py-3 px-3 text-right">Outstanding</th>
                          <th className="py-3 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={displayedColumns.length + 4} className="py-12 text-center text-slate-400">
                              <p className="font-bold text-sm text-slate-600">Ledger Matrix Khaali Hai</p>
                              <p className="text-xs text-slate-400 mt-1">Pehle students register karein taake unka 2-year fee schedule yahan show ho sakay.</p>
                            </td>
                          </tr>
                        ) : filteredStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{s.name}</div>
                              <div className="font-mono text-[10px] text-slate-400">{s.studentNo}</div>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-600 text-[11px]">
                              {s.program}
                            </td>
                            {displayedColumns.map((col) => {
                              const mf = s.monthlyFees.find((m) => m.monthName === col.key || (m.year === col.year && (m.shortMonth === col.month || m.monthName.startsWith(col.month))));
                              if (!mf) return <td key={col.key} className="py-2 px-1 text-center text-slate-300">-</td>;
                              const isPaid = mf.status === 'PAID';
                              const isDue = mf.status === 'DUE';
                              const isPartial = mf.status === 'PARTIAL';
                              const isUpcoming = mf.status === 'UPCOMING';

                              return (
                                <td key={col.key} className="py-2 px-0.5 text-center">
                                  <span
                                    title={`${mf.monthName}: ${mf.status} (Paid: Rs. ${mf.paidAmount} / Due: Rs. ${mf.payableAmount})`}
                                    className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black cursor-pointer ${
                                      isPaid
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                        : isPartial
                                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                        : isUpcoming
                                        ? 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                    }`}
                                    onClick={() => setSelectedStudentForLedger(s)}
                                  >
                                    {isPaid ? 'OK' : isPartial ? 'PART' : isUpcoming ? '—' : 'DUE'}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="py-2.5 px-3 text-right font-extrabold">
                              {(s.currentOverdueAmount || 0) > 0 ? (
                                <span className="text-rose-600 font-black">
                                  Rs. {(s.currentOverdueAmount || 0).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-bold">Rs. 0</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => setSelectedStudentForLedger(s)}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                              >
                                Ledger
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* TAB 4: DEFAULTERS & MISSED MONTHS (30 SEVERE + 35 SPECIFIC MISSED MONTHS) */}
          {/* ========================================================================= */}
          {currentTab === 'defaulters' && (
            <div className="space-y-4">
              {/* Header with multi-filters and Dedicated Search Bar */}
              {/* Header with multi-filters and Dedicated Search Bar */}
              <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>⚠️</span> Fee Defaulters & Missed Months
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      {currentCollege.name} • Overdue fee recovery & unpaid months tracking
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        alert('Official Defaulter Notice Batch sent to WhatsApp and SMS portal!');
                      }}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <span>📢</span>
                      <span>Send Bulk Reminders (WhatsApp/SMS)</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar & Program/Month Grid */}
                <div className="space-y-2.5 pt-2.5 sm:pt-3 border-t border-slate-100">
                  {/* Left: Dedicated Defaulter Search Input */}
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="🔍 Search name, roll no, father name, phone..."
                      value={defaulterSearchQuery}
                      onChange={(e) => setDefaulterSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-800"
                    />
                    {defaulterSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setDefaulterSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* 2-Column Responsive Grid for Program & Missed Month Dropdowns */}
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={defaulterProgramFilter}
                      onChange={(e) => setDefaulterProgramFilter(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 truncate"
                    >
                      <option value="ALL">🏢 All Programs ({allDefaulters.length})</option>
                      {allDefaulterPrograms.map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterDefaulterMonth}
                      onChange={(e) => setFilterDefaulterMonth(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 truncate"
                    >
                      <option value="ALL">📅 Any Month</option>
                      {ACADEMIC_CYCLE_MONTHS.slice(0, 12).map((m) => (
                        <option key={m.monthName} value={m.monthName}>
                          {m.monthName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Category Severity Swipeable Pills & Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 sm:pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
                    <button
                      onClick={() => setFilterDefaulterSeverity('ALL')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        filterDefaulterSeverity === 'ALL'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      📋 All ({allDefaulters.length})
                    </button>
                    <button
                      onClick={() => setFilterDefaulterSeverity('CHRONIC')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                        filterDefaulterSeverity === 'CHRONIC'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      <span>🚨</span>
                      <span>Chronic (2+ Mo) ({chronicDefaulters.length})</span>
                    </button>
                    <button
                      onClick={() => setFilterDefaulterSeverity('MISSED_MONTHS')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                        filterDefaulterSeverity === 'MISSED_MONTHS'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <span>⚠️</span>
                      <span>1 Mo Due ({occasionalDefaulters.length})</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold pt-1 sm:pt-0">
                    <span className="text-slate-600 text-[11px] sm:text-xs">
                      Showing <b>{filteredDefaulters.length}</b> of {allDefaulters.length} Defaulters
                    </span>
                    {filteredDefaulters.length > 0 && (
                      <span className="bg-rose-100 text-rose-900 px-2.5 py-1 rounded-lg border border-rose-300 font-mono text-[11px]">
                        Arrears: Rs. {filteredDefaultersTotals.totalArrears.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* MOBILE CARDS VIEW (md:hidden) */}
              <div className="md:hidden space-y-3">
                {filteredDefaulters.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                    {allDefaulters.length === 0 ? (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl mb-2 font-bold border border-emerald-200">
                          ✓
                        </div>
                        <p className="font-black text-sm text-emerald-800">Zero Defaulters</p>
                        <p className="text-xs text-slate-400 mt-1">Filhal kisi bhi student ki fee overdue nahi hai.</p>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl block mb-2">🔍</span>
                        <p className="font-black text-sm text-slate-700">Koi Defaulter Match Nahi Hua</p>
                        <p className="text-xs text-slate-400 mt-1">Search query ya filter criteria badal kar dekhein.</p>
                      </>
                    )}
                  </div>
                ) : (
                  filteredDefaulters.map((s) => (
                    <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{s.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                              {s.studentNo}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {s.program} ({s.yearLevel})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm font-black text-rose-600">
                            Rs. {(s.currentOverdueAmount ?? s.totalOutstandingAnnual).toLocaleString()}
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black mt-0.5 ${
                              s.unpaidMonthsCount >= 2
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-400 text-amber-950'
                            }`}
                          >
                            {s.unpaidMonthsCount} mo due
                          </span>
                        </div>
                      </div>

                      {/* Parent & Phone info */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>S/O: <b>{s.fatherName}</b></span>
                          <span className="font-mono text-slate-500">{s.phone}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-200/60">
                          <span className="text-[10px] font-bold text-slate-500">Unpaid:</span>
                          {s.unpaidMonthNames.map((mName) => (
                            <span
                              key={mName}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200"
                            >
                              {mName}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Quick Mobile Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForLedger(s)}
                          className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                        >
                          📄 Timeline
                        </button>
                        <button
                          type="button"
                          onClick={() => openFeeCollectionForStudent(s)}
                          className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                        >
                          💳 Collect Fee
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* DESKTOP DETAILED TABLE (hidden md:block) */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-rose-950 text-rose-100 font-bold border-b border-rose-900">
                      <tr>
                        <th className="py-3 px-4">Student ID & Name</th>
                        <th className="py-3 px-4">Program & Year</th>
                        <th className="py-3 px-4">Father Name & Phone</th>
                        <th className="py-3 px-4">Exact Unpaid Months</th>
                        <th className="py-3 px-4 text-center">Unpaid Count</th>
                        <th className="py-3 px-4 text-right">Overdue Arrears</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDefaulters.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-14 text-center text-slate-400">
                            {allDefaulters.length === 0 ? (
                              <>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl mb-2 font-bold border border-emerald-200">
                                  ✓
                                </div>
                                <p className="font-black text-sm text-emerald-800">Zero Defaulters</p>
                                <p className="text-xs text-slate-400 mt-1">Filhal kisi bhi student ki fee overdue nahi hai.</p>
                              </>
                            ) : (
                              <>
                                <span className="text-3xl block mb-2">🔍</span>
                                <p className="font-black text-sm text-slate-700">Koi Defaulter Match Nahi Hua</p>
                                <p className="text-xs text-slate-400 mt-1">Search query ya filter criteria badal kar dekhein.</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDefaulterSearchQuery('');
                                    setDefaulterProgramFilter('ALL');
                                    setFilterDefaulterSeverity('ALL');
                                    setFilterDefaulterMonth('ALL');
                                  }}
                                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
                                >
                                  Clear All Filters
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredDefaulters.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{s.name}</div>
                              <div className="font-mono text-[10px] text-teal-700 font-bold">{s.studentNo}</div>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-700">
                              {s.program} ({s.yearLevel})
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              <div>{s.fatherName}</div>
                              <span className="text-[10px] text-slate-400">{s.phone}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {s.unpaidMonthNames.map((mName) => (
                                  <span
                                    key={mName}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200"
                                  >
                                    {mName}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                                  s.unpaidMonthsCount >= 2
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-amber-400 text-amber-950'
                                }`}
                              >
                                {s.unpaidMonthsCount} mo
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-black text-rose-600 font-mono text-sm">
                              Rs. {(s.currentOverdueAmount ?? s.totalOutstandingAnnual).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedStudentForLedger(s)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                                >
                                  Timeline
                                </button>
                                <button
                                  onClick={() => openFeeCollectionForStudent(s)}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                                >
                                  Collect
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {/* Table Footer with Summary Totals */}
                    {filteredDefaulters.length > 0 && (
                      <tfoot className="bg-rose-950 text-white font-bold text-xs border-t-2 border-rose-900">
                        <tr>
                          <td colSpan={3} className="py-3 px-4">
                            <span className="font-extrabold text-white text-sm">
                              Filtered Defaulters Total ({filteredDefaulters.length} Students)
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-rose-200">
                            Total Unpaid Months: <span className="text-white font-mono font-bold">{filteredDefaultersTotals.totalMonths}</span>
                          </td>
                          <td colSpan={1} />
                          <td className="py-3 px-4 text-right">
                            <span className="text-[10px] text-rose-300 block uppercase tracking-wider">
                              Total Overdue Arrears
                            </span>
                            <span className="font-mono text-base font-black text-rose-200">
                              Rs. {filteredDefaultersTotals.totalArrears.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-rose-300 text-[11px]">
                            Recovery Status
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: FEE COLLECTION & PAYMENT TRANSACTIONS */}
          {/* ========================================================================= */}
          {currentTab === 'fee_collection' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Fee Collection Desk & Transaction Receipts
                  </h2>
                  <p className="text-xs text-slate-500">
                    Audit trail of all tuition receipts, bank deposits, and online portal collections
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStudentForReceiveFee(null);
                    setIsReceiveFeeOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2"
                >
                  <span>+ Receive Fee Counter</span>
                </button>
              </div>

              {/* Transactions List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Receipt No.</th>
                        <th className="py-3 px-4">Student Name & ID</th>
                        <th className="py-3 px-4">Program</th>
                        <th className="py-3 px-4">Months Paid</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Reference / Slip</th>
                        <th className="py-3 px-4 text-right">Amount (PKR)</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            <p className="font-bold text-sm text-slate-600">Koi Transaction Record Mojood Nahi Hai</p>
                            <p className="text-xs text-slate-400 mt-1">Jab fee counter se payment li jayegi, to yahan audit trail aur vouchers aayenge.</p>
                          </td>
                        </tr>
                      ) : transactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-teal-700">
                            {txn.receiptNo}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{txn.studentName}</div>
                            <span className="font-mono text-[10px] text-slate-400">{txn.studentNo}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">{txn.program}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                              {txn.monthNames && txn.monthNames.length > 0 ? txn.monthNames.join(', ') : 'Fee Clearance'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{txn.method}</td>
                          <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                            {txn.referenceNo}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-emerald-700 text-sm">
                            Rs. {txn.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setReceiptData({ transaction: txn, student: students.find((s) => s.id === txn.studentId) })}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <PrinterIcon className="w-3.5 h-3.5 text-slate-500" />
                                <span>Print</span>
                              </button>
                              {isPrincipalUnlocked && userRole === 'PRINCIPAL' ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTransaction(txn.id)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 cursor-pointer flex items-center gap-0.5"
                                  title="Principal Authority: Receipt Delete Karein"
                                >
                                  <span>🗑️ Delete</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTransaction(txn.id)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-0.5"
                                  title="Principal PIN Required: Receipt delete karne ke liye Principal PIN darkar hai"
                                >
                                  <span>🔒 Delete (PIN)</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: FEE STRUCTURE & SCHOLARSHIPS / CONCESSIONS */}
          {/* ========================================================================= */}
          {currentTab === 'fee_structure' && (!isPrincipalUnlocked || userRole !== 'PRINCIPAL') && (
            renderPrincipalLockedScreen('Fee Structures & Concession Policies')
          )}

          {currentTab === 'fee_structure' && isPrincipalUnlocked && userRole === 'PRINCIPAL' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎓</span>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        Academic Programs & Approved Fee Structures
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Harmain College of Health Sciences • {collegePrograms.length} Active Courses & Degree Programs
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsManageProgramsModalOpen(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                    >
                      <span>⚙️</span>
                      <span>Edit & Manage Programs</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Program Cards Grid - Beautifully Spaced and Separated */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
                  {collegePrograms.map((prog) => {
                    const cardBorder =
                      prog.colorTheme === 'purple'
                        ? 'border-purple-200 hover:border-purple-400 bg-white'
                        : prog.colorTheme === 'emerald'
                        ? 'border-emerald-200 hover:border-emerald-400 bg-white'
                        : prog.colorTheme === 'sky'
                        ? 'border-sky-200 hover:border-sky-400 bg-white'
                        : prog.colorTheme === 'amber'
                        ? 'border-amber-200 hover:border-amber-400 bg-white'
                        : prog.colorTheme === 'rose'
                        ? 'border-rose-200 hover:border-rose-400 bg-white'
                        : 'border-teal-200 hover:border-teal-400 bg-white';

                    const topBarColor =
                      prog.colorTheme === 'purple'
                        ? 'bg-purple-600'
                        : prog.colorTheme === 'emerald'
                        ? 'bg-emerald-600'
                        : prog.colorTheme === 'sky'
                        ? 'bg-sky-600'
                        : prog.colorTheme === 'amber'
                        ? 'bg-amber-600'
                        : prog.colorTheme === 'rose'
                        ? 'bg-rose-600'
                        : 'bg-teal-600';

                    const badgeStyles =
                      prog.colorTheme === 'purple'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : prog.colorTheme === 'emerald'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : prog.colorTheme === 'sky'
                        ? 'bg-sky-100 text-sky-900 border border-sky-300'
                        : prog.colorTheme === 'amber'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : prog.colorTheme === 'rose'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-teal-100 text-teal-900 border border-teal-300';

                    const textStyles =
                      prog.colorTheme === 'purple'
                        ? 'text-purple-950'
                        : prog.colorTheme === 'emerald'
                        ? 'text-emerald-950'
                        : prog.colorTheme === 'sky'
                        ? 'text-sky-950'
                        : prog.colorTheme === 'amber'
                        ? 'text-amber-950'
                        : prog.colorTheme === 'rose'
                        ? 'text-rose-950'
                        : 'text-teal-950';

                    return (
                      <div
                        key={prog.id}
                        className={`rounded-3xl border-2 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden ${cardBorder}`}
                      >
                        {/* Top Accent Strip */}
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${topBarColor}`} />

                        <div>
                          {/* Title & Duration */}
                          <div className="flex items-start justify-between gap-3 pt-1">
                            <div>
                              <h3 className={`font-black text-base ${textStyles} leading-tight`}>
                                {prog.name}
                              </h3>
                              <span className="text-[11px] text-slate-500 font-semibold block mt-1">
                                🎓 {prog.degreeType}
                              </span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 ${badgeStyles}`}>
                              ⏳ {prog.duration}
                            </span>
                          </div>

                          {/* Fee Breakdown Box */}
                          <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-1">
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              Tuition Fee Schedule
                            </div>
                            <div className={`text-2xl font-black font-mono ${textStyles}`}>
                              Rs. {prog.monthlyFee.toLocaleString()}{' '}
                              <span className="text-xs font-semibold text-slate-500">/ month</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 font-bold pt-1 border-t border-slate-200">
                              <span>Annual: Rs. {prog.annualFee.toLocaleString()}</span>
                              {prog.admissionFee ? (
                                <span className="text-slate-500 font-semibold">Reg: Rs. {prog.admissionFee.toLocaleString()}</span>
                              ) : null}
                            </div>
                          </div>

                          {/* Facilities / Points */}
                          <div className="mt-4 space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-700">
                              Course Highlights & Clinical Labs:
                            </div>
                            <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc pl-4">
                              {(prog.features || []).map((feat, idx) => (
                                <li key={idx} className="leading-snug">
                                  {feat}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-xs">
                          <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            🏥 Harmain Health
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsManageProgramsModalOpen(true)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold border border-indigo-200 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span>Edit Course</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Concessions & Scholarship Rules */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 mb-2">Concession & Scholarship Framework</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-teal-800">1. Merit Scholarship (25%)</div>
                    <p className="text-slate-600 mt-1 text-[11px]">
                      Students maintaining GPA 3.8+ or top 3 positions in annual professional examinations.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-sky-800">2. Need-Based Financial Aid (30% - 50%)</div>
                    <p className="text-slate-600 mt-1 text-[11px]">
                      Awarded through institutional scholarship committee after verification of family income.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-indigo-800">3. Faculty & Kinship Waiver (50%)</div>
                    <p className="text-slate-600 mt-1 text-[11px]">
                      Permanent teaching faculty children and siblings enrolled concurrently in medical programs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: FACULTY & STAFF PAYROLL */}
          {/* ========================================================================= */}
          {currentTab === 'faculty' && (!isPrincipalUnlocked || userRole !== 'PRINCIPAL') && (
            renderPrincipalLockedScreen('Faculty & Staff Monthly Payroll')
          )}

          {currentTab === 'faculty' && isPrincipalUnlocked && userRole === 'PRINCIPAL' && (
            <div className="space-y-5">
              {/* Faculty & Payroll KPI Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      Total Monthly Disbursement
                    </span>
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                      💰
                    </span>
                  </div>
                  <div className="text-xl font-black text-indigo-950 mt-1.5">
                    Rs. {facultyMetrics.totalDisbursement.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Gross: Rs. {facultyMetrics.totalGross.toLocaleString()}</span>
                    <span>•</span>
                    <span>{faculty.length} Total Staff</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                      Active Advance Loans
                    </span>
                    <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
                      💳
                    </span>
                  </div>
                  <div className="text-xl font-black text-amber-900 mt-1.5">
                    Rs. {facultyMetrics.totalActiveLoans.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-rose-600 font-semibold mt-1">
                    -Rs. {facultyMetrics.totalLoanDeductionsThisMonth.toLocaleString()} recovering this month
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                      Faculty Attendance Rate
                    </span>
                    <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
                      📅
                    </span>
                  </div>
                  <div className="text-xl font-black text-emerald-800 mt-1.5">
                    {facultyMetrics.avgAttendance}% Average
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1">
                    Biometric attendance & duty records sync
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                      Payroll Clearance
                    </span>
                    <span className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-sm font-bold">
                      📋
                    </span>
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-1.5">
                    <span className="text-emerald-700">{facultyMetrics.paidCount} Paid</span>
                    <span className="text-slate-400 mx-1 font-normal">•</span>
                    <span className="text-amber-600">{facultyMetrics.pendingCount} Pending</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    September 2026 Payroll Cycle
                  </div>
                </div>
              </div>

              {/* Main Action & Filter Bar */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👨‍🏫</span>
                      <h2 className="text-lg font-black text-slate-900">
                        Faculty & Staff Monthly Payroll Register
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Harmain College of Health Sciences (Kahuta) • Professors, Doctors, Hazri, Allowances, Loans, aur Pay Slips
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setManageFacultyCategoriesInitialTab('DEPTS');
                        setIsManageFacultyCategoriesOpen(true);
                      }}
                      title="Apne college ke hisab se departments aur medical terms/classes add, edit ya delete karein"
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300 shadow-xs"
                    >
                      <span className="text-sm">⚙️</span>
                      <span>Manage Depts & Terms</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenAllFacultyRegister}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-slate-900/15 transition-all cursor-pointer"
                    >
                      <PrinterIcon className="w-4 h-4 text-emerald-400" />
                      <span>📑 Print Full Register (PDF)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenAddFaculty}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                    >
                      <span className="text-sm font-black">➕</span>
                      <span>Naya Teacher / Staff Add Karein</span>
                    </button>
                  </div>
                </div>

                {/* View Mode Toggle, Search & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  {/* Left: View Mode Toggle (Table vs Cards) */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFacultyViewMode('TABLE')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        facultyViewMode === 'TABLE'
                          ? 'bg-white text-indigo-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>📊</span>
                      <span>Table View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFacultyViewMode('CARDS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        facultyViewMode === 'CARDS'
                          ? 'bg-white text-indigo-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>📇</span>
                      <span>Cards View</span>
                    </button>
                  </div>

                  {/* Right: Search, Status, and Dept filters */}
                  <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
                    <div className="relative min-w-[220px]">
                      <input
                        type="text"
                        placeholder="🔍 Search name, ID, subject, dept..."
                        value={facultySearchQuery}
                        onChange={(e) => setFacultySearchQuery(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800"
                      />
                      {facultySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setFacultySearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <select
                      value={facultyStatusFilter}
                      onChange={(e) => setFacultyStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'RESIGNED')}
                      className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                    >
                      <option value="ALL">📋 All Status ({faculty.length})</option>
                      <option value="ACTIVE">🟢 Active Teachers ({faculty.filter((f) => (f.employmentStatus || 'ACTIVE') === 'ACTIVE').length})</option>
                      <option value="RESIGNED">🔴 Resigned / Left ({faculty.filter((f) => f.employmentStatus === 'RESIGNED' || f.employmentStatus === 'TERMINATED').length})</option>
                    </select>

                    <select
                      value={facultyDepartmentFilter}
                      onChange={(e) => setFacultyDepartmentFilter(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer max-w-[200px]"
                    >
                      <option value="ALL">🏢 All Departments ({allFacultyDepartments.length})</option>
                      {allFacultyDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Helpful policy reminder bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      Showing {filteredFaculty.length} of {faculty.length} Staff
                    </span>
                    {(facultySearchQuery || facultyDepartmentFilter !== 'ALL' || facultyStatusFilter !== 'ALL') && (
                      <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        Filters Applied
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/80">
                    <span>⏰</span>
                    <span>Late Arrival Rule: 10:00 AM shift par 12:00 PM (2-3h late arrival) = Half Day count hota hai.</span>
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* VIEW 1: CLEAN PROFESSIONAL TABLE VIEW */}
              {/* ===================================================================== */}
              {facultyViewMode === 'TABLE' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100/90 text-slate-700 font-extrabold border-b border-slate-200 uppercase text-[11px] tracking-wide">
                        <tr>
                          <th className="py-3.5 px-4 min-w-[240px]">Faculty Member & Post</th>
                          <th className="py-3.5 px-3 min-w-[170px]">Department</th>
                          <th className="py-3.5 px-3 min-w-[150px] text-center">📅 Attendance (حاضری)</th>
                          <th className="py-3.5 px-4 min-w-[210px]">💵 Salary Breakdown (حساب)</th>
                          <th className="py-3.5 px-4 min-w-[150px] text-right">Net Take-Home Pay</th>
                          <th className="py-3.5 px-3 min-w-[100px] text-center">Status</th>
                          <th className="py-3.5 px-3 min-w-[120px] text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFaculty.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-14 text-center text-slate-400">
                              <span className="text-4xl block mb-2">👨‍🏫</span>
                              <p className="text-sm font-bold text-slate-600">Koi faculty record nahi mila.</p>
                              <p className="text-xs text-slate-400 mt-0.5">Filter change karein ya search query clear karein.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredFaculty.map((f) => {
                            const hasAdvance = (f.advanceDeductionThisMonth || 0) > 0 || (f.advanceTotalLoan || 0) > 0;
                            const isResigned = f.employmentStatus === 'RESIGNED' || f.employmentStatus === 'TERMINATED';
                            const initials = f.name
                              .replace(/^(dr|prof|mr|ms|mrs)\.?\s+/i, '')
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase();

                            return (
                              <tr
                                key={f.id}
                                className={`hover:bg-slate-50/80 transition-colors ${
                                  isResigned ? 'bg-rose-50/30 opacity-75' : ''
                                }`}
                              >
                                {/* Column 1: Faculty Member & Post */}
                                <td className="py-3.5 px-4 align-top">
                                  <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                                      {initials || 'FC'}
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-extrabold text-slate-900 text-sm">{f.name}</span>
                                        {isResigned && (
                                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                            LEFT
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs font-semibold text-slate-600">
                                        {f.designation}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        <span className="font-mono text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                          {f.employeeNo}
                                        </span>
                                        {f.subjectSpecialization && (
                                          <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                            🩺 {f.subjectSpecialization}
                                          </span>
                                        )}
                                        {f.teachingTerm && (
                                          <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                            🎓 {f.teachingTerm}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Column 2: Department */}
                                <td className="py-3.5 px-3 align-top">
                                  <div className="font-bold text-teal-900 text-xs">
                                    🏢 {f.department}
                                  </div>
                                  {f.joiningDate && (
                                    <div className="text-[10px] text-slate-500 mt-1">
                                      Joined: {f.joiningDate}
                                    </div>
                                  )}
                                  {f.phone && (
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      📞 {f.phone}
                                    </div>
                                  )}
                                </td>

                                {/* Column 3: Attendance */}
                                <td className="py-3.5 px-3 text-center align-top">
                                  <div className="inline-flex flex-col items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 w-full max-w-[140px]">
                                    <span className="font-extrabold text-slate-900 text-xs">
                                      {f.presentDays !== undefined ? f.presentDays : 30} / {f.workingDays || 30} Days
                                    </span>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 my-1.5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          (f.attendanceScore || 100) >= 95 ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`}
                                        style={{ width: `${Math.min(100, f.attendanceScore || 100)}%` }}
                                      />
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-1">
                                      <span
                                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                                          (f.attendanceScore || 100) >= 95
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {f.attendanceScore || 100}% Hazri
                                      </span>
                                      {(f.absentDays || 0) > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-100 text-rose-800">
                                          {f.absentDays} Abs
                                        </span>
                                      )}
                                      {(f.halfDaysCount || 0) > 0 && (
                                        <span
                                          title="10:00 AM ke bajaye 12:00 PM (2-3 ghante late) = Half Day"
                                          className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300"
                                        >
                                          {f.halfDaysCount} Half (Late)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Column 4: Salary Breakdown (Ledger) */}
                                <td className="py-3.5 px-4 align-top">
                                  <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 space-y-1">
                                    <div className="flex items-center justify-between text-slate-700">
                                      <span className="text-[11px] text-slate-500 font-medium">Basic Pay:</span>
                                      <span className="font-mono font-bold">Rs. {f.basicSalary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-emerald-700">
                                      <span className="text-[11px] font-medium">+ Allowances:</span>
                                      <span className="font-mono font-bold">+Rs. {f.allowances.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-rose-600">
                                      <span className="text-[11px] font-medium">- Deductions:</span>
                                      <span className="font-mono font-bold">-Rs. {f.deductions.toLocaleString()}</span>
                                    </div>
                                    {hasAdvance && (
                                      <div className="pt-1 mt-1 border-t border-slate-200 flex flex-col gap-0.5">
                                        <span className="text-[10px] text-amber-900 font-bold bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300/80 flex items-center justify-between">
                                          <span>💳 Adv Loan Cut:</span>
                                          <span>Rs. {(f.advanceDeductionThisMonth || 0).toLocaleString()}</span>
                                        </span>
                                        {(f.advanceRemainingBalance || 0) > 0 && (
                                          <span className="text-[9px] text-slate-500 text-right">
                                            Baqi Loan: Rs. {(f.advanceRemainingBalance || 0).toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Column 5: Net Take-Home Pay */}
                                <td className="py-3.5 px-4 text-right align-top">
                                  <div className="inline-flex flex-col items-end bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/70">
                                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                                      Take-Home Pay
                                    </span>
                                    <span className="font-mono text-base font-black text-emerald-950 mt-0.5">
                                      Rs. {f.netSalary.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-500 mt-0.5">
                                      Gross: Rs. {(f.basicSalary + f.allowances).toLocaleString()}
                                    </span>
                                  </div>
                                </td>

                                {/* Column 6: Status */}
                                <td className="py-3.5 px-3 text-center align-top">
                                  <div className="flex flex-col items-center gap-1.5 pt-1">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                                        f.salaryStatus === 'PAID'
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                                      }`}
                                    >
                                      {f.salaryStatus === 'PAID' ? '✅ PAID' : '⏳ PENDING'}
                                    </span>
                                    {isResigned ? (
                                      <span
                                        title={
                                          f.resignationReason
                                            ? `Reason: ${f.resignationReason} (${f.resignationDate || ''})`
                                            : 'Left institution'
                                        }
                                        className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200"
                                      >
                                        🔴 Resigned
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-emerald-700">🟢 Active</span>
                                    )}
                                  </div>
                                </td>

                                {/* Column 7: Actions */}
                                <td className="py-3.5 px-3 text-center align-top">
                                  <div className="flex items-center justify-center gap-1.5 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditFaculty(f)}
                                      title="Edit details, subject, term, attendance, salary, or mark resignation"
                                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all border border-indigo-200 shadow-2xs"
                                    >
                                      <EditIcon className="w-3.5 h-3.5" />
                                      <span>Edit</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenSalarySlip(f)}
                                      title="Print or Save Official Pay Slip PDF"
                                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                    >
                                      <PrinterIcon className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Slip</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (
                                          confirm(
                                            `Kya aap waqai teacher "${f.name}" (${f.employeeNo}) ka record close / remove karna chahte hain?`
                                          )
                                        ) {
                                          handleDeleteFaculty(f.id);
                                        }
                                      }}
                                      title="Teacher chhor gaya hai to record close ya delete karein"
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs flex items-center cursor-pointer transition-all border border-rose-200"
                                    >
                                      <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {/* Comprehensive Table Footer with ERP Totals */}
                      {filteredFaculty.length > 0 && (
                        <tfoot className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-700">
                          <tr>
                            <td colSpan={3} className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-base">📊</span>
                                <span className="font-extrabold text-white text-sm">
                                  Filtered Faculty Totals ({filteredFaculty.length} Staff Members)
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-[11px] space-y-0.5 text-slate-300">
                                <div>Basic: <span className="text-white font-mono font-bold">Rs. {filteredFacultyTotals.basic.toLocaleString()}</span></div>
                                <div>Allowances: <span className="text-emerald-400 font-mono font-bold">+Rs. {filteredFacultyTotals.allowances.toLocaleString()}</span></div>
                                <div>Deductions: <span className="text-rose-400 font-mono font-bold">-Rs. {filteredFacultyTotals.deductions.toLocaleString()}</span></div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                                Total Net Payout
                              </span>
                              <span className="font-mono text-base font-black text-emerald-400">
                                Rs. {filteredFacultyTotals.net.toLocaleString()}
                              </span>
                            </td>
                            <td colSpan={2} className="py-3 px-3 text-center text-slate-400 text-[11px]">
                              Harmain College Payroll
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* VIEW 2: MODERN FACULTY CARDS GRID VIEW */}
              {/* ===================================================================== */}
              {facultyViewMode === 'CARDS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredFaculty.length === 0 ? (
                    <div className="col-span-full py-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                      <span className="text-4xl block mb-2">👨‍🏫</span>
                      <p className="text-sm font-bold text-slate-600">Koi faculty record nahi mila.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Search ya filter criteria badal kar dekhein.</p>
                    </div>
                  ) : (
                    filteredFaculty.map((f) => {
                      const hasAdvance = (f.advanceDeductionThisMonth || 0) > 0 || (f.advanceTotalLoan || 0) > 0;
                      const isResigned = f.employmentStatus === 'RESIGNED' || f.employmentStatus === 'TERMINATED';
                      const initials = f.name
                        .replace(/^(dr|prof|mr|ms|mrs)\.?\s+/i, '')
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();

                      return (
                        <div
                          key={f.id}
                          className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                            isResigned
                              ? 'border-rose-200 bg-rose-50/20'
                              : 'border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div>
                            {/* Card Top: Avatar, Name, Employee ID & Status */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                                  {initials || 'FC'}
                                </div>
                                <div>
                                  <h3 className="font-black text-slate-900 text-base leading-tight">
                                    {f.name}
                                  </h3>
                                  <div className="text-xs font-semibold text-indigo-700 mt-0.5">
                                    {f.designation}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                                  f.salaryStatus === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {f.salaryStatus === 'PAID' ? '✅ PAID' : '⏳ PENDING'}
                              </span>
                            </div>

                            {/* Tags: Department, Code, Subject, Term */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-3.5 pt-3 border-t border-slate-100">
                              <span className="font-mono text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                ID: {f.employeeNo}
                              </span>
                              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                🏢 {f.department}
                              </span>
                              {f.subjectSpecialization && (
                                <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                  🩺 {f.subjectSpecialization}
                                </span>
                              )}
                              {f.teachingTerm && (
                                <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                  🎓 {f.teachingTerm}
                                </span>
                              )}
                              {isResigned && (
                                <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                                  🔴 LEFT INSTITUTION
                                </span>
                              )}
                            </div>

                            {/* Attendance Meter */}
                            <div className="mt-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700">📅 Monthly Attendance:</span>
                                <span className="font-black text-slate-900">
                                  {f.presentDays !== undefined ? f.presentDays : 30} / {f.workingDays || 30} Days
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 my-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    (f.attendanceScore || 100) >= 95 ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${Math.min(100, f.attendanceScore || 100)}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-emerald-700">
                                  {f.attendanceScore || 100}% Attendance Rate
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {(f.absentDays || 0) > 0 && (
                                    <span className="font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                                      {f.absentDays} Absents
                                    </span>
                                  )}
                                  {(f.halfDaysCount || 0) > 0 && (
                                    <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                                      {f.halfDaysCount} Half Days (Late)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Salary Calculation Ledger Box */}
                            <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between text-slate-600">
                                <span>Basic Pay:</span>
                                <span className="font-mono font-bold text-slate-900">
                                  Rs. {f.basicSalary.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-emerald-700">
                                <span>+ Allowances:</span>
                                <span className="font-mono font-bold">+Rs. {f.allowances.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between text-rose-600">
                                <span>- Deductions:</span>
                                <span className="font-mono font-bold">-Rs. {f.deductions.toLocaleString()}</span>
                              </div>
                              {hasAdvance && (
                                <div className="pt-1.5 border-t border-slate-200 text-[11px] text-amber-900 font-semibold flex items-center justify-between">
                                  <span>💳 Loan Cut:</span>
                                  <span>Rs. {(f.advanceDeductionThisMonth || 0).toLocaleString()} (Baqi: Rs. {(f.advanceRemainingBalance || 0).toLocaleString()})</span>
                                </div>
                              )}
                            </div>

                            {/* Net Take-Home Highlight */}
                            <div className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-xl flex items-center justify-between shadow-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100 block">
                                  Net Take-Home Pay
                                </span>
                                <span className="text-lg font-black font-mono">
                                  Rs. {f.netSalary.toLocaleString()}
                                </span>
                              </div>
                              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold">
                                {f.salaryStatus}
                              </span>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleOpenEditFaculty(f)}
                              className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-indigo-200"
                            >
                              <EditIcon className="w-3.5 h-3.5" />
                              <span>Edit Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenSalarySlip(f)}
                              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                            >
                              <PrinterIcon className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Salary Slip</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Kya aap waqai teacher "${f.name}" (${f.employeeNo}) ka record close / remove karna chahte hain?`
                                  )
                                ) {
                                  handleDeleteFaculty(f.id);
                                }
                              }}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer transition-all border border-rose-200"
                              title="Delete Teacher"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: CAMPUS & LAB EXPENSES */}
          {/* ========================================================================= */}
          {currentTab === 'expenses' && (!isPrincipalUnlocked || userRole !== 'PRINCIPAL') && (
            renderPrincipalLockedScreen('Campus & Lab Operational Expenses')
          )}

          {currentTab === 'expenses' && isPrincipalUnlocked && userRole === 'PRINCIPAL' && (
            <div className="space-y-5">
              {expenseNotification && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in duration-200 shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{expenseNotification}</span>
                  </div>
                  <button
                    onClick={() => setExpenseNotification(null)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Inventory & Expense Executive KPI Cards - Spacious & Cleanly Padded */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-rose-300 hover:shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider block">
                        Total Expense Outflow
                      </span>
                      <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm font-bold shrink-0 border border-rose-100">
                        💳
                      </span>
                    </div>
                    <div className="text-2xl font-black text-rose-700 mt-2 font-mono">
                      Rs. {summary.totalMonthlyExpenses.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">{expenses.length} Total Records</span>
                    <span>•</span>
                    <span>Campus & Lab Outflow</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-emerald-800 text-[11px] font-bold uppercase tracking-wider block">
                        Tracked Lab Assets
                      </span>
                      <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0 border border-emerald-100">
                        🔬
                      </span>
                    </div>
                    <div className="text-2xl font-black text-emerald-800 mt-2 font-mono">
                      {inventoryMetrics.inventoryItemsCount} Items
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-2 pt-2 border-t border-slate-100">
                    Value: Rs. {inventoryMetrics.totalInventoryValue.toLocaleString()}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-teal-800 text-[11px] font-bold uppercase tracking-wider block">
                        Available Stock Units
                      </span>
                      <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-sm font-bold shrink-0 border border-teal-100">
                        📦
                      </span>
                    </div>
                    <div className="text-2xl font-black text-teal-900 mt-2 font-mono">
                      {inventoryMetrics.totalInventoryUnits.toLocaleString()} Units
                    </div>
                  </div>
                  <div className="text-[11px] text-teal-700 font-semibold mt-2 pt-2 border-t border-slate-100">
                    Chemicals, Glassware & Reagents
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-amber-800 text-[11px] font-bold uppercase tracking-wider block">
                        Low Stock Alerts
                      </span>
                      <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold shrink-0 border border-amber-100">
                        ⚠️
                      </span>
                    </div>
                    <div className={`text-2xl font-black mt-2 font-mono ${inventoryMetrics.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {inventoryMetrics.lowStockCount} Items
                    </div>
                  </div>
                  <div className={`text-[11px] font-bold mt-2 pt-2 border-t border-slate-100 ${inventoryMetrics.lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {inventoryMetrics.lowStockCount > 0 ? 'Urgent reorder required' : 'All stock levels healthy'}
                  </div>
                </div>
              </div>

              {/* Main Action & Filter Bar */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📦</span>
                      <h2 className="text-lg font-black text-slate-900">
                        Campus & Lab Inventory & Expenses Hub
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Harmain College of Health Sciences (Kahuta) • Pathology, Anatomy, Reagents, Consumables & Operational Bills
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPrintInventoryModalOpen(true)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-slate-900/15 transition-all cursor-pointer"
                    >
                      <PrinterIcon className="w-4 h-4 text-emerald-400" />
                      <span>🖨️ Print / Save PDF Report</span>
                    </button>

                    <button
                      onClick={handleOpenAddExpense}
                      className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-800/20 transition-all cursor-pointer"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>➕ Add Inventory / Expense Item</span>
                    </button>
                  </div>
                </div>

                {/* View Mode Toggle, Sub-Tabs & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  {/* Left: View Mode Toggle (Table vs Cards) */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setExpenseViewMode('TABLE')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        expenseViewMode === 'TABLE'
                          ? 'bg-white text-teal-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>📊</span>
                      <span>Table View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseViewMode('CARDS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        expenseViewMode === 'CARDS'
                          ? 'bg-white text-teal-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>🔬</span>
                      <span>Lab Asset Cards</span>
                    </button>
                  </div>

                  {/* Sub-Tabs: Filter by Item Type */}
                  <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setExpenseFilterTab('ALL')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        expenseFilterTab === 'ALL'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📋 All ({expenses.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseFilterTab('INVENTORY')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        expenseFilterTab === 'INVENTORY'
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'text-slate-600 hover:text-emerald-900'
                      }`}
                    >
                      <span>📦 Inventory ({inventoryMetrics.inventoryItemsCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseFilterTab('LOW_STOCK')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        expenseFilterTab === 'LOW_STOCK'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-amber-800'
                      }`}
                    >
                      <span>⚠️ Low Stock</span>
                      {inventoryMetrics.lowStockCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-amber-900 font-black">
                          {inventoryMetrics.lowStockCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseFilterTab('OPERATIONAL')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        expenseFilterTab === 'OPERATIONAL'
                          ? 'bg-teal-800 text-white shadow-xs'
                          : 'text-slate-600 hover:text-teal-900'
                      }`}
                    >
                      ⚡ Operating Bills
                    </button>
                  </div>
                </div>

                {/* Search & Dynamic Category Selectors */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span>Showing {filteredExpenses.length} of {expenses.length} Records</span>
                    {(expenseSearchQuery || expenseDepartmentFilter !== 'ALL' || expenseCategoryFilter !== 'ALL' || expenseFilterTab !== 'ALL') && (
                      <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        Filtered
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
                    <div className="relative min-w-[200px]">
                      <input
                        type="text"
                        placeholder="🔍 Search item, SKU, vendor..."
                        value={expenseSearchQuery}
                        onChange={(e) => setExpenseSearchQuery(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800"
                      />
                      {expenseSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setExpenseSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Lab / Department Filter */}
                    <select
                      value={expenseDepartmentFilter}
                      onChange={(e) => setExpenseDepartmentFilter(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer max-w-[180px]"
                    >
                      <option value="ALL">🏢 All Labs / Depts ({allExpenseDepartments.length})</option>
                      {allExpenseDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>

                    {/* Category Filter */}
                    <select
                      value={expenseCategoryFilter}
                      onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer max-w-[180px]"
                    >
                      <option value="ALL">🏷️ All Categories ({allExpenseCategories.length})</option>
                      {allExpenseCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* VIEW 1: CLEAN PROFESSIONAL TABLE VIEW */}
              {/* ===================================================================== */}
              {expenseViewMode === 'TABLE' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100/90 text-slate-700 font-extrabold border-b border-slate-200 uppercase text-[11px] tracking-wide">
                        <tr>
                          <th className="py-3.5 px-4 min-w-[240px]">Item & Location / SKU</th>
                          <th className="py-3.5 px-3 min-w-[160px]">Category & Lab</th>
                          <th className="py-3.5 px-4 min-w-[170px] text-center">Live Stock / Units</th>
                          <th className="py-3.5 px-3 min-w-[140px]">Quantity & Rate</th>
                          <th className="py-3.5 px-3 min-w-[160px]">Supplier & Invoice</th>
                          <th className="py-3.5 px-4 min-w-[140px] text-right">Total Cost</th>
                          <th className="py-3.5 px-3 min-w-[90px] text-center">Status</th>
                          <th className="py-3.5 px-3 min-w-[100px] text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredExpenses.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-14 text-center text-slate-400">
                              <span className="text-4xl block mb-2">📦</span>
                              <p className="text-sm font-bold text-slate-600">Koi item ya expense nahi mila.</p>
                              <button
                                onClick={handleOpenAddExpense}
                                className="mt-3 px-4 py-2 bg-teal-50 text-teal-800 font-bold text-xs rounded-xl hover:bg-teal-100 cursor-pointer border border-teal-200"
                              >
                                + Naya Item Add Karein
                              </button>
                            </td>
                          </tr>
                        ) : (
                          filteredExpenses.map((e) => {
                            const isLow = e.stockStatus === 'LOW_STOCK';
                            const isOut = e.stockStatus === 'OUT_OF_STOCK';
                            const isInv = e.isInventoryItem !== false && e.currentStock !== undefined;

                            return (
                              <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                                {/* Column 1: Item & SKU & Storage */}
                                <td className="py-3.5 px-4 align-top">
                                  <div className="flex items-start gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 text-base shadow-2xs mt-0.5 border border-teal-200/60">
                                      {e.category.includes('Equipment') ? '🔬' : e.category.includes('Anatomy') || e.category.includes('Dissection') ? '🧪' : e.category.includes('Hospital') ? '🩺' : '📦'}
                                    </div>
                                    <div className="space-y-1">
                                      <div className="font-extrabold text-slate-900 text-sm leading-snug">
                                        {e.title}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        {e.itemCode ? (
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
                                            {e.itemCode}
                                          </span>
                                        ) : (
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                                            {e.date}
                                          </span>
                                        )}
                                        {e.storageLocation && (
                                          <span className="text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                            📍 {e.storageLocation}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Column 2: Category & Department */}
                                <td className="py-3.5 px-3 align-top">
                                  <div className="space-y-1">
                                    <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                      {e.category}
                                    </span>
                                    <div className="font-bold text-slate-800 text-xs mt-0.5">
                                      🏢 {e.department}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      Approved: {e.approvedBy}
                                    </div>
                                  </div>
                                </td>

                                {/* Column 3: Live Stock & Quick Adjuster */}
                                <td className="py-3.5 px-4 text-center align-top">
                                  {isInv ? (
                                    <div className="inline-flex flex-col items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/90 w-full max-w-[160px]">
                                      <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                                          isOut
                                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                            : isLow
                                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        }`}
                                      >
                                        {isOut ? '🔴 Out of Stock' : isLow ? '🟡 Low Stock' : '🟢 In Stock'}
                                      </span>

                                      <div className="text-xs font-black text-slate-900 mt-1">
                                        {e.currentStock} {e.unit || 'Units'}
                                      </div>

                                      {/* Quick adjust buttons */}
                                      <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-200/80 w-full justify-center">
                                        <button
                                          type="button"
                                          onClick={() => handleQuickAdjustStock(e.id, -1)}
                                          className="w-6 h-6 rounded-lg bg-white hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-black flex items-center justify-center text-xs cursor-pointer border border-slate-300 shadow-2xs transition-colors"
                                          title="Consume 1 Unit"
                                        >
                                          -
                                        </button>
                                        <span className="text-[10px] font-bold text-slate-400 px-1">Adjust</span>
                                        <button
                                          type="button"
                                          onClick={() => handleQuickAdjustStock(e.id, 1)}
                                          className="w-6 h-6 rounded-lg bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 font-black flex items-center justify-center text-xs cursor-pointer border border-slate-300 shadow-2xs transition-colors"
                                          title="Restock +1 Unit"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                      ⚡ Operational Expense
                                    </span>
                                  )}
                                </td>

                                {/* Column 4: Quantity & Rate */}
                                <td className="py-3.5 px-3 align-top">
                                  {e.quantity ? (
                                    <div className="space-y-0.5">
                                      <div className="font-extrabold text-slate-900 text-xs">
                                        {e.quantity} {e.unit || 'Units'}
                                      </div>
                                      {e.unitPrice && (
                                        <div className="text-[11px] font-mono text-slate-500">
                                          @ Rs. {e.unitPrice.toLocaleString()}
                                        </div>
                                      )}
                                      <div className="text-[10px] text-slate-400">
                                        Purchased: {e.date}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-slate-400 text-xs font-semibold">—</div>
                                  )}
                                </td>

                                {/* Column 5: Supplier & Invoice */}
                                <td className="py-3.5 px-3 align-top">
                                  {e.supplier ? (
                                    <div className="space-y-0.5">
                                      <div className="font-bold text-slate-800 text-xs truncate max-w-[160px]">
                                        {e.supplier}
                                      </div>
                                      {e.invoiceNo && (
                                        <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit border border-slate-200">
                                          Inv #{e.invoiceNo}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-[10px] font-medium">Direct Campus Purchase</span>
                                  )}
                                </td>

                                {/* Column 6: Total Cost */}
                                <td className="py-3.5 px-4 text-right align-top">
                                  <div className="inline-flex flex-col items-end bg-rose-50/70 p-2 rounded-xl border border-rose-200/70">
                                    <span className="text-[9px] uppercase font-bold text-rose-800 tracking-wider">
                                      Total Outflow
                                    </span>
                                    <span className="font-mono text-sm font-black text-rose-700 mt-0.5">
                                      Rs. {e.amount.toLocaleString()}
                                    </span>
                                  </div>
                                </td>

                                {/* Column 7: Status */}
                                <td className="py-3.5 px-3 text-center align-top">
                                  <div className="pt-1">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                                        e.paymentStatus === 'PAID'
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                                      }`}
                                    >
                                      {e.paymentStatus === 'PAID' ? '✅ PAID' : '⏳ PENDING'}
                                    </span>
                                  </div>
                                </td>

                                {/* Column 8: Actions */}
                                <td className="py-3.5 px-3 text-center align-top">
                                  <div className="flex items-center justify-center gap-1.5 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditExpense(e)}
                                      className="p-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer border border-indigo-200"
                                      title="Edit Item & Stock"
                                    >
                                      <EditIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteExpense(e.id, e.title)}
                                      className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer border border-rose-200"
                                      title="Delete Item"
                                    >
                                      <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {/* Comprehensive Table Footer with ERP Totals */}
                      {filteredExpenses.length > 0 && (
                        <tfoot className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-700">
                          <tr>
                            <td colSpan={2} className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-base">📊</span>
                                <span className="font-extrabold text-white text-sm">
                                  Filtered Records ({filteredExpenses.length} Items)
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="text-[11px] text-teal-300">
                                Total Units: <span className="text-white font-mono font-bold">{filteredExpensesTotals.totalUnits.toLocaleString()}</span>
                              </div>
                            </td>
                            <td colSpan={2} className="py-3 px-3 text-slate-400 text-[11px]">
                              Harmain College Inventory Register
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                                Grand Total Cost
                              </span>
                              <span className="font-mono text-base font-black text-rose-400">
                                Rs. {filteredExpensesTotals.totalCost.toLocaleString()}
                              </span>
                            </td>
                            <td colSpan={2} className="py-3 px-3 text-center text-slate-400 text-[11px]">
                              Verified
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* VIEW 2: MODERN LAB ASSET CARDS GRID VIEW */}
              {/* ===================================================================== */}
              {expenseViewMode === 'CARDS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
                  {filteredExpenses.length === 0 ? (
                    <div className="col-span-full py-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                      <span className="text-4xl block mb-2">📦</span>
                      <p className="text-sm font-bold text-slate-600">Koi item ya expense record nahi mila.</p>
                      <button
                        onClick={handleOpenAddExpense}
                        className="mt-3 px-4 py-2 bg-teal-50 text-teal-800 font-bold text-xs rounded-xl hover:bg-teal-100 cursor-pointer border border-teal-200"
                      >
                        + Naya Item Add Karein
                      </button>
                    </div>
                  ) : (
                    filteredExpenses.map((e) => {
                      const isLow = e.stockStatus === 'LOW_STOCK';
                      const isOut = e.stockStatus === 'OUT_OF_STOCK';
                      const isInv = e.isInventoryItem !== false && e.currentStock !== undefined;

                      return (
                        <div
                          key={e.id}
                          className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md"
                        >
                          <div>
                            {/* Card Top: Icon, Title, SKU & Category */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shrink-0 text-lg shadow-xs">
                                  {e.category.includes('Equipment') ? '🔬' : e.category.includes('Anatomy') || e.category.includes('Dissection') ? '🧪' : e.category.includes('Hospital') ? '🩺' : '📦'}
                                </div>
                                <div>
                                  <h3 className="font-black text-slate-900 text-base leading-snug">
                                    {e.title}
                                  </h3>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                      {e.category}
                                    </span>
                                    {e.itemCode && (
                                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
                                        {e.itemCode}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                                  e.paymentStatus === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {e.paymentStatus === 'PAID' ? 'PAID' : 'PENDING'}
                              </span>
                            </div>

                            {/* Lab Department & Location Details */}
                            <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-slate-100 text-xs">
                              <span className="font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                🏢 {e.department}
                              </span>
                              {e.storageLocation && (
                                <span className="text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                                  📍 {e.storageLocation}
                                </span>
                              )}
                            </div>

                            {/* Stock Status Box */}
                            {isInv && (
                              <div className="mt-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-700">Live Physical Stock:</span>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                      isOut
                                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                        : isLow
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    }`}
                                  >
                                    {isOut ? '🔴 Out' : isLow ? '🟡 Low Stock' : '🟢 In Stock'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-black text-slate-900">
                                    {e.currentStock} <span className="text-xs font-bold text-slate-500">{e.unit || 'Units'}</span>
                                  </span>

                                  {/* Quick Stock Adjust Buttons */}
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleQuickAdjustStock(e.id, -1)}
                                      className="w-7 h-7 rounded-lg bg-white hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-black flex items-center justify-center text-sm cursor-pointer border border-slate-300 shadow-2xs transition-colors"
                                      title="Consume 1 Unit"
                                    >
                                      -
                                    </button>
                                    <span className="text-[10px] font-bold text-slate-400">Qty</span>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickAdjustStock(e.id, 1)}
                                      className="w-7 h-7 rounded-lg bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 font-black flex items-center justify-center text-sm cursor-pointer border border-slate-300 shadow-2xs transition-colors"
                                      title="Restock +1 Unit"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Purchase Cost & Supplier Box */}
                            <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                              {e.quantity && (
                                <div className="flex items-center justify-between text-slate-600">
                                  <span>Quantity & Rate:</span>
                                  <span className="font-mono font-bold text-slate-900">
                                    {e.quantity} {e.unit || 'Units'} {e.unitPrice ? `@ Rs. ${e.unitPrice.toLocaleString()}` : ''}
                                  </span>
                                </div>
                              )}
                              {e.supplier && (
                                <div className="flex items-center justify-between text-slate-600">
                                  <span>Supplier:</span>
                                  <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                                    {e.supplier}
                                  </span>
                                </div>
                              )}
                              {e.invoiceNo && (
                                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                                  <span>Invoice Bill:</span>
                                  <span className="font-mono font-semibold">#{e.invoiceNo}</span>
                                </div>
                              )}
                            </div>

                            {/* Cost Banner */}
                            <div className="mt-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-xl flex items-center justify-between shadow-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">
                                  Total Expense Outflow
                                </span>
                                <span className="text-lg font-black font-mono text-emerald-400">
                                  Rs. {e.amount.toLocaleString()}
                                </span>
                              </div>
                              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg font-bold text-slate-300">
                                Date: {e.date}
                              </span>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleOpenEditExpense(e)}
                              className="flex-1 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-teal-200"
                            >
                              <EditIcon className="w-3.5 h-3.5" />
                              <span>Edit Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(e.id, e.title)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer transition-all border border-rose-200"
                              title="Delete Item"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: DEDICATED FULL-PAGE MEDICAL COLLEGE LLM COPILOT */}
          {/* ========================================================================= */}
          {currentTab === 'llm_copilot' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-teal-700/20">
                    <BotIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Medical College LLM AI Assistant
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real-time interactive intelligence over 100 students, fee defaults, and campus finances.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAICopilotOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Open Dedicated Side Panel →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div
                  onClick={() => setIsAICopilotOpen(true)}
                  className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/50 cursor-pointer transition-all"
                >
                  <div className="font-bold text-sm text-teal-900 flex items-center gap-2">
                    <span>📊</span> 30 Severe Defaulters
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Instant breakdown of the 30 students with 4+ months of unpaid tuition fees.
                  </p>
                </div>

                <div
                  onClick={() => setIsAICopilotOpen(true)}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 cursor-pointer transition-all"
                >
                  <div className="font-bold text-sm text-amber-900 flex items-center gap-2">
                    <span>🗓️</span> 35 Students With Missed Months
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Specific month-by-month analysis (March, August, etc.) for partial payers.
                  </p>
                </div>

                <div
                  onClick={() => setIsAICopilotOpen(true)}
                  className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50 cursor-pointer transition-all"
                >
                  <div className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                    <span>📝</span> Defaulter Notice Generation
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Official warning letters, SMS alerts, and PMDC exam clearance verification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 10: FINANCIAL AUDIT & REPORTS */}
          {/* ========================================================================= */}
          {currentTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Executive Audit Report for Academic Council & PMDC
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comprehensive reconciliation of tuition income, scholarships, faculty salaries, and lab costs
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span>Print Official Audit Report</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Gross Expected Annual</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    Rs. {(summary.totalExpectedAnnual / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-700">Actual Realized Revenue</div>
                  <div className="text-lg font-black text-emerald-800 mt-1">
                    Rs. {(summary.totalPaidAnnual / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                  <div className="text-xs font-semibold text-rose-700">Uncollected Outstanding</div>
                  <div className="text-lg font-black text-rose-800 mt-1">
                    Rs. {(summary.totalOutstanding / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                  <div className="text-xs font-semibold text-teal-700">Scholarship Subsidies</div>
                  <div className="text-lg font-black text-teal-800 mt-1">
                    Rs. {(summary.totalConcessionsGranted / 1000000).toFixed(2)}M
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>

      {/* Floating Success Notification Toast */}
      {paymentSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-600 flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircleIcon className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{paymentSuccessToast}</span>
          <button onClick={() => setPaymentSuccessToast(null)} className="ml-2 text-emerald-200 hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Student 2-Year Detailed Ledger Modal */}
      <div className="print:hidden">
        <StudentLedgerModal
          student={selectedStudentForLedger}
          onClose={() => setSelectedStudentForLedger(null)}
          onCollectFee={openFeeCollectionForStudent}
          onPrintStatement={(student) => setReceiptData({ student })}
          onQuickPayMonth={handleQuickPayMonth}
          onQuickPayFeeHead={handleQuickPayFeeHead}
          onUpdateStudent={handleUpdateStudent}
          onDeleteStudent={handleDeleteStudent}
          userRole={userRole}
          isPrincipalUnlocked={isPrincipalUnlocked}
          onRequestPrincipalUnlock={() => handleRequestPrincipalUnlock('students', 'Principal Authorization Required')}
        />
      </div>

      {/* Receive Fee / Payment Counter Modal */}
      {isReceiveFeeOpen && (
        <div className="print:hidden">
          <ReceiveFeeModal
            students={students}
            preselectedStudent={studentForReceiveFee}
            onClose={() => setIsReceiveFeeOpen(false)}
            onPaymentSuccess={handlePaymentSuccess}
            onUpdateStudent={handleUpdateStudent}
            onOpenAdmissionForm={() => setIsAdmissionFormOpen(true)}
            userRole={userRole}
            isPrincipalUnlocked={isPrincipalUnlocked}
            onRequestPrincipalUnlock={() => handleRequestPrincipalUnlock('students', 'Principal Authorization Required')}
          />
        </div>
      )}

      {/* Harmain College of Health Sciences (Kahuta) Admission Form Modal */}
      <AdmissionFormModal
        isOpen={isAdmissionFormOpen}
        onClose={() => setIsAdmissionFormOpen(false)}
        onSaveStudent={handleSaveNewStudent}
        college={currentCollege}
        totalStudentsCount={students.length}
        students={students}
      />

      {/* Official Printable Receipt & Ledger Slip Modal */}
      {receiptData && (
        <PrintReceiptModal
          transaction={receiptData.transaction}
          student={receiptData.student}
          college={currentCollege}
          onClose={() => setReceiptData(null)}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}

      {/* Medical College LLM AI Copilot Drawer */}
      <div className="print:hidden">
        <AICopilotDrawer
          isOpen={isAICopilotOpen}
          onClose={() => setIsAICopilotOpen(false)}
          students={students}
          faculty={faculty}
          expenses={expenses}
          onNavigateTab={(tab, query) => {
            setCurrentTab(tab);
            if (query) setGlobalSearch(query);
          }}
          onSelectStudent={(student) => setSelectedStudentForLedger(student)}
        />
      </div>

      {/* Expense Modal (Add / Edit Lab & Campus Expenses) */}
      <div className="print:hidden">
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          mode={expenseModalMode}
          expenseToEdit={selectedExpenseToEdit}
          onClose={() => setIsExpenseModalOpen(false)}
          onSave={handleSaveExpense}
        />
      </div>

      {/* Official Lab / Department & Category Inventory Print & PDF Modal */}
      <PrintInventoryReportModal
        isOpen={isPrintInventoryModalOpen}
        onClose={() => setIsPrintInventoryModalOpen(false)}
        expenses={expenses}
        college={currentCollege}
        initialDepartment={expenseDepartmentFilter}
        initialCategory={expenseCategoryFilter}
      />

      {/* Faculty Payroll, Attendance & Advance Loan Edit Modal */}
      <FacultySalaryModal
        isOpen={isFacultyModalOpen}
        mode={facultyModalMode}
        totalFacultyCount={faculty.length}
        facultyMember={selectedFacultyForEdit}
        departments={facultyDepartments}
        medicalTerms={facultyTerms}
        onAddDepartment={handleAddDepartment}
        onEditDepartment={handleEditDepartment}
        onDeleteDepartment={handleDeleteDepartment}
        onResetDepartments={handleResetDepartments}
        onAddTerm={handleAddTerm}
        onEditTerm={handleEditTerm}
        onDeleteTerm={handleDeleteTerm}
        onResetTerms={handleResetTerms}
        onClose={() => {
          setIsFacultyModalOpen(false);
          setSelectedFacultyForEdit(null);
        }}
        onSave={handleSaveFaculty}
        onDelete={handleDeleteFaculty}
      />

      {/* Main Page Standalone Manage Departments & Terms Modal */}
      <ManageFacultyCategoriesModal
        isOpen={isManageFacultyCategoriesOpen}
        onClose={() => setIsManageFacultyCategoriesOpen(false)}
        departments={facultyDepartments}
        medicalTerms={facultyTerms}
        onAddDepartment={handleAddDepartment}
        onEditDepartment={handleEditDepartment}
        onDeleteDepartment={handleDeleteDepartment}
        onAddTerm={handleAddTerm}
        onEditTerm={handleEditTerm}
        onDeleteTerm={handleDeleteTerm}
        onResetDepartments={handleResetDepartments}
        onResetTerms={handleResetTerms}
        initialTab={manageFacultyCategoriesInitialTab}
      />

      {/* Official Faculty Salary Pay Slip & Full Register Print/PDF Modal */}
      <PrintSalarySlipModal
        isOpen={isPrintSalarySlipModalOpen}
        onClose={() => {
          setIsPrintSalarySlipModalOpen(false);
          setSelectedFacultyForPaySlip(null);
        }}
        facultyMember={selectedFacultyForPaySlip}
        allFaculty={faculty}
        college={currentCollege}
      />

      {/* College Academic Programs & Fee Structures Management Modal */}
      <ManageProgramsModal
        isOpen={isManageProgramsModalOpen}
        onClose={() => setIsManageProgramsModalOpen(false)}
        programs={collegePrograms}
        onSavePrograms={handleSavePrograms}
        onResetToDefaults={handleResetPrograms}
      />



      {/* Principal Security Lock Modal (PIN Code Authentication) */}
      <div className="print:hidden">
        <PrincipalLockModal
          isOpen={isPrincipalLockModalOpen}
          targetTabLabel={pendingPrincipalTargetLabel}
          collegeId={currentCollege.id}
          defaultPin={activeCollegeAccount?.principalPin || '1234'}
          onClose={() => {
            setIsPrincipalLockModalOpen(false);
            setPendingPrincipalTargetTab(null);
            setPendingPrincipalTargetLabel(undefined);
          }}
          onSuccess={handlePrincipalUnlockSuccess}
        />
      </div>

      {/* Native-like Mobile Bottom Navigation Bar (Hidden during printing and on desktop) */}
      <div className="print:hidden">
        <MobileBottomNav
          currentTab={currentTab}
          onTabChange={(tab) => {
            if (['dashboard', 'faculty', 'expenses', 'fee_structure'].includes(tab) && !isPrincipalUnlocked) {
              handleRequestPrincipalUnlock(tab, tab.toUpperCase());
            } else {
              setCurrentTab(tab);
            }
          }}
          onOpenReceiveFee={() => {
            setStudentForReceiveFee(null);
            setIsReceiveFeeOpen(true);
          }}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          defaultersCount={allDefaulters.length}
        />
      </div>
    </div>
  );
}

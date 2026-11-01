import { Student, MonthlyFeeRecord, FeeHeadItem, FacultyStaff, Expense, PaymentTransaction, InstitutionMode, CollegeTenant, CollegeTenantAccount, SuperAdminUser } from './types';
export * from './types';

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const YEARS = [2026, 2027, 2028];
export const ACADEMIC_YEARS = ['Year 1', 'Year 2'] as const;

export interface AcademicMonthDef {
  shortMonth: string;
  year: number;
  monthName: string;
  academicYear: 'Year 1' | 'Year 2';
  sessionName: string;
  monthOrder: number;
}

// Academic session starts in September 2026 (Year 1: Sep 2026 - Aug 2027, Year 2: Sep 2027 - Aug 2028)
export const ACADEMIC_CYCLE_MONTHS: AcademicMonthDef[] = [
  // Year 1 (Session 2026 - 2027): Sep 2026 to Aug 2027
  { shortMonth: 'Sep', year: 2026, monthName: 'Sep 2026', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 0 },
  { shortMonth: 'Oct', year: 2026, monthName: 'Oct 2026', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 1 },
  { shortMonth: 'Nov', year: 2026, monthName: 'Nov 2026', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 2 },
  { shortMonth: 'Dec', year: 2026, monthName: 'Dec 2026', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 3 },
  { shortMonth: 'Jan', year: 2027, monthName: 'Jan 2027', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 4 },
  { shortMonth: 'Feb', year: 2027, monthName: 'Feb 2027', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 5 },
  { shortMonth: 'Mar', year: 2027, monthName: 'Mar 2027', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 6 },
  { shortMonth: 'Apr', year: 2027, monthName: 'Apr 2027', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 7 },
  { shortMonth: 'May', year: 2027, monthName: 'May 2027', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 8 },
  { shortMonth: 'Jun', year: 2027, monthName: 'Jun 2027', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 9 },
  { shortMonth: 'Jul', year: 2027, monthName: 'Jul 2027', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 10 },
  { shortMonth: 'Aug', year: 2027, monthName: 'Aug 2027', academicYear: 'Year 1', sessionName: '2026-27', monthOrder: 11 },

  // Year 2 (Session 2027 - 2028): Sep 2027 to Aug 2028
  { shortMonth: 'Sep', year: 2027, monthName: 'Sep 2027', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 0 },
  { shortMonth: 'Oct', year: 2027, monthName: 'Oct 2027', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 1 },
  { shortMonth: 'Nov', year: 2027, monthName: 'Nov 2027', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 2 },
  { shortMonth: 'Dec', year: 2027, monthName: 'Dec 2027', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 3 },
  { shortMonth: 'Jan', year: 2028, monthName: 'Jan 2028', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 4 },
  { shortMonth: 'Feb', year: 2028, monthName: 'Feb 2028', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 5 },
  { shortMonth: 'Mar', year: 2028, monthName: 'Mar 2028', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 6 },
  { shortMonth: 'Apr', year: 2028, monthName: 'Apr 2028', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 7 },
  { shortMonth: 'May', year: 2028, monthName: 'May 2028', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 8 },
  { shortMonth: 'Jun', year: 2028, monthName: 'Jun 2028', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 9 },
  { shortMonth: 'Jul', year: 2028, monthName: 'Jul 2028', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 10 },
  { shortMonth: 'Aug', year: 2028, monthName: 'Aug 2028', academicYear: 'Year 2', sessionName: '2027-28', monthOrder: 11 },
];

export const INITIAL_COLLEGES: CollegeTenant[] = [
  {
    id: 'college_hchs_kht',
    code: 'HCHS-KHT',
    name: 'Harmain College of Health Sciences',
    city: 'Kahuta',
    tagline: 'Teaching Hospital & Health Sciences Academy',
    recognizedBy: 'Affiliated with UHS & PMDC Recognized',
    themeColor: 'teal',
    establishedYear: 1998,
  },
  {
    id: 'college_rihs_isb',
    code: 'RIHS-ISB',
    name: 'Rawal Institute of Health Sciences',
    city: 'Islamabad',
    tagline: 'Federal Campus & Advanced Clinical Research',
    recognizedBy: 'Affiliated with SZABMU & PMDC Recognized',
    themeColor: 'blue',
    establishedYear: 2005,
  },
  {
    id: 'college_kmc_psw',
    code: 'KMC-PSW',
    name: 'Khyber College of Health Sciences',
    city: 'Peshawar',
    tagline: 'Postgraduate Medical Complex & Dental Hospital',
    recognizedBy: 'Affiliated with KMU & PMDC Recognized',
    themeColor: 'emerald',
    establishedYear: 2012,
  },
];

export const SUPER_ADMIN_DEFAULT: SuperAdminUser = {
  email: 'admin@campusmaster.edu',
  name: 'Chief SaaS Administrator',
  role: 'SUPER_ADMIN',
};

export const INITIAL_COLLEGE_ACCOUNTS: CollegeTenantAccount[] = [
  {
    id: 'college_hchs_kht',
    code: 'HCHS-KHT',
    name: 'Harmain College of Health Sciences',
    city: 'Kahuta',
    tagline: 'Teaching Hospital & Health Sciences Academy',
    recognizedBy: 'Affiliated with UHS & PMDC Recognized',
    themeColor: 'teal',
    establishedYear: 1998,
    email: 'admin@hchs.edu.pk',
    password: 'hchs123',
    principalPin: '1234',
    status: 'ACTIVE',
    contactPhone: '+92 51 3311792',
    adminName: 'Prof. Dr. Tariq Mansoor',
    createdAt: '2024-01-10',
  },
  {
    id: 'college_rihs_isb',
    code: 'RIHS-ISB',
    name: 'Rawal Institute of Health Sciences',
    city: 'Islamabad',
    tagline: 'Federal Campus & Advanced Clinical Research',
    recognizedBy: 'Affiliated with SZABMU & PMDC Recognized',
    themeColor: 'blue',
    establishedYear: 2005,
    email: 'director@rihs.edu.pk',
    password: 'rihs123',
    principalPin: '1234',
    status: 'ACTIVE',
    contactPhone: '+92 51 9204567',
    adminName: 'Dr. Shahida Parveen',
    createdAt: '2024-03-15',
  },
  {
    id: 'college_kmc_psw',
    code: 'KMC-PSW',
    name: 'Khyber College of Health Sciences',
    city: 'Peshawar',
    tagline: 'Postgraduate Medical Complex & Dental Hospital',
    recognizedBy: 'Affiliated with KMU & PMDC Recognized',
    themeColor: 'emerald',
    establishedYear: 2012,
    email: 'principal@kmc-health.edu.pk',
    password: 'kmc123',
    principalPin: '1234',
    status: 'ACTIVE',
    contactPhone: '+92 91 5841234',
    adminName: 'Prof. Dr. Zahid Afridi',
    createdAt: '2024-06-20',
  },
];

export const DEFAULT_ACTIVE_ACADEMIC_MONTH_NAME = 'Sep 2026';
export const DEFAULT_ACTIVE_ACADEMIC_MONTH_INDEX = -1; // -1 = Academic session starting/admission stage; no months elapsed yet, all upcoming

export function getCollegeStorageKey(collegeId: string, entity: string): string {
  const normId = (collegeId === 'college_pmc_lhr' || collegeId === 'college_aimc_kht' || collegeId === 'college_hbs_kht') ? 'college_hchs_kht' : collegeId;
  if (entity === 'faculty' || entity === 'expenses') {
    return `pmc_${normId}_${entity}_v16_clean`;
  }
  return `pmc_${normId}_${entity}_v12_clean`;
}

export const INITIAL_STUDENTS: Student[] = [];

export function normalizeStudentAcademicCycle(student: Student, activeMonthIndex: number = DEFAULT_ACTIVE_ACADEMIC_MONTH_INDEX): Student {
  if (!student) return student;

  const effectiveMonthlyFee = student.monthlyFee * (1 - (student.concessionPercent || 0) / 100);
  const oldFees = student.monthlyFees || [];

  // Determine the latest paid or partially paid month index across the 24-month timeline
  const paidIndices = ACADEMIC_CYCLE_MONTHS.map((mDef, idx) => {
    const oldRec = oldFees.find((m) => m.monthName === mDef.monthName) || oldFees[idx];
    return oldRec && (oldRec.status === 'PAID' || oldRec.status === 'PARTIAL' || (oldRec.paidAmount || 0) > 0) ? idx : -1;
  }).filter((idx) => idx >= 0);

  const latestPaidMonthIndex = paidIndices.length > 0 ? Math.max(...paidIndices) : -1;

  const newMonthlyFees: MonthlyFeeRecord[] = ACADEMIC_CYCLE_MONTHS.map((mDef, idx) => {
    // Preserve paid/partial status if present in existing record
    const oldRec = oldFees.find((m) => m.monthName === mDef.monthName) || oldFees[idx];
    const isPaid = oldRec?.status === 'PAID';
    const isPartial = oldRec?.status === 'PARTIAL';
    
    let status: 'PAID' | 'DUE' | 'PARTIAL' | 'WAIVED' | 'UPCOMING' = 'UPCOMING';
    let paidAmount = 0;

    if (isPaid) {
      status = 'PAID';
      paidAmount = oldRec.paidAmount || effectiveMonthlyFee;
    } else if (isPartial) {
      status = 'PARTIAL';
      paidAmount = oldRec.paidAmount || Math.round(effectiveMonthlyFee * 0.5);
    } else {
      // Unpaid month:
      // 1. If this month is BEFORE the latest month the student has already paid (idx < latestPaidMonthIndex),
      //    it was SKIPPED / MISSED, so it is automatically OVERDUE (DUE)!
      // 2. If the active calendar timeline has reached this month (activeMonthIndex >= 0 && idx <= activeMonthIndex), it is DUE.
      // 3. If previously explicitly marked DUE, it remains DUE.
      const isSkippedPastMonth = latestPaidMonthIndex >= 0 && idx < latestPaidMonthIndex;
      const isElapsedCalendarMonth = activeMonthIndex >= 0 && idx <= activeMonthIndex;
      const wasExplicitlyDue = oldRec?.status === 'DUE';

      if (isSkippedPastMonth || isElapsedCalendarMonth || wasExplicitlyDue) {
        status = 'DUE';
      } else {
        status = 'UPCOMING';
      }
      paidAmount = 0;
    }

    return {
      monthIndex: idx,
      monthName: mDef.monthName,
      shortMonth: mDef.shortMonth,
      academicYear: mDef.academicYear,
      year: mDef.year,
      originalAmount: student.monthlyFee,
      concessionAmount: student.monthlyFee * ((student.concessionPercent || 0) / 100),
      payableAmount: effectiveMonthlyFee,
      paidAmount,
      status,
      paidDate: isPaid ? (oldRec?.paidDate || `${mDef.year}-09-08`) : (isPartial ? (oldRec?.paidDate || `${mDef.year}-09-15`) : undefined),
      paymentMethod: isPaid || isPartial ? (oldRec?.paymentMethod || 'BANK_TRANSFER') : undefined,
      transactionRef: isPaid || isPartial ? (oldRec?.transactionRef || `TXN-${mDef.year}-${student.studentNo || 'STD'}-09`) : undefined,
    };
  });

  const totalTuitionPayable = newMonthlyFees.reduce((acc, m) => acc + m.payableAmount, 0);
  const totalTuitionPaid = newMonthlyFees.reduce((acc, m) => acc + m.paidAmount, 0);
  const feeHeads = (student.feeHeads || []).map((fh) => ({
    ...fh,
    // Fee heads for active newly admitted students start as UPCOMING unless paid or marked
    status: (fh.status === 'PAID' ? 'PAID' : (activeMonthIndex >= 0 && fh.status === 'DUE' ? 'DUE' : 'UPCOMING')) as 'PAID' | 'DUE' | 'PARTIAL' | 'UPCOMING',
  }));
  const totalHeadsPayable = feeHeads.reduce((acc, f) => acc + f.amount, 0);
  const totalHeadsPaid = feeHeads.reduce((acc, f) => acc + f.paidAmount, 0);
  const overdueMonthlyFees = newMonthlyFees.filter((m) => m.status === 'DUE' || m.status === 'PARTIAL');
  const pendingFeeHeads = feeHeads.filter((f) => f.status === 'DUE' || f.status === 'PARTIAL');
  const currentOverdueAmount = overdueMonthlyFees.reduce((sum, m) => sum + (m.payableAmount - m.paidAmount), 0) +
    pendingFeeHeads.reduce((sum, fh) => sum + (fh.amount - fh.paidAmount), 0);
  const upcomingMonthsCount = newMonthlyFees.filter((m) => m.status === 'UPCOMING').length;

  return {
    ...student,
    monthlyFees: newMonthlyFees,
    feeHeads,
    totalExpectedAnnual: totalTuitionPayable + totalHeadsPayable,
    totalPaidAnnual: totalTuitionPaid + totalHeadsPaid,
    totalOutstandingAnnual: (totalTuitionPayable + totalHeadsPayable) - (totalTuitionPaid + totalHeadsPaid),
    unpaidMonthsCount: overdueMonthlyFees.length,
    unpaidMonthNames: overdueMonthlyFees.map((m) => m.monthName),
    currentOverdueAmount,
    upcomingMonthsCount,
  };
}

export const INITIAL_FACULTY: FacultyStaff[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [];

// Helper calculations
export function calculateFinancialSummary(students: Student[], faculty: FacultyStaff[], expenses: Expense[], activeMonth: string = DEFAULT_ACTIVE_ACADEMIC_MONTH_NAME) {
  const totalStudents = students.length; // 100
  
  // Total expected 2-year fee across all students
  const totalExpectedAnnual = students.reduce((acc, s) => acc + s.totalExpectedAnnual, 0);
  const totalPaidAnnual = students.reduce((acc, s) => acc + s.totalPaidAnnual, 0);
  const totalOutstanding = students.reduce((acc, s) => acc + s.totalOutstandingAnnual, 0);
  const totalOverdueArrears = students.reduce((acc, s) => acc + (s.currentOverdueAmount || 0), 0);
  
  // Current active billing month (Default: September 2026)
  const currentMonthName = activeMonth;
  
  const getActiveMonthRecord = (s: Student) => 
    s.monthlyFees.find(m => m.monthName === currentMonthName) || 
    s.monthlyFees.find(m => m.year === 2026 && (m.shortMonth === 'Oct' || m.monthName.includes('Oct'))) ||
    s.monthlyFees[1] ||
    s.monthlyFees[0];

  const currentMonthPaidStudents = students.filter(s => {
    const rec = getActiveMonthRecord(s);
    return rec && rec.status === 'PAID';
  });
  const currentMonthPendingStudents = students.filter(s => {
    const rec = getActiveMonthRecord(s);
    return rec && rec.status === 'DUE';
  });
  const currentMonthPartialStudents = students.filter(s => {
    const rec = getActiveMonthRecord(s);
    return rec && rec.status === 'PARTIAL';
  });

  const currentMonthExpected = students.reduce((acc, s) => {
    const rec = getActiveMonthRecord(s);
    return acc + (rec ? rec.payableAmount : 0);
  }, 0);
  const currentMonthCollected = students.reduce((acc, s) => {
    const rec = getActiveMonthRecord(s);
    return acc + (rec ? rec.paidAmount : 0);
  }, 0);
  const currentMonthOutstanding = currentMonthExpected - currentMonthCollected;

  // Defaulters analysis: based on active overdue months
  // Students with 1 missed month
  const studentsWithMissedMonths = students.filter(s => s.unpaidMonthsCount === 1);
  // Chronic / severe defaulters (2+ overdue months in current session)
  const chronicDefaulters = students.filter(s => s.unpaidMonthsCount >= 2);

  // Total concessions
  const totalConcessionsGranted = students.reduce((acc, s) => {
    return acc + s.monthlyFees.reduce((mAcc, m) => mAcc + m.concessionAmount, 0);
  }, 0);

  // Faculty total payroll
  const totalFacultyMonthlyPayroll = faculty.reduce((acc, f) => acc + f.netSalary, 0);
  const paidFacultyPayroll = faculty.filter(f => f.salaryStatus === 'PAID').reduce((acc, f) => acc + f.netSalary, 0);
  const pendingFacultyPayroll = totalFacultyMonthlyPayroll - paidFacultyPayroll;

  // Total monthly expenses
  const totalMonthlyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return {
    totalStudents,
    currentMonthName,
    currentMonthPaidCount: currentMonthPaidStudents.length,
    currentMonthPendingCount: currentMonthPendingStudents.length,
    currentMonthPartialCount: currentMonthPartialStudents.length,
    currentMonthExpected,
    currentMonthCollected,
    currentMonthOutstanding,
    collectionRateMonth: (currentMonthCollected / currentMonthExpected) * 100,
    totalExpectedAnnual,
    totalPaidAnnual,
    totalOutstanding,
    totalOverdueArrears,
    totalConcessionsGranted,
    studentsWithMissedMonthsCount: studentsWithMissedMonths.length,
    chronicDefaultersCount: chronicDefaulters.length,
    totalFacultyMonthlyPayroll,
    paidFacultyPayroll,
    pendingFacultyPayroll,
    totalMonthlyExpenses,
    netSurplusMonthly: currentMonthCollected - (paidFacultyPayroll + totalMonthlyExpenses)
  };
}

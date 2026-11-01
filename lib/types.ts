export type InstitutionMode = 'medical_college' | 'medical_school' | 'school';

export type UserRole = 'PRINCIPAL' | 'RECEPTIONIST';

export type PortalMode = 'SAAS_LANDING' | 'PORTAL_LOGIN' | 'SUPER_ADMIN' | 'COLLEGE_PORTAL';

export interface CollegeTenant {
  id: string;
  code: string;
  name: string;
  city: string;
  tagline: string;
  recognizedBy: string;
  themeColor?: string;
  establishedYear?: number;
}

export interface CollegeTenantAccount extends CollegeTenant {
  email: string;
  password: string;
  principalPin: string;
  status: 'ACTIVE' | 'SUSPENDED';
  contactPhone?: string;
  adminName?: string;
  createdAt?: string;
}

export interface SuperAdminUser {
  email: string;
  name: string;
  role: 'SUPER_ADMIN';
}

export type FeeStatus = 'PAID' | 'DUE' | 'PARTIAL' | 'WAIVED' | 'UPCOMING';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'ONLINE_PORTAL' | 'CHEQUE';

export interface MonthlyFeeRecord {
  monthIndex: number; // 0 to 23 (12 months per year across 2 years)
  monthName: string;  // e.g. 'Jan 2025' or 'Jan'
  shortMonth?: string; // 'Jan', 'Feb', etc.
  academicYear?: 'Year 1' | 'Year 2' | string;
  year: number;       // 2025 or 2026
  originalAmount: number;
  concessionAmount: number;
  payableAmount: number;
  paidAmount: number;
  status: FeeStatus;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
}

export interface FeeHeadItem {
  id: string;
  title: string;
  code: string;
  category: 'Admission' | 'Academic' | 'Examination' | 'Clinical' | 'Administrative' | 'Certificate / Diploma' | 'Card' | string;
  amount: number;
  paidAmount: number;
  status: FeeStatus;
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
}

export interface AcademicQualification {
  exam: string;
  year: string;
  grade: string;
  board: string;
  marks?: string;
}

export interface AttachedDocument {
  id: string;
  title: string;
  fileName?: string;
  fileData?: string;
  isAttached: boolean;
  uploadedAt?: string;
}

export interface Student {
  id: string;
  studentNo: string;
  applicationFormNo?: string; // Harmain College of Health Sciences Admission Form #
  name: string;
  fatherName: string;
  program: string;
  batch: string;
  yearLevel: string; // e.g., '1st Year', '2nd Year', etc.
  phone: string;
  email: string;
  gender: 'Male' | 'Female';
  status: 'ACTIVE' | 'SUSPENDED' | 'ON_LEAVE' | 'GRADUATED';
  cnic?: string; // National Identity Card / B-Form #
  dob?: string; // Date of Birth
  domicile?: string;
  nationality?: string;
  religion?: string;
  photoUrl?: string; // Soft copy passport photo
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianAddress?: string;
  emergencyContactPerson?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  emergencyAddress?: string;
  academicQualifications?: AcademicQualification[];
  attachedDocuments?: AttachedDocument[];
  admissionDate?: string;
  admissionStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  remarks?: string;
  concessionType?: 'None' | 'Merit Scholarship' | 'Need Based' | 'Faculty Ward' | 'Kinship';
  concessionPercent: number;
  monthlyFee: number;
  monthlyFees: MonthlyFeeRecord[];
  feeHeads: FeeHeadItem[];
  pendingFeeHeadsCount: number;
  totalExpectedAnnual: number;
  totalPaidAnnual: number;
  totalOutstandingAnnual: number;
  unpaidMonthsCount: number;
  unpaidMonthNames: string[];
  currentOverdueAmount?: number;
  upcomingMonthsCount?: number;
}

export interface PaymentTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  studentNo: string;
  program: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNo: string;
  monthNames: string[];
  feeHeadTitles?: string[];
  itemizedBreakdown?: { description: string; amount: number; category?: string }[];
  collectedBy: string;
  note?: string;
}

export interface SalaryDeductionItem {
  id: string;
  title: string; // e.g., "Advance Salary Loan Installment", "Absenteeism Penalty", "Income Tax WHT"
  category: 'ADVANCE_SALARY' | 'ABSENTEEISM' | 'TAX' | 'PROVIDENT_FUND' | 'OTHER';
  amount: number;
  notes?: string;
}

export interface FacultyStaff {
  id: string;
  employeeNo: string;
  name: string;
  department: string;
  designation: string;
  subjectSpecialization?: string; // Subject taught e.g. "General Surgery", "Anatomy", "Pathology"
  teachingTerm?: string; // Medical term/year e.g. "1st Year MBBS", "Final Year MBBS", "BDS"
  joiningDate?: string; // Date of appointment
  employmentStatus?: 'ACTIVE' | 'RESIGNED' | 'ON_LEAVE' | 'TERMINATED'; // Active or Left/Resigned
  resignationDate?: string; // Date of departure
  resignationReason?: string; // Reason
  phone: string;
  email: string;
  cnic?: string;
  bankName?: string;
  accountNo?: string;

  // Monthly Attendance Tracking
  workingDays?: number; // Total working days in month (default: 30)
  presentDays?: number; // Days present (e.g. 28)
  absentDays?: number; // Unexcused absence days (e.g. 1)
  leaveDays?: number; // Approved casual/medical leaves (e.g. 1)
  halfDaysCount?: number; // Late arrivals (10:00 AM arrival at 12:00 PM / 2-3 hours late = Half Day)
  shiftTiming?: string; // Shift time (e.g. "10:00 AM - 04:00 PM")
  attendanceScore: number; // percentage (e.g. 96)

  // Earnings Breakdown
  basicSalary: number;
  houseRentAllowance?: number;
  medicalAllowance?: number;
  conveyanceAllowance?: number;
  specialAllowance?: number;
  allowances: number;
  grossSalary?: number; // basicSalary + allowances

  // Advance Salary / Loan Tracking System
  advanceTotalLoan?: number; // Total advance/loan taken (e.g. Rs. 500,000)
  advanceDeductionThisMonth?: number; // Monthly recovery installment (e.g. Rs. 50,000)
  advanceRemainingBalance?: number; // Remaining loan balance (e.g. Rs. 450,000)
  advanceReason?: string; // Reason / Purpose (e.g. "2 Months Advance Salary")

  // Deductions Breakdown
  absenteeismDeduction?: number; // Deduction for absent days
  halfDayDeduction?: number; // Deduction for late arrivals (half days)
  taxDeduction?: number; // Income Tax / WHT
  providentFundDeduction?: number; // PF / EOBI
  otherDeductions?: number; // Miscellaneous
  otherDeductionsNote?: string; // Explanation for other deductions
  deductionBreakdown?: SalaryDeductionItem[];

  deductions: number; // Total deductions sum
  netSalary: number; // grossSalary - deductions
  salaryStatus: 'PAID' | 'PENDING';
  paymentDate?: string;
  paymentMethod?: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE';
  transactionRef?: string;
  month?: string; // e.g. "September 2026"
}

export interface Expense {
  id: string;
  date: string;
  category: string; // Dynamic / User-defined custom category
  title: string;
  amount: number;
  department: string;
  approvedBy: string;
  paymentStatus: 'PAID' | 'PENDING';

  // Full Inventory Management Fields
  isInventoryItem?: boolean;
  itemCode?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  currentStock?: number;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'CONSUMED';
  supplier?: string;
  invoiceNo?: string;
  storageLocation?: string;
  minReorderLevel?: number;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    actionType?: 'filter_defaulters' | 'student_lookup' | 'analytics' | 'report';
    dataCount?: number;
    quickStats?: Record<string, string | number>;
  };
}

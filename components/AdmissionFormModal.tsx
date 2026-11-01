'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Student, MonthlyFeeRecord, FeeHeadItem, CollegeTenant } from '../lib/types';
import { PrinterIcon, CheckCircleIcon } from './Icons';
import { MONTH_NAMES, ACADEMIC_CYCLE_MONTHS } from '../lib/data';

interface AdmissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStudent: (newStudent: Student, shouldReceiveFee?: boolean) => void;
  college?: CollegeTenant;
  totalStudentsCount: number;
  students?: Student[];
}

// Helper to determine next HCHS roll number (HCHS-101, HCHS-102, HCHS-103...)
export function computeNextHchsAdmissionNo(students?: Student[]): string {
  let maxNum = 100;
  if (students && students.length > 0) {
    students.forEach((s) => {
      const no = s.studentNo || '';
      // Look for HCHS-101 or HBS-101 or AIMC-101
      const match = no.match(/(?:HCHS|HBS|AIMC)-(?:202\d-)?(\d+)/i) || no.match(/(?:HCHS|HBS|AIMC)-(\d+)/i);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    });
  }
  return `HCHS-${maxNum + 1}`;
}
export const computeNextAimcAdmissionNo = computeNextHchsAdmissionNo;
export const computeNextHbsAdmissionNo = computeNextHchsAdmissionNo;

export default function AdmissionFormModal({
  isOpen,
  onClose,
  onSaveStudent,
  college,
  totalStudentsCount,
  students,
}: AdmissionFormModalProps) {
  // Auto-computed Admission Number
  const autoAdmissionNo = useMemo(() => computeNextHchsAdmissionNo(students), [students, totalStudentsCount]);

  // Form Meta States
  const [admissionNo, setAdmissionNo] = useState(autoAdmissionNo);
  const [sessionYear, setSessionYear] = useState('2026-2028');
  const [courseName, setCourseName] = useState('F.Sc Medical Lab Technology (MLT)');

  // Affiliation / Registration Authority Checkmarks (FBISE, PMF, PPC, GOVT OF PUNJAB)
  const [selectedAffiliations, setSelectedAffiliations] = useState<string[]>(['FBISE']);

  // Photo Soft Copy (Base64)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Personal Particulars
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('2006-08-14');
  const [domicile, setDomicile] = useState('Rawalpindi');
  const [mobileNo, setMobileNo] = useState('');
  const [nationality, setNationality] = useState('Pakistani');
  const [religion, setReligion] = useState('Islam');
  const [cnic, setCnic] = useState('');
  const [cnicError, setCnicError] = useState<string | null>(null);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');

  // Guardian Details
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Father');
  const [guardianAddress, setGuardianAddress] = useState('');
  const [guardianMobile, setGuardianMobile] = useState('');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Father');
  const [emergencyAddress, setEmergencyAddress] = useState('');
  const [emergencyMobile, setEmergencyMobile] = useState('');

  // Academic Qualification
  const [matricYear, setMatricYear] = useState('2024');
  const [matricGrade, setMatricGrade] = useState('A+');
  const [matricBoard, setMatricBoard] = useState('FBISE Islamabad');
  const [matricMarks, setMatricMarks] = useState('980 / 1100');

  const [otherExam, setOtherExam] = useState('F.Sc Pre-Medical');
  const [otherYear, setOtherYear] = useState('');
  const [otherGrade, setOtherGrade] = useState('');
  const [otherBoard, setOtherBoard] = useState('');
  const [otherMarks, setOtherMarks] = useState('');

  // Required Documents Soft Copy Checklist
  const [docsChecklist, setDocsChecklist] = useState<{ [key: string]: { checked: boolean; fileName?: string; fileData?: string } }>({
    cnic: { checked: true, fileName: 'CNIC_Copy.pdf' },
    matric: { checked: true, fileName: 'Matric_Result_Card.jpg' },
    photos: { checked: true, fileName: '4x_Photos.jpg' },
    domicile: { checked: false },
    character: { checked: false },
  });

  // Financial / Fee Structure Setup
  const [monthlyFee, setMonthlyFee] = useState<number>(3500);
  const [admissionFee, setAdmissionFee] = useState<number>(35000);
  const [registrationFee, setRegistrationFee] = useState<number>(15000);
  const [studentCardFee, setStudentCardFee] = useState<number>(2000);

  // Office Use
  const [admissionStatus, setAdmissionStatus] = useState<'APPROVED' | 'PENDING' | 'REJECTED'>('APPROVED');
  const [remarks, setRemarks] = useState('Documents verified, eligible for admission on merit.');

  // Sync autoAdmissionNo when modal opens
  useEffect(() => {
    if (isOpen) {
      const freshNo = computeNextHchsAdmissionNo(students);
      setAdmissionNo(freshNo);
      setCnicError(null);
    }
  }, [isOpen, students]);

  if (!isOpen) return null;

  // Toggle Affiliation / Registration Badges
  const toggleAffiliation = (code: string) => {
    setSelectedAffiliations((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  };

  // Auto-format Pakistani CNIC / B-Form as XXXXX-XXXXXXX-X (13 digits)
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 13);
    let formatted = digits;
    if (digits.length > 5 && digits.length <= 12) {
      formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else if (digits.length > 12) {
      formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
    }
    setCnic(formatted);

    if (digits.length === 13) {
      const duplicateStudent = students?.find(
        (s) => s.cnic && s.cnic.replace(/\D/g, '') === digits
      );
      if (duplicateStudent) {
        setCnicError(`Duplicate ID Card! Yeh CNIC pehle se "${duplicateStudent.name}" (${duplicateStudent.studentNo} - ${duplicateStudent.program}) ke naam par darj hai. Double enrollment nahi ho sakti.`);
      } else {
        setCnicError(null);
      }
    } else if (digits.length > 0) {
      setCnicError(`Adhoora number: ${digits.length} / 13 digits (Pure 13 digits hona lazmi hain)`);
    } else {
      setCnicError('CNIC ya B-Form number lazmi hai!');
    }
  };

  // Helper to downscale and compress images to ~15KB so localStorage never exceeds quota
  const compressImage = (file: File, maxWidth = 250, maxHeight = 250, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Handle Photo Upload with Auto-Compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file, 250, 250, 0.7);
        setPhotoPreview(compressed);
      } else {
        alert('Barah-e-karam JPG ya PNG tasweer upload karein.');
      }
    }
  };

  // Handle Document Upload with Compression for images & metadata for PDFs
  const handleDocUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file, 350, 350, 0.6);
        setDocsChecklist((prev) => ({
          ...prev,
          [key]: {
            checked: true,
            fileName: file.name,
            fileData: compressed,
          },
        }));
      } else {
        setDocsChecklist((prev) => ({
          ...prev,
          [key]: {
            checked: true,
            fileName: file.name,
            fileData: undefined,
          },
        }));
      }
    }
  };

  const handleToggleCheck = (key: string) => {
    setDocsChecklist((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        checked: !prev[key]?.checked,
      },
    }));
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent, proceedToFee: boolean = false) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert('Barah-e-karam Student ka Full Name darj karein!');
      return;
    }

    // Strict 13-digit Pakistani CNIC / B-Form Validation
    const cnicDigits = cnic.replace(/\D/g, '');
    if (cnicDigits.length !== 13) {
      setCnicError('National Identity Card (CNIC / B-Form) ke pure 13 digits hona lazmi hain! (e.g. 37405-1234567-1)');
      alert('⚠️ Barah-e-karam Student ka pura 13-digit CNIC ya B-Form number darj karein!\nID Card / B-Form ke baghair admission save nahi ho sakta.');
      return;
    }

    // Duplicate Enrollment Protection: Check if this CNIC already exists in the system
    const existingDuplicate = students?.find(
      (s) => s.cnic && s.cnic.replace(/\D/g, '') === cnicDigits
    );
    if (existingDuplicate) {
      const errMsg = `⚠️ Double Enrollment Ki Ijazat Nahi Hai!\n\nYeh CNIC / B-Form number (${cnic}) pehle se system mein registered hai:\n• Student Name: ${existingDuplicate.name}\n• Roll / Admission No: ${existingDuplicate.studentNo}\n• Program: ${existingDuplicate.program}\n\nEk ID Card par do martaba admission nahi ho sakta. Barah-e-karam ID card number check karein ya purana student ledger open karein.`;
      setCnicError(`Duplicate ID Card! Pehle se "${existingDuplicate.name}" (${existingDuplicate.studentNo}) ke naam par darj hai.`);
      alert(errMsg);
      return;
    }

    // Generate 24-Month Fee Record (2 Years starting September 2026)
    // Newly admitted students start with all future months as UPCOMING (No overdue arrears)
    const monthlyFees: MonthlyFeeRecord[] = ACADEMIC_CYCLE_MONTHS.map((mDef, mIdx) => ({
      monthIndex: mIdx,
      monthName: mDef.monthName,
      shortMonth: mDef.shortMonth,
      academicYear: mDef.academicYear,
      year: mDef.year,
      originalAmount: monthlyFee,
      concessionAmount: 0,
      payableAmount: monthlyFee,
      paidAmount: 0,
      status: 'UPCOMING',
    }));

    // Standard Fee Heads (Payable at fee counter, not overdue on day 1 of admission)
    const feeHeads: FeeHeadItem[] = [
      {
        id: `adm_fee_${Date.now()}_1`,
        title: 'Admission Fee',
        code: 'ADM-01',
        category: 'Admission',
        amount: admissionFee,
        paidAmount: 0,
        status: 'UPCOMING',
        dueDate: '2026-09-30',
      },
      {
        id: `adm_fee_${Date.now()}_2`,
        title: 'Registration Fee',
        code: 'REG-02',
        category: 'Admission',
        amount: registrationFee,
        paidAmount: 0,
        status: 'UPCOMING',
        dueDate: '2026-09-30',
      },
      {
        id: `adm_fee_${Date.now()}_3`,
        title: 'Student ID Card & Portal Fee',
        code: 'CRD-11',
        category: 'Card',
        amount: studentCardFee,
        paidAmount: 0,
        status: 'UPCOMING',
        dueDate: '2026-09-30',
      },
    ];

    const totalTuitionPayable = monthlyFees.reduce((acc, curr) => acc + curr.payableAmount, 0);
    const totalFeeHeadsPayable = feeHeads.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpectedAnnual = totalTuitionPayable + totalFeeHeadsPayable;

    const assignedRoll = admissionNo.trim() || autoAdmissionNo;

    const newStudent: Student = {
      id: `std_${Date.now()}`,
      studentNo: assignedRoll,
      applicationFormNo: assignedRoll,
      name: fullName.trim(),
      fatherName: fatherName.trim() || 'Parent / Guardian',
      program: courseName,
      batch: `Batch ${sessionYear}`,
      yearLevel: '1st Year',
      phone: mobileNo.trim() || '+92 300 0000000',
      email: `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@hchs.edu.pk`,
      gender,
      status: 'ACTIVE',
      cnic: cnic.trim(),
      dob,
      domicile,
      nationality,
      religion,
      photoUrl: photoPreview || undefined,
      guardianName: guardianName.trim() || fatherName.trim(),
      guardianRelation,
      guardianPhone: guardianMobile.trim() || mobileNo.trim(),
      guardianAddress: guardianAddress.trim(),
      emergencyContactPerson: emergencyName.trim() || fatherName.trim(),
      emergencyRelation,
      emergencyPhone: emergencyMobile.trim() || mobileNo.trim(),
      emergencyAddress: emergencyAddress.trim() || guardianAddress.trim(),
      academicQualifications: [
        {
          exam: 'Matriculation',
          year: matricYear,
          grade: matricGrade,
          board: matricBoard,
          marks: matricMarks,
        },
        ...(otherYear
          ? [
              {
                exam: otherExam,
                year: otherYear,
                grade: otherGrade,
                board: otherBoard,
                marks: otherMarks,
              },
            ]
          : []),
      ],
      attachedDocuments: Object.entries(docsChecklist).map(([k, val]) => ({
        id: `doc_${k}`,
        title:
          k === 'cnic'
            ? 'CNIC / B-Form (4 copies)'
            : k === 'matric'
            ? 'Matric Result Card (4 copies)'
            : k === 'photos'
            ? 'Passport Size Photos (4 photos)'
            : k === 'domicile'
            ? 'Domicile Certificate'
            : 'Character Certificate',
        fileName: val.fileName,
        fileData: val.fileData,
        isAttached: val.checked,
      })),
      admissionDate: new Date().toISOString().split('T')[0],
      admissionStatus,
      remarks: `${remarks}${selectedAffiliations.length > 0 ? ` [Board: ${selectedAffiliations.join(', ')}]` : ''}`,
      concessionType: 'None',
      concessionPercent: 0,
      monthlyFee,
      monthlyFees,
      feeHeads,
      pendingFeeHeadsCount: 0,
      totalExpectedAnnual,
      totalPaidAnnual: 0,
      totalOutstandingAnnual: 0,
      unpaidMonthsCount: 0,
      unpaidMonthNames: [],
      currentOverdueAmount: 0,
      upcomingMonthsCount: monthlyFees.length,
    };

    onSaveStudent(newStudent, proceedToFee);
    onClose();
  };

  const handlePrintAdmissionForm = () => {
    window.print();
  };

  const cnicDigitsCount = cnic.replace(/\D/g, '').length;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. SCREEN INTERACTIVE MODAL (Hidden when printing via window.print)       */}
      {/* ========================================================================= */}
      <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-xs animate-fadeIn overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
          {/* Modal Top Bar (Responsive & Mobile App Optimized) */}
          <div className="p-3 sm:px-6 sm:py-4 bg-gradient-to-r from-red-900 via-rose-950 to-slate-900 text-white shrink-0 shadow-md">
            {/* Main Bar Row */}
            <div className="flex items-center justify-between gap-2">
              {/* Left Identity & Icon */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-base sm:text-xl shrink-0 shadow-inner">
                  📝
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xs sm:text-base font-extrabold text-white tracking-tight truncate sm:whitespace-normal">
                      <span className="sm:hidden">Student Admission Form</span>
                      <span className="hidden sm:inline">{college?.name || 'Harmain College of Health Sciences'} Admission Form</span>
                    </h2>
                    <span className="hidden md:inline-flex text-[11px] font-semibold text-rose-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                      Official Form & Student Ledger
                    </span>
                  </div>
                  <p className="hidden sm:block text-[11px] text-rose-200/90 truncate mt-0.5">
                    New Student Admission • 13-Digit CNIC Verification • Auto Roll #{autoAdmissionNo} • 2-Year Ledger Setup
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePrintAdmissionForm}
                  className="px-2.5 sm:px-3.5 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs border border-white/10"
                  title="Print Admission Form (Full Page PDF)"
                >
                  <PrinterIcon className="w-3.5 h-3.5 text-rose-300" />
                  <span className="hidden sm:inline">Print Form (Full Page PDF)</span>
                  <span className="sm:hidden font-medium">Print PDF</span>
                </button>
                <button
                  onClick={onClose}
                  type="button"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer active:scale-95 border border-white/10"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Mobile-only secondary badge info bar */}
            <div className="sm:hidden flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10 text-[10px] text-rose-200 flex-wrap">
              <span className="bg-rose-500/20 text-rose-100 font-bold px-2 py-0.5 rounded-md border border-rose-400/30">
                Roll #{autoAdmissionNo}
              </span>
              <span className="bg-white/10 text-rose-200 font-medium px-2 py-0.5 rounded-md truncate max-w-[170px]">
                {college?.name || 'Harmain College'}
              </span>
              <span className="text-rose-300/80">• 2-Year Ledger</span>
            </div>
          </div>

          {/* Scrollable Form Body */}
          <form
            onSubmit={(e) => handleSubmit(e, false)}
            className="p-3.5 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-xs"
          >
            {/* Official Letterhead Header */}
            <div className="border-b-2 border-red-800 pb-4 text-center relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
                <div>
                  <span className="font-bold text-red-800 text-[11px] tracking-wider uppercase block">
                    GOVERNMENT RECOGNIZED INSTITUTION
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Affiliated with FBISE, Punjab Medical Faculty (PMF), Punjab Pharmacy Council (PPC)
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
                    📞 051-3311792
                  </span>
                </div>
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-red-900 tracking-wide mt-2 uppercase">
                HARMAIN COLLEGE OF HEALTH SCIENCES
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Punjar Chowk Galla Stop, Kahuta, District Rawalpindi, Pakistan
              </p>

              {/* Clickable Registration Authority / Board Checkboxes */}
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-700 mb-1.5">
                  Registration / Affiliation Authority: (Click to Tick / Select)
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    { id: 'FBISE', label: 'FBISE' },
                    { id: 'PMF', label: 'PMF (Punjab Medical Faculty)' },
                    { id: 'PPC', label: 'PPC (Pharmacy Council)' },
                    { id: 'GOVT OF PUNJAB', label: 'GOVT OF PUNJAB' },
                  ].map((auth) => {
                    const isChecked = selectedAffiliations.includes(auth.id);
                    return (
                      <button
                        key={auth.id}
                        type="button"
                        onClick={() => toggleAffiliation(auth.id)}
                        className={`px-3 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-red-800 text-white shadow-sm ring-2 ring-red-400'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-xs font-black transition-all ${
                            isChecked ? 'bg-white text-red-900 shadow-xs' : 'border border-slate-400 bg-white text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <span>{auth.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Form Meta Row & Photo Paste Box */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="md:col-span-3 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Column 1: Enrollment / Admission No (Auto-Generated, Readonly) */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                      <span>Enrollment / Admission No *</span>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                        🔒 Auto Allot
                      </span>
                    </label>
                    <input
                      type="text"
                      value={admissionNo}
                      readOnly
                      className="w-full px-3 py-2 bg-indigo-50/70 border border-indigo-300 rounded-xl font-mono font-extrabold text-indigo-950 cursor-not-allowed select-all shadow-inner text-sm"
                    />
                    <span className="text-[10px] text-indigo-600 font-medium block mt-0.5">
                      Auto-allotted sequence ({admissionNo} onward)
                    </span>
                  </div>

                  {/* Column 2: Academic Session */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Academic Session / Year *
                    </label>
                    <input
                      type="text"
                      value={sessionYear}
                      onChange={(e) => setSessionYear(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                      placeholder="e.g. 2026-2028"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">2-Year Diploma Program</span>
                  </div>

                  {/* Column 3: Course / Program Name */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Course / Program Name *
                    </label>
                    <select
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-red-600"
                    >
                      <option value="F.Sc Medical Lab Technology (MLT)">F.Sc Medical Lab Technology (MLT)</option>
                      <option value="General Nursing / B.Sc Nursing">General Nursing / B.Sc Nursing</option>
                      <option value="Lady Health Visitor (LHV Nursing)">Lady Health Visitor (LHV Nursing)</option>
                      <option value="Certified Nursing Assistant (CNA)">Certified Nursing Assistant (CNA)</option>
                      <option value="Pharmacy Technician (Category-B)">Pharmacy Technician (Category-B)</option>
                      <option value="Operation Theater Technology (OTT)">Operation Theater Technology (OTT)</option>
                      <option value="Dispenser / Clinical Assistant">Dispenser / Clinical Assistant</option>
                      <option value="Radiography & Imaging Technology (RIT)">Radiography & Imaging Technology (RIT)</option>
                      <option value="Dental Hygiene & Tech (BDS Diploma)">Dental Hygiene & Tech (BDS Diploma)</option>
                      <option value="Doctor of Physical Therapy (DPT)">Doctor of Physical Therapy (DPT)</option>
                      <option value="MBBS Medical College Program">MBBS Medical College Program</option>
                      <option value="BDS Dental Surgery Program">BDS Dental Surgery Program</option>
                    </select>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Department Selection</span>
                  </div>
                </div>

                {/* Instructions banner */}
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <span className="text-base leading-none">✍️</span>
                  <div>
                    <b className="font-bold">Instructions for filling the Admission Form:</b> This form should be completed in FULL BLOCK LETTERS and submitted through proper channel to the Principal, Harmain College of Health Sciences (Kahuta).
                  </div>
                </div>
              </div>

              {/* Photo Paste Frame */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center">
                <div className="w-28 h-32 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs flex items-center justify-center relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 p-2">
                      <span className="text-3xl block">👤</span>
                      <span className="text-[10px] font-bold block mt-1">Photo Paste</span>
                      <span className="text-[8px] text-slate-400">(Passport Size)</span>
                    </div>
                  )}
                </div>

                <label className="mt-2 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors shadow-xs">
                  <span>📷 Upload Soft Copy</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="text-[9px] text-rose-600 hover:underline mt-1 font-semibold cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            {/* Required Documents Soft Copy Checklist */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                <span>📎 Required Documents Checklist & Soft Copy Uploads</span>
                <span className="text-[10px] font-normal text-slate-500">(Attach photocopies or soft copy PDF/JPG)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {/* CNIC / B-Form */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="checkbox"
                      checked={docsChecklist.cnic?.checked}
                      onChange={() => handleToggleCheck('cnic')}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>CNIC / B-Form (4 copies)</span>
                  </label>
                  <label className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 cursor-pointer">
                    {docsChecklist.cnic?.fileName ? '✓ Uploaded' : '📁 Upload'}
                    <input type="file" onChange={(e) => handleDocUpload('cnic', e)} className="hidden" />
                  </label>
                </div>

                {/* Matric Result Card */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="checkbox"
                      checked={docsChecklist.matric?.checked}
                      onChange={() => handleToggleCheck('matric')}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>Matric Result Card (4 copies)</span>
                  </label>
                  <label className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 cursor-pointer">
                    {docsChecklist.matric?.fileName ? '✓ Uploaded' : '📁 Upload'}
                    <input type="file" onChange={(e) => handleDocUpload('matric', e)} className="hidden" />
                  </label>
                </div>

                {/* Passport Photos */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="checkbox"
                      checked={docsChecklist.photos?.checked}
                      onChange={() => handleToggleCheck('photos')}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>Passport Size Photos (4 photos)</span>
                  </label>
                  <label className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 cursor-pointer">
                    {docsChecklist.photos?.fileName ? '✓ Uploaded' : '📁 Upload'}
                    <input type="file" onChange={(e) => handleDocUpload('photos', e)} className="hidden" />
                  </label>
                </div>

                {/* Domicile Certificate */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="checkbox"
                      checked={docsChecklist.domicile?.checked}
                      onChange={() => handleToggleCheck('domicile')}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>Domicile Certificate Copy</span>
                  </label>
                  <label className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 cursor-pointer">
                    {docsChecklist.domicile?.fileName ? '✓ Uploaded' : '📁 Upload'}
                    <input type="file" onChange={(e) => handleDocUpload('domicile', e)} className="hidden" />
                  </label>
                </div>

                {/* Character Certificate */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="checkbox"
                      checked={docsChecklist.character?.checked}
                      onChange={() => handleToggleCheck('character')}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>Character / Hope Certificate</span>
                  </label>
                  <label className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 cursor-pointer">
                    {docsChecklist.character?.fileName ? '✓ Uploaded' : '📁 Upload'}
                    <input type="file" onChange={(e) => handleDocUpload('character', e)} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Section 1: Personal Particulars */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span>👤 1. Student Personal Particulars</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Full Name (In Block Letters) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MUHAMMAD AHMAD"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold uppercase text-slate-900 focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Father Name (In Block Letters) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TARIQ MAHMOOD"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold uppercase text-slate-900 focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Domicile (District) *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rawalpindi"
                    value={domicile}
                    onChange={(e) => setDomicile(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile No *</label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nationality *</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Religion *</label>
                  <input
                    type="text"
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                  />
                </div>

                {/* MANDATORY 13-DIGIT CNIC / B-FORM INPUT */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                    <span>CNIC / B-Form # * (13 Digits)</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        cnicDigitsCount === 13
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {cnicDigitsCount} / 13 Digits
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="37405-1234567-1"
                    maxLength={15}
                    value={cnic}
                    onChange={handleCnicChange}
                    className={`w-full px-3 py-2 bg-white border rounded-xl font-mono font-bold text-slate-900 focus:ring-2 ${
                      cnicDigitsCount === 13
                        ? 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/20'
                        : cnicDigitsCount > 0
                        ? 'border-amber-400 focus:ring-amber-400'
                        : 'border-red-400 focus:ring-red-500'
                    }`}
                    required
                  />
                  {cnicError ? (
                    <span className="text-[10px] text-rose-600 font-bold block mt-1">
                      ⚠️ {cnicError}
                    </span>
                  ) : cnicDigitsCount === 13 ? (
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                      ✅ Valid 13-digit Pakistani CNIC / B-Form
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Format: 37405-1234567-1 (Pakistani ID Card)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Guardian & Emergency Contacts */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span>👨‍👩‍👧 2. Guardian & Emergency Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Name of Guardian</label>
                  <input
                    type="text"
                    placeholder="e.g. Tariq Mahmood"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Relationship</label>
                  <input
                    type="text"
                    placeholder="Father / Uncle / Brother"
                    value={guardianRelation}
                    onChange={(e) => setGuardianRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Guardian Mobile No</label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={guardianMobile}
                    onChange={(e) => setGuardianMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Permanent Residential Address</label>
                <input
                  type="text"
                  placeholder="House No, Street, Mohallah / Sector, Tehsil Kahuta, Distt Rawalpindi"
                  value={guardianAddress}
                  onChange={(e) => setGuardianAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Emergency Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="Emergency contact"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Relationship</label>
                  <input
                    type="text"
                    placeholder="Father / Brother / Guardian"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Emergency Mobile No</label>
                  <input
                    type="text"
                    placeholder="0321-9876543"
                    value={emergencyMobile}
                    onChange={(e) => setEmergencyMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Academic Qualifications Table */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span>📚 3. Academic Qualifications (تعلیمی قابلیت)</span>
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Sr. #</th>
                      <th className="py-2.5 px-3">Examination Passed</th>
                      <th className="py-2.5 px-3">Passing Year</th>
                      <th className="py-2.5 px-3">Grade / Division</th>
                      <th className="py-2.5 px-3">Board / Institute</th>
                      <th className="py-2.5 px-3">Marks (Obt / Total)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-500">01</td>
                      <td className="py-2 px-3 font-extrabold text-slate-900">Matriculation (Science)</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={matricYear}
                          onChange={(e) => setMatricYear(e.target.value)}
                          className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={matricGrade}
                          onChange={(e) => setMatricGrade(e.target.value)}
                          className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={matricBoard}
                          onChange={(e) => setMatricBoard(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={matricMarks}
                          onChange={(e) => setMatricMarks(e.target.value)}
                          className="w-28 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-500">02</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={otherExam}
                          onChange={(e) => setOtherExam(e.target.value)}
                          placeholder="e.g. F.Sc Pre-Medical"
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={otherYear}
                          onChange={(e) => setOtherYear(e.target.value)}
                          placeholder="Year"
                          className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={otherGrade}
                          onChange={(e) => setOtherGrade(e.target.value)}
                          placeholder="Grade"
                          className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={otherBoard}
                          onChange={(e) => setOtherBoard(e.target.value)}
                          placeholder="Board"
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={otherMarks}
                          onChange={(e) => setOtherMarks(e.target.value)}
                          placeholder="Obt/Total"
                          className="w-28 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: 2-Year Fee Schedule & Heads Setup */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3">
              <h3 className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>💰 4. Student Fee Structure (2-Year Ledger Auto-Generation)</span>
                <span className="text-[10px] text-emerald-700 font-bold">24 Months Billing Schedule</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-emerald-900 font-bold mb-1">
                    Monthly Tuition Fee *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 font-bold text-emerald-800 text-xs">Rs.</span>
                    <input
                      type="number"
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-emerald-900"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">🔒 Tamam 24 mahinon par auto-lock hogi</span>
                </div>

                <div>
                  <label className="block text-emerald-900 font-bold mb-1">
                    Admission Fee Head
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 font-bold text-emerald-800 text-xs">Rs.</span>
                    <input
                      type="number"
                      value={admissionFee}
                      onChange={(e) => setAdmissionFee(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-emerald-900"
                    />
                  </div>
                  <span className="text-[10px] text-emerald-700">One-time entry fee</span>
                </div>

                <div>
                  <label className="block text-emerald-900 font-bold mb-1">
                    Registration Fee Head
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 font-bold text-emerald-800 text-xs">Rs.</span>
                    <input
                      type="number"
                      value={registrationFee}
                      onChange={(e) => setRegistrationFee(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-emerald-900"
                    />
                  </div>
                  <span className="text-[10px] text-emerald-700">Board/Council registration</span>
                </div>

                <div>
                  <label className="block text-emerald-900 font-bold mb-1">
                    Student Card Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 font-bold text-emerald-800 text-xs">Rs.</span>
                    <input
                      type="number"
                      value={studentCardFee}
                      onChange={(e) => setStudentCardFee(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-emerald-900"
                    />
                  </div>
                  <span className="text-[10px] text-emerald-700">Card & portal setup</span>
                </div>
              </div>
            </div>

            {/* Section 5: Declaration & For Office Use Only */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                DECLARATION & OFFICE USE ONLY
              </h3>

              <p className="text-[11px] text-slate-600 leading-relaxed italic">
                "I hereby solemnly declare that all the statements made in the above form are true and correct to the best of my knowledge and belief. I fully understand that if any information provided is found to be false or incorrect, the registration and admission of my son/daughter may be cancelled. I am keen for my son/daughter to be educated in Harmain College of Health Sciences, Kahuta and I hereby agree to abide by all the rules and regulations of the institution."
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Admission Decision *</label>
                  <select
                    value={admissionStatus}
                    onChange={(e) => setAdmissionStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="APPROVED">✅ Admission Approved</option>
                    <option value="PENDING">⏳ Under Verification / Pending</option>
                    <option value="REJECTED">❌ Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Principal / Admin Remarks</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Footer Submit Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-all"
              >
                Cancel
              </button>

              <div className="flex flex-wrap items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={handlePrintAdmissionForm}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <PrinterIcon className="w-4 h-4 text-rose-400" />
                  <span>Print Admission Form (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 transition-all"
                >
                  <span>💾 Save & Receive First Fee Now →</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-700/20 transition-all"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Save Student Record</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED OFFICIAL PRINTABLE ADMISSION FORM (VISIBLE ONLY IN PRINT)     */}
      {/* ========================================================================= */}
      <div className="hidden print:block w-full max-w-[210mm] mx-auto p-4 sm:p-6 bg-white text-black font-sans text-xs leading-normal">
        {/* Print Styling Fix for Whole Page Pagination */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              body {
                background: white !important;
                color: black !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-avoid-break {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
          `
        }} />

        {/* Letterhead Header */}
        <div className="border-b-2 border-red-900 pb-3 text-center print-avoid-break">
          <div className="flex items-center justify-between text-[10px] text-slate-700 mb-1">
            <span className="font-bold uppercase tracking-wider text-red-900">
              GOVERNMENT RECOGNIZED MEDICAL INSTITUTION
            </span>
            <span className="font-mono font-bold text-slate-900">
              Ph: 051-3311792 • Web: www.hchs.edu.pk
            </span>
          </div>

          <h1 className="text-2xl font-black text-red-900 tracking-wide uppercase">
            HARMAIN COLLEGE OF HEALTH SCIENCES
          </h1>
          <p className="text-[11px] font-semibold text-slate-700">
            Punjar Chowk Galla Stop, Kahuta, District Rawalpindi, Pakistan
          </p>
          <p className="text-[9px] text-slate-500 font-medium">
            Affiliated with Federal Board (FBISE), Punjab Medical Faculty (PMF) & Punjab Pharmacy Council (PPC)
          </p>

          {/* Affiliation Checkmarks Row */}
          <div className="flex items-center justify-center gap-4 mt-2 pt-1 border-t border-slate-300 text-[11px] font-bold">
            <span className="text-slate-600 font-medium text-[10px]">Affiliation / Council:</span>
            {['FBISE', 'PMF', 'PPC', 'GOVT OF PUNJAB'].map((code) => {
              const isChecked = selectedAffiliations.includes(code);
              return (
                <div key={code} className="flex items-center gap-1.5 border border-slate-700 px-2 py-0.5 rounded">
                  <span className="w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-black text-xs leading-none">
                    {isChecked ? '✓' : ''}
                  </span>
                  <span className={isChecked ? 'text-red-950 font-black' : 'text-slate-600'}>{code}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 inline-block bg-red-900 text-white px-5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            APPLICATION FOR ADMISSION • SESSION {sessionYear}
          </div>
        </div>

        {/* Top Meta Details & Photo Block */}
        <div className="grid grid-cols-4 gap-4 items-center my-3.5 pb-3 border-b border-slate-300 print-avoid-break">
          <div className="col-span-3 space-y-1.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-slate-400 p-2 rounded bg-slate-50">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">
                  Enrollment / Admission No:
                </span>
                <span className="text-sm font-black font-mono text-red-900">{admissionNo}</span>
              </div>
              <div className="border border-slate-400 p-2 rounded bg-slate-50">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">
                  Academic Session / Batch:
                </span>
                <span className="text-sm font-black text-slate-900">{sessionYear}</span>
              </div>
            </div>

            <div className="border border-slate-400 p-2 rounded">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">
                Program / Discipline Applied For:
              </span>
              <span className="text-xs font-extrabold text-slate-900">{courseName}</span>
            </div>
          </div>

          {/* Photo Frame */}
          <div className="col-span-1 flex justify-end">
            <div className="w-24 h-28 border-2 border-dashed border-slate-400 rounded flex items-center justify-center overflow-hidden bg-slate-50 text-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <div className="p-1 text-[9px] text-slate-400 font-bold">
                  Affix Passport Size Photograph
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: Student Particulars */}
        <div className="space-y-2 mb-3 print-avoid-break">
          <h2 className="text-xs font-black uppercase tracking-wider bg-slate-200 text-slate-900 px-2 py-1 rounded">
            1. Student Personal Particulars
          </h2>

          <table className="w-full border-collapse border border-slate-400 text-xs">
            <tbody>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50 w-36">Full Name:</td>
                <td className="border border-slate-300 p-1.5 font-black uppercase text-slate-900">{fullName || '—'}</td>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50 w-32">Father's Name:</td>
                <td className="border border-slate-300 p-1.5 font-black uppercase text-slate-900">{fatherName || '—'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50">CNIC / B-Form #:</td>
                <td className="border border-slate-300 p-1.5 font-black font-mono text-red-900 text-sm">
                  {cnic || '—'}
                </td>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50">Date of Birth:</td>
                <td className="border border-slate-300 p-1.5 font-semibold">{dob || '—'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50">Gender:</td>
                <td className="border border-slate-300 p-1.5 font-semibold">{gender}</td>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50">Domicile:</td>
                <td className="border border-slate-300 p-1.5 font-semibold">{domicile || '—'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50">Mobile Number:</td>
                <td className="border border-slate-300 p-1.5 font-mono font-bold">{mobileNo || '—'}</td>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50">Nationality / Religion:</td>
                <td className="border border-slate-300 p-1.5 font-semibold">{nationality} / {religion}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Guardian Details */}
        <div className="space-y-2 mb-3 print-avoid-break">
          <h2 className="text-xs font-black uppercase tracking-wider bg-slate-200 text-slate-900 px-2 py-1 rounded">
            2. Guardian & Emergency Contact Information
          </h2>

          <table className="w-full border-collapse border border-slate-400 text-xs">
            <tbody>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50 w-36">Guardian Name:</td>
                <td className="border border-slate-300 p-1.5 font-bold">{guardianName || fatherName || '—'}</td>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50 w-32">Relationship:</td>
                <td className="border border-slate-300 p-1.5 font-semibold">{guardianRelation || 'Father'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50">Guardian Phone:</td>
                <td className="border border-slate-300 p-1.5 font-mono font-bold">{guardianMobile || mobileNo || '—'}</td>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50">Emergency Contact:</td>
                <td className="border border-slate-300 p-1.5 font-semibold">
                  {emergencyName ? `${emergencyName} (${emergencyRelation || 'Relation'}) - ${emergencyMobile}` : 'Same as Guardian'}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold bg-slate-50">Permanent Address:</td>
                <td colSpan={3} className="border border-slate-300 p-1.5 font-semibold">
                  {guardianAddress || 'District Rawalpindi, Punjab, Pakistan'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Academic Qualifications Table */}
        <div className="space-y-2 mb-3 print-avoid-break">
          <h2 className="text-xs font-black uppercase tracking-wider bg-slate-200 text-slate-900 px-2 py-1 rounded">
            3. Academic Record (تعلیمی ریکارڈ)
          </h2>

          <table className="w-full border-collapse border border-slate-400 text-xs text-left">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-900">
                <th className="border border-slate-300 p-1.5 w-12 text-center">Sr.</th>
                <th className="border border-slate-300 p-1.5">Examination</th>
                <th className="border border-slate-300 p-1.5 w-16 text-center">Year</th>
                <th className="border border-slate-300 p-1.5 w-20 text-center">Grade/Div</th>
                <th className="border border-slate-300 p-1.5">Board / Institute</th>
                <th className="border border-slate-300 p-1.5 w-28 text-center">Marks (Obt/Total)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-1.5 text-center font-bold">1</td>
                <td className="border border-slate-300 p-1.5 font-bold">Matriculation (Science)</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">{matricYear}</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">{matricGrade}</td>
                <td className="border border-slate-300 p-1.5 font-semibold">{matricBoard}</td>
                <td className="border border-slate-300 p-1.5 text-center font-mono font-bold">{matricMarks}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 text-center font-bold">2</td>
                <td className="border border-slate-300 p-1.5 font-bold">{otherExam || 'Intermediate (F.Sc / FA)'}</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">{otherYear || '—'}</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">{otherGrade || '—'}</td>
                <td className="border border-slate-300 p-1.5 font-semibold">{otherBoard || '—'}</td>
                <td className="border border-slate-300 p-1.5 text-center font-mono font-bold">{otherMarks || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Required Documents Verification Checklist */}
        <div className="space-y-1.5 mb-3 print-avoid-break">
          <h2 className="text-xs font-black uppercase tracking-wider bg-slate-200 text-slate-900 px-2 py-1 rounded">
            4. Attached Documents Verification Checklist
          </h2>

          <div className="grid grid-cols-3 gap-2 border border-slate-300 p-2 rounded text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border border-slate-800 flex items-center justify-center font-bold text-xs">
                {docsChecklist.cnic?.checked ? '✓' : ''}
              </span>
              <span>CNIC / B-Form (4 Attested Copies)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border border-slate-800 flex items-center justify-center font-bold text-xs">
                {docsChecklist.matric?.checked ? '✓' : ''}
              </span>
              <span>Matric Result Card (4 Copies)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border border-slate-800 flex items-center justify-center font-bold text-xs">
                {docsChecklist.photos?.checked ? '✓' : ''}
              </span>
              <span>Passport Size Photos (4 Photos)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border border-slate-800 flex items-center justify-center font-bold text-xs">
                {docsChecklist.domicile?.checked ? '✓' : ''}
              </span>
              <span>Domicile Certificate Copy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border border-slate-800 flex items-center justify-center font-bold text-xs">
                {docsChecklist.character?.checked ? '✓' : ''}
              </span>
              <span>Character / Hope Certificate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border border-slate-800 flex items-center justify-center font-bold text-xs">
                ✓
              </span>
              <span>Father / Guardian CNIC Copy</span>
            </div>
          </div>
        </div>

        {/* Section 5: Approved Fee Schedule */}
        <div className="space-y-1.5 mb-3 print-avoid-break">
          <h2 className="text-xs font-black uppercase tracking-wider bg-slate-200 text-slate-900 px-2 py-1 rounded">
            5. Approved Fee Structure (2-Year Program)
          </h2>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="border border-slate-300 p-1.5 rounded">
              <span className="text-[10px] text-slate-500 font-bold block">Monthly Tuition Fee</span>
              <span className="font-bold text-slate-900">Rs. {monthlyFee.toLocaleString()} / mo</span>
            </div>
            <div className="border border-slate-300 p-1.5 rounded">
              <span className="text-[10px] text-slate-500 font-bold block">Admission Fee</span>
              <span className="font-bold text-slate-900">Rs. {admissionFee.toLocaleString()}</span>
            </div>
            <div className="border border-slate-300 p-1.5 rounded">
              <span className="text-[10px] text-slate-500 font-bold block">Registration Fee</span>
              <span className="font-bold text-slate-900">Rs. {registrationFee.toLocaleString()}</span>
            </div>
            <div className="border border-slate-300 p-1.5 rounded">
              <span className="text-[10px] text-slate-500 font-bold block">Card & Portal Setup</span>
              <span className="font-bold text-slate-900">Rs. {studentCardFee.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Section 6: Declaration & Signatures */}
        <div className="space-y-3 pt-2 print-avoid-break">
          <div className="border border-slate-300 p-2.5 rounded bg-slate-50 text-[10px] text-slate-700 italic leading-relaxed text-justify">
            <b>Undertaking & Solemn Declaration:</b> I hereby solemnly declare that the statements made in this form are true and correct to the best of my knowledge and belief. I understand that any false statement or concealed fact will result in immediate cancellation of my admission. I agree to abide by all the rules, code of conduct, and regulations of Harmain College of Health Sciences, Kahuta.
          </div>

          {/* Official Signatures Row */}
          <div className="grid grid-cols-4 gap-4 pt-10 text-center text-[11px] font-bold text-slate-900">
            <div>
              <div className="border-t border-slate-800 pt-1">Signature of Applicant</div>
            </div>
            <div>
              <div className="border-t border-slate-800 pt-1">Signature of Father/Guardian</div>
            </div>
            <div>
              <div className="border-t border-slate-800 pt-1">Admission Incharge</div>
            </div>
            <div>
              <div className="border-t border-slate-800 pt-1">Principal / Director (Seal)</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

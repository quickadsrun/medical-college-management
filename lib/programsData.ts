export interface CollegeProgramFee {
  id: string;
  name: string;
  degreeType: string;
  duration: string;
  monthlyFee: number;
  annualFee: number;
  admissionFee?: number;
  features: string[];
  colorTheme: 'teal' | 'sky' | 'purple' | 'emerald' | 'rose' | 'amber';
}

export const DEFAULT_COLLEGE_PROGRAMS: CollegeProgramFee[] = [
  {
    id: 'prog_dpt',
    name: 'Doctor of Physical Therapy (DPT)',
    degreeType: 'Doctorate Degree',
    duration: '5 Years',
    monthlyFee: 35000,
    annualFee: 420000,
    admissionFee: 30000,
    features: [
      'Clinical Hospital Rotations & Rehab Gym Training',
      'Anatomy & Physiology Practical Dissection Labs',
      'UHS & Regulatory Allied Health Council Curriculum',
    ],
    colorTheme: 'purple',
  },
  {
    id: 'prog_nursing',
    name: 'BS Nursing (Generic)',
    degreeType: 'Undergraduate BS Degree',
    duration: '4 Years',
    monthlyFee: 28000,
    annualFee: 336000,
    admissionFee: 25000,
    features: [
      'Teaching Hospital Clinical Ward Internship',
      'Pakistan Nursing Council (PNC) Aligned Skills Lab',
      'Emergency & ICU Patient Care Practical Training',
    ],
    colorTheme: 'emerald',
  },
  {
    id: 'prog_mlt',
    name: 'BS Medical Lab Technology (MLT)',
    degreeType: 'Undergraduate BS Degree',
    duration: '4 Years',
    monthlyFee: 25000,
    annualFee: 300000,
    admissionFee: 25000,
    features: [
      'Pathology, Hematology & Chemical Diagnostic Lab',
      'Automated Analyzer & Reagents Hands-on Practice',
      'Hospital Clinical Diagnostic Center Attachment',
    ],
    colorTheme: 'teal',
  },
  {
    id: 'prog_pharm_b',
    name: 'Pharmacy Technician (Category-B)',
    degreeType: 'Professional Diploma',
    duration: '2 Years',
    monthlyFee: 18000,
    annualFee: 216000,
    admissionFee: 20000,
    features: [
      'Pharmacy Council of Pakistan (PCP) Approved Syllabus',
      'Pharmacology & Dispensing Practical Labs',
      'Hospital & Community Pharmacy Internship',
    ],
    colorTheme: 'sky',
  },
  {
    id: 'prog_ott',
    name: 'BS Operation Theater Technology (OTT)',
    degreeType: 'Undergraduate BS Degree',
    duration: '4 Years',
    monthlyFee: 24000,
    annualFee: 288000,
    admissionFee: 25000,
    features: [
      'Major Operation Theater Live Surgical Assistance',
      'Sterilization, Autoclave & Surgical Scrub Techniques',
      'Anesthesia Equipment & Patient Monitoring Training',
    ],
    colorTheme: 'amber',
  },
];

const PROGRAMS_STORAGE_KEY = 'hchs_college_programs_v1';

export function getStoredPrograms(): CollegeProgramFee[] {
  if (typeof window === 'undefined') return DEFAULT_COLLEGE_PROGRAMS;
  try {
    const raw = localStorage.getItem(PROGRAMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(DEFAULT_COLLEGE_PROGRAMS));
      return DEFAULT_COLLEGE_PROGRAMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COLLEGE_PROGRAMS;
  } catch (err) {
    return DEFAULT_COLLEGE_PROGRAMS;
  }
}

export function saveStoredPrograms(programs: CollegeProgramFee[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(programs));
  } catch (err) {
    console.error('Failed to save programs:', err);
  }
}

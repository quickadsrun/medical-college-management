// Medical College Faculty Departments and Medical Terms Configuration with LocalStorage Persistence

export const DEFAULT_DEPARTMENTS: string[] = [
  'General Surgery',
  'Obstetrics & Gynaecology',
  'Anatomy & Histology',
  'Physiology',
  'Biochemistry & Molecular Bio',
  'Pharmacology & Therapeutics',
  'Pathology & Microbiology',
  'Forensic Medicine & Toxicology',
  'Community Medicine & Public Health',
  'General Medicine',
  'Pediatrics',
  'Ophthalmology (Eye)',
  'Otorhinolaryngology (ENT)',
  'Orthopedic Surgery',
  'Anesthesiology & ICU',
  'Radiology & Medical Imaging',
  'Dermatology',
  'Psychiatry & Behavioral Sciences',
  'Dentistry / BDS',
  'Physical Therapy (DPT)',
  'Nursing & Midwifery',
  'Pharmacy (Pharm-D)',
  'Finance & Accounts',
  'Administration & Campus Management',
];

export const DEFAULT_MEDICAL_TERMS: string[] = [
  '1st Year MBBS (Pre-Clinical)',
  '2nd Year MBBS (Pre-Clinical)',
  '3rd Year MBBS (Para-Clinical)',
  '4th Year MBBS (Clinical)',
  'Final Year MBBS (Clinical Rotation)',
  'BDS 1st Year',
  'BDS 2nd Year',
  'BDS 3rd Year',
  'BDS Final Year',
  'DPT (1st - 5th Year)',
  'Pharm-D Professional',
  'B.Sc Nursing (1st - 4th Year)',
  'All Medical Terms / Multi-Disciplinary',
];

const STORAGE_KEY_DEPTS = 'medcollege_faculty_departments_v2';
const STORAGE_KEY_TERMS = 'medcollege_faculty_terms_v2';

export function getStoredDepartments(): string[] {
  if (typeof window === 'undefined') return DEFAULT_DEPARTMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEPTS);
    if (!raw) return DEFAULT_DEPARTMENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DEPARTMENTS;
  } catch (e) {
    console.error('Error loading stored departments:', e);
    return DEFAULT_DEPARTMENTS;
  }
}

export function saveStoredDepartments(departments: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(departments));
  } catch (e) {
    console.error('Error saving departments:', e);
  }
}

export function getStoredTerms(): string[] {
  if (typeof window === 'undefined') return DEFAULT_MEDICAL_TERMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TERMS);
    if (!raw) return DEFAULT_MEDICAL_TERMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MEDICAL_TERMS;
  } catch (e) {
    console.error('Error loading stored terms:', e);
    return DEFAULT_MEDICAL_TERMS;
  }
}

export function saveStoredTerms(terms: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TERMS, JSON.stringify(terms));
  } catch (e) {
    console.error('Error saving terms:', e);
  }
}

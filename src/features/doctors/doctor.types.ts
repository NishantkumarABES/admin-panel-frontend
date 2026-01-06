// API Response User for doctors
export type DoctorStatus = "active" | "inactive";

export interface DoctorUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country_code: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  state: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  license_number: string;
  clinic_address: string | null;
  specialization: string;
  years_of_experience: number;
  by_admin?: boolean;
}
// Paginated Response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DoctorAnalytics {
  total_doctors: number;
  active_doctors: number;
  inactive_doctors: number;
  success: boolean;
}

export interface DoctorQualification {
  degree: string;
  institution: string;
  year: number;
  documentUrl?: string;
}

export interface DoctorDocument {
  id: string;
  type: "license" | "degree" | "certificate" | "id_proof";
  name: string;
  url: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}


// DTO for creating/editing doctors
export interface CreateDoctorDTO {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: number;
}

export interface UpdateDoctorDTO extends Partial<CreateDoctorDTO> {
  id: string;
}




export const mockDoctors: DoctorUser[] = [
  {
    id: "1",
    full_name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "+1 555-123-4567",
    country_code : "+1",
    date_of_birth: "1980-05-15",
    gender: "female",
    state: "active",
    is_email_verified: true,
    is_phone_verified: true,
    is_active: true,
    created_at: "2023-01-15T10:00:00Z",
    updated_at: "2023-01-15T10:00:00Z",
    clinic_address: "123 Main St, Anytown, USA",
    specialization: "Cardiology",
    license_number: "CARD-12345",
    years_of_experience: 12,
  },
  {
    id: "2",
    full_name: "Brian Smith",
    email: "brian.smith@example.com",
    phone: "+1 555-987-6543",
    country_code : "+1",
    date_of_birth: "1975-09-20",
    gender: "male",
    state: "active",
    is_email_verified: false,
    is_phone_verified: true,
    is_active: true,
    created_at: "2023-02-01T11:30:00Z",
    updated_at: "2023-02-01T11:30:00Z",
    clinic_address: "456 Oak Ave, Anytown, USA",
    specialization: "Neurology",
    license_number: "NEURO-67890",
    years_of_experience: 6,
  },

  {
    id: "3",
    full_name: "Carol Lee",
    email: "carol.lee@example.com",
    phone: "+1 555-222-3333",
    country_code : "+1",
    date_of_birth: "1990-08-25",
    gender: "female",
    state: "inactive",
    is_email_verified: true,
    is_phone_verified: false,
    is_active: false,
    created_at: "2023-03-10T14:00:00Z",
    updated_at: "2023-03-10T14:00:00Z",
    clinic_address: "789 Pine Ln, Anytown, USA",
    specialization: "Dermatology",
    license_number: "DERM-24680",
    years_of_experience: 15,
  },
];

export const SPECIALTIES = [
  "Multispecialty",
  "General Medicine",
  "General Surgery",
  "Cardiology",
  "Nephrology",
  "Neurology",
  "Endocrinology",
  "Medical Oncology",
  "Pediatrics and Adolescent Medicine",
  "Family Medicine and Geriatric Medicine",
  "Emergency Medicine",
  "Anaesthesiology",
  "Intensive Care Medicine",
  "Dermatology",
  "Cosmetology",
  "Pulmonology",
  "Rheumatology",
  "Diagnostic & Clinical Radiology",
  "Interventional Radiology",
  "Forensic Medicine & Toxicology",
  "Microbiology & Hospital Infection Control",
  "Pathology & Oncopathology",
  "Haematology",
  "Biochemistry",
  "Radiation Oncology",
  "Nuclear Medicine",
  "Psychiatry",
  "Clinical Psychology",
  "Clinical Pharmacology",
  "Ophthalmology",
  "Neurosurgery",
  "Cardiothoracic Surgery",
  "Vascular Surgery",
  "Orthopaedic Surgery",
  "ENT",
  "Head and Neck Surgery",
  "Plastic & Cosmetic Surgery",
  "Urology & Transplant Surgery",
  "Gastrointestinal Surgery & Transplant Surgery",
  "Paediatric Surgery",
  "Surgical Oncology",
  "Maxillofacial Surgery",
  "Dentistry & Somatology",
  "Obstetrics & Gynaecology",
  "Geriatric & Palliative Medicine",
  "Physiotherapy & Rehabilitation",
  "Nutrition & Dietetics",
  "Sports Medicine",
  "Gastroenterology",
] as const;   
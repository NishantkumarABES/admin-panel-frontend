// API Response User for doctors
export type DoctorStatus = "active" | "inactive" | "created" | "deleted" | "pending_invitation" | "accepted_invitation";

export interface DoctorProfile {
  credentials: string | null;
  specialization: string;
  years_of_experience: number;
  license_number: string;
  medical_council: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  clinic_location: {
    lat: number;
    lng: number;
  } | null;
  consultation_fee: string;
  premium_online_fee: string;
  consultation_duration_minutes: number | null;
  bio: string;
  profile_photo: string | null;
  average_rating: number;
}

export interface DoctorUser {
  id: string;
  email: string;
  phone: string;
  country_code: string;
  full_name: string;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  state: DoctorStatus;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string
  doctor_profile: DoctorProfile;
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
  created_doctors: number;
  deleted_doctors: number;
  pending_invitations: number;
  accepted_invitations: number;
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
    email: "alice.johnson@example.com",
    phone: "+1 555-123-4567",
    country_code: "+1",
    full_name: "Alice Johnson",
    date_of_birth: "1980-05-15",
    gender: "female",
    state: "active",
    is_email_verified: true,
    is_phone_verified: true,
    is_active: true,
    created_at: "2023-01-15T10:00:00Z",
    updated_at: "2023-01-15T10:00:00Z",

    doctor_profile: {
      credentials: "MD",
      specialization: "Cardiology",
      years_of_experience: 12,
      license_number: "CARD-12345",
      medical_council: "American Medical Council",
      clinic_name: "HeartCare Center",
      clinic_address: "123 Main St, Anytown, USA",
      clinic_location: { lat: 40.7128, lng: -74.006 },
      consultation_fee: "120.00",
      premium_online_fee: "150.00",
      consultation_duration_minutes: 30,
      bio: "Experienced cardiologist specializing in preventive heart care.",
      profile_photo: "https://example.com/alice.jpg",
      average_rating: 4.7,
    },
  },

  {
    id: "2",
    email: "brian.smith@example.com",
    phone: "+1 555-987-6543",
    country_code: "+1",
    full_name: "Brian Smith",
    date_of_birth: "1975-09-20",
    gender: "male",
    state: "active",
    is_email_verified: false,
    is_phone_verified: true,
    is_active: true,
    created_at: "2023-02-01T11:30:00Z",
    updated_at: "2023-02-01T11:30:00Z",

    doctor_profile: {
      credentials: "MBBS, MD",
      specialization: "Neurology",
      years_of_experience: 6,
      license_number: "NEURO-67890",
      medical_council: "National Neurology Board",
      clinic_name: "NeuroLife Clinic",
      clinic_address: "456 Oak Ave, Anytown, USA",
      clinic_location: { lat: 34.0522, lng: -118.2437 },
      consultation_fee: "100.00",
      premium_online_fee: "130.00",
      consultation_duration_minutes: 25,
      bio: "Specialist in brain and nerve disorders.",
      profile_photo: "https://example.com/brian.jpg",
      average_rating: 4.4,
    },
  },

  {
    id: "3",
    email: "carol.lee@example.com",
    phone: "+1 555-222-3333",
    country_code: "+1",
    full_name: "Carol Lee",
    date_of_birth: "1990-08-25",
    gender: "female",
    state: "inactive",
    is_email_verified: true,
    is_phone_verified: false,
    is_active: false,
    created_at: "2023-03-10T14:00:00Z",
    updated_at: "2023-03-10T14:00:00Z",

    doctor_profile: {
      credentials: "MD",
      specialization: "Dermatology",
      years_of_experience: 15,
      license_number: "DERM-24680",
      medical_council: "Dermatology Council USA",
      clinic_name: "SkinGlow Clinic",
      clinic_address: "789 Pine Ln, Anytown, USA",
      clinic_location: { lat: 37.7749, lng: -122.4194 },
      consultation_fee: "90.00",
      premium_online_fee: "110.00",
      consultation_duration_minutes: 20,
      bio: "Helping patients achieve healthy skin.",
      profile_photo: "https://example.com/carol.jpg",
      average_rating: 4.9,
    },
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
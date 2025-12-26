export type DoctorStatus = "pending" | "verified" | "rejected" | "suspended";

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

export interface DoctorVerification {
  status: DoctorStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface Doctor {
  id: string;

  // Personal Information
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;

  // Professional Information
  specialty: string;
  subSpecialty?: string[];
  licenseNumber: string;
  licenseAuthority?: string;
  licenseExpiry?: string;
  yearsOfExperience: number;
  qualifications: DoctorQualification[];

  // Additional Professional Details
  hospitalAffiliations?: string[];
  consultationFee?: number;
  languages?: string[];
  bio?: string;

  // Profile & Media
  profileImage?: string;

  // Documents
  documents: DoctorDocument[];

  // Verification & Status
  verification: DoctorVerification;
  isActive: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
  status: DoctorStatus;
}

// DTO for creating/editing doctors
export interface CreateDoctorDTO {
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: number;
  // qualifications: DoctorQualification[];
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  subSpecialty?: string[];
  licenseAuthority?: string;
  licenseExpiry?: string;
  hospitalAffiliations?: string[];
  consultationFee?: number;
  languages?: string[];
  bio?: string;
}

export interface UpdateDoctorDTO extends Partial<CreateDoctorDTO> {
  id: string;
}

export interface VerifyDoctorDTO {
  id: string;
  status: "verified" | "rejected";
  notes?: string;
  rejectionReason?: string;
}

export type DoctorForm = {
  id: string;
  fullName: string;
  specialty: string;
  yearsOfExperience: number;
  licenseNumber: string;
  phone: string;
  email: string;
  status: DoctorStatus;
};

export const mockDoctors: DoctorForm[] = [
  {
    id: "1",
    fullName: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "+1 555-123-4567",
    specialty: "Cardiology",
    licenseNumber: "CARD-12345",
    yearsOfExperience: 12,
    status: "verified",
  },

  {
    id: "2",
    fullName: "Brian Smith",
    email: "brian.smith@example.com",
    phone: "+1 555-987-6543",
    specialty: "Neurology",
    licenseNumber: "NEURO-67890",
    yearsOfExperience: 6,
    status: "pending",
  },

  {
    id: "3",
    fullName: "Carol Lee",
    email: "carol.lee@example.com",
    phone: "+1 555-222-3333",

    specialty: "Dermatology",
    licenseNumber: "DERM-24680",
    yearsOfExperience: 15,
    status: "rejected",
  },
];
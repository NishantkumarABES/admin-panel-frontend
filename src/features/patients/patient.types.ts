export type PatientStatus = "active" | "inactive";

// API Response User
export interface PatientUser {
  id: string;
  image: string;
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
}

// Paginated Response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
}

export interface UpdatePatientDTO extends CreatePatientDTO {
  id: string;
  status?: PatientStatus;
}

export interface PatientFilters {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

// Mock data for development
export const mockPatients: PatientUser[] = [
  {
    id: "1",
    full_name: "Alice Johnson",
    image: "https://example.com/alice.jpg",
    email: "alice.johnson@example.com",
    phone: "+1 555-123-4567",
    country_code : "+1",
    date_of_birth: "1980-05-15",
    gender: "female",
    state: "active",
    is_email_verified: true,
    is_phone_verified: false,
    is_active: true,
    created_at: "2023-01-15T10:00:00Z",
    updated_at: "2023-01-15T10:00:00Z",
  },
  {
    id: "2",
    full_name: "Bob Smith",
    image: "https://example.com/bob.jpg",
    email: "bob.smith@example.com",
    phone: "+1 555-987-6543",
    country_code : "+1",
    date_of_birth: "1975-09-20",
    gender: "male",
    state: "inactive",
    is_email_verified: true,
    is_phone_verified: true,
    is_active: false,
    created_at: "2023-02-01T11:30:00Z",
    updated_at: "2023-02-01T11:30:00Z",
  },
  {
    id: "3",
    full_name: "Charlie Brown",
    image: "https://example.com/charlie.jpg",
    email: "charlie.brown@example.com",
    phone: "+1 555-111-2222",
    country_code : "+1",
    date_of_birth: "1992-11-01",
    gender: "male",
    state: "active",
    is_email_verified: false,
    is_phone_verified: false,
    is_active: true,
    created_at: "2023-03-20T09:00:00Z",
    updated_at: "2023-03-20T09:00:00Z",
  },
];


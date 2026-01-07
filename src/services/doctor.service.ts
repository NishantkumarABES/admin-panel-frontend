import { api } from "./api";
import type {
  // Doctor,
  CreateDoctorDTO,
  UpdateDoctorDTO,
  DoctorStatus,
  DoctorAnalytics,
  DoctorUser,
  PaginatedResponse,
} from "../features/doctors/doctor.types";
import { generateSystemPassword } from "../utils/passwordGenerator";

export interface DoctorFilters {
  status?: DoctorStatus;
  speciality?: string;
  search?: string;
  page?: number;
  page_size?: number;
  by_admin?: boolean;
}

export interface PaginatedDoctors {
  count: number;
  next: string | null;
  previous: string | null;
  results: DoctorUser[];
}

// Get all doctors with optional filters (paginated)
export const getDoctors = async (filters?: DoctorFilters): Promise<{ data: PaginatedDoctors }> => {
  const params = new URLSearchParams();

  if (filters?.page) {
    params.append("page", filters.page.toString());
  }

  if (filters?.page_size) {
    params.append("page_size", filters.page_size.toString());
  }

  if (filters?.search) {
    params.append("search", filters.search);
  }

  if (filters?.status) {
    params.append("status", filters.status);
  }

  if (filters?.speciality) {
    params.append("speciality", filters.speciality);
  }

  if (filters?.by_admin !== undefined) {
    params.append("by_admin", filters.by_admin.toString());
  }

  const queryString = params.toString();
  const response = await api.get<PaginatedResponse<DoctorUser>>(
    `/auth/admin/users/doctor${queryString ? `?${queryString}` : ""}`
  );

  return {
    data: {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: response.data.results,
    }
  };
};


// Get doctors analytics
export const getDoctorsAnalytics = () =>
  api.get<DoctorAnalytics>("/analytics/admin/doctors/metrics/");


// Get a single doctor by ID
export const getDoctorById = (id: string) =>
  api.get<DoctorUser>(`/auth/admin/users/doctor/${id}`);

// Create a new doctor
export const createDoctor = async (data: CreateDoctorDTO) => {
  // Generate system password for the doctor account
  const systemPassword = generateSystemPassword();

  // Transform DTO to match API payload structure
  const payload = {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    country_code: data.countryCode,
    password: systemPassword,
    terms_accepted: true,
    is_phone_verified: true,
    is_email_verified: true,
    specialization: data.specialty,
    license_number: data.licenseNumber,
    years_of_experience: data.yearsOfExperience,
    by_admin: true,
  };

  const response = await api.post("/auth/register/doctor/", payload);
  return {
    data: response.data,
    password: systemPassword,
  };
};

// Update an existing doctor
export const updateDoctor = async (data: UpdateDoctorDTO) => {
  // Transform DTO to match API payload structure
  const payload = {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    country_code: data.countryCode,
    specialization: data.specialty,
    license_number: data.licenseNumber,
    years_of_experience: data.yearsOfExperience,
  };

  const response = await api.patch<DoctorUser>(`/auth/update/${data.id}/`, payload);
  return response;
};

// Delete a doctor
export const deleteDoctor = (id: string) =>
  api.delete(`/admin/doctors/${id}`);
import { api } from "./api";
import type {
  Doctor,
  CreateDoctorDTO,
  UpdateDoctorDTO,
  VerifyDoctorDTO,
  DoctorStatus,
} from "../features/doctors/doctor.types";

export interface DoctorFilters {
  status?: DoctorStatus;
  specialty?: string;
  search?: string;
}

// Get all doctors with optional filters
export const getDoctors = (filters?: DoctorFilters) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.specialty) params.append("specialty", filters.specialty);
  if (filters?.search) params.append("search", filters.search);

  return api.get<Doctor[]>(`/admin/doctors?${params.toString()}`);
};

// Get single doctor by ID
export const getDoctor = (id: string) =>
  api.get<Doctor>(`/admin/doctors/${id}`);

// Create new doctor
export const createDoctor = (data: CreateDoctorDTO) =>
  api.post<Doctor>("/admin/doctors", data);

// Update existing doctor
export const updateDoctor = (data: UpdateDoctorDTO) =>
  api.put<Doctor>(`/admin/doctors/${data.id}`, data);

// Delete doctor
export const deleteDoctor = (id: string) =>
  api.delete(`/admin/doctors/${id}`);

// Verify or reject doctor
export const verifyDoctor = (data: VerifyDoctorDTO) =>
  api.post<Doctor>(`/admin/doctors/${data.id}/verify`, data);

// Suspend/Unsuspend doctor
export const toggleDoctorSuspension = (id: string, suspend: boolean) =>
  api.post<Doctor>(`/admin/doctors/${id}/${suspend ? "suspend" : "unsuspend"}`);

// Activate/Deactivate doctor
export const toggleDoctorStatus = (id: string, isActive: boolean) =>
  api.patch<Doctor>(`/admin/doctors/${id}/status`, { isActive });

// Upload doctor document
export const uploadDoctorDocument = (id: string, file: File, type: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  return api.post<{ url: string; documentId: string }>(
    `/admin/doctors/${id}/documents`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

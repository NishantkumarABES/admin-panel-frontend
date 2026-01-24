import { api } from "./api";
import type {
  AdvisoryMember,
  CreateAdvisoryDTO,
  UpdateAdvisoryDTO,
  AdvisoryAnalytics,
  PaginatedAdvisory,
  AdvisoryFilters,
} from "../features/Advisory/advisory.types";

// Get all advisory members with optional filters (paginated)
export const getAdvisoryMembers = async (
  filters?: AdvisoryFilters
): Promise<PaginatedAdvisory> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.page_size) params.append("page_size", filters.page_size.toString());
  if (filters?.search) params.append("search", filters.search);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.specialization) params.append("specialization", filters.specialization);

  const queryString = params.toString();

  const response = await api.get<PaginatedAdvisory>(
    `/admin/advisory${queryString ? `?${queryString}` : ""}`
  );

  return response.data;
};

// Get advisory analytics
export const getAdvisoryAnalytics = () =>
  api.get<AdvisoryAnalytics>("/analytics/admin/advisory/metrics/");

// Get a single advisory member by ID
export const getAdvisoryMemberById = (id: string) =>
  api.get<AdvisoryMember>(`/admin/advisory/${id}/`);

// Create a new advisory member (manually)
export const createAdvisoryMember = async (data: CreateAdvisoryDTO) => {
  const formData = new FormData();

  formData.append("full_name", data.full_name);
  formData.append("email", data.email);
  formData.append("phone", data.phone);
  formData.append("specialization", data.specialization);
  formData.append("years_of_experience", data.years_of_experience.toString());

  if (data.gender) {
    formData.append("gender", data.gender);
  }

  if (data.date_of_birth) {
    formData.append("date_of_birth", data.date_of_birth);
  }

  if (data.bio) {
    formData.append("bio", data.bio);
  }

  if (data.image) {
    formData.append("image", data.image);
  }

  if (data.status) {
    formData.append("status", data.status);
  }

  const response = await api.post<AdvisoryMember>("/admin/advisory/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};

// Add existing doctor to advisory panel
export const addDoctorToAdvisory = async (doctorId: string) => {
  const response = await api.post<AdvisoryMember>("/admin/advisory/from-doctor/", {
    doctor_id: doctorId,
  });

  return response;
};

// Update an existing advisory member
export const updateAdvisoryMember = async (data: UpdateAdvisoryDTO) => {
  const formData = new FormData();

  if (data.full_name) {
    formData.append("full_name", data.full_name);
  }

  if (data.email) {
    formData.append("email", data.email);
  }

  if (data.phone) {
    formData.append("phone", data.phone);
  }

  if (data.specialization) {
    formData.append("specialization", data.specialization);
  }

  if (data.years_of_experience !== undefined) {
    formData.append("years_of_experience", data.years_of_experience.toString());
  }

  if (data.bio !== undefined) {
    formData.append("bio", data.bio);
  }

  if (data.image) {
    formData.append("image", data.image);
  }

  if (data.status) {
    formData.append("status", data.status);
  }

  const response = await api.patch<AdvisoryMember>(
    `/admin/advisory/${data.id}/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response;
};

// Delete an advisory member
export const deleteAdvisoryMember = (id: string) =>
  api.delete(`/admin/advisory/${id}/`);

// Export all services as a single object (alternative pattern)
export const advisoryService = {
  getMembers: getAdvisoryMembers,
  getAnalytics: getAdvisoryAnalytics,
  getMemberById: getAdvisoryMemberById,
  createMember: createAdvisoryMember,
  addDoctorToAdvisory,
  updateMember: updateAdvisoryMember,
  deleteMember: deleteAdvisoryMember,
};

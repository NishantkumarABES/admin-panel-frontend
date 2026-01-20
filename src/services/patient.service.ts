import { api } from "./api";
import type {
  CreatePatientDTO, UpdatePatientDTO, PatientFilters,
  PaginatedResponse, PatientUser
} from "../features/patients/patient.types";


export interface PatientAnalytics {
  total_patients: number;
  active_patients: number;
  inactive_patients: number;
}

export interface PaginatedPatients {
  count: number;
  next: string | null;
  previous: string | null;
  results: PatientUser[];
}

export const patientService = {
  getAnalytics: () => {
    return api.get<PatientAnalytics>("/analytics/admin/patients/metrics/");
  },

  getPatients: async (filters?: PatientFilters): Promise<{ data: PaginatedPatients }> => {
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

    if (filters?.ordering) {
      params.append("ordering", filters.ordering);
    }

    const queryString = params.toString();
    const response = await api.get<PaginatedResponse<PatientUser>>(
      `/auth/admin/users/patient${queryString ? `?${queryString}` : ""}`
    );

    return {
      data: {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: response.data.results,
      }
    };
  },

  getPatient: (id: string) => {
    return api.get<PatientUser>(`/admin/patients/${id}`);
  },

  createPatient: (data: CreatePatientDTO) => {
    return api.post<PatientUser>("/admin/patients", data);
  },

  updatePatient: (data: UpdatePatientDTO) => {
    return api.put<PatientUser>(`/admin/patients/${data.id}`, data);
  },

  deletePatient: (id: string) => {
    return api.delete(`/admin/patients/${id}`);
  },
};

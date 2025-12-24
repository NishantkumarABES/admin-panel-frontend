import { api } from "./api";
import type {
  PatientForm, CreatePatientDTO, UpdatePatientDTO, PatientFilters,
} from "../features/patients/patient.types";

export const patientService = {
  getPatients: (filters?: PatientFilters) => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    const queryString = params.toString();
    return api.get<PatientForm[]>(
      `/admin/patients${queryString ? `?${queryString}` : ""}`
    );
  },

  getPatient: (id: string) => {
    return api.get<PatientForm>(`/admin/patients/${id}`);
  },

  createPatient: (data: CreatePatientDTO) => {
    return api.post<PatientForm>("/admin/patients", data);
  },

  updatePatient: (data: UpdatePatientDTO) => {
    return api.put<PatientForm>(`/admin/patients/${data.id}`, data);
  },

  deletePatient: (id: string) => {
    return api.delete(`/admin/patients/${id}`);
  },
};

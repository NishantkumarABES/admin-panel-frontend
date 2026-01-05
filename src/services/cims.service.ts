import { api } from "./api";
import type {
  CIMS,
  CreateCIMSDTO,
  UpdateCIMSDTO,
} from "../features/CIMS/cims.types";

export const getCIMS = async (filters?: {
  drugClass?: string;
  therapeuticCategory?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) => {
  return api.get<{
    results: CIMS[];
    count: number;
    next: string | null;
    previous: string | null;
  }>("/cims", { params: filters });
};

export const getCIMSById = async (id: string) => {
  return api.get<CIMS>(`/cims/${id}`);
};

export const createCIMS = async (data: CreateCIMSDTO) => {
  return api.post<CIMS>("/cims", data);
};

export const updateCIMS = async (data: UpdateCIMSDTO) => {
  const { id, ...updateData } = data;
  return api.put<CIMS>(`/cims/${id}`, updateData);
};

export const deleteCIMS = async (id: string) => {
  return api.delete(`/cims/${id}`);
};

export const publishCIMS = async (id: string) => {
  return api.post(`/cims/${id}/publish`);
};

export const archiveCIMS = async (id: string) => {
  return api.post(`/cims/${id}/archive`);
};

export const getCIMSAnalytics = async () => {
  return api.get<{
    total_drugs: number;
    published_drugs: number;
    draft_drugs: number;
    archived_drugs: number;
  }>("/cims/analytics");
};

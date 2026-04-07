import { api } from "./api";
import type { AppCategory, CreateAppCategoryDTO, UpdateAppCategoryDTO } from "../features/other/app-categories/app_categories.types";

export interface AppCategoryFilters {
  page?: number;
  page_size?: number;
  search?: string;
}

interface AppCategoryListApiResponse {
  detail: string;
  data: {
    categories: AppCategory[];
  };
  success?: boolean;
}

interface AppCategoryMutationApiResponse {
  detail: string;
  data: AppCategory;
  success?: boolean;
}

export const getAppCategories = async (filters: AppCategoryFilters = {}): Promise<{ data: AppCategory[] }> => {
  const params = new URLSearchParams();

  if (filters.page) {
    params.append("page", filters.page.toString());
  }
  if (filters.page_size) {
    params.append("page_size", filters.page_size.toString());
  }
  if (filters.search) {
    params.append("search", filters.search);
  }

  const queryString = params.toString();
  const response = await api.get<AppCategoryListApiResponse>(
    `/appointments/admin/categories/${queryString ? `?${queryString}` : ""}`
  );
  return { data: response.data.data.categories };
};

export const createAppCategory = async (data: CreateAppCategoryDTO): Promise<{ data: AppCategory }> => {
  let payload: CreateAppCategoryDTO | FormData = data;

  if (data.image instanceof File) {
    const formData = new FormData();
    formData.append("key", data.key);
    formData.append("label", data.label);
    formData.append("image", data.image);
    payload = formData;
  }

  const response = await api.post<AppCategoryMutationApiResponse>("/appointments/admin/categories/", payload);
  return { data: response.data.data };
};

export const updateAppCategory = async (data: UpdateAppCategoryDTO): Promise<{ data: AppCategory }> => {
  const { id, ...rest } = data;
  let payload: Partial<CreateAppCategoryDTO> | FormData = rest;

  if (rest.image instanceof File) {
    const formData = new FormData();
    if (rest.key !== undefined) {
      formData.append("key", rest.key);
    }
    if (rest.label !== undefined) {
      formData.append("label", rest.label);
    }
    formData.append("image", rest.image);
    payload = formData;
  }

  const response = await api.patch<AppCategoryMutationApiResponse>(`/appointments/admin/categories/${id}/`, payload);
  return { data: response.data.data };
};

export const deleteAppCategory = async (categoryId: string): Promise<void> => {
  await api.delete(`/appointments/admin/categories/${categoryId}/`);
};

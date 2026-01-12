import { api } from "./api";
import type {
  GeneralAdvertisement, CreateGeneralAdDTO, UpdateGeneralAdDTO,
  PaginatedResponse, AdFilters,
} from "../features/Advertisements/advertisement.types";

export interface PaginatedAdvertisements {
  count: number;
  next: string | null;
  previous: string | null;
  results: GeneralAdvertisement[];
}

export const advertisementService = {
  // General Advertisements
  getGeneralAds: async (filters?: AdFilters): Promise<{ data: PaginatedAdvertisements }> => {
    const params = new URLSearchParams();
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }

    if (filters?.page_size) {
      params.append("page_size", filters.page_size.toString());
    }
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    const queryString = params.toString();
    const response = await api.get<PaginatedResponse<GeneralAdvertisement>>(
      `/advertisements/${queryString ? `?${queryString}` : ""}`
    );
    return {
      data :{
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: response.data.results,
      }
    }
  },

  getGeneralAd: (id: string) => {
    return api.get<GeneralAdvertisement>(`/advertisements/${id}`);
  },

  createGeneralAd: (data: CreateGeneralAdDTO) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("url", data.url);
    formData.append("image", data.image);
    formData.append("status", data.status);

    return api.post<GeneralAdvertisement>("/advertisements/create/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateGeneralAd: (data: UpdateGeneralAdDTO) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("url", data.url);
    if (data.image) {
      formData.append("image", data.image);
    }
    formData.append("specializations", JSON.stringify(data.specializations));
    formData.append("status", data.status);

    return api.patch<GeneralAdvertisement>(
      `/advertisements/update/${data.id}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  deleteGeneralAd: (id: string) => {
    return api.delete(`/advertisements${id}`);
  },
};

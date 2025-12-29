import { api } from "./api";
import type {
  GeneralAdvertisement,
  CreateGeneralAdDTO,
  UpdateGeneralAdDTO,
  AdFilters,
} from "../features/Advertisements/advertisement.types";

export const advertisementService = {
  // General Advertisements
  getGeneralAds: (filters?: AdFilters) => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    const queryString = params.toString();
    return api.get<GeneralAdvertisement[]>(
      `/admin/advertisements/general${queryString ? `?${queryString}` : ""}`
    );
  },

  getGeneralAd: (id: string) => {
    return api.get<GeneralAdvertisement>(`/admin/advertisements/general/${id}`);
  },

  createGeneralAd: (data: CreateGeneralAdDTO) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("url", data.url);
    formData.append("image", data.image);
    formData.append("status", data.status);

    return api.post<GeneralAdvertisement>("/admin/advertisements/general", formData, {
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
    formData.append("status", data.status);

    return api.put<GeneralAdvertisement>(
      `/admin/advertisements/general/${data.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  deleteGeneralAd: (id: string) => {
    return api.delete(`/admin/advertisements/general/${id}`);
  },
};

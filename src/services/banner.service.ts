import { api } from "./api";
import type {
    Banner,
    CreateBannerDTO,
    UpdateBannerDTO,
    BannerFilters,
    ApiResponse,
    Category,
} from "../features/banners/banner.types";

export const getBanners = async (
    filters: BannerFilters = {}
): Promise<{ data: Banner[] }> => {
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
    if (filters.is_active !== undefined) {
        params.append("is_active", filters.is_active.toString());
    }

    const queryString = params.toString();
    const response = await api.get<ApiResponse<Banner[]>>(
        `/commerce/admin/banners/${queryString ? `?${queryString}` : ""}`
    );

    // API returns { success, detail, data: Banner[] }
    return { data: response.data.data };
};

export const createBanner = async (
    data: CreateBannerDTO
): Promise<{ data: Banner }> => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.subtitle) formData.append("subtitle", data.subtitle);
    formData.append("image", data.image);
    formData.append("redirect_category", data.redirect_category);
    if (data.is_active !== undefined)
        formData.append("is_active", String(data.is_active));
    if (data.order !== undefined)
        formData.append("order", String(data.order));

    const response = await api.post<ApiResponse<Banner>>(
        "/commerce/admin/banners/",
        formData
    );
    return { data: response.data.data };
};

export const updateBanner = async (
    data: UpdateBannerDTO
): Promise<{ data: Banner }> => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.subtitle !== undefined) formData.append("subtitle", data.subtitle);
    if (data.image) formData.append("image", data.image);
    if (data.redirect_category !== undefined)
        formData.append("redirect_category", data.redirect_category);
    if (data.is_active !== undefined)
        formData.append("is_active", String(data.is_active));
    if (data.order !== undefined) formData.append("order", String(data.order));

    const response = await api.patch<ApiResponse<Banner>>(
        `/commerce/admin/banners/${data.id}/`,
        formData
    );
    return { data: response.data.data };
};

export const deleteBanner = async (id: string): Promise<void> => {
    await api.delete(`/commerce/admin/banners/${id}/`);
};

export const getCategories = async (): Promise<{ data: Category[] }> => {
    const response = await api.get<ApiResponse<Category[]>>(
        "/commerce/admin/banners/categories/"
    );
    return { data: response.data.data };
};

import { api } from "./api";
import type { SoCoupon, CreateSoCouponDTO, UpdateSoCouponDTO } from "../features/other/so-coupon/so_coupon.types";

export interface SoCouponFilters {
  page?: number;
  page_size?: number;
  search?: string;
  coupon_type?: string;
  is_active?: boolean;
}

export interface PaginatedSoCouponResponse {
  results: SoCoupon[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface SoCouponApiResponse {
  detail: string;
  data: PaginatedSoCouponResponse;
  success: boolean;
}

export const getSoCoupons = async (filters: SoCouponFilters = {}): Promise<{ data: PaginatedSoCouponResponse }> => {
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
  if (filters.coupon_type) {
    params.append("coupon_type", filters.coupon_type);
  }
  if (filters.is_active !== undefined) {
    params.append("is_active", filters.is_active.toString());
  }

  const queryString = params.toString();
  const response = await api.get<SoCouponApiResponse>(
    `/second-opinion/admin/coupons/${queryString ? `?${queryString}` : ""}`
  );

  return { data: response.data.data };
};

export const createSoCoupon = async (couponData: CreateSoCouponDTO): Promise<{ data: SoCoupon }> => {
  const formData = new FormData();

  Object.entries(couponData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const response = await api.post<SoCoupon>("/second-opinion/admin/coupons/create/", formData);
  return { data: response.data };
};

export const updateSoCoupon = async (couponData: UpdateSoCouponDTO): Promise<{ data: SoCoupon }> => {
  const response = await api.patch<SoCoupon>(`/second-opinion/admin/coupons/${couponData.id}/update/`, couponData);
  return { data: response.data };
};

export const deleteSoCoupon = async (couponId: string): Promise<void> => {
  await api.delete(`/second-opinion/admin/coupons/${couponId}/`);
};

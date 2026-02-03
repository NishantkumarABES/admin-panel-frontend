import { api } from "./api";
import type { Coupon, CreateCouponDTO, UpdateCouponDTO } from "../features/products/coupon.types";

export interface CouponFilters {
  page?: number;
  page_size?: number;
  search?: string;
  coupon_type?: string;
  is_active?: boolean;
  product_id?: string;
}

export interface PaginatedCouponResponse {
  results: Coupon[];
  count: number;
  next: string | null;
  previous: string | null;
}

export const getCoupons = async (filters: CouponFilters = {}): Promise<{ data: PaginatedCouponResponse }> => {
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
  if (filters.product_id) {
    params.append("product_id", filters.product_id);
  }

  const queryString = params.toString();
  const response = await api.get<PaginatedCouponResponse>(
    `/commerce/admin/coupons/${queryString ? `?${queryString}` : ""}`
  );

  return { data: response.data };
};

export const getCouponsByProductId = async (productId: string): Promise<{ data: Coupon[] }> => {
  const response = await api.get<Coupon[]>(`/commerce/admin/products/${productId}/coupons/`);
  return { data: response.data };
};

export const createCoupon = async (couponData: CreateCouponDTO): Promise<{ data: Coupon }> => {
  const response = await api.post<Coupon>("/commerce/admin/coupons/", couponData);
  return { data: response.data };
};

export const updateCoupon = async (couponData: UpdateCouponDTO): Promise<{ data: Coupon }> => {
  const response = await api.patch<Coupon>(`/commerce/admin/coupons/${couponData.id}/`, couponData);
  return { data: response.data };
};

export const deleteCoupon = async (couponId: string): Promise<void> => {
  await api.delete(`/commerce/admin/coupons/${couponId}/`);
};

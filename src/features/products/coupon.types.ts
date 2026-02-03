// Coupon Types
export type CouponType = "product" | "category" | "all";
export type DiscountType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: string;
  max_uses?: number;
  current_uses: number;
  min_purchase_amount?: string;
  max_discount_amount?: string;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  created_at: string;
  updated_at: string;
}

// DTO for creating coupons
export interface CreateCouponDTO {
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: string;
  max_uses?: number;
  min_purchase_amount?: string;
  max_discount_amount?: string;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
}

export interface UpdateCouponDTO extends Partial<CreateCouponDTO> {
  id: string;
}


export const mockCoupons: Coupon[] = [
  {
    id: "1",
    code: "COUPON10",
    description: "10% off on all products",
    discount_type: "percentage",
    discount_value: "10.00",
    max_uses: 100,
    current_uses: 50,
    min_purchase_amount: "50.00",
    max_discount_amount: "50.00",
    is_active: true,
    valid_from: "2023-01-01T00:00:00Z",
    valid_until: "2023-12-31T23:59:59Z",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    code: "COUPON20",
    description: "20% off on electronics",
    discount_type: "fixed",
    discount_value: "20.00",
    max_uses: 50,
    current_uses: 25,
    is_active: true,
    valid_from: "2023-02-01T00:00:00Z",
    valid_until: "2023-03-31T23:59:59Z",
    created_at: "2023-02-01T00:00:00Z",
    updated_at: "2023-02-01T00:00:00Z",
  }
]
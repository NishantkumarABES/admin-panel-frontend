// Second Opinion Coupon Types
export type DiscountType = "percentage" | "fixed";

export interface SoCoupon {
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

// DTO for creating SO coupons
export interface CreateSoCouponDTO {
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

export interface UpdateSoCouponDTO extends Partial<CreateSoCouponDTO> {
    id: string;
}

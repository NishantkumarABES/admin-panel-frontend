import { api } from "./api";
import type {
    RefundRequest,
    RefundAnalytics,
    RefundFilters,
} from "../features/orders/order.types";

// Get refund requests with filters
export const getRefunds = (filters?: RefundFilters) => {
    const params = new URLSearchParams();

    if (filters?.status && filters.status !== "all") {
        params.append("status", filters.status);
    }
    if (filters?.refund_type && filters.refund_type !== "all") {
        params.append("refund_type", filters.refund_type);
    }
    if (filters?.date_from) {
        params.append("date_from", filters.date_from);
    }
    if (filters?.date_to) {
        params.append("date_to", filters.date_to);
    }
    if (filters?.search) {
        params.append("search", filters.search);
    }
    if (filters?.payment_method && filters.payment_method !== "all") {
        params.append("payment_method", filters.payment_method);
    }
    if (filters?.page) {
        params.append("page", filters.page.toString());
    }
    if (filters?.page_size) {
        params.append("page_size", filters.page_size.toString());
    }

    const queryString = params.toString();
    return api.get<{
        results: RefundRequest[];
        count: number;
        next: string | null;
        previous: string | null;
    }>(`/commerce/admin/refundss/${queryString ? `?${queryString}` : ""}`);
};

// Get single refund by ID
export const getRefundById = (id: string) => {
    return api.get<{ success: boolean; data: RefundRequest }>(`/commerce/admin/refunds/${id}/`);
};

// Mark refund as under review
export const reviewRefund = (refundId: string) => {
    return api.patch<{ success: boolean; data: RefundRequest }>(
        `/commerce/admin/refunds/${refundId}/review/`,
        {}
    );
};

// Approve refund
export const approveRefund = (refundId: string, adminNotes?: string) => {
    return api.patch<{ success: boolean; data: RefundRequest }>(
        `/commerce/admin/refunds/${refundId}/approve/`,
        { admin_notes: adminNotes }
    );
};

// Reject refund
export const rejectRefund = (refundId: string, reason: string, adminNotes?: string) => {
    return api.patch<{ success: boolean; data: RefundRequest }>(
        `/commerce/admin/refunds/${refundId}/reject/`,
        { rejection_reason: reason, admin_notes: adminNotes }
    );
};

// Initiate refund processing via payment gateway
export const initiateRefund = (refundId: string) => {
    return api.post<{ success: boolean; data: RefundRequest }>(
        `/commerce/admin/refunds/${refundId}/initiate/`,
        {}
    );
};

// Get refund analytics
export const getRefundAnalytics = () => {
    return api.get<RefundAnalytics>("/analytics/admin/refunds/metrics/");
};

// Export refunds list (download)
export const exportRefunds = (filters?: RefundFilters) => {
    const params = new URLSearchParams();

    if (filters?.status && filters.status !== "all") {
        params.append("status", filters.status);
    }
    if (filters?.date_from) {
        params.append("date_from", filters.date_from);
    }
    if (filters?.date_to) {
        params.append("date_to", filters.date_to);
    }

    return api.get(`/commerce/admin/refunds/export/?${params.toString()}`, {
        responseType: "blob",
    });
};

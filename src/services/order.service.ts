import { api } from "./api";
import type {
  Order,
  OrderAnalytics,
  OrderFilters,
  UpdateOrderStatusDTO,
  RefundOrderDTO,
  AddOrderNoteDTO
} from "../features/orders/order.types";

export interface CreateOrderDTO {
  user_id: string;
  address_id: string;
  items: Array<{ product_id: string; quantity: number }>;
  payment_method: string;
  payment_reference?: string;
  status?: string;
}

// Get orders with filters
export const getOrders = (filters?: OrderFilters) => {
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
  if (filters?.search) {
    params.append("search", filters.search);
  }
  if (filters?.page) {
    params.append("page", filters.page.toString());
  }
  if (filters?.page_size) {
    params.append("page_size", filters.page_size.toString());
  }

  const queryString = params.toString();
  return api.get<{
    results: Order[];
    count: number;
    next: string | null;
    previous: string | null;
  }>(`/commerce/admin/orders/${queryString ? `?${queryString}` : ""}`);
};

// Get order by ID
export const getOrderById = (id: string) => {
  return api.get<{ success: boolean; data: Order }>(`/commerce/admin/orders/${id}/`);
};

// Get order analytics
export const getOrderAnalytics = () => {
  return api.get<OrderAnalytics>("/analytics/admin/orders/metrics/");
};

// Create a new order (admin manual creation)
export const createOrder = (data: CreateOrderDTO) => {
  return api.post<{ success: boolean; message: string; data: Order }>("/commerce/admin/orders/", data);
};

// Update order status
export const updateOrderStatus = (data: UpdateOrderStatusDTO) => {
  return api.patch<{ success: boolean; data: Order }>(`/commerce/admin/orders/${data.id}/status/`, {
    status: data.status,
    note: data.note
  });
};

// Refund order
export const refundOrder = (data: RefundOrderDTO) => {
  return api.post<Order>(`/commerce/admin/orders/${data.id}/refund/`, {
    reason: data.reason,
    amount: data.amount
  });
};

// Add note to order
export const addOrderNote = (data: AddOrderNoteDTO) => {
  return api.post<Order>(`/commerce/admin/orders/${data.id}/notes/`, {
    note: data.note
  });
};

// Export orders (download)
export const exportOrders = (filters?: OrderFilters) => {
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

  return api.get(`/commerce/admin/orders/export/?${params.toString()}`, {
    responseType: "blob"
  });
};


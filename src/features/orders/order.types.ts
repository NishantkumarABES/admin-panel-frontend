// Order related types

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "card" | "upi" | "netbanking" | "wallet" | "cod";
export type CouponType = "percentage" | "fixed";

export interface Address {
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    image_url?: string;
    sku?: string;
  };
  quantity: number;
  base_price: number;
  tax_percentage: number;
  discount_percentage: number;
  final_total: number;
}

export interface Order {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  address: Address;
  status: OrderStatus;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
  items: OrderItem[];
  subtotal_amount?: number;
  coupon_code?: string;
  coupon_type?: CouponType;
  coupon_value?: string;
  coupon_discount?: number;
  shipping_charge?: number;
  notes?: string;
  timeline?: OrderTimelineEvent[];
  created_at: string;
  updated_at?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderAnalytics {
  total_orders: number;
  pending_payments: number;
  processing_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  paid_orders?: number;
  refunded_orders?: number;
  refund_amount?: number;
  total_revenue: number;
}

export interface OrderFilters {
  status?: OrderStatus | "all";
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface UpdateOrderStatusDTO {
  id: string;
  status: OrderStatus;
  note?: string;
}

export interface RefundOrderDTO {
  id: string;
  reason: string;
  amount?: number;
}

export interface AddOrderNoteDTO {
  id: string;
  note: string;
}

// Status display configurations
export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string
}> = {
  pending_payment: {
    label: "Pending Payment",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  paid: {
    label: "Paid",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  processing: {
    label: "Processing",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  shipped: {
    label: "Shipped",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  refunded: {
    label: "Refunded",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  }
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "Credit/Debit Card",
  upi: "UPI",
  netbanking: "Net Banking",
  wallet: "Wallet",
  cod: "Cash on Delivery"
};

// Mock data for development
export const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    user: {
      id: "USR-001",
      name: "Dr. Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 9876543210"
    },
    address: {
      name: "Dr. Rajesh Kumar",
      phone: "+91 9876543210",
      address_line: "123 Medical Complex, MG Road",
      city: "Bangalore",
      state: "Karnataka",
      postal_code: "560001",
      country: "India"
    },
    status: "delivered",
    total_amount: 2499.00,
    payment_method: "card",
    payment_reference: "PAY-123456789",
    items: [
      {
        id: "ITEM-001",
        product: {
          id: "PROD-001",
          name: "Premium Stethoscope",
          image_url: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=200",
          sku: "MED-STET-001"
        },
        quantity: 1,
        base_price: 2499.00,
        final_total: 2499.00,
        tax_percentage: 5,
        discount_percentage: 0
      }
    ],
    subtotal_amount: 2499.00,
    // tax: 449.82,
    // discount: 0,
    shipping_charge: 0,
    created_at: "2024-01-13T10:30:00Z",
    updated_at: "2024-01-14T15:45:00Z"
  },
  {
    id: "ORD-2024-002",
    user: {
      id: "USR-002",
      name: "Dr. Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 9876543211"
    },
    address: {
      name: "Dr. Priya Sharma",
      phone: "+91 9876543211",
      address_line: "456 Healthcare Centre, Park Street",
      city: "Mumbai",
      state: "Maharashtra",
      postal_code: "400001",
      country: "India"
    },
    status: "processing",
    total_amount: 5999.00,
    payment_method: "upi",
    payment_reference: "UPI-987654321",
    items: [
      {
        id: "ITEM-002",
        product: {
          id: "PROD-002",
          name: "Digital BP Monitor",
          image_url: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=200",
          sku: "MED-BP-002"
        },
        quantity: 2,
        base_price: 2999.50,
        final_total: 5999.00,
        tax_percentage: 10,
        discount_percentage: 200
      }
    ],
    subtotal_amount: 5999.00,
    // tax: 1079.82,
    // discount: 200,
    shipping_charge: 50,
    created_at: "2024-01-13T14:20:00Z"
  },
  {
    id: "ORD-2024-003",
    user: {
      id: "USR-003",
      name: "Dr. Amit Patel",
      email: "amit.patel@example.com"
    },
    address: {
      name: "Dr. Amit Patel",
      phone: "+91 9876543212",
      address_line: "789 Medical Plaza, Civil Lines",
      city: "Delhi",
      state: "Delhi",
      postal_code: "110001",
      country: "India"
    },
    status: "pending_payment",
    total_amount: 1299.00,
    payment_method: "cod",
    items: [
      {
        id: "ITEM-003",
        product: {
          id: "PROD-003",
          name: "Surgical Gloves (Pack of 100)",
          sku: "MED-GLOVE-003"
        },
        quantity: 1,
        base_price: 1299.00,
        tax_percentage: 0,
        discount_percentage: 0,
        final_total: 1299.00
      }
    ],
    subtotal_amount: 1299.00,
    // tax: 233.82,
    // discount: 0,
    shipping_charge: 40,
    created_at: "2024-01-13T16:10:00Z"
  },
  {
    id: "ORD-2024-004",
    user: {
      id: "USR-004",
      name: "Dr. Sneha Reddy",
      email: "sneha.reddy@example.com",
      phone: "+91 9876543213"
    },
    address: {
      name: "Dr. Sneha Reddy",
      phone: "+91 9876543213",
      address_line: "321 Health Clinic, Anna Salai",
      city: "Chennai",
      state: "Tamil Nadu",
      postal_code: "600001",
      country: "India"
    },
    status: "shipped",
    total_amount: 8999.00,
    payment_method: "netbanking",
    payment_reference: "NB-456789123",
    items: [
      {
        id: "ITEM-004",
        product: {
          id: "PROD-004",
          name: "ECG Machine Portable",
          image_url: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=200",
          sku: "MED-ECG-004"
        },
        quantity: 1,
        base_price: 8999.00,
        tax_percentage: 10,
        discount_percentage: 50,
        final_total: 8999.00
      }
    ],
    subtotal_amount: 8999.00,
    // tax: 1619.82,
    // discount: 500,
    shipping_charge: 0,
    created_at: "2024-01-12T09:15:00Z",
    updated_at: "2024-01-13T11:30:00Z"
  }
];

// ──────────────────────────────────────────────────────
// REFUND TYPES
// ──────────────────────────────────────────────────────

export type RefundStatus =
  | "refund_requested"
  | "under_review"
  | "approved"
  | "rejected"
  | "refund_initiated"
  | "refund_completed"
  | "refund_failed";

export type RefundType = "full" | "partial";

export interface RefundTimelineEvent {
  status: RefundStatus;
  timestamp: string;
  note?: string;
  actor?: string;
}

export interface RefundItemProduct {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface RefundRequest {
  id: string;
  order_id: string;
  order_number?: string;
  order_status?: string;
  order_total_amount?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  address?: Address;
  items?: RefundItemProduct[];
  payment_method?: string;
  payment_gateway?: string;
  payment_reference?: string;
  payment_id?: string;
  refund_type: RefundType;
  refund_amount: number;
  reason: string;
  user_notes?: string;
  is_partial?: boolean;
  status: RefundStatus;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: {
    id: string;
    name: string;
    email: string;
  };
  admin_notes?: string;
  rejection_reason?: string;
  refund_initiated_at?: string;
  refund_completed_at?: string;
  payment_gateway_reference?: string | null;
  timeline?: RefundTimelineEvent[];
}

export interface RefundAnalytics {
  total_refunds: number;
  pending_refunds: number;
  approved_refunds: number;
  rejected_refunds: number;
  total_refund_amount: number;
}

export interface RefundFilters {
  status?: RefundStatus | "all";
  refund_type?: RefundType | "all";
  date_from?: string;
  date_to?: string;
  search?: string;
  payment_method?: PaymentMethod | "all";
  page?: number;
  page_size?: number;
}

export const REFUND_STATUS_CONFIG: Record<RefundStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  refund_requested: {
    label: "Refund Requested",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  under_review: {
    label: "Under Review",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  approved: {
    label: "Approved",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  refund_initiated: {
    label: "Refund Initiated",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  refund_completed: {
    label: "Refund Completed",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  refund_failed: {
    label: "Refund Failed",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
};

// ──────────────────────────────────────────────────────
// MOCK REFUND DATA
// ──────────────────────────────────────────────────────

export const mockRefundRequests: RefundRequest[] = [
  {
    id: "REF-2024-001",
    order_id: "ORD-2024-001",
    order_number: "ORD-2024-001",
    order_status: "delivered",
    order_total_amount: "2499.00",
    user: { id: "USR-001", name: "Dr. Rajesh Kumar", email: "rajesh.kumar@example.com", phone: "+91 9876543210" },
    payment_method: "card",
    payment_reference: "PAY-123456789",
    refund_type: "full",
    refund_amount: 2499.0,
    reason: "Product not as described",
    user_notes: "The stethoscope quality does not match the description on the website. Tube is too stiff.",
    status: "refund_requested",
    requested_at: "2024-01-15T10:30:00Z",
    timeline: [
      { status: "refund_requested", timestamp: "2024-01-15T10:30:00Z", note: "User submitted refund request", actor: "Dr. Rajesh Kumar" },
    ],
  },
  {
    id: "REF-2024-002",
    order_id: "ORD-2024-002",
    order_number: "ORD-2024-002",
    order_status: "processing",
    order_total_amount: "5999.00",
    user: { id: "USR-002", name: "Dr. Priya Sharma", email: "priya.sharma@example.com", phone: "+91 9876543211" },
    payment_method: "upi",
    payment_reference: "UPI-987654321",
    refund_type: "partial",
    refund_amount: 2999.5,
    reason: "Received damaged item",
    user_notes: "One of the two BP monitors arrived with a cracked screen.",
    status: "under_review",
    requested_at: "2024-01-14T08:15:00Z",
    reviewed_at: "2024-01-14T14:00:00Z",
    reviewed_by: { id: "ADM-001", name: "Admin User", email: "admin@clinictopics.com" },
    admin_notes: "Checking with warehouse for damage report",
    timeline: [
      { status: "refund_requested", timestamp: "2024-01-14T08:15:00Z", note: "User submitted refund request for damaged item", actor: "Dr. Priya Sharma" },
      { status: "under_review", timestamp: "2024-01-14T14:00:00Z", note: "Admin started reviewing the request", actor: "Admin User" },
    ],
  },
  {
    id: "REF-2024-003",
    order_id: "ORD-2024-004",
    order_number: "ORD-2024-004",
    order_status: "shipped",
    order_total_amount: "8999.00",
    user: { id: "USR-004", name: "Dr. Sneha Reddy", email: "sneha.reddy@example.com", phone: "+91 9876543213" },
    payment_method: "netbanking",
    payment_reference: "NB-456789123",
    refund_type: "full",
    refund_amount: 8999.0,
    reason: "Wrong product delivered",
    user_notes: "Ordered ECG Machine Portable but received a different model.",
    status: "approved",
    requested_at: "2024-01-13T11:00:00Z",
    reviewed_at: "2024-01-13T16:30:00Z",
    reviewed_by: { id: "ADM-001", name: "Admin User", email: "admin@clinictopics.com" },
    admin_notes: "Confirmed wrong item shipped. Full refund approved.",
    timeline: [
      { status: "refund_requested", timestamp: "2024-01-13T11:00:00Z", note: "User reported wrong product delivery", actor: "Dr. Sneha Reddy" },
      { status: "under_review", timestamp: "2024-01-13T14:00:00Z", note: "Review started", actor: "Admin User" },
      { status: "approved", timestamp: "2024-01-13T16:30:00Z", note: "Full refund approved — wrong item confirmed by warehouse", actor: "Admin User" },
    ],
  },
  {
    id: "REF-2024-004",
    order_id: "ORD-2024-003",
    order_number: "ORD-2024-003",
    order_status: "pending_payment",
    order_total_amount: "1299.00",
    user: { id: "USR-003", name: "Dr. Amit Patel", email: "amit.patel@example.com" },
    payment_method: "cod",
    refund_type: "full",
    refund_amount: 1299.0,
    reason: "Changed mind",
    status: "rejected",
    requested_at: "2024-01-14T12:00:00Z",
    reviewed_at: "2024-01-15T09:00:00Z",
    reviewed_by: { id: "ADM-001", name: "Admin User", email: "admin@clinictopics.com" },
    rejection_reason: "Refund policy does not cover change-of-mind for opened consumable items",
    admin_notes: "Product is consumable and has been opened. Cannot be restocked.",
    timeline: [
      { status: "refund_requested", timestamp: "2024-01-14T12:00:00Z", note: "User requested refund — changed mind", actor: "Dr. Amit Patel" },
      { status: "under_review", timestamp: "2024-01-14T18:00:00Z", note: "Review started", actor: "Admin User" },
      { status: "rejected", timestamp: "2024-01-15T09:00:00Z", note: "Rejected: consumable item already opened", actor: "Admin User" },
    ],
  },
  {
    id: "REF-2024-005",
    order_id: "ORD-2024-001",
    order_number: "ORD-2024-001",
    order_status: "delivered",
    order_total_amount: "2499.00",
    user: { id: "USR-001", name: "Dr. Rajesh Kumar", email: "rajesh.kumar@example.com", phone: "+91 9876543210" },
    payment_method: "card",
    payment_reference: "PAY-123456789",
    refund_type: "partial",
    refund_amount: 500.0,
    reason: "Minor defect in product",
    user_notes: "Small scratch on the stethoscope chest-piece. Requesting partial refund.",
    status: "refund_initiated",
    requested_at: "2024-01-12T09:00:00Z",
    reviewed_at: "2024-01-12T15:00:00Z",
    reviewed_by: { id: "ADM-001", name: "Admin User", email: "admin@clinictopics.com" },
    admin_notes: "Partial refund approved for cosmetic defect",
    refund_initiated_at: "2024-01-13T10:00:00Z",
    payment_gateway_reference: "RZP-REF-98765",
    timeline: [
      { status: "refund_requested", timestamp: "2024-01-12T09:00:00Z", note: "Partial refund requested for cosmetic defect", actor: "Dr. Rajesh Kumar" },
      { status: "under_review", timestamp: "2024-01-12T12:00:00Z", note: "Review started", actor: "Admin User" },
      { status: "approved", timestamp: "2024-01-12T15:00:00Z", note: "Partial refund of ₹500 approved", actor: "Admin User" },
      { status: "refund_initiated", timestamp: "2024-01-13T10:00:00Z", note: "Refund initiated via Razorpay — Ref: RZP-REF-98765", actor: "system" },
    ],
  },
  {
    id: "REF-2024-006",
    order_id: "ORD-2024-002",
    order_number: "ORD-2024-002",
    order_status: "processing",
    order_total_amount: "5999.00",
    user: { id: "USR-002", name: "Dr. Priya Sharma", email: "priya.sharma@example.com", phone: "+91 9876543211" },
    payment_method: "upi",
    payment_reference: "UPI-987654321",
    refund_type: "full",
    refund_amount: 5999.0,
    reason: "Product not working",
    user_notes: "Both BP monitors show inaccurate readings after calibration.",
    status: "refund_completed",
    requested_at: "2024-01-10T08:00:00Z",
    reviewed_at: "2024-01-10T14:00:00Z",
    reviewed_by: { id: "ADM-001", name: "Admin User", email: "admin@clinictopics.com" },
    admin_notes: "QA confirmed calibration issue. Full refund processed.",
    refund_initiated_at: "2024-01-11T09:00:00Z",
    refund_completed_at: "2024-01-12T16:00:00Z",
    payment_gateway_reference: "RZP-REF-11223",
    timeline: [
      { status: "refund_requested", timestamp: "2024-01-10T08:00:00Z", note: "User reported defective product", actor: "Dr. Priya Sharma" },
      { status: "under_review", timestamp: "2024-01-10T10:00:00Z", note: "Review started", actor: "Admin User" },
      { status: "approved", timestamp: "2024-01-10T14:00:00Z", note: "Full refund approved after QA verification", actor: "Admin User" },
      { status: "refund_initiated", timestamp: "2024-01-11T09:00:00Z", note: "Refund initiated via Razorpay", actor: "system" },
      { status: "refund_completed", timestamp: "2024-01-12T16:00:00Z", note: "Refund of ₹5,999.00 completed successfully", actor: "system" },
    ],
  },
  {
    id: "REF-2024-007",
    order_id: "ORD-2024-004",
    order_number: "ORD-2024-004",
    order_status: "shipped",
    order_total_amount: "8999.00",
    user: { id: "USR-004", name: "Dr. Sneha Reddy", email: "sneha.reddy@example.com", phone: "+91 9876543213" },
    payment_method: "netbanking",
    payment_reference: "NB-456789123",
    refund_type: "partial",
    refund_amount: 1500.0,
    reason: "Missing accessories",
    user_notes: "ECG Machine delivered without the carrying case and leads.",
    status: "refund_failed",
    requested_at: "2024-01-11T07:30:00Z",
    reviewed_at: "2024-01-11T13:00:00Z",
    reviewed_by: { id: "ADM-001", name: "Admin User", email: "admin@clinictopics.com" },
    admin_notes: "Refund approved but payment gateway returned error",
    refund_initiated_at: "2024-01-12T08:00:00Z",
    payment_gateway_reference: "RZP-REF-FAIL-001",
    timeline: [
      { status: "refund_requested", timestamp: "2024-01-11T07:30:00Z", note: "User reported missing accessories", actor: "Dr. Sneha Reddy" },
      { status: "under_review", timestamp: "2024-01-11T10:00:00Z", note: "Review started", actor: "Admin User" },
      { status: "approved", timestamp: "2024-01-11T13:00:00Z", note: "Partial refund of ₹1,500 approved", actor: "Admin User" },
      { status: "refund_initiated", timestamp: "2024-01-12T08:00:00Z", note: "Refund initiated via Razorpay", actor: "system" },
      { status: "refund_failed", timestamp: "2024-01-12T08:05:00Z", note: "Payment gateway error: transaction timed out. Will retry.", actor: "system" },
    ],
  },
  {
    id: "REF-2024-008",
    order_id: "ORD-2024-003",
    order_number: "ORD-2024-003",
    order_status: "pending_payment",
    order_total_amount: "1299.00",
    user: { id: "USR-003", name: "Dr. Amit Patel", email: "amit.patel@example.com" },
    payment_method: "cod",
    refund_type: "partial",
    refund_amount: 400.0,
    reason: "Overcharged shipping",
    user_notes: "Was promised free shipping but charged ₹400 for delivery.",
    status: "refund_requested",
    requested_at: "2024-01-16T11:00:00Z",
    timeline: [
      { status: "refund_requested", timestamp: "2024-01-16T11:00:00Z", note: "User claims overcharged shipping", actor: "Dr. Amit Patel" },
    ],
  },
];


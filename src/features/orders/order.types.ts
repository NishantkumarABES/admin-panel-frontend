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

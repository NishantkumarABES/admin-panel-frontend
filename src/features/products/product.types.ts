// API Response Types
export type ProductStatus = "active" | "inactive";

export interface ProductImage {
  id: string;
  image: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  category_name: string;
  description: string;
  price: string;
  tax_percentage: string;
  is_prescription_required: boolean;
  is_active: boolean;
  stock_quantity: number;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProductAnalytics {
  total_products: number;
  active_products: number;
  inactive_products: number;
}

// DTO for creating/editing products
export interface CreateProductDTO {
  name: string;
  sku: string;
  category: string;
  description: string;
  price: string;
  tax_percentage: string;
  is_prescription_required: boolean;
  is_active: boolean;
  stock_quantity: number;
  images?: File[];
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  id: string;
}

// Mock data for testing
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    sku: "MED-001",
    category: "1",
    category_name: "Tablets",
    description: "Pain relief and fever reducer",
    price: "50.00",
    tax_percentage: "5.00",
    is_prescription_required: false,
    is_active: true,
    stock_quantity: 500,
    images: [],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    sku: "MED-002",
    category: "2",
    category_name: "Capsules",
    description: "Antibiotic for bacterial infections",
    price: "120.00",
    tax_percentage: "5.00",
    is_prescription_required: true,
    is_active: true,
    stock_quantity: 300,
    images: [],
    created_at: "2024-01-16T11:30:00Z",
    updated_at: "2024-01-16T11:30:00Z",
  },
  {
    id: "3",
    name: "Vitamin D3 Supplement",
    sku: "MED-003",
    category: "3",
    category_name: "Supplements",
    description: "Vitamin D3 for bone health",
    price: "250.00",
    tax_percentage: "12.00",
    is_prescription_required: false,
    is_active: false,
    stock_quantity: 0,
    images: [],
    created_at: "2024-01-17T14:00:00Z",
    updated_at: "2024-01-17T14:00:00Z",
  },
];

export const PRODUCT_CATEGORIES = [
  "Tablets",
  "Capsules",
  "Syrups",
  "Injections",
  "Creams & Ointments",
  "Supplements",
  "Medical Devices",
  "First Aid",
  "Personal Care",
  "Baby Care",
] as const;
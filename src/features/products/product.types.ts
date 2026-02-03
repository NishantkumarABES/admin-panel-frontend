// API Response Types
export type ProductStatus = "instock" | "outofstock";

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
  brand?: string;
  description: string;
  price: string;
  discount_percentage: string;
  tax_percentage: string;
  is_active: boolean;
  stock_quantity: number;
  for_patients: boolean;
  for_doctors: boolean;
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
  instock_products: number;
  outofstock_products: number;
  success: boolean;
}

// DTO for creating/editing products
export interface CreateProductDTO {
  name: string;
  category: string;
  brand?: string;
  description: string;
  price: string;
  discount_percentage: string;
  tax_percentage: string;
  is_active: boolean;
  stock_quantity: number;
  for_patients: boolean;
  for_doctors: boolean;
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
    brand: "HealthCorp",
    category: "supplies",
    description: "Pain relief and fever reducer",
    price: "50.00",
    discount_percentage: "0.00",
    tax_percentage: "5.00",
    is_active: true,
    stock_quantity: 500,
    for_patients: true,
    for_doctors: false,
    images: [],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    sku: "MED-002",
    brand: "BioPharma",
    category: "supplies",
    description: "Antibiotic for bacterial infections",
    price: "120.00",
    discount_percentage: "10.00",
    tax_percentage: "5.00",
    is_active: true,
    stock_quantity: 300,
    for_patients: false,
    for_doctors: true,
    images: [],
    created_at: "2024-01-16T11:30:00Z",
    updated_at: "2024-01-16T11:30:00Z",
  },
  {
    id: "3",
    name: "Vitamin D3 Supplement",
    sku: "MED-003",
    brand: "NutriHealth",
    category: "supplies",
    description: "Vitamin D3 for bone health",
    price: "250.00",
    discount_percentage: "15.00",
    tax_percentage: "12.00",
    is_active: false,
    stock_quantity: 0,
    for_patients: true,
    for_doctors: true,
    images: [],
    created_at: "2024-01-17T14:00:00Z",
    updated_at: "2024-01-17T14:00:00Z",
  },
];

export const PRODUCT_CATEGORIES = [
  'diagnostics',
  'ppe',
  'monitoring',
  'supplies'
] as const;




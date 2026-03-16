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
  max_user_quantity: number | null;
  for_patients: boolean;
  for_doctors: boolean;
  is_refundable: boolean;
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
  max_quantity_per_user?: number | null;
  for_patients: boolean;
  for_doctors: boolean;
  is_refundable: boolean;
  images?: File[];
  deleted_image_ids?: string[];
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
    max_user_quantity: null,
    for_patients: true,
    for_doctors: false,
    is_refundable: false,
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
    max_user_quantity: null,
    for_patients: false,
    for_doctors: true,
    is_refundable: true,
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
    max_user_quantity: null,
    for_patients: true,
    for_doctors: true,
    is_refundable: false,
    images: [],
    created_at: "2024-01-17T14:00:00Z",
    updated_at: "2024-01-17T14:00:00Z",
  },
];

export const PRODUCT_CATEGORIES = [
  'diagnostics',
  'ppe',
  'monitoring',
  'supplies',
  'medicine',
  'skin_care',
  'vitamins_minerals',
  'baby_care',
  'pain_relief',
  'diabetic_care',
  'protein_supplements',
  'personal_care_hygiene',
] as const;

export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  diagnostics: 'Diagnostics',
  ppe: 'PPE',
  monitoring: 'Monitoring',
  supplies: 'Supplies',
  medicine: 'Medicine',
  skin_care: 'Skin Care',
  vitamins_minerals: 'Vitamins & Minerals',
  baby_care: 'Baby Care',
  pain_relief: 'Pain Relief',
  diabetic_care: 'Diabetic Care',
  protein_supplements: 'Protein Supplements',
  personal_care_hygiene: 'Personal Care & Hygiene',
};

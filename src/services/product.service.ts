import { api } from "./api";
import type { 
    PaginatedResponse, CreateProductDTO, UpdateProductDTO,  Product, 
} from "../features/products/product.types";

export interface ProductFilters {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    category?: string;
    is_prescription_required?: boolean;
}



export const getProducts = async (filters: ProductFilters = {}): Promise<{ data: PaginatedResponse<Product> }> => {
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
    if (filters.status) {
        params.append("status", filters.status);
    }
    if (filters.category) {
        params.append("category", filters.category);
    }
    if (filters.is_prescription_required !== undefined) {
        params.append("is_prescription_required", filters.is_prescription_required.toString());
    }

    const queryString = params.toString();
    const response = await api.get<PaginatedResponse<Product>>(
        `/products${queryString ? `?${queryString}` : ""}`
    );

    return { data: response.data };
};

export const createProduct = async (productData: CreateProductDTO): Promise<{ data: Product }> => {
    const payload = {
        ...productData,
    }
    const response = await api.post<Product>("/products", payload);
    return { data: response.data };
};

export const updateProduct = async (productData: UpdateProductDTO): Promise<{ data: Product }> => {
    const payload = {
        ...productData,
    }
    const response = await api.patch<Product>(`/products/${productData.id}`, payload);
    return { data: response.data };
}
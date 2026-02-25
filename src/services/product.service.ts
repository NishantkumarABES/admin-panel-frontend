import { api } from "./api";
import type {
    PaginatedResponse, CreateProductDTO, UpdateProductDTO, Product, ProductAnalytics
} from "../features/products/product.types";

export interface ProductFilters {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    category?: string;
    user_type?: string;
}

export const getProductsAnalytics = () =>
    api.get<ProductAnalytics>("/analytics/admin/products/metrics/");

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
    if (filters.user_type) {
        params.append("user_type", filters.user_type);
    }

    const queryString = params.toString();
    const response = await api.get<PaginatedResponse<Product>>(
        `/commerce/admin/products/${queryString ? `?${queryString}` : ""}`
    );

    return { data: response.data };
};

export const createProduct = async (productData: CreateProductDTO): Promise<{ data: Product }> => {
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
            value.forEach(file => formData.append("images", file));
        } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });
    const response = await api.post<Product>("/commerce/admin/products/", formData);
    return { data: response.data };
};

export const updateProduct = async (productData: UpdateProductDTO): Promise<{ data: Product }> => {
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
            // Only send images field if there are actual new files to upload
            if (value.length > 0) {
                value.forEach(file => formData.append("images", file));
            }
        } else if (key === "deleted_image_ids" && Array.isArray(value)) {
            // Send each deleted image ID separately so Django receives a list
            value.forEach(id => formData.append("deleted_image_ids", id));
        } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });
    const response = await api.patch<Product>(`/commerce/admin/products/${productData.id}/`, formData);
    return { data: response.data };
}
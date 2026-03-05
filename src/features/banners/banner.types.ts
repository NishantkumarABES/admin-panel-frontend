// Banner Types

export interface Banner {
    id: string;
    title: string;
    subtitle?: string;
    image: string; // URL from server
    redirect_category: string;
    redirect_category_name?: string;
    is_active?: boolean;
    order?: number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateBannerDTO {
    title: string;
    subtitle?: string;
    image: File;
    redirect_category: string;
    is_active?: boolean;
    order?: number;
}

export interface UpdateBannerDTO {
    id: string;
    title?: string;
    subtitle?: string;
    image?: File;
    redirect_category?: string;
    is_active?: boolean;
    order?: number;
}

export interface BannerFilters {
    page?: number;
    page_size?: number;
    search?: string;
    is_active?: boolean;
}

// Wrapper response from the API: { success, detail, data }
export interface ApiResponse<T> {
    success: boolean;
    detail: string;
    data: T;
}

export interface PaginatedBannerResponse {
    results: Banner[];
    count: number;
    next: string | null;
    previous: string | null;
}

export interface Category {
    key: string;
    label: string;
}



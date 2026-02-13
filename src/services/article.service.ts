import { api } from "./api";
import type { Article, ArticleFilters, ReviewArticleDTO, ArticleAnalytics, CreateArticleDTO, UpdateArticleDTO } from "../features/my-reposit/articles/articles.types";

interface PaginatedArticles {
    count: number;
    next: string | null;
    previous: string | null;
    results: Article[];
}

interface ArticleResponse {
    detail: string;
    data: PaginatedArticles;
    success: boolean;
}

// Get all articles with optional filters
export const getArticles = async (filters?: ArticleFilters): Promise<PaginatedArticles> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size) params.append("page_size", filters.page_size.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.ordering) params.append("ordering", filters.ordering);
    if (filters?.speciality) params.append("speciality", filters.speciality);
    if (filters?.article_type) params.append("article_type", filters.article_type);
    if (filters?.status) params.append("status", filters.status);

    const queryString = params.toString();

    const response = await api.get<ArticleResponse>(
        `/articles/admin/${queryString ? `?${queryString}` : ""}`
    );

    return response.data.data;
};

// Review an article (publish or reject)
export const reviewArticle = async (id: string, data: ReviewArticleDTO) => {
    const response = await api.patch(`/articles/admin/${id}/review/`, data);
    return response.data;
};

// Move article from draft to in review
export const moveArticleToReview = async (id: string) => {
    const response = await api.patch(`/articles/admin/${id}/move/`);
    return response.data;
};

// Get articles analytics
export const getArticlesAnalytics = async (): Promise<ArticleAnalytics> => {
    const response = await api.get<ArticleAnalytics>("/analytics/admin/articles/metrics/");
    return response.data;
};

// Create an article on behalf of a doctor user
export const createArticle = async (data: CreateArticleDTO) => {
    const formData = new FormData();
    formData.append("user_id", data.user_id);
    formData.append("title", data.title);
    formData.append("article_type", data.article_type);
    formData.append("speciality", data.speciality);
    formData.append("authors", data.authors);
    formData.append("institution", data.institution);
    formData.append("abstract", data.abstract);
    formData.append("content", data.content);
    formData.append("year", data.year.toString());
    formData.append("publication_date", data.publication_date);

    const response = await api.post("/articles/admin/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// Update an article (admin)
// Update an article (admin)
export const updateArticle = async (id: string, data: UpdateArticleDTO) => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.article_type !== undefined) formData.append("article_type", data.article_type);
    if (data.speciality !== undefined) formData.append("speciality", data.speciality);
    if (data.authors !== undefined) formData.append("authors", data.authors);
    if (data.institution !== undefined) formData.append("institution", data.institution);
    if (data.abstract !== undefined) formData.append("abstract", data.abstract);
    if (data.content !== undefined) formData.append("content", data.content);
    if (data.year !== undefined) formData.append("year", data.year.toString());
    if (data.publication_date !== undefined) formData.append("publication_date", data.publication_date);

    const response = await api.patch(`/articles/admin/${id}/update/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

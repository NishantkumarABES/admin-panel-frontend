export type ArticleStatus = "draft" | "review" | "published" | "rejected";

export type ArticleType = "original_research" | "review" | "case_report" | "brief_communication";

export interface Article {
    id: string;
    uploaded_by: string;
    title: string;
    article_type: ArticleType;
    speciality: string | null;
    authors: string;
    institution: string | null;
    abstract: string;
    content: string | null;
    year: number;
    publication_date: string;
    status: ArticleStatus;
    rejection_reason: string | null;
    view_count: number;
    download_count: number;
    is_deleted: boolean;
    created_at: string;
}

export interface ArticleFilters {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    speciality?: string;
    article_type?: ArticleType;
    status?: ArticleStatus;
}

export interface ReviewArticleDTO {
    status: "published" | "rejected" | "review";
    rejection_reason?: string;
}

export interface ArticleAnalytics {
    total_articles: number;
    published_articles: number;
    draft_articles: number;
    in_review_articles: number;
    rejected_articles: number;
}

export interface CreateArticleDTO {
    user_id: string;
    title: string;
    article_type: ArticleType;
    speciality: string;
    authors: string;
    institution: string;
    abstract: string;
    content: string;
    publication_date: string;
}

export interface UpdateArticleDTO {
    title?: string;
    article_type?: ArticleType;
    speciality?: string;
    authors?: string;
    institution?: string;
    abstract?: string;
    content?: string;
    publication_date?: string;
}

export const ARTICLE_TYPES: { value: ArticleType; label: string }[] = [
    { value: "original_research", label: "Original Research" },
    { value: "review", label: "Review" },
    { value: "case_report", label: "Case Report" },
    { value: "brief_communication", label: "Brief Communication" },
];

export type VideoStatus = "pending" | "review" | "published" | "rejected";

export interface Video {
    id: string;
    uploaded_by: string;
    title: string;
    description: string;
    Institution: string;
    speciality: string | null;
    video_file: string;
    thumbnail: string | null;
    duration_seconds: number | null;
    status: VideoStatus;
    rejection_reason: string | null;
    view_count: number;
    download_count: number;
    is_deleted: boolean;
    allow_download: boolean;
    created_at: string;
    updated_at: string;
    is_bookmarked: boolean;
    is_liked: boolean;
    like_count: number;
}

export interface PaginatedVideoResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Video[];
}

export interface VideoFilters {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    speciality?: string;
    status?: VideoStatus;
}

export interface ReviewVideoDTO {
    status: "published" | "rejected" | "review";
    rejection_reason?: string;
}

export interface VideoAnalytics {
    total_videos: number;
    published_videos: number;
    draft_videos: number;
    in_review_videos: number;
    rejected_videos: number;
}

export interface CreateVideoDTO {
    user_id: string;
    title: string;
    description: string;
    Institution: string;
    speciality: string;
    video_file: File;
    thumbnail?: File;
    allow_download: boolean;
}

export interface UpdateVideoDTO {
    title?: string;
    description?: string;
    Institution?: string;
    speciality?: string;
    video_file?: File;
    thumbnail?: File;
    allow_download?: boolean;
}

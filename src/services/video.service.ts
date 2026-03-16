import { api } from "./api";
import type { VideoFilters, ReviewVideoDTO, VideoAnalytics, CreateVideoDTO, UpdateVideoDTO, PaginatedVideoResponse } from "../features/my-reposit/videos/videos.types";

interface VideoResponse {
    detail: string;
    data: PaginatedVideoResponse;
    success?: boolean;
}

// Get all videos with optional filters
export const getVideos = async (filters?: VideoFilters): Promise<PaginatedVideoResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size) params.append("page_size", filters.page_size.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.ordering) params.append("ordering", filters.ordering);
    if (filters?.speciality) params.append("speciality", filters.speciality);
    if (filters?.status) params.append("status", filters.status);

    const queryString = params.toString();

    const response = await api.get<VideoResponse>(
        `/videos/admin/${queryString ? `?${queryString}` : ""}`
    );

    return response.data.data;
};

// Review a video (publish or reject)
export const reviewVideo = async (id: string, data: ReviewVideoDTO) => {
    const response = await api.patch(`/videos/admin/review/${id}/`, data);
    return response.data;
};

// Move video from draft to in review
export const moveVideoToReview = async (id: string) => {
    const response = await api.patch(`/videos/admin/move/${id}/`);
    return response.data;
};

// Get video analytics
export const getVideoAnalytics = async (): Promise<VideoAnalytics> => {
    const response = await api.get<VideoAnalytics>("/analytics/admin/videos/metrics/");
    return response.data;
};

// Create a video on behalf of a doctor user
export const createVideo = async (data: CreateVideoDTO) => {
    const formData = new FormData();
    formData.append("user_id", data.user_id);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("Institution", data.Institution);
    formData.append("speciality", data.speciality);
    formData.append("video_file", data.video_file);
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);
    formData.append("allow_download", data.allow_download.toString());

    const response = await api.post("/videos/admin/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// Update a video (admin)
export const updateVideo = async (id: string, data: UpdateVideoDTO) => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.Institution !== undefined) formData.append("Institution", data.Institution);
    if (data.speciality !== undefined) formData.append("speciality", data.speciality);
    if (data.video_file) formData.append("video_file", data.video_file);
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);
    if (data.allow_download !== undefined) formData.append("allow_download", data.allow_download.toString());

    const response = await api.patch(`/videos/admin/update/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

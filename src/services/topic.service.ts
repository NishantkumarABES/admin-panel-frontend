import { api } from "./api";
import type {
  Topic,
  CreateTopicDTO,
  UpdateTopicDTO,
  ArticleExtractionResponse,
  PaginatedResponse,
  TopicsAnalytics,
} from "../features/topics/topic.types";

export interface TopicFilters {
  status?: string;
  page?: number;
  page_size?: number;
  search?: string;
}

// Get topics analytics
export const getTopicsAnalytics = async () => {
  const response = await api.get<TopicsAnalytics>("analytics/admin/topics/metrics/");
  return response.data;
};

// Get paginated topics list
export const getTopics = async (filters: TopicFilters = {}) => {
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

  const queryString = params.toString();
  const response = await api.get<PaginatedResponse<Topic>>(
    `topics/admin/topics/${queryString ? `?${queryString}` : ""}`
  );

  return response.data;
};

export const getTopicById = async (id: string) => {
  return api.get<Topic>(`topics/admin/topics/${id}/`);
};

export const createTopic = async (data: CreateTopicDTO) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "image" && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  const response = await api.post<{ success: boolean; data: Topic }>(
    "topics/admin/topics/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const updateTopic = async (data: UpdateTopicDTO) => {
  const { id, ...updateData } = data;
  const formData = new FormData();

  Object.entries(updateData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "image" && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  const response = await api.patch<{ success: boolean; data: Topic }>(
    `topics/admin/topics/${id}/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteTopic = async (id: string) => {
  return api.delete(`/admin/topics/${id}/`);
};

export const togglePublishStatus = async (id: string) => {
  const response = await api.patch<{ success: boolean; message: string }>(
    `topics/admin/topics/${id}/publish-status/`
  );
  return response.data;
};

export const extractArticleFromUrl = async (
  url: string
): Promise<ArticleExtractionResponse> => {
  try {
    const response = await api.post<ArticleExtractionResponse>(
      "topics/admin/extract-article/",
      { url }
    );
    return response.data;
  } catch (error: any) {
    return {
      detail: error.response?.data?.detail || "Failed to extract article content",
      success: false,
      error: error.response?.data?.detail || "Failed to extract article content",
    };
  }
};

export const cleanupUnwantedImages = async (imageUrls: string[]) => {
  try {
    await api.post("topics/admin/cleanup-unwanted-images/", {
      image_urls: imageUrls,
    });
  } catch (error: any) {
    console.error("Failed to cleanup unwanted images:", error);
  }
};

// Transcription service functions
export const startTranscription = async (topicId: string) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: {
      transcription_id: string;
      sonix_media_id: string;
      status: string;
    };
  }>(`topics/admin/topics/${topicId}/start-transcription/`);
  return response.data;
};

export const getTranscriptionStatus = async (topicId: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      status: string;
      transcription_id: string;
    };
  }>(`topics/admin/topics/${topicId}/transcription-status/`);
  return response.data;
};

export const downloadTranscript = async (
  topicId: string,
  format: "text" | "srt" = "text"
) => {
  const endpoint =
    format === "srt"
      ? `topics/admin/topics/${topicId}/transcript/srt/`
      : `topics/admin/topics/${topicId}/transcript/`;

  const response = await api.get(endpoint, {
    responseType: "blob",
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `transcript_${topicId}.${format === "srt" ? "srt" : "txt"}`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

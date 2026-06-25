export type TopicStatus = "unpublished" | "published"; // "scheduled" removed for simplicity

// Transcription Status Types
export type TranscriptionStatus =
  | "pending"
  | "preparing"
  | "transcribing"
  | "completed"
  | "failed"
  | "blocked";

// Transcription Data Interface
export interface TopicTranscription {
  id: string;
  sonix_media_id: string;
  status: TranscriptionStatus;
  transcript_text: string | null;
  transcript_srt: string | null;
  summary_text: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Backend API Topic Response Interface (from AdminTopicReadSerializer)
export interface Topic {
  id: string;
  title: string;
  title_color?: string | null;
  description: string;
  image: string;
  source_url: string | null;
  video_url: string | null;
  thumbnail: string | null;
  duration_seconds: number | null;
  publishing_time: string;
  publish_status: boolean;
  author_name: string | null;
  author_email: string | null;
  created_at: string;
  updated_at: string;
  transcription?: TopicTranscription | null;
}


// Paginated API Response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  success: boolean;
}

// Topics Analytics Response
export interface TopicsAnalytics {
  total_topics: number;
  published_topics: number;
  unpublished_topics: number;
  success: boolean;
}

// Article extraction data from backend
export interface ArticleExtractionData {
  title: string;
  summary: string;
  images: string[];
}

// Article extraction response from backend
export interface ArticleExtractionResponse {
  detail: string;
  data?: ArticleExtractionData;
  success: boolean;
  error?: string;
}

// AI title refinement response from backend
export interface TitleRefinementResponse {
  detail: string;
  data?: {
    original_title: string;
    refined_title: string;
  };
  success: boolean;
  error?: string;
}

// DTO for creating/editing topics (from AdminTopicWriteSerializer)
export interface CreateTopicDTO {
  title: string;
  title_color?: string;
  description: string;
  image_url?: string;
  image_file?: File;
  source_url?: string;
  publishing_time: string;
}

export interface UpdateTopicDTO extends Partial<CreateTopicDTO> {
  id: string;
}

// Cleanup images request
export interface CleanupImagesRequest {
  image_urls: string[];
}

// Mock data
export const mockTopics: Topic[] = [
  {
    id: "1",
    title: "Understanding Heart Health",
    description: "A comprehensive guide to maintaining cardiovascular health and preventing heart diseases.",
    image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400",
    source_url: "https://example.com/heart-health",
    video_url: null,
    thumbnail: null,
    duration_seconds: null,
    publishing_time: "2024-01-15T10:00:00Z",
    publish_status: true,
    author_name: "Dr. Alice Johnson",
    author_email: "alice.johnson@example.com",
    created_at: "2024-01-15T09:30:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Brain Health and Cognitive Function",
    description: "Learn about maintaining optimal brain health through lifestyle choices and medical care.",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400",
    source_url: "https://example.com/brain-health",
    video_url: null,
    thumbnail: null,
    duration_seconds: null,
    publishing_time: "2024-01-20T14:00:00Z",
    publish_status: true,
    author_name: "Dr. Brian Smith",
    author_email: "brian.smith@example.com",
    created_at: "2024-01-20T13:30:00Z",
    updated_at: "2024-01-20T14:00:00Z",
  },
  {
    id: "3",
    title: "Healthy Lifestyle Tips",
    description: "Essential tips for maintaining a healthy lifestyle, including diet, exercise, and mental wellness.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    source_url: "https://example.com/lifestyle",
    video_url: "https://www.youtube.com/watch?v=example",
    thumbnail: null,
    duration_seconds: null,
    publishing_time: "2024-02-01T10:00:00Z",
    publish_status: false,
    author_name: "Admin User",
    author_email: "admin@example.com",
    created_at: "2024-01-25T11:00:00Z",
    updated_at: "2024-01-25T11:00:00Z",
  },
];
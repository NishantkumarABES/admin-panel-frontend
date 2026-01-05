export type TopicStatus = "unpublished" | "published"; // "scheduled" removed for simplicity
export type TopicFormat = "format1" | "format2" | "format3";
export type AuthorType = "doctor" | "admin";
export type DetailPageType = "pdf" | "external_url" | "no_url";
export type PublishTiming = "now" | "later";
export type ArticleInputType = "html" | "plain_text";

export interface Topic {
  id: string;

  // Common fields
  category: string;
  authorType: AuthorType;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  image?: string;

  // Article-based fields
  articleInputType: ArticleInputType;
  articleContent: string;
  baseImageUrl: string;
  imageUrlOverride?: string;
  titleOverride?: string;

  // Format-specific fields (kept for backward compatibility)
  format: TopicFormat;
  pdfUrl?: string; // Format 1
  detailPageType?: DetailPageType; // Format 2 & 3
  externalUrl?: string; // Format 2 & 3
  videoUrl?: string; // Format 3

  // Publishing
  publishTiming: PublishTiming;
  scheduledAt?: string;
  publishedAt?: string;
  status: TopicStatus;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy?: string;
}

// DTO for creating/editing topics
export interface CreateTopicDTO {
  // Article-based fields
  articleInputType: ArticleInputType;
  articleContent: string;
  baseImageUrl: string;
  imageUrlOverride?: string;
  titleOverride?: string;
}

export interface UpdateTopicDTO extends Partial<CreateTopicDTO> {
  id: string;
}

// Table display type
export type TopicTableItem = {
  id: string;
  sno: number;
  title: string;
  category: string;
  authorName: string;
  authorType: AuthorType;
  status: TopicStatus;
  publishedAt?: string;
  createdAt: string;
};

// Mock data
export const mockTopics: Topic[] = [
  {
    id: "1",
    category: "Cardiology",
    authorType: "doctor",
    authorId: "doc1",
    authorName: "Dr. Alice Johnson",
    title: "Understanding Heart Health",
    description: "A comprehensive guide to maintaining cardiovascular health and preventing heart diseases.",
    image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400",
    format: "format1",
    pdfUrl: "https://example.com/heart-health.pdf",
    publishTiming: "now",
    status: "published",
    publishedAt: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-15T09:30:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    createdBy: "admin1",
    articleInputType: "html",
    articleContent: "",
    baseImageUrl: ""
  },
  {
    id: "2",
    category: "Neurology",
    authorType: "doctor",
    authorId: "doc2",
    authorName: "Dr. Brian Smith",
    title: "Brain Health and Cognitive Function",
    description: "Learn about maintaining optimal brain health through lifestyle choices and medical care.",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400",
    format: "format2",
    detailPageType: "external_url",
    externalUrl: "https://example.com/brain-health",
    publishTiming: "now",
    status: "published",
    publishedAt: "2024-01-20T14:00:00Z",
    createdAt: "2024-01-20T13:30:00Z",
    updatedAt: "2024-01-20T14:00:00Z",
    createdBy: "admin1",
    articleInputType: "html",
    articleContent: "",
    baseImageUrl: ""
  },
  {
    id: "3",
    category: "General Health",
    authorType: "admin",
    authorId: "admin1",
    authorName: "Admin User",
    title: "Healthy Lifestyle Tips",
    description: "Essential tips for maintaining a healthy lifestyle, including diet, exercise, and mental wellness.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    format: "format3",
    videoUrl: "https://www.youtube.com/watch?v=example",
    detailPageType: "pdf",
    pdfUrl: "https://example.com/lifestyle.pdf",
    publishTiming: "later",
    scheduledAt: "2024-02-01T10:00:00Z",
    status: "unpublished",
    createdAt: "2024-01-25T11:00:00Z",
    updatedAt: "2024-01-25T11:00:00Z",
    createdBy: "admin1",
    articleInputType: "html",
    articleContent: "",
    baseImageUrl: ""
  },
  {
    id: "4",
    category: "Dermatology",
    authorType: "doctor",
    authorId: "doc3",
    authorName: "Dr. Carol Lee",
    title: "Skin Care Essentials",
    description: "Everything you need to know about taking care of your skin in different seasons.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    format: "format1",
    pdfUrl: "https://example.com/skincare.pdf",
    publishTiming: "now",
    status: "published",
    publishedAt: "2024-01-22T09:00:00Z",
    createdAt: "2024-01-22T08:30:00Z",
    updatedAt: "2024-01-22T09:00:00Z",
    createdBy: "admin1",
    articleInputType: "html",
    articleContent: "",
    baseImageUrl: ""
  },
  {
    id: "5",
    category: "Nutrition",
    authorType: "admin",
    authorId: "admin1",
    authorName: "Admin User",
    title: "Balanced Diet Guide",
    description: "A complete guide to creating and maintaining a balanced diet for optimal health.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
    format: "format3",
    videoUrl: "https://www.youtube.com/watch?v=nutrition",
    detailPageType: "no_url",
    publishTiming: "now",
    status: "published",
    publishedAt: "2024-01-18T12:00:00Z",
    createdAt: "2024-01-18T11:30:00Z",
    updatedAt: "2024-01-18T12:00:00Z",
    createdBy: "admin1",
    articleInputType: "html",
    articleContent: "",
    baseImageUrl: ""
  },
];


export const TOPIC_CATEGORIES = [
  "Cardiology",
  "Neurology",
  "General Health",
  "Dermatology",
  "Nutrition",
  "Physical Therapy",
  "Sleep Disorders"
] as const;
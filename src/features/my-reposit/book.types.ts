export type BookStatus = "pending" | "approved" | "rejected";

export type BookType = "textbook" | "handbook" | "guideline" | "review";

export interface Book {
  id: string;
  uploaded_by: string;
  title: string;
  authors: string;
  publisher: string;
  edition: string;
  publication_year: number;
  isbn: string;
  speciality: string | null;
  book_type: BookType;
  description: string;
  rating: string;
  views: number;
  downloads: number;
  status: BookStatus;
  rejection_reason: string | null;
  is_editor_curated: boolean;
  price: number;
  collections: string[];
  created_at: string;
}

export interface BookFilters {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  specialty?: string;
  book_type?: BookType;
}

export interface ReviewBookDTO {
  status: "approved" | "rejected";
  rejection_reason?: string;
}

export const BOOK_TYPES: { value: BookType; label: string }[] = [
  { value: "textbook", label: "Textbook" },
  { value: "handbook", label: "Handbook" },
  { value: "guideline", label: "Guideline" },
  { value: "review", label: "Review" },
];

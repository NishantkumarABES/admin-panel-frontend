export type BookStatus = "pending" | "approved" | "rejected" | "in_review";

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
    file_url: string | null;
    collections: string[];
    is_deleted: boolean;
    created_at: string;
}

export interface BookFilters {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    speciality?: string;
    book_type?: BookType;
    status?: BookStatus;
}

export interface ReviewBookDTO {
    status: "approved" | "rejected" | "in_review";
    rejection_reason?: string;
}

export interface BookAnalytics {
    total_books: number;
    approved_books: number;
    pending_books: number;
    in_review_books: number;
    rejected_books: number;
}

export interface CreateBookDTO {
    user_id: string;
    title: string;
    authors: string;
    publisher: string;
    edition: string;
    publication_year: number;
    isbn: string;
    speciality: string;
    book_type: BookType;
    description: string;
    price: number;
    book_file?: File;
}

export interface UpdateBookDTO {
    title?: string;
    authors?: string;
    publisher?: string;
    edition?: string;
    publication_year?: number;
    isbn?: string;
    speciality?: string;
    book_type?: BookType;
    description?: string;
    price?: number;
    book_file?: File;
}

export const BOOK_TYPES: { value: BookType; label: string }[] = [
    { value: "textbook", label: "Textbook" },
    { value: "handbook", label: "Handbook" },
    { value: "guideline", label: "Guideline" },
    { value: "review", label: "Review" },
];

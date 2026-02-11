import { api } from "./api";
import type { Book, BookFilters, ReviewBookDTO, BookAnalytics, CreateBookDTO } from "../features/my-reposit/books/books.types";

interface PaginatedBooks {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
  detail: string;
  success: boolean;
}

// Get all books with optional filters (supports status filter)
export const getBooks = async (filters?: BookFilters): Promise<PaginatedBooks> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.page_size) params.append("page_size", filters.page_size.toString());
  if (filters?.search) params.append("search", filters.search);
  if (filters?.ordering) params.append("ordering", filters.ordering);
  if (filters?.specialty) params.append("specialty", filters.specialty);
  if (filters?.book_type) params.append("book_type", filters.book_type);
  if (filters?.status) params.append("status", filters.status);

  const queryString = params.toString();

  const response = await api.get<PaginatedBooks>(
    `/books/admin/${queryString ? `?${queryString}` : ""}`
  );

  return response.data;
};

// Legacy: Get only pending books
export const getPendingBooks = async (filters?: BookFilters): Promise<PaginatedBooks> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.page_size) params.append("page_size", filters.page_size.toString());
  if (filters?.search) params.append("search", filters.search);
  if (filters?.ordering) params.append("ordering", filters.ordering);
  if (filters?.specialty) params.append("specialty", filters.specialty);
  if (filters?.book_type) params.append("book_type", filters.book_type);

  const queryString = params.toString();

  const response = await api.get<PaginatedBooks>(
    `/books/admin/pending/${queryString ? `?${queryString}` : ""}`
  );

  return response.data;
};

// Review a book (approve or reject)
export const reviewBook = async (id: string, data: ReviewBookDTO) => {
  const response = await api.patch(`/books/admin/${id}/review/`, data);
  return response.data;
};

// Get books analytics
export const getBooksAnalytics = async (): Promise<BookAnalytics> => {
  const response = await api.get<BookAnalytics>("/analytics/admin/books/metrics/");
  return response.data;
};

// Create a book on behalf of a doctor user
export const createBook = async (data: CreateBookDTO) => {
  const formData = new FormData();
  formData.append("user_id", data.user_id);
  formData.append("title", data.title);
  formData.append("authors", data.authors);
  formData.append("publisher", data.publisher);
  formData.append("edition", data.edition);
  formData.append("publication_year", data.publication_year.toString());
  formData.append("isbn", data.isbn);
  formData.append("speciality", data.speciality);
  formData.append("book_type", data.book_type);
  formData.append("description", data.description);
  formData.append("price", data.price.toString());
  if (data.book_file) {
    formData.append("book_file", data.book_file);
  }

  const response = await api.post("/books/admin/create/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

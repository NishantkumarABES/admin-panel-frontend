import { api } from "./api";
import type { Book, BookFilters, ReviewBookDTO, BookAnalytics, CreateBookDTO, UpdateBookDTO } from "../features/my-reposit/books/books.types";

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
  if (filters?.speciality) params.append("speciality", filters.speciality);
  if (filters?.book_type) params.append("book_type", filters.book_type);
  if (filters?.status) params.append("status", filters.status);

  const queryString = params.toString();

  const response = await api.get<PaginatedBooks>(
    `/books/admin/${queryString ? `?${queryString}` : ""}`
  );

  return response.data;
};

// Review a book (approve or reject)
export const reviewBook = async (id: string, data: ReviewBookDTO) => {
  const response = await api.patch(`/books/admin/${id}/review/`, data);
  return response.data;
};

export const moveBookToInReview = async (id: string) => {
  const response = await api.patch(`/books/admin/${id}/move/`);
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
  formData.append("access_level", data.access_level);
  formData.append("copyright_status", data.copyright_status);
  formData.append("description", data.description);
  formData.append("price", data.price.toString());
  if (data.book_file) {
    formData.append("file", data.book_file);
  }
  if (data.book_cover) {
    formData.append("book_cover", data.book_cover);
  }

  const response = await api.post("/books/admin/create/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Update a book (admin)
export const updateBook = async (id: string, data: UpdateBookDTO) => {
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.authors !== undefined) formData.append("authors", data.authors);
  if (data.publisher !== undefined) formData.append("publisher", data.publisher);
  if (data.edition !== undefined) formData.append("edition", data.edition);
  if (data.publication_year !== undefined) formData.append("publication_year", data.publication_year.toString());
  if (data.isbn !== undefined) formData.append("isbn", data.isbn);
  if (data.speciality !== undefined) formData.append("speciality", data.speciality);
  if (data.book_type !== undefined) formData.append("book_type", data.book_type);
  if (data.access_level !== undefined) formData.append("access_level", data.access_level);
  if (data.copyright_status !== undefined) formData.append("copyright_status", data.copyright_status);
  if (data.description !== undefined) formData.append("description", data.description);
  if (data.price !== undefined) formData.append("price", data.price.toString());
  if (data.book_file) formData.append("book_file", data.book_file);
  if (data.book_cover) formData.append("book_cover", data.book_cover);

  const response = await api.patch(`/books/admin/${id}/update/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

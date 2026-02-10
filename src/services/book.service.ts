import { api } from "./api";
import type { Book, BookFilters, ReviewBookDTO } from "../features/my-reposit/book.types";

interface PaginatedBooks {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
  detail: string;
  success: boolean;
}

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

export const reviewBook = async (id: string, data: ReviewBookDTO) => {
  const response = await api.patch(`/books/admin/${id}/review/`, data);
  return response.data;
};

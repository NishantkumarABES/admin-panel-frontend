import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, Plus } from "lucide-react";
import type { Book, BookType, BookStatus, BookAnalytics, CreateBookDTO } from "./books.types";
import { BOOK_TYPES } from "./books.types";
import { SPECIALTIES } from "../../Advertisements/advertisement.types";
import * as bookService from "../../../services/book.service";
import toast from "react-hot-toast";
import AddBookModal from "./components/AddBookModal";
import BooksTable from "./components/BooksTable";

const STATUS_OPTIONS: { value: BookStatus | ""; label: string }[] = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "in_review", label: "In Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

export default function BooksView() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [specialtyFilter, setSpecialtyFilter] = useState("");
    const [bookTypeFilter, setBookTypeFilter] = useState<BookType | "">("");
    const [statusFilter, setStatusFilter] = useState<BookStatus | "">("");

    // Analytics
    const [analytics, setAnalytics] = useState<BookAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    // Add book modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Track if this is the initial mount
    const isInitialMount = useRef(true);

    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const data = await bookService.getBooksAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to fetch book analytics:", error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchBooks = useCallback(async () => {
        try {
            setLoading(true);
            const filters = {
                search: searchTerm || undefined,
                specialty: specialtyFilter || undefined,
                book_type: (bookTypeFilter as BookType) || undefined,
                status: (statusFilter as BookStatus) || undefined,
                page: currentPage,
                page_size: pageSize,
            };

            const response = await bookService.getBooks(filters);
            setBooks(response.results);
            setTotalCount(response.count);
            setHasNext(response.next !== null);
            setHasPrevious(response.previous !== null);
        } catch (error) {
            console.error("Failed to fetch books:", error);
            toast.error("Failed to fetch books");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, specialtyFilter, bookTypeFilter, statusFilter, currentPage, pageSize]);

    // Fetch analytics on mount
    useEffect(() => {
        fetchAnalytics();
    }, []);

    // Fetch books on mount immediately, then debounce on subsequent changes
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchBooks();
            return;
        }

        const timer = setTimeout(() => {
            fetchBooks();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchBooks]);

    // Reset page to 1 when filters change (not pagination)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, specialtyFilter, bookTypeFilter, statusFilter]);

    const handleAddBook = async (data: CreateBookDTO) => {
        await bookService.createBook(data);
        toast.success("Book added successfully");
        fetchBooks();
        fetchAnalytics();
    };

    const handleRefresh = () => {
        fetchBooks();
        fetchAnalytics();
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const hasActiveFilters = searchTerm || specialtyFilter || bookTypeFilter || statusFilter;

    const handleClearFilters = () => {
        setSearchTerm("");
        setSpecialtyFilter("");
        setBookTypeFilter("");
        setStatusFilter("");
    };

    return (
        <div className="space-y-6 min-w-0 max-w-full">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Total Books</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {analytics?.total_books || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Approved</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-emerald-600 mt-1">
                            {analytics?.approved_books || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Pending</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-amber-600 mt-1">
                            {analytics?.pending_books || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">In Review</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-blue-600 mt-1">
                            {analytics?.in_review_books || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Rejected</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-red-600 mt-1">
                            {analytics?.rejected_books || 0}
                        </div>
                    )}
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 min-w-0">
                    {/* Left side: Search + Filters */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap sm:gap-4 min-w-0 flex-1">
                        {/* Search */}
                        <div className="flex-1 min-w-0 w-full sm:min-w-75 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by title, author, publisher..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                        </div>

                        {/* Filters group */}
                        <div className="flex flex-wrap items-center gap-4 min-w-0">
                            {/* Specialty Filter */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-48">
                                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                                <select
                                    value={specialtyFilter}
                                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                >
                                    <option value="">All Specialties</option>
                                    {SPECIALTIES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Book Type Filter */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                <select
                                    value={bookTypeFilter}
                                    onChange={(e) => setBookTypeFilter(e.target.value as BookType | "")}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                >
                                    <option value="">All Types</option>
                                    {BOOK_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as BookStatus | "")}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right side: Add Book Button */}
                    <div className="flex justify-end lg:justify-normal shrink-0">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Add Book
                        </button>
                    </div>
                </div>
            </div>

            {/* Books Table */}
            <BooksTable
                books={books}
                loading={loading}
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
                onRefresh={handleRefresh}
            />

            {/* Add Book Modal */}
            <AddBookModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddBook}
            />
        </div>
    );
}

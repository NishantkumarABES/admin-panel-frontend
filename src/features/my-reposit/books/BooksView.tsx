import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, Plus, BookOpen, ShoppingCart, HelpCircle, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import type { Book, BookType, BookStatus, BookAnalytics, CreateBookDTO, UpdateBookDTO } from "./books.types";
import { BOOK_TYPES } from "./books.types";
import { SPECIALTIES } from "../../Advertisements/advertisement.types";
import * as bookService from "../../../services/book.service";
import toast from "react-hot-toast";
import AddEditBookModal from "./components/AddEditBookModal";
import BooksTable from "./components/BooksTable";
import BookPurchaseView from "./components/BookPurchaseView";

type ViewTab = "books" | "purchases";

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

    // Add/Edit book modal
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState<ViewTab>("books");

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
                speciality: specialtyFilter || undefined,
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

    useEffect(() => {
        fetchAnalytics();
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchBooks();
            return;
        }
        const timer = setTimeout(() => { fetchBooks(); }, 300);
        return () => clearTimeout(timer);
    }, [fetchBooks]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, specialtyFilter, bookTypeFilter, statusFilter]);

    const handleOpenAddModal = () => { setEditingBook(null); setIsAddEditModalOpen(true); };
    const handleOpenEditModal = (book: Book) => { setEditingBook(book); setIsAddEditModalOpen(true); };

    const handleAddOrEditBook = async (data: CreateBookDTO) => {
        if (editingBook) {
            const updateData: UpdateBookDTO = {
                title: data.title, authors: data.authors, publisher: data.publisher,
                edition: data.edition, publication_year: data.publication_year, isbn: data.isbn,
                speciality: data.speciality, book_type: data.book_type, description: data.description,
                price: data.price, book_file: data.book_file, book_cover: data.book_cover,
            };
            await bookService.updateBook(editingBook.id, updateData);
            toast.success("Book updated successfully");
        } else {
            await bookService.createBook(data);
            toast.success("Book added successfully");
        }
        fetchBooks();
        fetchAnalytics();
    };

    const handleRefresh = () => { fetchBooks(); fetchAnalytics(); };
    const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };
    const hasActiveFilters = searchTerm || specialtyFilter || bookTypeFilter || statusFilter;
    const handleClearFilters = () => { setSearchTerm(""); setSpecialtyFilter(""); setBookTypeFilter(""); setStatusFilter(""); };

    const statCards = [
        { label: "Total Books", value: analytics?.total_books || 0, icon: BookOpen, color: "#6b96ff", bg: "rgba(107, 150, 255, 0.08)", tooltip: "The total number of books in the system." },
        { label: "Approved", value: analytics?.approved_books || 0, icon: CheckCircle, color: "#4fcfa5", bg: "rgba(79, 207, 165, 0.08)", tooltip: "Books that have been approved and are live." },
        { label: "Pending", value: analytics?.pending_books || 0, icon: AlertTriangle, color: "#ffc554", bg: "rgba(255, 197, 84, 0.08)", tooltip: "Books awaiting initial review." },
        { label: "In Review", value: analytics?.in_review_books || 0, icon: Clock, color: "#6b96ff", bg: "rgba(107, 150, 255, 0.08)", tooltip: "Books currently being reviewed by the admin." },
        { label: "Rejected", value: analytics?.rejected_books || 0, icon: XCircle, color: "#ff7070", bg: "rgba(255, 112, 112, 0.08)", tooltip: "Books that have been rejected after review." },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: "#eff1f5", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)" }}>
                <button
                    onClick={() => setActiveTab("books")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "books" ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
                    style={activeTab === "books" ? { background: "#ffffff", boxShadow: "2px 2px 4px rgba(0,0,0,0.06), -2px -2px 4px rgba(255,255,255,0.5)" } : {}}
                >
                    <BookOpen className="w-4 h-4" />
                    Books
                </button>
                <button
                    onClick={() => setActiveTab("purchases")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "purchases" ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
                    style={activeTab === "purchases" ? { background: "#ffffff", boxShadow: "2px 2px 4px rgba(0,0,0,0.06), -2px -2px 4px rgba(255,255,255,0.5)" } : {}}
                >
                    <ShoppingCart className="w-4 h-4" />
                    Purchases
                </button>
            </div>

            {activeTab === "purchases" ? (
                <BookPurchaseView />
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {statCards.map((stat) => (
                            <div key={stat.label} className="clay-card min-w-0">
                                <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
                                    <div className="clay-circle" style={{ background: stat.bg }}>
                                        <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                                    </div>
                                    <div className="group relative">
                                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                                        <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                                            {stat.tooltip}
                                        </div>
                                    </div>
                                </div>
                                {analyticsLoading ? (
                                    <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
                                ) : (
                                    <div className="text-2xl font-bold" style={{ color: stat.color, marginBottom: "2px" }}>{stat.value}</div>
                                )}
                                <div className="text-xs" style={{ color: "#111827" }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filters and Actions */}
                    <div className="clay-card min-w-0" style={{ padding: "14px 18px" }}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 min-w-0">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:gap-3 min-w-0 flex-1">
                                <div className="flex-1 min-w-0 w-full sm:min-w-75 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by title, author, publisher..."
                                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }}
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-3 min-w-0">
                                    <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-48">
                                        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                                        <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}
                                            className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                            style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }}
                                        >
                                            <option value="">All Specialties</option>
                                            {SPECIALTIES.map((s) => (<option key={s} value={s}>{s}</option>))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                        <select value={bookTypeFilter} onChange={(e) => setBookTypeFilter(e.target.value as BookType | "")}
                                            className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                            style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }}
                                        >
                                            <option value="">All Types</option>
                                            {BOOK_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookStatus | "")}
                                            className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                            style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }}
                                        >
                                            {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                        </select>
                                    </div>
                                    {hasActiveFilters && (
                                        <button onClick={handleClearFilters} className="clay-btn text-sm whitespace-nowrap" style={{ padding: "6px 14px", fontSize: "13px" }}>
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end lg:justify-normal shrink-0">
                                <button onClick={handleOpenAddModal}
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap shrink-0"
                                    style={{ background: "#1f2937", boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)" }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Book
                                </button>
                            </div>
                        </div>
                    </div>

                    <BooksTable books={books} loading={loading} currentPage={currentPage} totalCount={totalCount} pageSize={pageSize} hasNext={hasNext} hasPrevious={hasPrevious} onPageChange={setCurrentPage} onPageSizeChange={handlePageSizeChange} onRefresh={handleRefresh} onEdit={handleOpenEditModal} />

                    <AddEditBookModal isOpen={isAddEditModalOpen} onClose={() => { setIsAddEditModalOpen(false); setEditingBook(null); }} onSubmit={handleAddOrEditBook} book={editingBook} />
                </>
            )}
        </div>
    );
}

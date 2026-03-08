import { useState } from "react";
import { Check, X, BookOpen, ArrowRight, Eye, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import type { Book, BookStatus } from "../books.types";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import BookDetailsModal from "./BookDetailsModal";
import * as bookService from "../../../../services/book.service";
import toast from "react-hot-toast";

interface BooksTableProps {
    books: Book[];
    loading: boolean;
    currentPage: number;
    totalCount: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onRefresh: () => void;
    onEdit: (book: Book) => void;
}

function getStatusBadge(status: BookStatus) {
    const styles: Record<BookStatus, string> = {
        pending: "bg-amber-100 text-amber-800",
        in_review: "bg-blue-100 text-blue-800",
        approved: "bg-emerald-100 text-emerald-800",
        rejected: "bg-red-100 text-red-800",
    };
    const labels: Record<BookStatus, string> = {
        pending: "Pending",
        in_review: "In Review",
        approved: "Approved",
        rejected: "Rejected",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

export default function BooksTable({
    books, loading, currentPage, totalCount, pageSize, hasNext, hasPrevious,
    onPageChange, onPageSizeChange, onRefresh, onEdit,
}: BooksTableProps) {
    const [approvingBook, setApprovingBook] = useState<Book | null>(null);
    const [movingToReview, setMovingToReview] = useState<Book | null>(null);
    const [rejectingBook, setRejectingBook] = useState<Book | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewingBook, setViewingBook] = useState<Book | null>(null);

    const totalPages = Math.ceil(totalCount / pageSize);

    const getPageNumbers = (): (number | "ellipsis")[] => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | "ellipsis")[] = [];
        if (currentPage <= 3) { pages.push(1, 2, 3, 4, "ellipsis", totalPages); }
        else if (currentPage >= totalPages - 2) { pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages); }
        else { pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages); }
        return pages;
    };

    const handleApprove = async (book: Book) => {
        try { setIsSubmitting(true); await bookService.reviewBook(book.id, { status: "approved" }); toast.success(`"${book.title}" approved successfully`); onRefresh(); }
        catch (error) { console.error("Failed to approve book:", error); toast.error("Failed to approve book"); }
        finally { setIsSubmitting(false); }
    };

    const handleMoveToReview = async (book: Book) => {
        try { setIsSubmitting(true); await bookService.moveBookToInReview(book.id); toast.success(`"${book.title}" moved to review`); onRefresh(); }
        catch (error) { console.error("Failed to move book to review:", error); toast.error("Failed to move book to review"); }
        finally { setIsSubmitting(false); }
    };

    const handleRejectSubmit = async () => {
        if (!rejectingBook || !rejectionReason.trim()) return;
        try { setIsSubmitting(true); await bookService.reviewBook(rejectingBook.id, { status: "rejected", rejection_reason: rejectionReason.trim() }); toast.success(`"${rejectingBook.title}" rejected`); setRejectingBook(null); setRejectionReason(""); onRefresh(); }
        catch (error) { console.error("Failed to reject book:", error); toast.error("Failed to reject book"); }
        finally { setIsSubmitting(false); }
    };

    return (
        <>
            <div className="clay-card overflow-hidden" style={{ padding: 0 }}>
                {loading ? (
                    <div className="w-full">
                        <div className="px-4 py-3" style={{ background: "#f8f9fb", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <div className="flex items-center gap-4">
                                <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
                                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse ml-auto" />
                            </div>
                        </div>
                        {[...Array(pageSize)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                                <div className="w-9 h-9 bg-gray-200 rounded-lg shrink-0" />
                                <div className="flex-1 min-w-0 space-y-1.5"><div className="w-36 h-4 bg-gray-200 rounded" /><div className="w-48 h-3 bg-gray-100 rounded" /></div>
                                <div className="w-20 h-3.5 bg-gray-200 rounded" />
                                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                                <div className="w-16 h-3.5 bg-gray-200 rounded" />
                                <div className="flex gap-1.5"><div className="w-7 h-7 bg-gray-200 rounded-lg" /><div className="w-7 h-7 bg-gray-200 rounded-lg" /></div>
                            </div>
                        ))}
                    </div>
                ) : !books.length ? (
                    <div className="p-8 text-center"><p className="text-gray-500 mb-4">No books found. Try adjusting your filters.</p></div>
                ) : (
                    <>
                        <div className="overflow-x-auto min-w-0">
                            <table className="w-full table-auto divide-y divide-gray-100 min-w-max">
                                <thead style={{ background: "#f8f9fb", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Authors</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Uploaded By</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Specialty</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Year</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {books.map((book) => (
                                        <tr key={book.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-4 py-4" style={{ maxWidth: "340px" }}>
                                                <div className="flex items-start gap-3">
                                                    {book.book_cover ? (
                                                        <img
                                                            src={book.book_cover}
                                                            alt={book.title}
                                                            className="w-9 h-9 object-cover rounded-lg shrink-0 mt-0.5"
                                                            style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.1)" }}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 shrink-0 mt-0.5">
                                                            <BookOpen className="w-4.5 h-4.5 text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-sm font-medium text-gray-900 break-words">{book.title}</div>
                                                            {book.is_deleted && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 shrink-0">Deleted</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{book.publisher} · {book.edition}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{book.authors}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{book.uploaded_by}</td>
                                            <td className="px-4 py-2"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">{book.book_type}</span></td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{book.speciality || "—"}</td>
                                            <td className="px-4 py-2">{getStatusBadge(book.status)}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{book.publication_year}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => setViewingBook(book)} title="View Details" className="p-1.5 rounded-lg transition-all duration-200" style={{ color: "#6b96ff" }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(107, 150, 255, 0.08)"; e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; }}>
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => onEdit(book)} title="Edit Book" className="p-1.5 rounded-lg transition-all duration-200" style={{ color: "#6b7280" }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0, 0, 0, 0.04)"; e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; }}>
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    {book.status === "pending" && (
                                                        <button onClick={() => setMovingToReview(book)} disabled={isSubmitting} title="Move to Review" className="p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50" style={{ color: "#ff9f47" }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 159, 71, 0.08)"; e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)"; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; }}>
                                                            <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {(book.status === "pending" || book.status === "in_review") && (
                                                        <button onClick={() => setApprovingBook(book)} disabled={isSubmitting} title="Approve" className="p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50" style={{ color: "#4fcfa5" }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(79, 207, 165, 0.08)"; e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)"; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; }}>
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {(book.status === "pending" || book.status === "in_review") && (
                                                        <button onClick={() => setRejectingBook(book)} disabled={isSubmitting} title="Reject" className="p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50" style={{ color: "#ff7070" }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 112, 112, 0.08)"; e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)"; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; }}>
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {books.length > 0 && (
                            <div className="px-5 py-3" style={{ background: "#eff1f5", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)" }}>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-gray-600">Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} books</div>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor="bookPageSize" className="text-xs text-gray-600">Per page:</label>
                                            <select id="bookPageSize" value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                                className="px-2 py-1 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                                style={{ background: "#ffffff", border: "none", boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.5)" }}>
                                                <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={!hasPrevious} className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1" style={{ padding: "5px 10px", fontSize: "12px" }} title="Previous page">
                                            <ChevronLeft className="w-3.5 h-3.5" /> Prev
                                        </button>
                                        {getPageNumbers().map((page, idx) =>
                                            page === "ellipsis" ? (
                                                <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-gray-400 select-none">…</span>
                                            ) : (
                                                <button key={page} onClick={() => onPageChange(page)} className="min-w-[28px] h-7 rounded-lg text-xs font-semibold transition-all" title={`Go to page ${page}`}
                                                    style={currentPage === page ? { background: "#1f2937", color: "white", boxShadow: "2px 2px 5px rgba(0,0,0,0.15)" } : { background: "#eff1f5", color: "#6b7280", boxShadow: "2px 2px 4px rgba(0,0,0,0.08), -2px -2px 4px rgba(255,255,255,0.6)" }}>
                                                    {page}
                                                </button>
                                            )
                                        )}
                                        <button onClick={() => onPageChange(currentPage + 1)} disabled={!hasNext} className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1" style={{ padding: "5px 10px", fontSize: "12px" }} title="Next page">
                                            Next <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <ConfirmDialog isOpen={!!approvingBook} onClose={() => setApprovingBook(null)} onConfirm={() => { if (approvingBook) handleApprove(approvingBook); setApprovingBook(null); }} title="Approve Book" message={`Are you sure you want to approve "${approvingBook?.title}"?`} confirmText="Approve" cancelText="Cancel" variant="success" />
            <ConfirmDialog isOpen={!!movingToReview} onClose={() => setMovingToReview(null)} onConfirm={() => { if (movingToReview) handleMoveToReview(movingToReview); setMovingToReview(null); }} title="Move to Review" message={`Are you sure you want to move "${movingToReview?.title}" to review?`} confirmText="Move to Review" cancelText="Cancel" variant="warning" />

            {rejectingBook && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/50 transition-opacity" />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4"><X className="w-6 h-6 text-red-600" /></div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Book</h3>
                                <p className="text-sm text-gray-600 mb-4">Are you sure you want to reject <span className="font-medium">"{rejectingBook.title}"</span>? Please provide a reason.</p>
                                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter rejection reason..." rows={3}
                                    className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none mb-6"
                                    style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }} />
                                <div className="flex items-center justify-end gap-3">
                                    <button onClick={() => { setRejectingBook(null); setRejectionReason(""); }} className="clay-btn" style={{ fontSize: "13px", padding: "6px 16px" }}>Cancel</button>
                                    <button onClick={handleRejectSubmit} disabled={!rejectionReason.trim() || isSubmitting}
                                        className="px-4 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ background: "#ef4444", boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)" }}>
                                        {isSubmitting ? "Rejecting..." : "Reject"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <BookDetailsModal book={viewingBook} isOpen={!!viewingBook} onClose={() => setViewingBook(null)} />
        </>
    );
}

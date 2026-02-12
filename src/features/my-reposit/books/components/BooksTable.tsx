import { useState } from "react";
import { Check, X, BookOpen, ArrowRight, Eye, ChevronLeft, ChevronRight } from "lucide-react";
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
    books,
    loading,
    currentPage,
    totalCount,
    pageSize,
    hasNext,
    hasPrevious,
    onPageChange,
    onPageSizeChange,
    onRefresh,
}: BooksTableProps) {
    // Approve confirm state
    const [approvingBook, setApprovingBook] = useState<Book | null>(null);
    // Move to review confirm state
    const [movingToReview, setMovingToReview] = useState<Book | null>(null);
    // Reject modal state
    const [rejectingBook, setRejectingBook] = useState<Book | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // View details modal
    const [viewingBook, setViewingBook] = useState<Book | null>(null);

    const handleApprove = async (book: Book) => {
        try {
            setIsSubmitting(true);
            await bookService.reviewBook(book.id, { status: "approved" });
            toast.success(`"${book.title}" approved successfully`);
            onRefresh();
        } catch (error) {
            console.error("Failed to approve book:", error);
            toast.error("Failed to approve book");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMoveToReview = async (book: Book) => {
        try {
            setIsSubmitting(true);
            await bookService.moveBookToInReview(book.id);
            toast.success(`"${book.title}" moved to review`);
            onRefresh();
        } catch (error) {
            console.error("Failed to move book to review:", error);
            toast.error("Failed to move book to review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectingBook || !rejectionReason.trim()) return;
        try {
            setIsSubmitting(true);
            await bookService.reviewBook(rejectingBook.id, {
                status: "rejected",
                rejection_reason: rejectionReason.trim(),
            });
            toast.success(`"${rejectingBook.title}" rejected`);
            setRejectingBook(null);
            setRejectionReason("");
            onRefresh();
        } catch (error) {
            console.error("Failed to reject book:", error);
            toast.error("Failed to reject book");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-600">Loading books...</div>
                ) : !books.length ? (
                    <div className="p-8 text-center text-gray-600">
                        No books found. Try adjusting your filters.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Authors</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {books.map((book) => (
                                        <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 shrink-0 mt-0.5">
                                                        <BookOpen className="w-4.5 h-4.5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{book.title}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{book.publisher} · {book.edition}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{book.authors}</td>
                                            <td className="px-6 py-4 text-gray-700">{book.uploaded_by}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                                    {book.book_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{book.speciality || "—"}</td>
                                            <td className="px-6 py-4">{getStatusBadge(book.status)}</td>
                                            <td className="px-6 py-4 text-gray-700">{book.publication_year}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    {/* View Details (always visible) */}
                                                    <button
                                                        onClick={() => setViewingBook(book)}
                                                        title="View Details"
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {/* Move to Review (pending only) */}
                                                    {book.status === "pending" && (
                                                        <button
                                                            onClick={() => setMovingToReview(book)}
                                                            disabled={isSubmitting}
                                                            title="Move to Review"
                                                            className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                                                        >
                                                            <ArrowRight className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {/* Approve (pending or in_review) */}
                                                    {(book.status === "pending" || book.status === "in_review") && (
                                                        <button
                                                            onClick={() => setApprovingBook(book)}
                                                            disabled={isSubmitting}
                                                            title="Approve"
                                                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {/* Reject (pending or in_review) */}
                                                    {(book.status === "pending" || book.status === "in_review") && (
                                                        <button
                                                            onClick={() => setRejectingBook(book)}
                                                            disabled={isSubmitting}
                                                            title="Reject"
                                                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                        >
                                                            <X className="w-5 h-5" />
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
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                                        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} books
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="pageSize" className="text-sm text-gray-600">Per page:</label>
                                        <select
                                            id="pageSize"
                                            value={pageSize}
                                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                        disabled={!hasPrevious}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <div className="px-3 py-1.5 text-sm text-gray-600">
                                        Page {currentPage} of {Math.ceil(totalCount / pageSize) || 1}
                                    </div>
                                    <button
                                        onClick={() => onPageChange(currentPage + 1)}
                                        disabled={!hasNext}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Approve Confirm Dialog */}
            <ConfirmDialog
                isOpen={!!approvingBook}
                onClose={() => setApprovingBook(null)}
                onConfirm={() => {
                    if (approvingBook) handleApprove(approvingBook);
                    setApprovingBook(null);
                }}
                title="Approve Book"
                message={`Are you sure you want to approve "${approvingBook?.title}"?`}
                confirmText="Approve"
                cancelText="Cancel"
                variant="success"
            />

            {/* Move to Review Confirm Dialog */}
            <ConfirmDialog
                isOpen={!!movingToReview}
                onClose={() => setMovingToReview(null)}
                onConfirm={() => {
                    if (movingToReview) handleMoveToReview(movingToReview);
                    setMovingToReview(null);
                }}
                title="Move to Review"
                message={`Are you sure you want to move "${movingToReview?.title}" to review?`}
                confirmText="Move to Review"
                cancelText="Cancel"
                variant="warning"
            />

            {/* Reject Modal */}
            {rejectingBook && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => { setRejectingBook(null); setRejectionReason(""); }} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
                                    <X className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Book</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Are you sure you want to reject <span className="font-medium">"{rejectingBook.title}"</span>? Please provide a reason.
                                </p>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter rejection reason..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none mb-6"
                                />
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => { setRejectingBook(null); setRejectionReason(""); }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRejectSubmit}
                                        disabled={!rejectionReason.trim() || isSubmitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Rejecting..." : "Reject"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Book Details Modal */}
            <BookDetailsModal
                book={viewingBook}
                isOpen={!!viewingBook}
                onClose={() => setViewingBook(null)}
            />
        </>
    );
}

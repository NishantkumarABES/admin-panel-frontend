import { BookOpen, User, Calendar, Hash, DollarSign, FileText, Download, ExternalLink, XCircle } from "lucide-react";
import type { Book, BookStatus } from "../books.types";

interface BookDetailsModalProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
}

const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black/50" onClick={onClose}></div>

                <div
                    className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

function getBookTypeBadge(type: string) {
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
            {type}
        </span>
    );
}

export default function BookDetailsModal({ book, isOpen, onClose }: BookDetailsModalProps) {
    if (!book) return null;

    const InfoRow = ({
        icon: Icon,
        label,
        value,
    }: {
        icon: React.ElementType;
        label: string;
        value: string | number | undefined | null | React.ReactNode;
    }) => {
        if (!value && value !== 0) return null;
        return (
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                    <div className="text-sm text-gray-900">{value}</div>
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Book Details">
            <div className="space-y-6">
                {/* Header with Book Info */}
                <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 shrink-0">
                        <BookOpen className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {book.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">by {book.authors}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(book.status)}
                            {getBookTypeBadge(book.book_type)}
                            {book.is_editor_curated && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Editor Curated
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Book Information */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Book Information
                    </h4>
                    <div className="space-y-2">
                        <InfoRow icon={User} label="Uploaded By" value={book.uploaded_by} />
                        <InfoRow icon={FileText} label="Publisher" value={book.publisher} />
                        <InfoRow icon={BookOpen} label="Edition" value={book.edition || "—"} />
                        <InfoRow icon={Calendar} label="Publication Year" value={book.publication_year} />
                        <InfoRow icon={Hash} label="ISBN" value={book.isbn || "—"} />
                        <InfoRow icon={FileText} label="Specialty" value={book.speciality || "—"} />
                        <InfoRow icon={DollarSign} label="Price" value={`₹${book.price}`} />
                    </div>
                </div>

                {/* Statistics */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Statistics
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{book.views}</div>
                            <div className="text-xs text-gray-500">Views</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{book.downloads}</div>
                            <div className="text-xs text-gray-500">Downloads</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{book.rating || "—"}</div>
                            <div className="text-xs text-gray-500">Rating</div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {book.description && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Description
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{book.description}</p>
                        </div>
                    </div>
                )}

                {/* Rejection Reason */}
                {book.status === "rejected" && book.rejection_reason && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Rejection Reason
                        </h4>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                            <p className="text-sm text-red-700">{book.rejection_reason}</p>
                        </div>
                    </div>
                )}

                {/* Book File */}
                {book.file_url && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Book File
                        </h4>
                        <div className="flex items-center gap-3">
                            <a
                                href={book.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors group"
                            >
                                <ExternalLink className="w-5 h-5 text-blue-600 shrink-0" />
                                <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                                    View PDF
                                </span>
                            </a>
                            <a
                                href={book.file_url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group"
                            >
                                <Download className="w-5 h-5 text-gray-600 shrink-0" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-800">
                                    Download
                                </span>
                            </a>
                        </div>
                    </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-400 pt-4 border-t border-gray-200">
                    <p>Created: {new Date(book.created_at).toLocaleString("en-IN")}</p>
                    <p>Book ID: {book.id}</p>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 p-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
}

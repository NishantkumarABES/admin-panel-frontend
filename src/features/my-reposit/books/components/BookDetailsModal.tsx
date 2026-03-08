import { BookOpen, ExternalLink } from "lucide-react";
import type { Book, BookStatus } from "../books.types";

interface BookDetailsModalProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
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
    if (!isOpen || !book) return null;

    const InfoItem = ({
        icon: Icon, label, value,
    }: {
        icon: React.ElementType;
        label: string;
        value: string | number | undefined | null | React.ReactNode;
    }) => {
        if (!value && value !== 0) return null;
        return (
            <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-sm text-gray-900">{value}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-[18px] w-full max-w-lg max-h-[90vh] flex flex-col"
                    style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sticky Header */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <h2 className="text-lg font-semibold text-gray-900">Book Details</h2>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">
                        {/* Header: icon + book title + status */}
                        <div className="flex items-start justify-between gap-4 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <div className="flex items-center gap-3">
                                {book.book_cover ? (
                                    <img
                                        src={book.book_cover}
                                        alt={book.title}
                                        className="w-10 h-14 object-cover rounded-lg shrink-0"
                                        style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.1)" }}
                                    />
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                                        style={{
                                            background: "#f8f9fb",
                                            boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)"
                                        }}
                                    >
                                        <BookOpen className="w-5 h-5 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                                    <p className="text-xs text-gray-500">by {book.authors}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                                {getStatusBadge(book.status)}
                                {getBookTypeBadge(book.book_type)}
                                {book.is_editor_curated && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Curated
                                    </span>
                                )}
                                {book.is_deleted && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Deleted
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Book Cover Image */}
                        {book.book_cover && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Book Cover</h4>
                                <div
                                    className="rounded-xl p-3 flex justify-center"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    <img
                                        src={book.book_cover}
                                        alt={`${book.title} cover`}
                                        className="max-h-64 rounded-lg object-contain"
                                        style={{ boxShadow: "2px 2px 8px rgba(0,0,0,0.12)" }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Book Information — Inset Panel */}
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Book Information</h4>
                            <div
                                className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 px-3 rounded-xl"
                                style={{
                                    background: "#f8f9fb",
                                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                }}
                            >
                                <InfoItem icon={BookOpen} label="Uploaded By" value={book.uploaded_by} />
                                <InfoItem icon={BookOpen} label="Publisher" value={book.publisher} />
                                <InfoItem icon={BookOpen} label="Edition" value={book.edition} />
                                <InfoItem icon={BookOpen} label="Publication Year" value={book.publication_year?.toString()} />
                                <InfoItem icon={BookOpen} label="ISBN" value={book.isbn} />
                                <InfoItem icon={BookOpen} label="Specialty" value={book.speciality} />
                                <InfoItem icon={BookOpen} label="Price" value={`₹${book.price}`} />
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Statistics</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Views", value: book.views },
                                    { label: "Downloads", value: book.downloads },
                                    { label: "Rating", value: book.rating || "—" },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-xl p-3 text-center"
                                        style={{
                                            background: "#f8f9fb",
                                            boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                        }}
                                    >
                                        <div className="text-base font-bold text-gray-900">{stat.value}</div>
                                        <div className="text-xs text-gray-500">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        {book.description && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                                <div
                                    className="rounded-xl p-3"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{book.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Rejection Reason */}
                        {book.status === "rejected" && book.rejection_reason && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Rejection Reason</h4>
                                <div
                                    className="rounded-xl p-3"
                                    style={{
                                        background: "rgba(239, 68, 68, 0.06)",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.5)"
                                    }}
                                >
                                    <p className="text-sm text-red-700">{book.rejection_reason}</p>
                                </div>
                            </div>
                        )}

                        {/* Book File */}
                        {book.file_url && (
                            <div className="mt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "12px" }}>
                                <div className="text-xs text-gray-500 mb-2">Book File</div>
                                <a
                                    href={book.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors group"
                                    style={{
                                        background: "#ffffff",
                                        boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)"
                                    }}
                                >
                                    <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                                        View PDF
                                    </span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Sticky Footer */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div className="text-xs text-gray-500">
                            Created: {new Date(book.created_at).toLocaleString("en-IN")} · Book ID: {book.id}
                        </div>
                        <button
                            onClick={onClose}
                            className="clay-btn"
                            style={{ fontSize: "13px", padding: "6px 16px" }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

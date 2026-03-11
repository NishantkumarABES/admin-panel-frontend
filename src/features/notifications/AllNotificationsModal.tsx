import { useState, useEffect } from "react";
import { Bell, ChevronLeft, ChevronRight, Check, Clock, X } from "lucide-react";
import Modal from "../../components/common/Modal";
import { notificationService } from "../../services/notification.service";
import type { Notification } from "./notification.types";
import toast from "react-hot-toast";

interface AllNotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AllNotificationsModal({
    isOpen,
    onClose,
}: AllNotificationsModalProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    const totalPages = Math.ceil(totalCount / pageSize);

    const fetchNotifications = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await notificationService.getAll(page, pageSize);
            setNotifications(response.results);
            setTotalCount(response.count);
            setHasNext(response.next !== null);
            setHasPrevious(response.previous !== null);
            setCurrentPage(page);
        } catch (error) {
            toast.error("Failed to load notifications");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications(1);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            fetchNotifications(1);
        }
    }, [pageSize]);

    // Build pagination page numbers with ellipsis
    const getPageNumbers = (): (number | "ellipsis")[] => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages: (number | "ellipsis")[] = [];
        if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, "ellipsis", totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
        }
        return pages;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="All Notifications" size="md">
            <div className="flex flex-col h-full">
                {/* Close Button - Top Right */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 z-10 active:scale-95 active:shadow-inner"
                    style={{
                        background: "#f8f9fb",
                        boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.6)"
                    }}
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Header with count */}
                <div
                    className="flex items-center gap-2 pb-3 mb-4"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                >
                    <span className="text-xs font-medium" style={{ color: "#6b7280" }}>
                        {totalCount} notification{totalCount !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Notifications list */}
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar" style={{
                    maxHeight: 'calc(80vh - 200px)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 transparent'
                }}>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="clay-inset animate-pulse" style={{ padding: "14px" }}>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="w-3/4 h-4 bg-gray-200 rounded" />
                                            <div className="w-full h-3 bg-gray-100 rounded" />
                                            <div className="w-24 h-3 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="clay-circle mx-auto" style={{
                                width: "56px",
                                height: "56px",
                                background: "rgba(107, 150, 255, 0.06)",
                                marginBottom: "12px",
                            }}>
                                <Bell className="w-7 h-7" style={{ color: "#b0b8c9" }} />
                            </div>
                            <p className="text-sm" style={{ color: "#9ca3af" }}>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="clay-inset transition-all"
                                    style={{
                                        padding: "14px",
                                        background: notification.is_read ? "#eff1f5" : "rgba(107, 150, 255, 0.06)",
                                        boxShadow: notification.is_read
                                            ? "inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.5)"
                                            : "inset 2px 2px 5px rgba(107, 150, 255, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="clay-circle shrink-0"
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                                background: notification.is_read
                                                    ? "rgba(0, 0, 0, 0.03)"
                                                    : "rgba(107, 150, 255, 0.10)",
                                            }}
                                        >
                                            {notification.is_read ? (
                                                <Check className="w-4 h-4" style={{ color: "#9ca3af" }} />
                                            ) : (
                                                <Bell className="w-4 h-4" style={{ color: "#6b96ff" }} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4
                                                    className={`text-sm font-medium truncate ${notification.is_read
                                                        ? "text-gray-600"
                                                        : "text-gray-900"
                                                        }`}
                                                >
                                                    {notification.title}
                                                </h4>
                                                {!notification.is_read && (
                                                    <span
                                                        className="shrink-0 w-2 h-2 rounded-full"
                                                        style={{ background: "#6b96ff" }}
                                                    />
                                                )}
                                            </div>
                                            <p className="text-xs mt-1 line-clamp-2" style={{ color: "#6b7280" }}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: "#9ca3af" }}>
                                                <Clock className="w-3 h-3" />
                                                <span>{formatDate(notification.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && notifications.length > 0 && (
                    <div
                        className="pt-4 mt-4"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="text-xs text-gray-600">
                                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} notifications
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="notifPageSize" className="text-xs text-gray-600">
                                            Per page:
                                        </label>
                                        <select
                                            id="notifPageSize"
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                            }}
                                            className="px-2 py-1 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            style={{
                                                background: "#ffffff",
                                                border: "none",
                                                boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.5)",
                                            }}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => fetchNotifications(Math.max(1, currentPage - 1))}
                                        disabled={!hasPrevious || isLoading}
                                        className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                        style={{ padding: "5px 10px", fontSize: "12px" }}
                                        title="Previous page"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                        Prev
                                    </button>

                                    {/* Page Number Buttons */}
                                    {getPageNumbers().map((page, idx) =>
                                        page === "ellipsis" ? (
                                            <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-gray-400 select-none">…</span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => fetchNotifications(page)}
                                                className="min-w-[28px] h-7 rounded-lg text-xs font-semibold transition-all"
                                                style={
                                                    currentPage === page
                                                        ? { background: "#1f2937", color: "white", boxShadow: "2px 2px 5px rgba(0,0,0,0.15)" }
                                                        : { background: "#eff1f5", color: "#6b7280", boxShadow: "2px 2px 4px rgba(0,0,0,0.08), -2px -2px 4px rgba(255,255,255,0.6)" }
                                                }
                                                title={`Go to page ${page}`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    )}

                                    <button
                                        onClick={() => fetchNotifications(currentPage + 1)}
                                        disabled={!hasNext || isLoading}
                                        className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                        style={{ padding: "5px 10px", fontSize: "12px" }}
                                        title="Next page"
                                    >
                                        Next
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

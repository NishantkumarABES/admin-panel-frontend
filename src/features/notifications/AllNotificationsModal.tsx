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
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchNotifications = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await notificationService.getAll(page);
            setNotifications(response.results);
            setTotalCount(response.count);
            setTotalPages(Math.ceil(response.count / 5)); // 5 per page based on backend
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
                {totalPages > 1 && (
                    <div
                        className="flex items-center justify-between pt-4 mt-4"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <button
                            onClick={() => fetchNotifications(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                            className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Previous
                        </button>
                        <span className="text-xs" style={{ color: "#6b7280" }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => fetchNotifications(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoading}
                            className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                            Next
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}

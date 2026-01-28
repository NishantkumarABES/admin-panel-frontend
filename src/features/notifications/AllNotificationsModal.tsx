import { useState, useEffect } from "react";
import { Bell, ChevronLeft, ChevronRight, Check, Clock } from "lucide-react";
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
        <Modal isOpen={isOpen} onClose={onClose} title="All Notifications" size="lg">
            <div className="space-y-4">
                {/* Header with count */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">
                        {totalCount} notification{totalCount !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Notifications list */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No notifications yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-lg border transition-colors ${notification.is_read
                                        ? "bg-gray-50 border-gray-200"
                                        : "bg-blue-50 border-blue-200"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`p-2 rounded-full shrink-0 ${notification.is_read
                                                ? "bg-gray-200"
                                                : "bg-blue-100"
                                            }`}
                                    >
                                        {notification.is_read ? (
                                            <Check className="w-4 h-4 text-gray-600" />
                                        ) : (
                                            <Bell className="w-4 h-4 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4
                                                className={`font-medium truncate ${notification.is_read
                                                        ? "text-gray-700"
                                                        : "text-gray-900"
                                                    }`}
                                            >
                                                {notification.title}
                                            </h4>
                                            {!notification.is_read && (
                                                <span className="shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDate(notification.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <button
                            onClick={() => fetchNotifications(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => fetchNotifications(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoading}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}

import { api } from "./api";
import type {
    NotificationSummaryResponse,
    NotificationListResponse,
    MarkReadResponse,
} from "../features/notifications/notification.types";

export const notificationService = {
    /**
     * Get notification summary with unread count and latest notifications
     */
    async getSummary(): Promise<NotificationSummaryResponse> {
        const response = await api.get<NotificationSummaryResponse>(
            "/admin/notifications/summary/"
        );
        return response.data;
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<MarkReadResponse> {
        const response = await api.post<MarkReadResponse>(
            "/admin/notifications/mark-read/"
        );
        return response.data;
    },

    /**
     * Get paginated list of all notifications
     */
    async getAll(page: number = 1): Promise<NotificationListResponse> {
        const response = await api.get<NotificationListResponse>(
            `/admin/notifications/?page=${page}`
        );
        return response.data;
    },
};

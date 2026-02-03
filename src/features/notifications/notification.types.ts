export interface Notification {
    id: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    is_read: boolean;
    created_at: string;
    read_at: string | null;
}

export interface NotificationSummaryResponse {
    success: boolean;
    unread_count: number;
    latest: Notification[];
}

export interface NotificationListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Notification[];
}

export interface MarkReadResponse {
    success: boolean;
}

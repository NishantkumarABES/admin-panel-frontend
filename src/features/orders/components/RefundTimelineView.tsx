import type { RefundTimelineEvent } from "../order.types";
import RefundStatusBadge from "./RefundStatusBadge";

interface RefundTimelineViewProps {
    events: RefundTimelineEvent[];
}

const STATUS_DOT_COLORS: Record<string, string> = {
    refund_requested: "#f59e0b",
    under_review: "#3b82f6",
    approved: "#22c55e",
    rejected: "#ef4444",
    refund_initiated: "#a855f7",
    refund_completed: "#10b981",
    refund_failed: "#f43f5e",
};

export default function RefundTimelineView({ events }: RefundTimelineViewProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    if (!events || events.length === 0) return null;

    return (
        <div className="space-y-0">
            {events.map((event, index) => {
                const isLast = index === events.length - 1;
                const dotColor = STATUS_DOT_COLORS[event.status] || "#6b7280";

                return (
                    <div key={index} className="flex gap-3" style={{ minHeight: isLast ? "auto" : "52px" }}>
                        {/* Timeline Column */}
                        <div className="flex flex-col items-center shrink-0" style={{ width: "20px" }}>
                            <div
                                className="w-3 h-3 rounded-full shrink-0 mt-1"
                                style={{
                                    background: dotColor,
                                    boxShadow: `0 0 0 3px ${dotColor}20`,
                                }}
                            />
                            {!isLast && (
                                <div
                                    className="flex-1"
                                    style={{
                                        width: "2px",
                                        background: `linear-gradient(to bottom, ${dotColor}40, rgba(209,213,219,0.3))`,
                                        minHeight: "20px",
                                    }}
                                />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <RefundStatusBadge status={event.status} size="sm" />
                                <span className="text-xs text-gray-400">{formatDate(event.timestamp)}</span>
                            </div>
                            {event.note && (
                                <p className="text-xs text-gray-600 mt-1">{event.note}</p>
                            )}
                            {event.actor && (
                                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                                    by {event.actor}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

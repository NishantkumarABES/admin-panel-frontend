import { AlertCircle, Package, BookOpen, Megaphone, CheckCircle2, FileText, Video, Briefcase, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { PendingActions } from "../../../services/dashboard.service";

interface DashboardQuickActionsProps {
    pendingActions: PendingActions | null;
    loading: boolean;
}

interface ActionItem {
    count: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    accentColor: string;
    bgColor: string;
    linkTo: string;
}

export default function DashboardQuickActions({ pendingActions, loading }: DashboardQuickActionsProps) {
    if (loading) {
        return (
            <div className="clay-card h-full">
                <div className="flex items-center gap-2" style={{ marginBottom: "16px" }}>
                    <AlertCircle className="w-5 h-5" style={{ color: "#ffc554" }} />
                    <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="clay-inset flex items-center gap-3" style={{ padding: "14px" }}>
                            <div className="clay-skeleton" style={{ height: "36px", width: "36px", borderRadius: "10px", flexShrink: 0 }} />
                            <div className="flex-1">
                                <div className="clay-skeleton" style={{ height: "14px", width: "70%", marginBottom: "6px" }} />
                                <div className="clay-skeleton" style={{ height: "11px", width: "90%" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const actions: ActionItem[] = [];

    if (pendingActions) {
        if (pendingActions.out_of_stock_products > 0) {
            actions.push({
                count: pendingActions.out_of_stock_products,
                title: `${pendingActions.out_of_stock_products} Products Out of Stock`,
                description: "Review and restock products to avoid order issues",
                icon: <Package className="w-4 h-4" style={{ color: "#ff7070" }} />,
                accentColor: "#ff7070",
                bgColor: "rgba(255, 112, 112, 0.08)",
                linkTo: "/products",
            });
        }
        if (pendingActions.unpublished_topics > 0) {
            actions.push({
                count: pendingActions.unpublished_topics,
                title: `${pendingActions.unpublished_topics} Unpublished Topics`,
                description: "Review and publish pending topics",
                icon: <BookOpen className="w-4 h-4" style={{ color: "#ffc554" }} />,
                accentColor: "#ffc554",
                bgColor: "rgba(255, 197, 84, 0.08)",
                linkTo: "/topics",
            });
        }
        if (pendingActions.unpublished_advt > 0) {
            actions.push({
                count: pendingActions.unpublished_advt,
                title: `${pendingActions.unpublished_advt} Unpublished Advertisements`,
                description: "Review and publish pending advertisements",
                icon: <Megaphone className="w-4 h-4" style={{ color: "#6b96ff" }} />,
                accentColor: "#6b96ff",
                bgColor: "rgba(107, 150, 255, 0.08)",
                linkTo: "/advertisements",
            });
        }

        // Books — Pending
        if (pendingActions.pending_books > 0) {
            actions.push({
                count: pendingActions.pending_books,
                title: `${pendingActions.pending_books} Pending Books`,
                description: "Books awaiting initial review",
                icon: <BookOpen className="w-4 h-4" style={{ color: "#ffc554" }} />,
                accentColor: "#ffc554",
                bgColor: "rgba(255, 197, 84, 0.08)",
                linkTo: "/my-reposit/books",
            });
        }
        // Books — In Review
        if (pendingActions.in_review_books > 0) {
            actions.push({
                count: pendingActions.in_review_books,
                title: `${pendingActions.in_review_books} Books In Review`,
                description: "Books currently being reviewed by admin",
                icon: <Clock className="w-4 h-4" style={{ color: "#6b96ff" }} />,
                accentColor: "#6b96ff",
                bgColor: "rgba(107, 150, 255, 0.08)",
                linkTo: "/my-reposit/books",
            });
        }

        // Articles — Draft
        if (pendingActions.draft_articles > 0) {
            actions.push({
                count: pendingActions.draft_articles,
                title: `${pendingActions.draft_articles} Draft Articles`,
                description: "Articles saved as drafts, not yet submitted",
                icon: <FileText className="w-4 h-4" style={{ color: "#ffc554" }} />,
                accentColor: "#ffc554",
                bgColor: "rgba(255, 197, 84, 0.08)",
                linkTo: "/my-reposit/articles",
            });
        }
        // Articles — In Review
        if (pendingActions.in_review_articles > 0) {
            actions.push({
                count: pendingActions.in_review_articles,
                title: `${pendingActions.in_review_articles} Articles In Review`,
                description: "Articles currently under admin review",
                icon: <Clock className="w-4 h-4" style={{ color: "#6b96ff" }} />,
                accentColor: "#6b96ff",
                bgColor: "rgba(107, 150, 255, 0.08)",
                linkTo: "/my-reposit/articles",
            });
        }

        // Videos — Pending
        if (pendingActions.pending_videos > 0) {
            actions.push({
                count: pendingActions.pending_videos,
                title: `${pendingActions.pending_videos} Pending Videos`,
                description: "Videos saved as drafts, not yet submitted",
                icon: <Video className="w-4 h-4" style={{ color: "#ffc554" }} />,
                accentColor: "#ffc554",
                bgColor: "rgba(255, 197, 84, 0.08)",
                linkTo: "/my-reposit/videos",
            });
        }
        // Videos — In Review
        if (pendingActions.in_review_videos > 0) {
            actions.push({
                count: pendingActions.in_review_videos,
                title: `${pendingActions.in_review_videos} Videos In Review`,
                description: "Videos currently under admin review",
                icon: <Clock className="w-4 h-4" style={{ color: "#6b96ff" }} />,
                accentColor: "#6b96ff",
                bgColor: "rgba(107, 150, 255, 0.08)",
                linkTo: "/my-reposit/videos",
            });
        }

        // Jobs — Draft
        if (pendingActions.draft_jobs > 0) {
            actions.push({
                count: pendingActions.draft_jobs,
                title: `${pendingActions.draft_jobs} Draft Jobs`,
                description: "Jobs saved as drafts, not yet submitted for review",
                icon: <Briefcase className="w-4 h-4" style={{ color: "#ffc554" }} />,
                accentColor: "#ffc554",
                bgColor: "rgba(255, 197, 84, 0.08)",
                linkTo: "/my-reposit/jobs",
            });
        }
        // Jobs — In Review
        if (pendingActions.in_review_jobs > 0) {
            actions.push({
                count: pendingActions.in_review_jobs,
                title: `${pendingActions.in_review_jobs} Jobs In Review`,
                description: "Jobs currently under admin review before publishing",
                icon: <Clock className="w-4 h-4" style={{ color: "#6b96ff" }} />,
                accentColor: "#6b96ff",
                bgColor: "rgba(107, 150, 255, 0.08)",
                linkTo: "/my-reposit/jobs",
            });
        }

        // Topics — Pending Videos
        if (pendingActions.pending_videos_topics > 0) {
            actions.push({
                count: pendingActions.pending_videos_topics,
                title: `${pendingActions.pending_videos_topics} Topics with Pending Videos`,
                description: "Topics with videos awaiting processing or review",
                icon: <Video className="w-4 h-4" style={{ color: "#a285ff" }} />,
                accentColor: "#a285ff",
                bgColor: "rgba(162, 133, 255, 0.08)",
                linkTo: "/topics",
            });
        }
    }

    return (
        <div className="clay-card h-full">
            <div className="flex items-center gap-2" style={{ marginBottom: "16px" }}>
                <AlertCircle className="w-5 h-5" style={{ color: "#ffc554" }} />
                <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
                {actions.length > 0 && (
                    <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto"
                        style={{ background: "rgba(255, 197, 84, 0.15)", color: "#d4960a" }}
                    >
                        {actions.length} pending
                    </span>
                )}
            </div>

            {actions.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "32px 16px" }}>
                    <div
                        className="clay-circle"
                        style={{
                            width: "52px",
                            height: "52px",
                            background: "rgba(79, 207, 165, 0.1)",
                            marginBottom: "12px",
                        }}
                    >
                        <CheckCircle2 className="w-6 h-6" style={{ color: "#4fcfa5" }} />
                    </div>
                    <p className="text-sm font-medium text-gray-700" style={{ marginBottom: "4px" }}>
                        All caught up!
                    </p>
                    <p className="text-xs text-center" style={{ color: "#9ca3af" }}>
                        No pending actions at this time
                    </p>
                </div>
            ) : (
                <div className="quick-actions-scroll" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "680px", overflowY: "auto", paddingRight: "4px" }}>
                    {actions.map((action, index) => (
                        <div
                            key={index}
                            className="pending-action-card flex items-center justify-between"
                            style={{
                                background: action.bgColor,
                                borderRadius: "12px",
                                padding: "14px",
                                borderLeft: `3px solid ${action.accentColor}`,
                            }}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                    className="flex items-center justify-center shrink-0"
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "10px",
                                        background: "rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    {action.icon}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {action.title}
                                    </div>
                                    <div className="text-[11px]" style={{ color: "#6b7280", marginTop: "2px" }}>
                                        {action.description}
                                    </div>
                                </div>
                            </div>
                            <Link
                                to={action.linkTo}
                                className="clay-btn clay-btn-mobile-full shrink-0"
                                style={{ fontSize: "12px", padding: "6px 14px", marginLeft: "12px" }}
                            >
                                Review
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

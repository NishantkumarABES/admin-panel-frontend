import { FileText } from "lucide-react";
import type { Article, ArticleStatus, ArticleType } from "../articles.types";

interface ArticleDetailsModalProps {
    article: Article | null;
    isOpen: boolean;
    onClose: () => void;
}

function getStatusBadge(status: ArticleStatus) {
    const styles: Record<ArticleStatus, string> = {
        draft: "bg-amber-100 text-amber-800",
        review: "bg-blue-100 text-blue-800",
        published: "bg-emerald-100 text-emerald-800",
        rejected: "bg-red-100 text-red-800",
    };
    const labels: Record<ArticleStatus, string> = {
        draft: "Draft",
        review: "In Review",
        published: "Published",
        rejected: "Rejected",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

function getArticleTypeBadge(type: ArticleType) {
    const labels: Record<ArticleType, string> = {
        original_research: "Original Research",
        review: "Review",
        case_report: "Case Report",
        brief_communication: "Brief Communication",
    };
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {labels[type]}
        </span>
    );
}

export default function ArticleDetailsModal({ article, isOpen, onClose }: ArticleDetailsModalProps) {
    if (!isOpen || !article) return null;

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
                    className="relative bg-white rounded-[18px] w-full max-w-2xl max-h-[90vh] flex flex-col"
                    style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sticky Header */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <h2 className="text-lg font-semibold text-gray-900">Article Details</h2>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">
                        {/* Header: icon + article title + status */}
                        <div className="flex items-start justify-between gap-4 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)"
                                    }}
                                >
                                    <FileText className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                                    <p className="text-xs text-gray-500">by {article.authors}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                                {getStatusBadge(article.status)}
                                {getArticleTypeBadge(article.article_type)}
                                {article.is_deleted && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Deleted
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Article Information — Inset Panel */}
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Article Information</h4>
                            <div
                                className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 px-3 rounded-xl"
                                style={{
                                    background: "#f8f9fb",
                                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                }}
                            >
                                <InfoItem icon={FileText} label="Uploaded By" value={article.uploaded_by} />
                                <InfoItem icon={FileText} label="Institution" value={article.institution} />
                                <InfoItem icon={FileText} label="Article Type" value={article.article_type?.replace(/_/g, " ")} />
                                <InfoItem icon={FileText} label="Specialty" value={article.speciality} />
                                <InfoItem icon={FileText} label="Year" value={article.year?.toString()} />
                                <InfoItem icon={FileText} label="Publication Date" value={article.publication_date ? new Date(article.publication_date).toLocaleDateString("en-IN") : "—"} />
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Statistics</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Views", value: article.view_count },
                                    { label: "Downloads", value: article.download_count },
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

                        {/* Abstract */}
                        {article.abstract && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Abstract</h4>
                                <div
                                    className="rounded-xl p-3"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{article.abstract}</p>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        {article.content && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Content</h4>
                                <div
                                    className="rounded-xl p-3 prose prose-sm max-w-none"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                                </div>
                            </div>
                        )}

                        {/* Rejection Reason */}
                        {article.status === "rejected" && article.rejection_reason && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Rejection Reason</h4>
                                <div
                                    className="rounded-xl p-3"
                                    style={{
                                        background: "rgba(239, 68, 68, 0.06)",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.5)"
                                    }}
                                >
                                    <p className="text-sm text-red-700">{article.rejection_reason}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky Footer */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div className="text-xs text-gray-500">
                            Created: {new Date(article.created_at).toLocaleString("en-IN")} · Article ID: {article.id}
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

import { FileText, XCircle } from "lucide-react";
import type { Article, ArticleStatus, ArticleType } from "../articles.types";

interface ArticleDetailsModalProps {
    article: Article | null;
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
                    className="relative inline-block w-full max-w-2xl p-5 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

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
    if (!article) return null;

    const InfoCell = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
        <div>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-sm font-medium text-gray-900">{value || "—"}</div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Article Details">
            <div className="space-y-4">
                {/* Header with Article Info */}
                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
                        <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900">
                            {article.title}
                        </h3>
                        <p className="text-sm text-gray-600">by {article.authors}</p>
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

                {/* Article Information */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Article Information
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-gray-50 rounded-lg p-3">
                        <InfoCell label="Uploaded By" value={article.uploaded_by} />
                        <InfoCell label="Institution" value={article.institution} />
                        <InfoCell label="Article Type" value={article.article_type?.replace(/_/g, " ")} />
                        <InfoCell label="Specialty" value={article.speciality} />
                        <InfoCell label="Year" value={article.year?.toString()} />
                        <InfoCell label="Publication Date" value={article.publication_date ? new Date(article.publication_date).toLocaleDateString("en-IN") : "—"} />
                    </div>
                </div>

                {/* Statistics */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-base font-bold text-gray-900">{article.view_count}</div>
                            <div className="text-xs text-gray-500">Views</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-base font-bold text-gray-900">{article.download_count}</div>
                            <div className="text-xs text-gray-500">Downloads</div>
                        </div>
                    </div>
                </div>

                {/* Abstract */}
                {article.abstract && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Abstract
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{article.abstract}</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                {article.content && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Content
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        </div>
                    </div>
                )}

                {/* Rejection Reason */}
                {article.status === "rejected" && article.rejection_reason && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Rejection Reason
                        </h4>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                            <p className="text-sm text-red-700">{article.rejection_reason}</p>
                        </div>
                    </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-400 pt-3 border-t border-gray-200">
                    <p>Created: {new Date(article.created_at).toLocaleString("en-IN")}</p>
                    <p>Article ID: {article.id}</p>
                </div>
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
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

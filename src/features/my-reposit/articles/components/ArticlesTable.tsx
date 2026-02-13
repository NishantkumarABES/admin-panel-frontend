import { useState } from "react";
import { Check, X, FileText, ArrowRight, Eye, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import type { Article, ArticleStatus } from "../articles.types";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import ArticleDetailsModal from "./ArticleDetailsModal";
import * as articleService from "../../../../services/article.service";
import toast from "react-hot-toast";

interface ArticlesTableProps {
    articles: Article[];
    loading: boolean;
    currentPage: number;
    totalCount: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onRefresh: () => void;
    onEdit: (article: Article) => void;
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

export default function ArticlesTable({
    articles,
    loading,
    currentPage,
    totalCount,
    pageSize,
    hasNext,
    hasPrevious,
    onPageChange,
    onPageSizeChange,
    onRefresh,
    onEdit,
}: ArticlesTableProps) {
    // Publish confirm state
    const [publishingArticle, setPublishingArticle] = useState<Article | null>(null);
    // Move to review confirm state
    const [movingToReview, setMovingToReview] = useState<Article | null>(null);
    // Reject modal state
    const [rejectingArticle, setRejectingArticle] = useState<Article | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // View details modal
    const [viewingArticle, setViewingArticle] = useState<Article | null>(null);

    const handlePublish = async (article: Article) => {
        try {
            setIsSubmitting(true);
            await articleService.reviewArticle(article.id, { status: "published" });
            toast.success(`"${article.title}" published successfully`);
            onRefresh();
        } catch (error) {
            console.error("Failed to publish article:", error);
            toast.error("Failed to publish article");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMoveToReview = async (article: Article) => {
        try {
            setIsSubmitting(true);
            await articleService.moveArticleToReview(article.id);
            toast.success(`"${article.title}" moved to review`);
            onRefresh();
        } catch (error) {
            console.error("Failed to move article to review:", error);
            toast.error("Failed to move article to review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectingArticle || !rejectionReason.trim()) return;
        try {
            setIsSubmitting(true);
            await articleService.reviewArticle(rejectingArticle.id, {
                status: "rejected",
                rejection_reason: rejectionReason.trim(),
            });
            toast.success(`"${rejectingArticle.title}" rejected`);
            setRejectingArticle(null);
            setRejectionReason("");
            onRefresh();
        } catch (error) {
            console.error("Failed to reject article:", error);
            toast.error("Failed to reject article");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-600">Loading articles...</div>
                ) : !articles?.length ? (
                    <div className="p-8 text-center text-gray-600">
                        No articles found. Try adjusting your filters.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Title</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Authors</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {articles.map((article) => (
                                        <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 shrink-0 mt-0.5">
                                                        <FileText className="w-4.5 h-4.5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 text-wrap">{article.title}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{article.institution || "—"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{article.authors}</td>
                                            <td className="px-6 py-4 text-gray-700">{article.uploaded_by}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                                    {article.article_type?.replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{article.speciality || "—"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(article.status)}</td>
                                            <td className="px-6 py-4 text-gray-700">{article.year}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    {/* View Details (always visible) */}
                                                    <button
                                                        onClick={() => setViewingArticle(article)}
                                                        title="View Details"
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {/* Edit (always visible) */}
                                                    <button
                                                        onClick={() => onEdit(article)}
                                                        title="Edit Article"
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    {/* Move to Review (draft only) */}
                                                    {article.status === "draft" && (
                                                        <button
                                                            onClick={() => setMovingToReview(article)}
                                                            disabled={isSubmitting}
                                                            title="Move to Review"
                                                            className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                                                        >
                                                            <ArrowRight className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {/* Publish (draft or review) */}
                                                    {(article.status === "draft" || article.status === "review") && (
                                                        <button
                                                            onClick={() => setPublishingArticle(article)}
                                                            disabled={isSubmitting}
                                                            title="Publish"
                                                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {/* Reject (draft or review) */}
                                                    {(article.status === "draft" || article.status === "review") && (
                                                        <button
                                                            onClick={() => setRejectingArticle(article)}
                                                            disabled={isSubmitting}
                                                            title="Reject"
                                                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                                        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} articles
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="articlePageSize" className="text-sm text-gray-600">Per page:</label>
                                        <select
                                            id="articlePageSize"
                                            value={pageSize}
                                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                        disabled={!hasPrevious}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <div className="px-3 py-1.5 text-sm text-gray-600">
                                        Page {currentPage} of {Math.ceil(totalCount / pageSize) || 1}
                                    </div>
                                    <button
                                        onClick={() => onPageChange(currentPage + 1)}
                                        disabled={!hasNext}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Publish Confirm Dialog */}
            <ConfirmDialog
                isOpen={!!publishingArticle}
                onClose={() => setPublishingArticle(null)}
                onConfirm={() => {
                    if (publishingArticle) handlePublish(publishingArticle);
                    setPublishingArticle(null);
                }}
                title="Publish Article"
                message={`Are you sure you want to publish "${publishingArticle?.title}"?`}
                confirmText="Publish"
                cancelText="Cancel"
                variant="success"
            />

            {/* Move to Review Confirm Dialog */}
            <ConfirmDialog
                isOpen={!!movingToReview}
                onClose={() => setMovingToReview(null)}
                onConfirm={() => {
                    if (movingToReview) handleMoveToReview(movingToReview);
                    setMovingToReview(null);
                }}
                title="Move to Review"
                message={`Are you sure you want to move "${movingToReview?.title}" to review?`}
                confirmText="Move to Review"
                cancelText="Cancel"
                variant="warning"
            />

            {/* Reject Modal */}
            {rejectingArticle && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => { setRejectingArticle(null); setRejectionReason(""); }} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
                                    <X className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Article</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Are you sure you want to reject <span className="font-medium">"{rejectingArticle.title}"</span>? Please provide a reason.
                                </p>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter rejection reason..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none mb-6"
                                />
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => { setRejectingArticle(null); setRejectionReason(""); }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRejectSubmit}
                                        disabled={!rejectionReason.trim() || isSubmitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Rejecting..." : "Reject"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Article Details Modal */}
            <ArticleDetailsModal
                article={viewingArticle}
                isOpen={!!viewingArticle}
                onClose={() => setViewingArticle(null)}
            />
        </>
    );
}

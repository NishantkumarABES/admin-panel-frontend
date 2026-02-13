import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, Plus } from "lucide-react";
import type { Article, ArticleType, ArticleStatus, ArticleAnalytics, CreateArticleDTO, UpdateArticleDTO } from "./articles.types";
import { ARTICLE_TYPES } from "./articles.types";
import { SPECIALTIES } from "../../Advertisements/advertisement.types";
import * as articleService from "../../../services/article.service";
import toast from "react-hot-toast";
import AddEditArticleModal from "./components/AddEditArticleModal";
import ArticlesTable from "./components/ArticlesTable";

const STATUS_OPTIONS: { value: ArticleStatus | ""; label: string }[] = [
    { value: "", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "review", label: "In Review" },
    { value: "published", label: "Published" },
    { value: "rejected", label: "Rejected" },
];

export default function ArticlesView() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [specialtyFilter, setSpecialtyFilter] = useState("");
    const [articleTypeFilter, setArticleTypeFilter] = useState<ArticleType | "">("");
    const [statusFilter, setStatusFilter] = useState<ArticleStatus | "">("");

    // Analytics
    const [analytics, setAnalytics] = useState<ArticleAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    // Add/Edit article modal
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    // Track if this is the initial mount
    const isInitialMount = useRef(true);

    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const data = await articleService.getArticlesAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to fetch article analytics:", error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            const filters = {
                search: searchTerm || undefined,
                speciality: specialtyFilter || undefined,
                article_type: (articleTypeFilter as ArticleType) || undefined,
                status: (statusFilter as ArticleStatus) || undefined,
                page: currentPage,
                page_size: pageSize,
            };

            const response = await articleService.getArticles(filters);
            setArticles(response.results || []);
            setTotalCount(response.count);
            setHasNext(response.next !== null);
            setHasPrevious(response.previous !== null);
        } catch (error) {
            console.error("Failed to fetch articles:", error);
            toast.error("Failed to fetch articles");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, specialtyFilter, articleTypeFilter, statusFilter, currentPage, pageSize]);

    // Fetch analytics on mount
    useEffect(() => {
        fetchAnalytics();
    }, []);

    // Fetch articles on mount immediately, then debounce on subsequent changes
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchArticles();
            return;
        }

        const timer = setTimeout(() => {
            fetchArticles();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchArticles]);

    // Reset page to 1 when filters change (not pagination)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, specialtyFilter, articleTypeFilter, statusFilter]);

    const handleOpenAddModal = () => {
        setEditingArticle(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (article: Article) => {
        setEditingArticle(article);
        setIsAddEditModalOpen(true);
    };

    const handleAddOrEditArticle = async (data: CreateArticleDTO) => {
        if (editingArticle) {
            // Edit mode: extract fields for update (exclude user_id)
            const updateData: UpdateArticleDTO = {
                title: data.title,
                article_type: data.article_type,
                speciality: data.speciality,
                authors: data.authors,
                institution: data.institution,
                abstract: data.abstract,
                content: data.content,
                year: data.year,
                publication_date: data.publication_date,
            };
            await articleService.updateArticle(editingArticle.id, updateData);
            toast.success("Article updated successfully");
        } else {
            await articleService.createArticle(data);
            toast.success("Article added successfully");
        }
        fetchArticles();
        fetchAnalytics();
    };

    const handleRefresh = () => {
        fetchArticles();
        fetchAnalytics();
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const hasActiveFilters = searchTerm || specialtyFilter || articleTypeFilter || statusFilter;

    const handleClearFilters = () => {
        setSearchTerm("");
        setSpecialtyFilter("");
        setArticleTypeFilter("");
        setStatusFilter("");
    };

    return (
        <div className="space-y-6 min-w-0 max-w-full">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Total Articles</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {analytics?.total_articles || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Published</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-emerald-600 mt-1">
                            {analytics?.published_articles || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Draft</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-amber-600 mt-1">
                            {analytics?.draft_articles || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">In Review</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-blue-600 mt-1">
                            {analytics?.in_review_articles || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Rejected</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-red-600 mt-1">
                            {analytics?.rejected_articles || 0}
                        </div>
                    )}
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 min-w-0">
                    {/* Left side: Search + Filters */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap sm:gap-4 min-w-0 flex-1">
                        {/* Search */}
                        <div className="flex-1 min-w-0 w-full sm:min-w-75 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by title, author, institution..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                        </div>

                        {/* Filters group */}
                        <div className="flex flex-wrap items-center gap-4 min-w-0">
                            {/* Specialty Filter */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-48">
                                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                                <select
                                    value={specialtyFilter}
                                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                >
                                    <option value="">All Specialties</option>
                                    {SPECIALTIES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Article Type Filter */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                <select
                                    value={articleTypeFilter}
                                    onChange={(e) => setArticleTypeFilter(e.target.value as ArticleType | "")}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                >
                                    <option value="">All Types</option>
                                    {ARTICLE_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as ArticleStatus | "")}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right side: Add Article Button */}
                    <div className="flex justify-end lg:justify-normal shrink-0">
                        <button
                            onClick={handleOpenAddModal}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Add Article
                        </button>
                    </div>
                </div>
            </div>

            {/* Articles Table */}
            <ArticlesTable
                articles={articles}
                loading={loading}
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
                onRefresh={handleRefresh}
                onEdit={handleOpenEditModal}
            />

            {/* Add/Edit Article Modal */}
            <AddEditArticleModal
                isOpen={isAddEditModalOpen}
                onClose={() => {
                    setIsAddEditModalOpen(false);
                    setEditingArticle(null);
                }}
                onSubmit={handleAddOrEditArticle}
                article={editingArticle}
            />
        </div>
    );
}

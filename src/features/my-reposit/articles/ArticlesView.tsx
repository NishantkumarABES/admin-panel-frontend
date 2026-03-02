import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, Plus, HelpCircle, FileText, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
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

    const [analytics, setAnalytics] = useState<ArticleAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    const isInitialMount = useRef(true);

    const fetchAnalytics = async () => {
        try { setAnalyticsLoading(true); const data = await articleService.getArticlesAnalytics(); setAnalytics(data); }
        catch (error) { console.error("Failed to fetch article analytics:", error); }
        finally { setAnalyticsLoading(false); }
    };

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            const filters = { search: searchTerm || undefined, speciality: specialtyFilter || undefined, article_type: (articleTypeFilter as ArticleType) || undefined, status: (statusFilter as ArticleStatus) || undefined, page: currentPage, page_size: pageSize };
            const response = await articleService.getArticles(filters);
            setArticles(response.results || []); setTotalCount(response.count); setHasNext(response.next !== null); setHasPrevious(response.previous !== null);
        } catch (error) { console.error("Failed to fetch articles:", error); toast.error("Failed to fetch articles"); }
        finally { setLoading(false); }
    }, [searchTerm, specialtyFilter, articleTypeFilter, statusFilter, currentPage, pageSize]);

    useEffect(() => { fetchAnalytics(); }, []);
    useEffect(() => { if (isInitialMount.current) { isInitialMount.current = false; fetchArticles(); return; } const timer = setTimeout(() => { fetchArticles(); }, 300); return () => clearTimeout(timer); }, [fetchArticles]);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, specialtyFilter, articleTypeFilter, statusFilter]);

    const handleOpenAddModal = () => { setEditingArticle(null); setIsAddEditModalOpen(true); };
    const handleOpenEditModal = (article: Article) => { setEditingArticle(article); setIsAddEditModalOpen(true); };

    const handleAddOrEditArticle = async (data: CreateArticleDTO) => {
        if (editingArticle) {
            const updateData: UpdateArticleDTO = { title: data.title, article_type: data.article_type, speciality: data.speciality, authors: data.authors, institution: data.institution, abstract: data.abstract, content: data.content, year: data.year, publication_date: data.publication_date };
            await articleService.updateArticle(editingArticle.id, updateData);
            toast.success("Article updated successfully");
        } else { await articleService.createArticle(data); toast.success("Article added successfully"); }
        fetchArticles(); fetchAnalytics();
    };

    const handleRefresh = () => { fetchArticles(); fetchAnalytics(); };
    const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };
    const hasActiveFilters = searchTerm || specialtyFilter || articleTypeFilter || statusFilter;
    const handleClearFilters = () => { setSearchTerm(""); setSpecialtyFilter(""); setArticleTypeFilter(""); setStatusFilter(""); };

    const statCards = [
        { label: "Total Articles", value: analytics?.total_articles || 0, icon: FileText, color: "#6b96ff", bg: "rgba(107, 150, 255, 0.08)", tooltip: "The total number of articles in the system." },
        { label: "Published", value: analytics?.published_articles || 0, icon: CheckCircle, color: "#4fcfa5", bg: "rgba(79, 207, 165, 0.08)", tooltip: "Articles that have been published." },
        { label: "Draft", value: analytics?.draft_articles || 0, icon: AlertTriangle, color: "#ffc554", bg: "rgba(255, 197, 84, 0.08)", tooltip: "Articles saved as drafts." },
        { label: "In Review", value: analytics?.in_review_articles || 0, icon: Clock, color: "#6b96ff", bg: "rgba(107, 150, 255, 0.08)", tooltip: "Articles currently under review." },
        { label: "Rejected", value: analytics?.rejected_articles || 0, icon: XCircle, color: "#ff7070", bg: "rgba(255, 112, 112, 0.08)", tooltip: "Articles that have been rejected." },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {statCards.map((stat) => (
                    <div key={stat.label} className="clay-card min-w-0">
                        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
                            <div className="clay-circle" style={{ background: stat.bg }}>
                                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>
                            <div className="group relative">
                                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                                <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                                    {stat.tooltip}
                                </div>
                            </div>
                        </div>
                        {analyticsLoading ? (
                            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
                        ) : (
                            <div className="text-2xl font-bold" style={{ color: stat.color, marginBottom: "2px" }}>{stat.value}</div>
                        )}
                        <div className="text-xs" style={{ color: "#111827" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters and Actions */}
            <div className="clay-card min-w-0" style={{ padding: "14px 18px" }}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:gap-3 min-w-0 flex-1">
                        <div className="flex-1 min-w-0 w-full sm:min-w-75 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by title, author, institution..."
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 min-w-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-48">
                                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                                <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                    style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }}>
                                    <option value="">All Specialties</option>
                                    {SPECIALTIES.map((s) => (<option key={s} value={s}>{s}</option>))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                <select value={articleTypeFilter} onChange={(e) => setArticleTypeFilter(e.target.value as ArticleType | "")}
                                    className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                    style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }}>
                                    <option value="">All Types</option>
                                    {ARTICLE_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ArticleStatus | "")}
                                    className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                    style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }}>
                                    {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                </select>
                            </div>
                            {hasActiveFilters && (
                                <button onClick={handleClearFilters} className="clay-btn text-sm whitespace-nowrap" style={{ padding: "6px 14px", fontSize: "13px" }}>Clear Filters</button>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end lg:justify-normal shrink-0">
                        <button onClick={handleOpenAddModal}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap shrink-0"
                            style={{ background: "#1f2937", boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)" }}>
                            <Plus className="w-4 h-4" /> Add Article
                        </button>
                    </div>
                </div>
            </div>

            <ArticlesTable articles={articles} loading={loading} currentPage={currentPage} totalCount={totalCount} pageSize={pageSize} hasNext={hasNext} hasPrevious={hasPrevious} onPageChange={setCurrentPage} onPageSizeChange={handlePageSizeChange} onRefresh={handleRefresh} onEdit={handleOpenEditModal} />

            <AddEditArticleModal isOpen={isAddEditModalOpen} onClose={() => { setIsAddEditModalOpen(false); setEditingArticle(null); }} onSubmit={handleAddOrEditArticle} article={editingArticle} />
        </div>
    );
}

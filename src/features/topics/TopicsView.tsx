import { useState, useEffect } from "react";
import {
  Plus, Search, ChevronLeft, ChevronRight, X,
  HelpCircle, BookOpen, Globe, EyeOff,
} from "lucide-react";
import type { Topic, CreateTopicDTO, TopicsAnalytics } from "./topic.types";
import TopicTable from "./components/TopicTable";
import TopicDetailsModal from "./components/TopicDetailsModal";
import AddEditTopicModal from "./components/AddEditTopicModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import * as topicService from "../../services/topic.service";

const insetInputStyle = {
  background: "#eff1f5",
  border: "none",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

const tooltipStyle = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)",
  color: "#374151",
};

const activePillStyle = {
  background: "#1f2937",
  color: "white",
  boxShadow: "2px 2px 5px rgba(0,0,0,0.15)",
};

const inactivePillStyle = {
  background: "#eff1f5",
  color: "#6b7280",
  boxShadow: "4px 4px 8px rgba(0,0,0,0.10), -4px -4px 8px rgba(255,255,255,0.7)",
};

export default function TopicsView() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [pageSize, setPageSize] = useState(5);

  // Analytics state
  const [analytics, setAnalytics] = useState<TopicsAnalytics | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "admin" | "doctor">("all");

  // Modal states
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isTranscriptionWarningOpen, setIsTranscriptionWarningOpen] = useState(false);

  // Keep selectedTopic in sync with latest data from topics array
  useEffect(() => {
    if (selectedTopic) {
      const updated = topics.find((t) => t.id === selectedTopic.id);
      if (updated) setSelectedTopic(updated);
    }
  }, [topics]);

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await topicService.getTopicsAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch topics
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await topicService.getTopics({
        status: statusFilter !== "all" ? statusFilter : undefined,
        topic_type: typeFilter !== "all" ? typeFilter : undefined,
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
      });

      setTopics(response.results || []);
      setTotalCount(response.count || 0);
      setHasNext(response.next !== null);
      setHasPrevious(response.previous !== null);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
    fetchTopics();
  }, [currentPage, pageSize, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchTopics();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handlers
  const handleView = (topic: Topic) => { setSelectedTopic(topic); setIsDetailsModalOpen(true); };
  const handleAdd = () => { setSelectedTopic(null); setIsAddEditModalOpen(true); };
  const handleEdit = (topic: Topic) => { setSelectedTopic(topic); setIsAddEditModalOpen(true); };
  const handleDelete = (topic: Topic) => { setSelectedTopic(topic); setIsDeleteDialogOpen(true); };

  const handlePublish = (topic: Topic) => {
    setSelectedTopic(topic);
    if (
      !topic.publish_status &&
      topic.video_url &&
      (!topic.transcription || topic.transcription.status !== "completed")
    ) {
      setIsTranscriptionWarningOpen(true);
      return;
    }
    setIsPublishDialogOpen(true);
  };

  const handleAddEditSubmit = async (data: CreateTopicDTO) => {
    try {
      if (selectedTopic) {
        await topicService.updateTopic({ ...data, id: selectedTopic.id });
      } else {
        await topicService.createTopic(data);
      }
      await fetchTopics();
      await fetchAnalytics();
      setIsAddEditModalOpen(false);
    } catch (error) {
      console.error("Failed to save topic:", error);
      alert("Failed to save topic. Please try again.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTopic) return;
    try {
      await topicService.deleteTopic(selectedTopic.id);
      await fetchTopics();
      await fetchAnalytics();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete topic:", error);
      alert("Failed to delete topic. Please try again.");
    }
  };

  const handleConfirmPublish = async () => {
    if (!selectedTopic) return;
    try {
      await topicService.togglePublishStatus(selectedTopic.id);
      await fetchTopics();
      await fetchAnalytics();
      setIsPublishDialogOpen(false);
    } catch (error) {
      console.error("Failed to update topic status:", error);
      alert("Failed to update publish status. Please try again.");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || typeFilter !== "all";

  const stats = analytics
    ? {
      total: analytics.total_topics,
      published: analytics.published_topics,
      unpublished: analytics.unpublished_topics,
    }
    : {
      total: totalCount || topics.length,
      published: topics.filter((t) => t.publish_status).length,
      unpublished: topics.filter((t) => !t.publish_status).length,
    };



  const totalPages = Math.ceil(totalCount / pageSize);

  // Build pagination page numbers with ellipsis
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
    }
    return pages;
  };

  // Handle details modal actions
  const handleDetailsEdit = (topic: Topic) => {
    setIsDetailsModalOpen(false);
    handleEdit(topic);
  };

  const handleDetailsPublish = (topic: Topic) => {
    setIsDetailsModalOpen(false);
    handlePublish(topic);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Total Topics */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
              <BookOpen className="w-5 h-5" style={{ color: "#6b96ff" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                The total number of health topics available in the system, including both admin articles and doctor video topics.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="animate-pulse">
              <div className="h-7 w-16 bg-gray-200 rounded-lg" style={{ marginBottom: "6px" }} />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>{stats.total}</div>
              <div className="text-xs" style={{ color: "#111827" }}>Total Topics</div>
            </>
          )}
        </div>

        {/* Published */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
              <Globe className="w-5 h-5" style={{ color: "#4fcfa5" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Topics that are currently published and visible to patients and doctors in the app.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="animate-pulse">
              <div className="h-7 w-16 bg-gray-200 rounded-lg" style={{ marginBottom: "6px" }} />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold" style={{ color: "#4fcfa5", marginBottom: "2px" }}>{stats.published}</div>
              <div className="text-xs" style={{ color: "#111827" }}>Published</div>
            </>
          )}
        </div>

        {/* Unpublished */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(156, 163, 175, 0.12)" }}>
              <EyeOff className="w-5 h-5" style={{ color: "#9ca3af" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Topics that have not been published yet and are only visible to admins.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="animate-pulse">
              <div className="h-7 w-16 bg-gray-200 rounded-lg" style={{ marginBottom: "6px" }} />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold" style={{ color: "#6b7280", marginBottom: "2px" }}>{stats.unpublished}</div>
              <div className="text-xs" style={{ color: "#111827" }}>Unpublished</div>
            </>
          )}
        </div>
      </div>


      {/* Filters and Actions */}
      <div className="clay-card min-w-0" style={{ padding: "14px 18px" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 min-w-0">

          {/* Left: Search + Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:gap-3 min-w-0 flex-1">

            {/* Search */}
            <div className="flex-1 min-w-0 w-full sm:min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full pl-9 pr-9 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                style={insetInputStyle}
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters Group */}
            <div className="flex flex-wrap items-center gap-3 min-w-0">

              {/* Status Pill Group */}
              <div className="flex items-center rounded-xl overflow-hidden" style={{ boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.06), inset -1px -1px 3px rgba(255,255,255,0.5)" }}>
                {([
                  { value: "all", label: "All" },
                  { value: "publish", label: "Published" },
                  { value: "unpublish", label: "Unpublished" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className="px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap"
                    style={statusFilter === opt.value ? activePillStyle : inactivePillStyle}
                    title={`Filter by ${opt.label}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Type Pill Group */}
              <div className="flex items-center rounded-xl overflow-hidden" style={{ boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.06), inset -1px -1px 3px rgba(255,255,255,0.5)" }}>
                {([
                  { value: "all" as const, label: "All" },
                  { value: "admin" as const, label: "Admin Articles" },
                  { value: "doctor" as const, label: "Doctor Videos" },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTypeFilter(opt.value)}
                    className="px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap"
                    style={typeFilter === opt.value ? activePillStyle : inactivePillStyle}
                    title={`Filter by ${opt.label}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="clay-btn text-sm whitespace-nowrap"
                  style={{ padding: "6px 14px", fontSize: "13px" }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Right: Add Topic Button */}
          <div className="flex justify-end lg:justify-normal shrink-0">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap shrink-0"
              style={{
                background: "#1f2937",
                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
              }}
            >
              <Plus className="w-4 h-4" />
              Add Topic
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="clay-card overflow-hidden" style={{ padding: 0 }}>
        {loading ? (
          /* Skeleton Loading Rows */
          <div className="w-full">
            <div
              className="px-4 py-3"
              style={{ background: "#f8f9fb", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse ml-auto" />
              </div>
            </div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-4 animate-pulse"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
              >
                {/* Index */}
                <div className="w-6 h-4 bg-gray-200 rounded" />
                {/* Thumbnail */}
                <div className="w-11 h-11 bg-gray-200 rounded-lg shrink-0" />
                {/* Title + subtitle */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="w-48 h-4 bg-gray-200 rounded" />
                  <div className="w-64 h-3 bg-gray-100 rounded" />
                </div>
                {/* Type badge */}
                <div className="w-24 h-6 bg-gray-200 rounded-lg" />
                {/* Author */}
                <div className="space-y-1">
                  <div className="w-20 h-3.5 bg-gray-200 rounded" />
                  <div className="w-28 h-3 bg-gray-100 rounded" />
                </div>
                {/* Status */}
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                {/* Date */}
                <div className="w-20 h-3.5 bg-gray-200 rounded" />
                {/* Actions */}
                <div className="flex gap-1.5">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : topics.length === 0 ? (
          /* Empty State */
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "#eff1f5",
                boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.6)",
              }}
            >
              <BookOpen className="w-8 h-8" style={{ color: "#c0c4cc" }} />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No topics found</h3>
            {hasActiveFilters ? (
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            ) : (
              <button
                onClick={handleAdd}
                className="mt-3 flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.04)",
                }}
              >
                <Plus className="w-4 h-4" />
                Add your first topic
              </button>
            )}
          </div>
        ) : (
          <>
            <TopicTable
              topics={topics}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPublish={handlePublish}
            />

            {/* Pagination */}
            {!loading && topics.length > 0 && (
              <div
                className="px-5 py-3"
                style={{
                  background: "#eff1f5",
                  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-600">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} topics
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor="topicPageSize" className="text-xs text-gray-600">Per page:</label>
                        <select
                          id="topicPageSize"
                          value={pageSize}
                          onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                          className="px-2 py-1 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          style={{
                            background: "#ffffff",
                            border: "none",
                            boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.5)",
                          }}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!hasPrevious}
                        className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        title="Previous page"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev
                      </button>

                      {/* Page Number Buttons */}
                      {getPageNumbers().map((page, idx) =>
                        page === "ellipsis" ? (
                          <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-gray-400 select-none">…</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className="min-w-[28px] h-7 rounded-lg text-xs font-semibold transition-all"
                            style={
                              currentPage === page
                                ? { background: "#1f2937", color: "white", boxShadow: "2px 2px 5px rgba(0,0,0,0.15)" }
                                : { background: "#eff1f5", color: "#6b7280", boxShadow: "2px 2px 4px rgba(0,0,0,0.08), -2px -2px 4px rgba(255,255,255,0.6)" }
                            }
                            title={`Go to page ${page}`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!hasNext}
                        className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        title="Next page"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <TopicDetailsModal
        topic={selectedTopic}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onRefresh={fetchTopics}
        onEdit={handleDetailsEdit}
        onPublish={handleDetailsPublish}
      />

      <AddEditTopicModal
        topic={selectedTopic}
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleAddEditSubmit}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Topic"
        message={`Are you sure you want to delete "${selectedTopic?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        onConfirm={handleConfirmPublish}
        title={selectedTopic?.publish_status ? "Unpublish Topic" : "Publish Topic"}
        message={
          selectedTopic?.publish_status
            ? `Are you sure you want to unpublish "${selectedTopic?.title}"? This will make it invisible to users.`
            : `Are you sure you want to publish "${selectedTopic?.title}"? This will make it visible to users.`
        }
        confirmText={selectedTopic?.publish_status ? "Unpublish" : "Publish"}
        variant={selectedTopic?.publish_status ? "warning" : "success"}
      />

      <ConfirmDialog
        isOpen={isTranscriptionWarningOpen}
        onClose={() => setIsTranscriptionWarningOpen(false)}
        onConfirm={() => setIsTranscriptionWarningOpen(false)}
        title="Transcription Not Complete"
        message="This video topic cannot be published yet. Please complete the transcription and summarization process first before publishing."
        confirmText="OK"
        variant="warning"
        hideCancelButton={true}
      />
    </div>
  );
}
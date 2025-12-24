import { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import type { Topic, CreateTopicDTO, TopicStatus } from "./topic.types";
import { mockTopics } from "./topic.types";
import TopicTable from "./components/TopicTable";
import TopicDetailsModal from "./components/TopicDetailsModal";
import AddEditTopicModal from "./components/AddEditTopicModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import * as topicService from "../../services/topic.service";

export default function TopicsView() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<TopicStatus | "all">("all");

  // Modal states
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch topics
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (categoryFilter !== "all") filters.category = categoryFilter;
      if (searchTerm) filters.search = searchTerm;
      const response = await topicService.getTopics(filters);
      setTopics(Array.isArray(response.data) ? response.data : [...mockTopics]);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      // Use mock data on error
      setTopics(mockTopics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Use mock data for now
    setTopics(mockTopics);
    setLoading(false);
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchTopics();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Refetch when filters change
  useEffect(() => {
    // fetchTopics();
  }, [statusFilter, categoryFilter]);

  // Handlers
  const handleView = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsDetailsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedTopic(null);
    setIsAddEditModalOpen(true);
  };

  const handleEdit = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsAddEditModalOpen(true);
  };

  const handleDelete = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsDeleteDialogOpen(true);
  };

  // Submit handlers
  const handleAddEditSubmit = async (data: CreateTopicDTO) => {
    try {
      if (selectedTopic) {
        await topicService.updateTopic({ ...data, id: selectedTopic.id });
      } else {
        await topicService.createTopic(data);
      }
      fetchTopics();
    } catch (error) {
      console.error("Failed to save topic:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTopic) return;
    try {
      await topicService.deleteTopic(selectedTopic.id);
      fetchTopics();
    } catch (error) {
      console.error("Failed to delete topic:", error);
    }
  };

  // Get unique categories for filter
  const uniqueCategories = Array.from(
    new Set(topics.map((topic) => topic.category))
  ).sort();

  // Get stats for all topics
  const stats = {
    total: topics.length,
    published: topics.filter((t) => t.status === "published").length,
    scheduled: topics.filter((t) => t.status === "scheduled").length,
    draft: topics.filter((t) => t.status === "draft").length,
  };

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          {/* Left side: Search + Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap sm:gap-4 min-w-0 flex-1">
            {/* Search */}
            <div className="flex-1 min-w-0 w-full sm:min-w-[280px] sm:max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, category, or author..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-4 min-w-0">
              {/* Category Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-[160px]">
                <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-[160px]">
                <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as TopicStatus | "all")
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right side: Add Topic Button */}
          <div className="flex justify-end lg:justify-normal flex-shrink-0">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Topic
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Total Topics</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Published</div>
          <div className="text-2xl font-bold text-emerald-600">
            {stats.published}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Scheduled</div>
          <div className="text-2xl font-bold text-amber-600">
            {stats.scheduled}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Draft</div>
          <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading topics...</p>
        </div>
      ) : (
        <TopicTable
          topics={topics}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <TopicDetailsModal
        topic={selectedTopic}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
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
    </div>
  );
}
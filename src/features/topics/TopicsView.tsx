import { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import type { Topic, CreateTopicDTO, TopicsAnalytics } from "./topic.types";
import TopicTable from "./components/TopicTable";
import TopicDetailsModal from "./components/TopicDetailsModal";
import AddEditTopicModal from "./components/AddEditTopicModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import * as topicService from "../../services/topic.service";

export default function TopicsView() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  // Analytics state
  const [analytics, setAnalytics] = useState<TopicsAnalytics | null>(null);

  // Modal states
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const data = await topicService.getTopicsAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  // Fetch topics
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await topicService.getTopics({
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
      });

      setTopics(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / pageSize));
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
  }, [currentPage]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      fetchTopics();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const handlePublish = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsPublishDialogOpen(true);
  };

  // Submit handlers
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

  return (

    <div className="space-y-6 min-w-0 max-w-full">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Total Topics</div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics?.total_topics || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Published</div>
          <div className="text-2xl font-bold text-emerald-600">
            {analytics?.published_topics || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Unpublished</div>
          <div className="text-2xl font-bold text-gray-600">
            {analytics?.unpublished_topics || 0}
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Left side: Search */}
          <div className="flex-1 min-w-0 w-full sm:min-w-300 sm:max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="publish">Publish</option>
              <option value="unpublish">UnPublish</option>
            </select>
          </div>
          {/* Right side: Add Topic Button */}
          <div className="flex justify-end lg:justify-normal shrink-0">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Topic
            </button>
          </div>
        </div>
      </div>



      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading topics...</p>
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
          {totalPages > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing page {currentPage} of {totalPages} ({totalCount} total topics)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
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
    </div>
  );
}
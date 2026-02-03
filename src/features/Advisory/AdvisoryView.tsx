import { useState, useEffect } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import type {
  AdvisoryMember,
  CreateAdvisoryDTO,
  AdvisoryAnalytics,
  AdvisoryStatus,
} from "./advisory.types";
import { mockAdvisoryMembers, mockAdvisoryAnalytics } from "./advisory.types";
import AdvisoryTable from "./components/AdvisoryTable";
import AdvisoryDetailsModal from "./components/AdvisoryDetailsModal";
import AddEditAdvisoryModal from "./components/AddEditAdvisoryModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import * as advisoryService from "../../services/advisory.service";

export default function AdvisoryView() {
  const [members, setMembers] = useState<AdvisoryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdvisoryStatus | "all">("all");
  const [analytics, setAnalytics] = useState<AdvisoryAnalytics | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Modal states
  const [selectedMember, setSelectedMember] = useState<AdvisoryMember | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch advisory analytics
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      try {
        const response = await advisoryService.getAdvisoryAnalytics();
        setAnalytics(response.data);
      } catch (error) {
        console.log("Using mock analytics - API not available");
        setAnalytics(mockAdvisoryAnalytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch advisory members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
        page: currentPage,
        page_size: pageSize,
      };

      // Try to fetch from API, fallback to mock data on error
      try {
        const response = await advisoryService.getAdvisoryMembers(filters);
        setMembers(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockAdvisoryMembers];

        // Apply status filter
        if (statusFilter !== "all") {
          filteredData = filteredData.filter((m) => m.status === statusFilter);
        }

        // Apply search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            (m) =>
              m.full_name.toLowerCase().includes(search) ||
              m.email.toLowerCase().includes(search) ||
              m.phone.toLowerCase().includes(search) ||
              m.specialization.toLowerCase().includes(search)
          );
        }

        setMembers(filteredData);
        setTotalCount(filteredData.length);
      }
    } catch (error) {
      console.error("Failed to fetch advisory members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Handlers
  const handleView = (member: AdvisoryMember) => {
    setSelectedMember(member);
    setIsDetailsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedMember(null);
    setIsAddEditModalOpen(true);
  };

  const handleEdit = (member: AdvisoryMember) => {
    setSelectedMember(member);
    setIsAddEditModalOpen(true);
  };

  const handleDelete = (member: AdvisoryMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  // Submit handlers
  const handleAddEditSubmit = async (
    data: CreateAdvisoryDTO | { doctorId: string },
    isFromDoctor: boolean
  ): Promise<{ error?: string }> => {
    try {
      if (selectedMember) {
        // Update existing member
        await advisoryService.updateAdvisoryMember({
          ...(data as CreateAdvisoryDTO),
          id: selectedMember.id,
        });
      } else if (isFromDoctor && "doctorId" in data) {
        // Add doctor to advisory
        await advisoryService.addDoctorToAdvisory(data.doctorId);
      } else {
        // Create new member manually
        await advisoryService.createAdvisoryMember(data as CreateAdvisoryDTO);
      }
      fetchMembers();
      fetchAnalytics();
      return {};
    } catch (error: any) {
      console.error("Failed to save advisory member:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        (selectedMember
          ? "Failed to update advisory member. Please try again."
          : "Failed to add advisory member. Please try again.");
      return { error: errorMessage };
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMember) return;
    try {
      await advisoryService.deleteAdvisoryMember(selectedMember.id);
      fetchMembers();
      fetchAnalytics();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete advisory member:", error);
    }
  };

  // Use API analytics data if available, or calculate from current members
  const stats = analytics
    ? {
      total: analytics.total_members,
      active: analytics.active_members,
      inactive: analytics.inactive_members,
    }
    : {
      total: totalCount || members.length,
      active: members.filter((m) => m.status === "active").length,
      inactive: members.filter((m) => m.status === "inactive").length,
    };

  // Clear filters handler
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter !== "all";

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Total Members</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Active Members</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.active}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Inactive Members</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {stats.inactive}
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
                placeholder="Search by name, email, or specialization..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
              <Filter className="w-5 h-5 text-gray-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as AdvisoryStatus | "all")
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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

          {/* Right side: Add Member Button */}
          <div className="flex justify-end lg:justify-normal shrink-0">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">
            Loading advisory members...
          </div>
        ) : !members?.length ? (
          <div className="p-8 text-center text-gray-600">
            No advisory members found. Try adjusting your filters.
          </div>
        ) : (
          <>
            <AdvisoryTable
              members={members}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {!loading && members?.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, totalCount)} of{" "}
                        {totalCount} members
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor="pageSize" className="text-sm text-gray-600">
                          Per page:
                        </label>
                        <select
                          id="pageSize"
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                          }}
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
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={!hasPrevious}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <div className="px-3 py-1.5 text-sm text-gray-600">
                        Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                      </div>
                      <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={!hasNext}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
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
      <AdvisoryDetailsModal
        member={selectedMember}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <AddEditAdvisoryModal
        member={selectedMember}
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setSelectedMember(null);
        }}
        onSubmit={handleAddEditSubmit}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Advisory Member"
        message={`Are you sure you want to remove Dr. ${selectedMember?.full_name} from the advisory panel? This action cannot be undone.`}
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}

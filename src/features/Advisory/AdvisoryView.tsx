import { useState, useEffect } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, HelpCircle, Users, UserCheck, UserX } from "lucide-react";
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

      try {
        const response = await advisoryService.getAdvisoryMembers(filters);
        setMembers(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockAdvisoryMembers];

        if (statusFilter !== "all") {
          filteredData = filteredData.filter((m) => m.status === statusFilter);
        }

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

  const handleAddEditSubmit = async (
    data: CreateAdvisoryDTO | { doctorId: string },
    isFromDoctor: boolean
  ): Promise<{ error?: string }> => {
    try {
      if (selectedMember) {
        await advisoryService.updateAdvisoryMember({
          ...(data as CreateAdvisoryDTO),
          id: selectedMember.id,
        });
      } else if (isFromDoctor && "doctorId" in data) {
        await advisoryService.addDoctorToAdvisory(data.doctorId);
      } else {
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

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all";

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Members */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
              <Users className="w-5 h-5" style={{ color: "#6b96ff" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                The total number of advisory panel members in the system.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>{stats.total}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Total Members</div>
        </div>

        {/* Active Members */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
              <UserCheck className="w-5 h-5" style={{ color: "#4fcfa5" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Advisory members currently active and contributing to the panel.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-xl font-bold" style={{ color: "#4fcfa5", marginBottom: "2px" }}>{stats.active}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Active</div>
        </div>

        {/* Inactive Members */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(255, 197, 84, 0.08)" }}>
              <UserX className="w-5 h-5" style={{ color: "#ffc554" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Members who are currently inactive on the advisory panel.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-xl font-bold" style={{ color: "#ffc554", marginBottom: "2px" }}>{stats.inactive}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Inactive</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="clay-card min-w-0" style={{ padding: "14px 18px" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 min-w-0">
          {/* Left side: Search + Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:gap-3 min-w-0 flex-1">
            {/* Search */}
            <div className="flex-1 min-w-0 w-full sm:min-w-75 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or specialization..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                style={insetInputStyle}
              />
            </div>

            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              {/* Status Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as AdvisoryStatus | "all")
                  }
                  className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                  style={insetInputStyle}
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
                  className="clay-btn text-sm whitespace-nowrap"
                  style={{ padding: "6px 14px", fontSize: "13px" }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Right side: Add Member Button */}
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
              Add Member
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
                <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse ml-auto" />
              </div>
            </div>
            {[...Array(pageSize)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-4 animate-pulse"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
              >
                {/* Avatar + Name */}
                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="w-36 h-4 bg-gray-200 rounded" />
                  <div className="w-48 h-3 bg-gray-100 rounded" />
                </div>
                {/* Specialization */}
                <div className="w-24 h-6 bg-gray-200 rounded-lg" />
                {/* Phone */}
                <div className="w-24 h-3.5 bg-gray-200 rounded" />
                {/* Status */}
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                {/* Actions */}
                <div className="flex gap-1.5">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : !members?.length ? (
          <div className="p-8 text-center text-gray-500">
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
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, totalCount)} of{" "}
                        {totalCount} members
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor="pageSize" className="text-xs text-gray-600">
                          Per page:
                        </label>
                        <select
                          id="pageSize"
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                          }}
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
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
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
                        onClick={() => setCurrentPage((prev) => prev + 1)}
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

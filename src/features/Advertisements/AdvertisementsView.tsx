import { useState, useEffect } from "react";
import { Plus, Search, Edit, Eye, Filter, ChevronLeft, ChevronRight, HelpCircle, Megaphone, CheckCircle, XCircle } from "lucide-react";
import type { GeneralAdvertisement } from "./advertisement.types";
import { mockGeneralAds } from "./advertisement.types";
import { advertisementService } from "../../services/advertisement.service";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AddGeneralAdForm from "./components/AddGeneralAdForm";
import EditGeneralAdForm from "./components/EditGeneralAdForm";
import AdvertisementDetailsModal from "./components/AdvertisementDetailsModal";

export default function AdvertisementsView() {
  const [generalAds, setGeneralAds] = useState<GeneralAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<GeneralAdvertisement | null>(null);

  const fetchGeneralAds = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
        page: currentPage,
        page_size: pageSize,
      };

      try {
        const response = await advertisementService.getGeneralAds(filters);
        setGeneralAds(Array.isArray(response.data.results) ? response.data.results : [...mockGeneralAds]);
        setTotalCount(response.data.count);
        setHasNext(!!response.data.next);
        setHasPrevious(!!response.data.previous);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockGeneralAds];
        if (statusFilter !== "all") filteredData = filteredData.filter(ad => ad.status === statusFilter);
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(ad => ad.title.toLowerCase().includes(search) || ad.url.toLowerCase().includes(search));
        }
        setGeneralAds(filteredData);
        setTotalCount(filteredData.length);
      }
    } catch (error) {
      console.error("Failed to fetch general advertisements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchGeneralAds(); }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, currentPage, pageSize]);

  const handleAddSuccess = () => { setIsAddModalOpen(false); fetchGeneralAds(); };
  const handleEditSuccess = () => { setIsEditModalOpen(false); setSelectedAd(null); fetchGeneralAds(); };
  const handleEdit = (ad: GeneralAdvertisement) => { setSelectedAd(ad); setIsEditModalOpen(true); };
  const handleViewDetails = (ad: GeneralAdvertisement) => { setSelectedAd(ad); setIsDetailsModalOpen(true); };

  const handleConfirmDelete = async () => {
    if (!selectedAd) return;
    try {
      await advertisementService.deleteGeneralAd(selectedAd.id);
      setIsDeleteDialogOpen(false);
      setSelectedAd(null);
      fetchGeneralAds();
    } catch (error) {
      console.error("Failed to delete advertisement:", error);
      setGeneralAds(prev => prev.filter(ad => ad.id !== selectedAd.id));
      setIsDeleteDialogOpen(false);
      setSelectedAd(null);
    }
  };

  const stats = {
    total: generalAds.length,
    enabled: generalAds.filter(ad => ad.status === "enabled").length,
    disabled: generalAds.filter(ad => ad.status === "disabled").length,
  };

  const handleClearFilters = () => { setSearchTerm(""); setStatusFilter("all"); };
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

  const getStatusBadge = (status: string) => {
    const isEnabled = status === "enabled";
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        style={{
          background: isEnabled ? "rgba(79, 207, 165, 0.1)" : "rgba(107, 114, 128, 0.1)",
          color: isEnabled ? "#2ea87e" : "#4b5563",
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Total Ads */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
              <Megaphone className="w-5 h-5" style={{ color: "#6b96ff" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-56 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Total number of advertisements in the system.
              </div>
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>{stats.total}</div>
          <div className="text-xs" style={{ color: "#111827" }}>Total Ads</div>
        </div>

        {/* Enabled */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
              <CheckCircle className="w-5 h-5" style={{ color: "#4fcfa5" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-56 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Advertisements currently visible to users.
              </div>
            </div>
          </div>
          <div className="text-xl font-bold" style={{ color: "#4fcfa5", marginBottom: "2px" }}>{stats.enabled}</div>
          <div className="text-xs" style={{ color: "#111827" }}>Enabled</div>
        </div>

        {/* Disabled */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 114, 128, 0.08)" }}>
              <XCircle className="w-5 h-5" style={{ color: "#6b7280" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-56 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Advertisements that are currently hidden.
              </div>
            </div>
          </div>
          <div className="text-xl font-bold" style={{ color: "#6b7280", marginBottom: "2px" }}>{stats.disabled}</div>
          <div className="text-xs" style={{ color: "#111827" }}>Disabled</div>
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
                placeholder="Search advertisements by title or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                  style={insetInputStyle}
                >
                  <option value="all">All Status</option>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
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

          {/* Right side: Add Button */}
          <div className="flex justify-end lg:justify-normal shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap shrink-0"
              style={{
                background: "#1f2937",
                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
              }}
            >
              <Plus className="w-4 h-4" />
              Add Advertisement
            </button>
          </div>
        </div>
      </div>

      {/* Advertisements Table */}
      <div className="clay-card overflow-hidden" style={{ padding: 0 }}>
        {loading ? (
          /* Skeleton Loading Rows */
          <div className="w-full">
            <div
              className="px-4 py-3"
              style={{ background: "#f8f9fb", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-40 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
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
                {/* Image + Title */}
                <div className="w-11 h-11 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="w-44 h-4 bg-gray-200 rounded" />
                  <div className="w-32 h-3 bg-gray-100 rounded" />
                </div>
                {/* URL */}
                <div className="w-40 h-3.5 bg-gray-200 rounded" />
                {/* Specialties */}
                <div className="flex gap-1">
                  <div className="w-16 h-5 bg-gray-200 rounded-full" />
                  <div className="w-16 h-5 bg-gray-200 rounded-full" />
                </div>
                {/* Target */}
                <div className="w-16 h-6 bg-gray-200 rounded-full" />
                {/* Status */}
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                {/* Actions */}
                <div className="flex gap-1.5">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : generalAds.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No advertisements found. Try adjusting your filters or add a new advertisement.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto min-w-0">
              <table className="w-full table-auto divide-y divide-gray-100 min-w-max">
                <thead style={{ background: "#f8f9fb", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-[280px]">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      URL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Specialties
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Target User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {generalAds.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-4 max-w-[280px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-12 h-12 object-cover rounded-lg shrink-0"
                            style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "2px 2px 6px rgba(0,0,0,0.08)" }}
                            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/48x48?text=Ad"; }}
                          />
                          <div className="text-sm font-medium text-gray-900 break-words">{ad.title}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600 truncate max-w-[200px]" title={ad.url}>{ad.url}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {ad.specializations && ad.specializations.length > 0 ? (
                            ad.specializations.slice(0, 3).map((specialty) => (
                              <span
                                key={specialty}
                                className="inline-flex items-center px-2 py-0.5 text-xs rounded-full"
                                style={{ background: "rgba(107, 150, 255, 0.1)", color: "#4b6fd4" }}
                              >
                                {specialty}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">No specialties</span>
                          )}
                          {ad.specializations && ad.specializations.length > 3 && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 text-xs rounded-full"
                              style={{ background: "rgba(107, 114, 128, 0.1)", color: "#4b5563" }}
                            >
                              +{ad.specializations.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: ad.target_user === "doctor" ? "rgba(162, 133, 255, 0.1)" : "rgba(6, 182, 212, 0.1)",
                            color: ad.target_user === "doctor" ? "#7c56db" : "#0e7490",
                          }}
                        >
                          {ad.target_user === "doctor" ? "Doctor" : "Patient"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(ad.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(ad)}
                            className="p-1.5 rounded-lg transition-all duration-200"
                            title="View Details"
                            style={{ color: "#6b96ff" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(107, 150, 255, 0.08)";
                              e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(ad)}
                            className="p-1.5 rounded-lg transition-all duration-200"
                            title="Edit Advertisement"
                            style={{ color: "#6b7280" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(0, 0, 0, 0.04)";
                              e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && generalAds.length > 0 && (
              <div
                className="px-5 py-3"
                style={{
                  background: "#eff1f5",
                  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
                }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-600">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} advertisements
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="adPageSize" className="text-xs text-gray-600">Per page:</label>
                      <select
                        id="adPageSize"
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="px-2 py-1 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={{ background: "#ffffff", border: "none", boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.5)" }}
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
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddGeneralAdForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {selectedAd && (
        <>
          <AdvertisementDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => { setIsDetailsModalOpen(false); setSelectedAd(null); }}
            advertisement={selectedAd}
          />

          <EditGeneralAdForm
            isOpen={isEditModalOpen}
            onClose={() => { setIsEditModalOpen(false); setSelectedAd(null); }}
            advertisement={selectedAd}
            onSuccess={handleEditSuccess}
          />

          <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => { setIsDeleteDialogOpen(false); setSelectedAd(null); }}
            onConfirm={handleConfirmDelete}
            title="Delete Advertisement"
            message={`Are you sure you want to delete "${selectedAd.title}"? This action cannot be undone.`}
            confirmText="Delete"
            variant="danger"
          />
        </>
      )}
    </div>
  );
}

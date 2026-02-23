import { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, HelpCircle, Users, UserCheck, UserX, UserPlus, Trash2 } from "lucide-react";
import type { PatientUser } from "./patient.types";
import { mockPatients } from "./patient.types";
import { patientService, type PatientAnalytics } from "../../services/patient.service";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PatientDetailsModal from "./components/PatientDetailsModal";
import PatientTable from "./components/PatientTable";

export default function PatientsView() {
  const [patients, setPatients] = useState<PatientUser[]>([]);
  const [analytics, setAnalytics] = useState<PatientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Sorting state
  type SortDirection = "asc" | "desc" | null;
  type PatientSortField = "full_name" | "email" | "phone" | "is_active";
  const [sortField, setSortField] = useState<PatientSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Modal states
  const [selectedPatient, setSelectedPatient] = useState<PatientUser | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handle sort toggle
  const handleSort = (field: PatientSortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);

      let ordering: string | undefined;
      if (sortField && sortDirection) {
        ordering = sortDirection === "desc" ? `-${sortField}` : sortField;
      }

      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
        page: currentPage,
        page_size: pageSize,
        ordering,
      };

      try {
        const response = await patientService.getPatients(filters);
        setPatients(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockPatients];

        if (statusFilter !== "all") {
          filteredData = filteredData.filter(p =>
            statusFilter === "active" ? p.is_active : !p.is_active
          );
        }

        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            p =>
              `${p.full_name}`.toLowerCase().includes(search) ||
              p.email.toLowerCase().includes(search) ||
              p.phone.toLowerCase().includes(search)
          );
        }

        if (sortField && sortDirection) {
          filteredData.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (typeof aVal === "string") {
              aVal = aVal.toLowerCase();
              bVal = (bVal as string).toLowerCase();
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
          });
        }

        setPatients(filteredData);
        setTotalCount(filteredData.length);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await patientService.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch patient analytics:", error);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, currentPage, pageSize, sortField, sortDirection]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleView = (patient: PatientUser) => {
    setSelectedPatient(patient);
    setIsDetailsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPatient) return;

    try {
      await patientService.deletePatient(selectedPatient.id);
      setIsDeleteDialogOpen(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (error) {
      console.error("Failed to delete patient:", error);
      setPatients(prev => prev.filter(p => p.id !== selectedPatient.id));
      setIsDeleteDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  // Use API analytics data if available
  const stats = analytics
    ? {
      total: analytics.total_patients,
      active: analytics.active_patients,
      inactive: analytics.inactive_patients,
      deleted: analytics.deleted_patients,
      created: analytics.created_patients,
    }
    : {
      total: totalCount || patients.length,
      active: patients.filter(p => p.is_active).length,
      inactive: patients.filter(p => !p.is_active).length,
      deleted: 0,
      created: 0,
    };

  // Clear filters handler
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Check if any filters are active
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
              <Users className="w-5 h-5" style={{ color: "#6b96ff" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                The total number of patient accounts registered in the system.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>{stats.total}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Total Patients</div>
        </div>

        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
              <UserCheck className="w-5 h-5" style={{ color: "#4fcfa5" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                Patients with active accounts, recent activity, and all required profile information completed.
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

        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(255, 197, 84, 0.08)" }}>
              <UserX className="w-5 h-5" style={{ color: "#ffc554" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                Accounts that have been inactive for an extended period of time.
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

        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(162, 133, 255, 0.08)" }}>
              <UserPlus className="w-5 h-5" style={{ color: "#a285ff" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                Newly registered patients who have not yet completed all required profile fields.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-xl font-bold" style={{ color: "#a285ff", marginBottom: "2px" }}>{stats.created}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Created</div>
        </div>

        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(255, 112, 112, 0.08)" }}>
              <Trash2 className="w-5 h-5" style={{ color: "#ff7070" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                Accounts that have been permanently deleted by the user.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-xl font-bold" style={{ color: "#ff7070", marginBottom: "2px" }}>{stats.deleted}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Deleted</div>
        </div>
      </div>

      {/* Filters and Search */}
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
                placeholder="Search patient by name, email, or phone..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                style={{
                  background: "#eff1f5",
                  border: "none",
                  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                }}
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
                  style={{
                    background: "#eff1f5",
                    border: "none",
                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="created">Created</option>
                  <option value="deleted">Deleted</option>
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
                <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
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
                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                {/* Name + email */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="w-36 h-4 bg-gray-200 rounded" />
                  <div className="w-48 h-3 bg-gray-100 rounded" />
                </div>
                {/* Phone */}
                <div className="w-24 h-3.5 bg-gray-200 rounded" />
                {/* Age */}
                <div className="w-10 h-3.5 bg-gray-200 rounded" />
                {/* Gender */}
                <div className="w-16 h-6 bg-gray-200 rounded-lg" />
                {/* Status */}
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                {/* Actions */}
                <div className="flex gap-1.5">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              No patients found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            <PatientTable
              patients={patients}
              onView={handleView}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />

            {/* Pagination */}
            {!loading && patients.length > 0 && (
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
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} patients
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
      <PatientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPatient(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Patient"
        message={`Are you sure you want to delete ${selectedPatient?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, X, HelpCircle, Stethoscope, UserCheck, UserX, UserPlus, Trash2, Mail, CheckCircle } from "lucide-react";
import type { DoctorUser, CreateDoctorDTO, DoctorAnalytics, DoctorStatus } from "./doctor.types";
import { mockDoctors, SPECIALTIES } from "./doctor.types";
import DoctorTable from "./components/DoctorTable";
import DoctorDetailsModal from "./components/DoctorDetailsModal";
import AddEditDoctorModal from "./components/AddEditDoctorModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import * as doctorService from "../../services/doctor.service";

export default function DoctorsView() {
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DoctorStatus | "all">("all");
  const [specialityFilter, setspecialityFilter] = useState<string>("all");
  const [showAdminCreatedOnly, setShowAdminCreatedOnly] = useState(false);
  const [analytics, setAnalytics] = useState<DoctorAnalytics | null>(null);

  // speciality dropdown states
  const [isspecialityDropdownOpen, setIsspecialityDropdownOpen] = useState(false);
  const [specialitySearchTerm, setspecialitySearchTerm] = useState("");
  const specialityDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorUser | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sorting state
  type SortDirection = "asc" | "desc" | null;
  type DoctorSortField = "full_name" | "specialization" | "license_number" | "years_of_experience" | "phone" | "is_active";
  const [sortField, setSortField] = useState<DoctorSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle sort toggle
  const handleSort = (field: DoctorSortField) => {
    if (sortField === field) {
      // Cycle: asc -> desc -> null
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

  // Fetch doctors analytics
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await doctorService.getDoctorsAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);

      // Build ordering string
      let ordering: string | undefined;
      if (sortField && sortDirection) {
        ordering = sortDirection === "desc" ? `-${sortField}` : sortField;
      }

      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        speciality: specialityFilter !== "all" ? specialityFilter : undefined,
        search: searchTerm || undefined,
        page: currentPage,
        page_size: pageSize,
        by_admin: showAdminCreatedOnly ? true : undefined,
        ordering,
      };

      // Try to fetch from API, fallback to mock data on error
      try {
        const response = await doctorService.getDoctors(filters);
        setDoctors(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockDoctors];

        // Apply speciality filter
        if (specialityFilter !== "all") {
          filteredData = filteredData.filter(d => d.doctor_profile?.specialization === specialityFilter);
        }

        // Apply search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            d =>
              d.full_name.toLowerCase().includes(search) ||
              d.email.toLowerCase().includes(search) ||
              d.phone.toLowerCase().includes(search) ||
              d.doctor_profile?.license_number.toLowerCase().includes(search)
          );
        }

        setDoctors(filteredData);
        setTotalCount(filteredData.length);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, specialityFilter, showAdminCreatedOnly, currentPage, pageSize, sortField, sortDirection]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, specialityFilter, showAdminCreatedOnly]);

  // Close speciality dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (specialityDropdownRef.current && !specialityDropdownRef.current.contains(event.target as Node)) {
        setIsspecialityDropdownOpen(false);
        setspecialitySearchTerm("");
      }
    };

    if (isspecialityDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isspecialityDropdownOpen]);

  // Handlers
  const handleView = (doctor: DoctorUser) => {
    setSelectedDoctor(doctor);
    setIsDetailsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedDoctor(null);
    setIsAddEditModalOpen(true);
  };

  const handleEdit = (doctor: DoctorUser) => {
    setSelectedDoctor(doctor);
    setIsAddEditModalOpen(true);
  };

  const handleDelete = (doctor: DoctorUser) => {
    setSelectedDoctor(doctor);
    setIsDeleteDialogOpen(true);
  };

  // Submit handlers
  const handleAddEditSubmit = async (data: CreateDoctorDTO): Promise<{ password?: string; error?: string }> => {
    try {
      if (selectedDoctor) {
        await doctorService.updateDoctor({ ...data, id: selectedDoctor.id });
        fetchDoctors();
        fetchAnalytics();
        return {};
      } else {
        const result = await doctorService.createDoctor(data);
        fetchDoctors();
        fetchAnalytics();
        return { password: result.password };
      }
    } catch (error: any) {
      console.error("Failed to save doctor:", error);
      const errorMessage = error?.response?.data?.detail
        || error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || (selectedDoctor ? "Failed to update doctor. Please try again." : "Failed to add doctor. Please try again.");
      return { error: errorMessage };
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoctor) return;
    try {
      await doctorService.deleteDoctor(selectedDoctor.id);
      fetchDoctors();
    } catch (error) {
      console.error("Failed to delete doctor:", error);
    }
  };

  // Filter specialties based on search term
  const filteredSpecialties = SPECIALTIES.filter(speciality =>
    speciality.toLowerCase().includes(specialitySearchTerm.toLowerCase())
  );

  // Get display label for selected speciality
  const getspecialityDisplayLabel = () => {
    if (specialityFilter === "all") return "All specialities";
    return specialityFilter;
  };

  // Clear filters handler
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setspecialityFilter("all");
    setShowAdminCreatedOnly(false);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter !== "all" || specialityFilter !== "all" || showAdminCreatedOnly;

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


  // Use API analytics data if available, or totalCount from pagination, or calculate from current doctors
  const stats = analytics
    ? {
      total: analytics.total_doctors,
      active: analytics.active_doctors,
      inactive: analytics.inactive_doctors,
      created: analytics.created_doctors,
      deleted: analytics.deleted_doctors,
      pendingInvitations: analytics.pending_invitations,
      acceptedInvitations: analytics.accepted_invitations,
    }
    : {
      total: totalCount || doctors.length,
      active: doctors.filter(d => d.is_active).length,
      inactive: doctors.filter(d => !d.is_active).length,
      created: 0,
      deleted: 0,
      pendingInvitations: 0,
      acceptedInvitations: 0,
    };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* Stats - Two Row Layout */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Row 1: Account Status Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="clay-card min-w-0">
            <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
              <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
                <Stethoscope className="w-5 h-5" style={{ color: "#6b96ff" }} />
              </div>
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                  The total number of doctor accounts registered in the system.
                </div>
              </div>
            </div>
            {analyticsLoading ? (
              <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
            ) : (
              <div className="text-2xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>{stats.total}</div>
            )}
            <div className="text-xs" style={{ color: "#111827" }}>Total Doctors</div>
          </div>

          <div className="clay-card min-w-0">
            <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
              <div className="clay-circle" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
                <UserCheck className="w-5 h-5" style={{ color: "#4fcfa5" }} />
              </div>
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                  Doctors with active accounts, recent activity, and all required profile information completed.
                </div>
              </div>
            </div>
            {analyticsLoading ? (
              <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
            ) : (
              <div className="text-2xl font-bold" style={{ color: "#4fcfa5", marginBottom: "2px" }}>{stats.active}</div>
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
              <div className="text-2xl font-bold" style={{ color: "#ffc554", marginBottom: "2px" }}>{stats.inactive}</div>
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
                  Newly registered doctors who have not yet completed all required profile fields.
                </div>
              </div>
            </div>
            {analyticsLoading ? (
              <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
            ) : (
              <div className="text-2xl font-bold" style={{ color: "#a285ff", marginBottom: "2px" }}>{stats.created}</div>
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
                <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                  Accounts that have been permanently deleted by the user.
                </div>
              </div>
            </div>
            {analyticsLoading ? (
              <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
            ) : (
              <div className="text-2xl font-bold" style={{ color: "#ff7070", marginBottom: "2px" }}>{stats.deleted}</div>
            )}
            <div className="text-xs" style={{ color: "#111827" }}>Deleted</div>
          </div>
        </div>

        {/* Invitation Stats — compact inline strip */}
        <div
          className="flex flex-wrap items-center gap-4 px-4 py-2.5 rounded-xl"
          style={{
            background: "#eff1f5",
            boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
          }}
        >
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" style={{ color: "#ff9f47" }} />
            {analyticsLoading ? (
              <div className="clay-skeleton" style={{ height: "16px", width: "24px" }} />
            ) : (
              <span className="text-sm font-semibold" style={{ color: "#ff9f47" }}>{stats.pendingInvitations}</span>
            )}
            <span className="text-xs text-gray-500">Pending Invitations</span>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                Invitations sent by admin to doctors who have not yet logged in with the provided credentials.
              </div>
            </div>
          </div>

          <div style={{ width: "1px", height: "16px", background: "rgba(0,0,0,0.1)" }} />

          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" style={{ color: "#6b96ff" }} />
            {analyticsLoading ? (
              <div className="clay-skeleton" style={{ height: "16px", width: "24px" }} />
            ) : (
              <span className="text-sm font-semibold" style={{ color: "#6b96ff" }}>{stats.acceptedInvitations}</span>
            )}
            <span className="text-xs text-gray-500">Accepted Invitations</span>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                Doctors who have logged in using admin-provided credentials. Once they complete their profile, they become active.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions - All in one row */}
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
                placeholder="Search doctor by name, email, or phone..."
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
              {/* speciality Filter - Searchable Dropdown */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-60 relative" ref={specialityDropdownRef}>
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => setIsspecialityDropdownOpen(!isspecialityDropdownOpen)}
                    className="w-full px-3 py-2 text-sm rounded-xl text-left flex items-center justify-between gap-2"
                    style={{
                      background: "#eff1f5",
                      border: "none",
                      boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    <span className="truncate">{getspecialityDisplayLabel()}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {isspecialityDropdownOpen && (
                    <div
                      className="absolute z-50 mt-1 w-full bg-white rounded-xl max-h-80 overflow-hidden"
                      style={{
                        boxShadow: "6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      {/* Search Input */}
                      <div className="p-2 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={specialitySearchTerm}
                            onChange={(e) => setspecialitySearchTerm(e.target.value)}
                            placeholder="Search specialties..."
                            className="w-full pl-8 pr-8 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            style={{
                              background: "#eff1f5",
                              border: "none",
                              boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {specialitySearchTerm && (
                            <button
                              onClick={() => setspecialitySearchTerm("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Options List */}
                      <div className="overflow-y-auto max-h-64">
                        <button
                          onClick={() => {
                            setspecialityFilter("all");
                            setIsspecialityDropdownOpen(false);
                            setspecialitySearchTerm("");
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${specialityFilter === "all" ? "bg-gray-50 font-medium" : ""
                            }`}
                        >
                          All specialities
                        </button>
                        {filteredSpecialties.length > 0 ? (
                          filteredSpecialties.map((speciality) => (
                            <button
                              key={speciality}
                              onClick={() => {
                                setspecialityFilter(speciality);
                                setIsspecialityDropdownOpen(false);
                                setspecialitySearchTerm("");
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${specialityFilter === speciality ? "bg-gray-50 font-medium" : ""
                                }`}
                            >
                              {speciality}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No specialties found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DoctorStatus | "all")}
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

          {/* Right side: Add Doctor Button */}
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
              Add Doctor
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
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
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
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
                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                {/* Name + email */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="w-36 h-4 bg-gray-200 rounded" />
                  <div className="w-48 h-3 bg-gray-100 rounded" />
                </div>
                {/* Specialty */}
                <div className="w-24 h-6 bg-gray-200 rounded-lg" />
                {/* License */}
                <div className="w-20 h-3.5 bg-gray-200 rounded" />
                {/* Experience */}
                <div className="w-16 h-3.5 bg-gray-200 rounded" />
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
        ) : doctors.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              No doctors found. Try adjusting your filters.
            </p>
            {showAdminCreatedOnly && (
              <div className="flex justify-center">
                <label className="flex items-center gap-2 cursor-pointer select-none clay-inset px-4 py-2">
                  <input
                    type="checkbox"
                    checked={showAdminCreatedOnly}
                    onChange={(e) => setShowAdminCreatedOnly(e.target.checked)}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700 whitespace-nowrap">Show only admin created accounts</span>
                </label>
              </div>
            )}
          </div>
        ) : (
          <>
            <DoctorTable
              doctors={doctors}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />

            {/* Pagination */}
            {!loading && doctors.length > 0 && (
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
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} doctors
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

                      <div className="flex items-start">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={showAdminCreatedOnly}
                            onChange={(e) => setShowAdminCreatedOnly(e.target.checked)}
                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                          />
                          <span className="text-xs text-gray-700 whitespace-nowrap">Show only admin created accounts</span>
                        </label>
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
      <DoctorDetailsModal
        doctor={selectedDoctor}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <AddEditDoctorModal
        doctor={selectedDoctor}
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setSelectedDoctor(null);
        }}
        onSubmit={handleAddEditSubmit}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Doctor"
        message={`Are you sure you want to delete Dr. ${selectedDoctor?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
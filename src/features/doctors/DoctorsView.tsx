import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
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

  // Use API analytics data if available, or totalCount from pagination, or calculate from current doctors
  const stats = analytics
    ? {
      total: analytics.total_doctors,
      active: analytics.active_doctors,
      inactive: analytics.inactive_doctors,
    }
    : {
      total: totalCount || doctors.length,
      active: doctors.filter(d => d.is_active).length,
      inactive: doctors.filter(d => !d.is_active).length,
    };

  return (
    <div className="space-y-6 min-w-0 max-w-full">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Total Doctors</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.active}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Inactive</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {stats.inactive}
            </div>
          )}
        </div>
      </div>

      {/* Filters and Actions - All in one row */}
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
                placeholder="Search doctor by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-4 min-w-0">
              {/* speciality Filter - Searchable Dropdown */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-60 relative" ref={specialityDropdownRef}>
                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => setIsspecialityDropdownOpen(!isspecialityDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-left flex items-center justify-between gap-2 bg-white"
                  >
                    <span className="truncate">{getspecialityDisplayLabel()}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {isspecialityDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={specialitySearchTerm}
                            onChange={(e) => setspecialitySearchTerm(e.target.value)}
                            placeholder="Search specialties..."
                            className="w-full pl-8 pr-8 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${specialityFilter === "all" ? "bg-gray-100 font-medium" : ""
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
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${specialityFilter === speciality ? "bg-gray-100 font-medium" : ""
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
                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DoctorStatus | "all")}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right side: Add Doctor Button */}
          <div className="flex justify-end lg:justify-normal shrink-0">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Doctor
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">
              No doctors found. Try adjusting your filters.
            </p>
            {showAdminCreatedOnly && (
              <div className="flex justify-center">
                <label className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
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
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} doctors
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


                      <div className="flex items-start">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={showAdminCreatedOnly}
                            onChange={(e) => setShowAdminCreatedOnly(e.target.checked)}
                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                          />
                          <span className="text-sm text-gray-700 whitespace-nowrap">Show only admin created accounts</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                        onClick={() => setCurrentPage(prev => prev + 1)}
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
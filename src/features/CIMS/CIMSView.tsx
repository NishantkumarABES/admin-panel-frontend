import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
import type { CIMS, CreateCIMSDTO, CIMSStatus } from "./cims.types";
import { mockCIMS, DRUG_CLASSES, THERAPEUTIC_CATEGORIES } from "./cims.types";
import CIMSTable from "./components/CIMSTable";
import CIMSDetailsModal from "./components/CIMSDetailsModal";
import AddEditCIMSModal from "./components/AddEditCIMSModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import * as cimsService from "../../services/cims.service";

export default function CIMSView() {
  const [cimsList, setCimsList] = useState<CIMS[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CIMSStatus | "all">("all");
  const [drugClassFilter, setDrugClassFilter] = useState<string>("all");
  const [therapeuticCategoryFilter, setTherapeuticCategoryFilter] = useState<string>("all");

  // Drug Class dropdown states
  const [isDrugClassDropdownOpen, setIsDrugClassDropdownOpen] = useState(false);
  const [drugClassSearchTerm, setDrugClassSearchTerm] = useState("");
  const drugClassDropdownRef = useRef<HTMLDivElement>(null);

  // Therapeutic Category dropdown states
  const [isTherapeuticCategoryDropdownOpen, setIsTherapeuticCategoryDropdownOpen] = useState(false);
  const [therapeuticCategorySearchTerm, setTherapeuticCategorySearchTerm] = useState("");
  const therapeuticCategoryDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Modal states
  const [selectedCIMS, setSelectedCIMS] = useState<CIMS | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch CIMS data
  const fetchCIMS = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        drugClass: drugClassFilter !== "all" ? drugClassFilter : undefined,
        therapeuticCategory: therapeuticCategoryFilter !== "all" ? therapeuticCategoryFilter : undefined,
        search: searchTerm || undefined,
        page: currentPage,
        page_size: pageSize,
      };

      // Try to fetch from API, fallback to mock data on error
      try {
        const response = await cimsService.getCIMS(filters);
        setCimsList(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockCIMS];

        // Apply drug class filter
        if (drugClassFilter !== "all") {
          filteredData = filteredData.filter(c => c.drugClass === drugClassFilter);
        }

        // Apply therapeutic category filter
        if (therapeuticCategoryFilter !== "all") {
          filteredData = filteredData.filter(c => c.therapeuticCategory === therapeuticCategoryFilter);
        }

        // Apply status filter
        if (statusFilter !== "all") {
          filteredData = filteredData.filter(c => c.status === statusFilter);
        }

        // Apply search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            c =>
              c.drugNameGeneric.toLowerCase().includes(search) ||
              c.drugClass.toLowerCase().includes(search) ||
              c.therapeuticCategory.toLowerCase().includes(search) ||
              c.brandsInIndia.toLowerCase().includes(search)
          );
        }

        setCimsList(filteredData);
        setTotalCount(filteredData.length);
      }
    } catch (error) {
      console.error("Failed to fetch CIMS:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCIMS();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, drugClassFilter, therapeuticCategoryFilter, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, drugClassFilter, therapeuticCategoryFilter]);

  // Close drug class dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drugClassDropdownRef.current && !drugClassDropdownRef.current.contains(event.target as Node)) {
        setIsDrugClassDropdownOpen(false);
        setDrugClassSearchTerm("");
      }
    };

    if (isDrugClassDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDrugClassDropdownOpen]);

  // Close therapeutic category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (therapeuticCategoryDropdownRef.current && !therapeuticCategoryDropdownRef.current.contains(event.target as Node)) {
        setIsTherapeuticCategoryDropdownOpen(false);
        setTherapeuticCategorySearchTerm("");
      }
    };

    if (isTherapeuticCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isTherapeuticCategoryDropdownOpen]);

  // Handlers
  const handleView = (cims: CIMS) => {
    setSelectedCIMS(cims);
    setIsDetailsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCIMS(null);
    setIsAddEditModalOpen(true);
  };

  const handleEdit = (cims: CIMS) => {
    setSelectedCIMS(cims);
    setIsAddEditModalOpen(true);
  };

  const handleDelete = (cims: CIMS) => {
    setSelectedCIMS(cims);
    setIsDeleteDialogOpen(true);
  };

  // Submit handlers
  const handleAddEditSubmit = async (data: CreateCIMSDTO) => {
    try {
      if (selectedCIMS) {
        await cimsService.updateCIMS({ ...data, id: selectedCIMS.id });
      } else {
        await cimsService.createCIMS(data);
      }
      fetchCIMS();
    } catch (error) {
      console.error("Failed to save CIMS:", error);
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCIMS) return;
    try {
      await cimsService.deleteCIMS(selectedCIMS.id);
      fetchCIMS();
    } catch (error) {
      console.error("Failed to delete CIMS:", error);
    }
  };

  // Filter drug classes based on search term
  const filteredDrugClasses = DRUG_CLASSES.filter(cls =>
    cls.toLowerCase().includes(drugClassSearchTerm.toLowerCase())
  );

  // Filter therapeutic categories based on search term
  const filteredTherapeuticCategories = THERAPEUTIC_CATEGORIES.filter(cat =>
    cat.toLowerCase().includes(therapeuticCategorySearchTerm.toLowerCase())
  );

  // Get display label for selected drug class
  const getDrugClassDisplayLabel = () => {
    if (drugClassFilter === "all") return "All Drug Classes";
    return drugClassFilter;
  };

  // Get display label for selected therapeutic category
  const getTherapeuticCategoryDisplayLabel = () => {
    if (therapeuticCategoryFilter === "all") return "All Categories";
    return therapeuticCategoryFilter;
  };

  // Calculate stats
  const stats = {
    total: totalCount || cimsList.length,
    published: cimsList.filter(c => c.status === "published").length,
    draft: cimsList.filter(c => c.status === "draft").length
  };

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Total Drugs</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Published</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.published}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Draft</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.draft}</div>
        </div>

        {/* <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Archived</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.archived}</div>
        </div> */}
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
                placeholder="Search by drug name, class, or brand..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-4 min-w-0">
              {/* Drug Class Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-60 relative" ref={drugClassDropdownRef}>
                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => setIsDrugClassDropdownOpen(!isDrugClassDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-left flex items-center justify-between gap-2 bg-white"
                  >
                    <span className="truncate">{getDrugClassDisplayLabel()}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {isDrugClassDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={drugClassSearchTerm}
                            onChange={(e) => setDrugClassSearchTerm(e.target.value)}
                            placeholder="Search drug classes..."
                            className="w-full pl-8 pr-8 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {drugClassSearchTerm && (
                            <button
                              onClick={() => setDrugClassSearchTerm("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="overflow-y-auto max-h-64">
                        <button
                          onClick={() => {
                            setDrugClassFilter("all");
                            setIsDrugClassDropdownOpen(false);
                            setDrugClassSearchTerm("");
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                            drugClassFilter === "all" ? "bg-gray-100 font-medium" : ""
                          }`}
                        >
                          All Drug Classes
                        </button>
                        {filteredDrugClasses.length > 0 ? (
                          filteredDrugClasses.map((cls) => (
                            <button
                              key={cls}
                              onClick={() => {
                                setDrugClassFilter(cls);
                                setIsDrugClassDropdownOpen(false);
                                setDrugClassSearchTerm("");
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                drugClassFilter === cls ? "bg-gray-100 font-medium" : ""
                              }`}
                            >
                              {cls}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No drug classes found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Therapeutic Category Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-60 relative" ref={therapeuticCategoryDropdownRef}>
                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => setIsTherapeuticCategoryDropdownOpen(!isTherapeuticCategoryDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-left flex items-center justify-between gap-2 bg-white"
                  >
                    <span className="truncate">{getTherapeuticCategoryDisplayLabel()}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {isTherapeuticCategoryDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={therapeuticCategorySearchTerm}
                            onChange={(e) => setTherapeuticCategorySearchTerm(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-8 pr-8 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {therapeuticCategorySearchTerm && (
                            <button
                              onClick={() => setTherapeuticCategorySearchTerm("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="overflow-y-auto max-h-64">
                        <button
                          onClick={() => {
                            setTherapeuticCategoryFilter("all");
                            setIsTherapeuticCategoryDropdownOpen(false);
                            setTherapeuticCategorySearchTerm("");
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                            therapeuticCategoryFilter === "all" ? "bg-gray-100 font-medium" : ""
                          }`}
                        >
                          All Categories
                        </button>
                        {filteredTherapeuticCategories.length > 0 ? (
                          filteredTherapeuticCategories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => {
                                setTherapeuticCategoryFilter(cat);
                                setIsTherapeuticCategoryDropdownOpen(false);
                                setTherapeuticCategorySearchTerm("");
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                therapeuticCategoryFilter === cat ? "bg-gray-100 font-medium" : ""
                              }`}
                            >
                              {cat}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No categories found
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
                  onChange={(e) => setStatusFilter(e.target.value as CIMSStatus | "all")}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right side: Add Drug Button */}
          <div className="flex justify-end lg:justify-normal shrink-0">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Drug
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading drugs...</div>
        ) : cimsList.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No drugs found. Try adjusting your filters.
          </div>
        ) : (
          <>
            <CIMSTable
              cimsList={cimsList}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {!loading && cimsList.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} drugs
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
      <CIMSDetailsModal
        cims={selectedCIMS}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <AddEditCIMSModal
        cims={selectedCIMS}
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleAddEditSubmit}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Drug"
        message={`Are you sure you want to delete "${selectedCIMS?.drugNameGeneric}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

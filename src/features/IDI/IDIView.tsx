import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, X, Pill, HelpCircle, BookOpen, Archive } from "lucide-react";
import type { IDI, CreateIDIDTO, IDIStatus } from "./idi.types";
import { mockIDI, DRUG_CLASSES, THERAPEUTIC_CATEGORIES } from "./idi.types";
import IDITable from "./components/IDITable";
import IDIDetailsModal from "./components/IDIDetailsModal";
import AddEditIDIModal from "./components/AddEditIDIModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import * as IDIService from "../../services/idi.service";

export default function IDIView() {
  const [IDIList, setIDIList] = useState<IDI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<IDIStatus | "all">("all");
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
  const [pageSize, setPageSize] = useState(5);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Modal states
  const [selectedIDI, setSelectedIDI] = useState<IDI | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchIDI = async () => {
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

      try {
        const response = await IDIService.getIDI(filters);
        setIDIList(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockIDI];
        if (drugClassFilter !== "all") filteredData = filteredData.filter(c => c.drugClass === drugClassFilter);
        if (therapeuticCategoryFilter !== "all") filteredData = filteredData.filter(c => c.therapeuticCategory === therapeuticCategoryFilter);
        if (statusFilter !== "all") filteredData = filteredData.filter(c => c.status === statusFilter);
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(c =>
            c.drugNameGeneric.toLowerCase().includes(search) ||
            c.drugClass.toLowerCase().includes(search) ||
            c.therapeuticCategory.toLowerCase().includes(search) ||
            c.brandsInIndia.toLowerCase().includes(search)
          );
        }
        setIDIList(filteredData);
        setTotalCount(filteredData.length);
      }
    } catch (error) {
      console.error("Failed to fetch IDI:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const timer = setTimeout(() => { fetchIDI(); }, 300); return () => clearTimeout(timer); }, [searchTerm, statusFilter, drugClassFilter, therapeuticCategoryFilter, currentPage, pageSize]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, drugClassFilter, therapeuticCategoryFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drugClassDropdownRef.current && !drugClassDropdownRef.current.contains(event.target as Node)) {
        setIsDrugClassDropdownOpen(false); setDrugClassSearchTerm("");
      }
    };
    if (isDrugClassDropdownOpen) { document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }
  }, [isDrugClassDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (therapeuticCategoryDropdownRef.current && !therapeuticCategoryDropdownRef.current.contains(event.target as Node)) {
        setIsTherapeuticCategoryDropdownOpen(false); setTherapeuticCategorySearchTerm("");
      }
    };
    if (isTherapeuticCategoryDropdownOpen) { document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }
  }, [isTherapeuticCategoryDropdownOpen]);

  const handleView = (IDI: IDI) => { setSelectedIDI(IDI); setIsDetailsModalOpen(true); };
  const handleAdd = () => { setSelectedIDI(null); setIsAddEditModalOpen(true); };
  const handleEdit = (IDI: IDI) => { setSelectedIDI(IDI); setIsAddEditModalOpen(true); };
  const handleDelete = (IDI: IDI) => { setSelectedIDI(IDI); setIsDeleteDialogOpen(true); };

  const handleAddEditSubmit = async (data: CreateIDIDTO) => {
    try {
      if (selectedIDI) { await IDIService.updateIDI({ ...data, id: selectedIDI.id }); } else { await IDIService.createIDI(data); }
      fetchIDI();
      fetchAnalytics();
    } catch (error) { console.error("Failed to save IDI:", error); throw error; }
  };

  const handleConfirmDelete = async () => {
    if (!selectedIDI) return;
    try {
      await IDIService.deleteIDI(selectedIDI.id);
      fetchIDI();
      fetchAnalytics();
    } catch (error) { console.error("Failed to delete IDI:", error); }
  };

  const filteredDrugClasses = DRUG_CLASSES.filter(cls => cls.toLowerCase().includes(drugClassSearchTerm.toLowerCase()));
  const filteredTherapeuticCategories = THERAPEUTIC_CATEGORIES.filter(cat => cat.toLowerCase().includes(therapeuticCategorySearchTerm.toLowerCase()));
  const getDrugClassDisplayLabel = () => drugClassFilter === "all" ? "All Drug Classes" : drugClassFilter;
  const getTherapeuticCategoryDisplayLabel = () => therapeuticCategoryFilter === "all" ? "All Categories" : therapeuticCategoryFilter;

  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });

  const fetchAnalytics = async () => {
    try {
      const response = await IDIService.getIDIAnalytics();
      const data = response.data;
      setStats({
        total: data.total_idi,
        published: data.published_idi,
        draft: data.draft_idi
      });
    } catch (error) {
      console.error("Failed to fetch IDI analytics:", error);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const handleClearFilters = () => { setSearchTerm(""); setStatusFilter("all"); setDrugClassFilter("all"); setTherapeuticCategoryFilter("all"); };
  const hasActiveFilters = searchTerm || statusFilter !== "all" || drugClassFilter !== "all" || therapeuticCategoryFilter !== "all";

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

  const dropdownStyle = {
    boxShadow: "6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.7)",
  };

  const tooltipStyle = {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)",
    color: "#374151",
  };

  const dropdownInnerInputStyle = {
    background: "#eff1f5",
    border: "none",
    boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Total Drugs */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
              <Pill className="w-5 h-5" style={{ color: "#6b96ff" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-56 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Total number of drug information entries.
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>{stats.total}</div>
          <div className="text-xs" style={{ color: "#111827" }}>Total Drugs</div>
        </div>

        {/* Published */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
              <BookOpen className="w-5 h-5" style={{ color: "#6b96ff" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-56 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Drug entries currently visible to users.
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: "#6b96ff", marginBottom: "2px" }}>{stats.published}</div>
          <div className="text-xs" style={{ color: "#111827" }}>Published</div>
        </div>

        {/* Draft */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 114, 128, 0.08)" }}>
              <Archive className="w-5 h-5" style={{ color: "#6b7280" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-56 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Drug entries still in draft state.
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: "#6b7280", marginBottom: "2px" }}>{stats.draft}</div>
          <div className="text-xs" style={{ color: "#111827" }}>Draft</div>
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
                placeholder="Search by drug name, class, or brand..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                style={insetInputStyle}
              />
            </div>

            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              {/* Drug Class Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-52 relative" ref={drugClassDropdownRef}>
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => setIsDrugClassDropdownOpen(!isDrugClassDropdownOpen)}
                    className="w-full px-3 py-2 text-sm rounded-xl text-left flex items-center justify-between gap-2"
                    style={insetInputStyle}
                  >
                    <span className="truncate">{getDrugClassDisplayLabel()}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {isDrugClassDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white rounded-xl max-h-80 overflow-hidden" style={dropdownStyle}>
                      <div className="p-2 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={drugClassSearchTerm}
                            onChange={(e) => setDrugClassSearchTerm(e.target.value)}
                            placeholder="Search drug classes..."
                            className="w-full pl-8 pr-8 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            style={dropdownInnerInputStyle}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {drugClassSearchTerm && (
                            <button onClick={() => setDrugClassSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-64">
                        <button
                          onClick={() => { setDrugClassFilter("all"); setIsDrugClassDropdownOpen(false); setDrugClassSearchTerm(""); }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${drugClassFilter === "all" ? "bg-gray-50 font-medium" : ""}`}
                        >
                          All Drug Classes
                        </button>
                        {filteredDrugClasses.length > 0 ? (
                          filteredDrugClasses.map((cls) => (
                            <button
                              key={cls}
                              onClick={() => { setDrugClassFilter(cls); setIsDrugClassDropdownOpen(false); setDrugClassSearchTerm(""); }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${drugClassFilter === cls ? "bg-gray-50 font-medium" : ""}`}
                            >
                              {cls}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">No drug classes found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Therapeutic Category Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-52 relative" ref={therapeuticCategoryDropdownRef}>
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => setIsTherapeuticCategoryDropdownOpen(!isTherapeuticCategoryDropdownOpen)}
                    className="w-full px-3 py-2 text-sm rounded-xl text-left flex items-center justify-between gap-2"
                    style={insetInputStyle}
                  >
                    <span className="truncate">{getTherapeuticCategoryDisplayLabel()}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {isTherapeuticCategoryDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white rounded-xl max-h-80 overflow-hidden" style={dropdownStyle}>
                      <div className="p-2 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={therapeuticCategorySearchTerm}
                            onChange={(e) => setTherapeuticCategorySearchTerm(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-8 pr-8 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            style={dropdownInnerInputStyle}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {therapeuticCategorySearchTerm && (
                            <button onClick={() => setTherapeuticCategorySearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-64">
                        <button
                          onClick={() => { setTherapeuticCategoryFilter("all"); setIsTherapeuticCategoryDropdownOpen(false); setTherapeuticCategorySearchTerm(""); }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${therapeuticCategoryFilter === "all" ? "bg-gray-50 font-medium" : ""}`}
                        >
                          All Categories
                        </button>
                        {filteredTherapeuticCategories.length > 0 ? (
                          filteredTherapeuticCategories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => { setTherapeuticCategoryFilter(cat); setIsTherapeuticCategoryDropdownOpen(false); setTherapeuticCategorySearchTerm(""); }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${therapeuticCategoryFilter === cat ? "bg-gray-50 font-medium" : ""}`}
                            >
                              {cat}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">No categories found</div>
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
                  onChange={(e) => setStatusFilter(e.target.value as IDIStatus | "all")}
                  className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                  style={insetInputStyle}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
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

          {/* Right side: Add Drug Button */}
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
              Add Drug
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
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
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
                {/* Pill icon + Name */}
                <div className="w-9 h-9 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="w-40 h-4 bg-gray-200 rounded" />
                </div>
                {/* Class */}
                <div className="w-24 h-6 bg-gray-200 rounded-lg" />
                {/* Category */}
                <div className="w-24 h-6 bg-gray-200 rounded-lg" />
                {/* Brands */}
                <div className="flex gap-1">
                  <div className="w-16 h-5 bg-gray-200 rounded-full" />
                  <div className="w-16 h-5 bg-gray-200 rounded-full" />
                </div>
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
        ) : IDIList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No drugs found. Try adjusting your filters.
          </div>
        ) : (
          <>
            <IDITable
              IDIList={IDIList}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {!loading && IDIList.length > 0 && (
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
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} drugs
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="idiPageSize" className="text-xs text-gray-600">Per page:</label>
                      <select
                        id="idiPageSize"
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
      <IDIDetailsModal
        IDI={selectedIDI}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <AddEditIDIModal
        IDI={selectedIDI}
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleAddEditSubmit}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Drug"
        message={`Are you sure you want to delete "${selectedIDI?.drugNameGeneric}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, X, Calendar, Clock, CheckCircle, HelpCircle } from "lucide-react";
import type { Event, CreateEventDTO, EventAnalytics, EventStatus, EventType } from "./event.types";
import { mockEvents, EVENT_TYPES } from "./event.types";
import EventTable from "./components/EventTable";
import EventDetailsModal from "./components/EventDetailsModal";
import AddEditEventModal from "./components/AddEditEventModal";
import * as eventService from "../../services/event.service";

export default function EventsView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);

  // Type dropdown states
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [typeSearchTerm, setTypeSearchTerm] = useState("");
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);

  // Fetch events analytics
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await eventService.getEventsAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      const total = mockEvents.length;
      const upcoming = mockEvents.filter((e: Event) => e.status === "upcoming").length;
      const ongoing = mockEvents.filter((e: Event) => e.status === "ongoing").length;
      const completed = mockEvents.filter((e: Event) => e.status === "completed").length;
      const cancelled = mockEvents.filter((e: Event) => e.status === "cancelled").length;
      setAnalytics({ total_events: total, upcoming_events: upcoming, ongoing_events: ongoing, completed_events: completed, cancelled_events: cancelled, success: true });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        event_type: typeFilter !== "all" ? typeFilter : undefined,
        search: searchTerm || undefined,
        page: currentPage,
        page_size: pageSize,
      };

      try {
        const response = await eventService.getEvents(filters);
        setEvents(response.data.data.results);
        setTotalCount(response.data.data.count);
        setHasNext(response.data.data.next !== null);
        setHasPrevious(response.data.data.previous !== null);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockEvents];
        if (statusFilter !== "all") filteredData = filteredData.filter(e => e.status === statusFilter);
        if (typeFilter !== "all") filteredData = filteredData.filter(e => e.event_type === typeFilter);
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            e => e.title.toLowerCase().includes(search) || e.description.toLowerCase().includes(search) || e.specialization.toLowerCase().includes(search)
          );
        }
        setEvents(filteredData);
        setTotalCount(filteredData.length);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);
  useEffect(() => { const timer = setTimeout(() => { fetchEvents(); }, 300); return () => clearTimeout(timer); }, [searchTerm, statusFilter, typeFilter, currentPage, pageSize]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
        setTypeSearchTerm("");
      }
    };
    if (isTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isTypeDropdownOpen]);

  // Handlers
  const handleView = (event: Event) => { setSelectedEvent(event); setIsDetailsModalOpen(true); };
  const handleAdd = () => { setSelectedEvent(null); setIsAddEditModalOpen(true); };
  const handleEdit = (event: Event) => { setSelectedEvent(event); setIsAddEditModalOpen(true); };

  const handleAddEditSubmit = async (data: CreateEventDTO): Promise<{ error?: string }> => {
    try {
      const startDateTime = new Date(`${data.start_date}T${data.start_time}`);
      const endDateTime = new Date(`${data.end_date}T${data.end_time}`);
      if (startDateTime > endDateTime) return { error: "Event start date & time cannot be later than end date & time." };
      if (selectedEvent) {
        await eventService.updateEvent({ ...data, id: selectedEvent.id });
      } else {
        await eventService.createEvent(data);
      }
      fetchEvents();
      fetchAnalytics();
      return {};
    } catch (error: any) {
      console.error("Failed to save event:", error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || (selectedEvent ? "Failed to update event. Please try again." : "Failed to add event. Please try again.");
      return { error: errorMessage };
    }
  };

  const filteredTypes = EVENT_TYPES.filter((type) => type.toLowerCase().includes(typeSearchTerm.toLowerCase()));

  const getTypeDisplayLabel = () => {
    if (typeFilter === "all") return "All Types";
    return typeFilter.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleClearFilters = () => { setSearchTerm(""); setStatusFilter("all"); setTypeFilter("all"); };
  const hasActiveFilters = searchTerm || statusFilter !== "all" || typeFilter !== "all";

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

  const stats = analytics
    ? { total: analytics.total_events, upcoming: analytics.upcoming_events, ongoing: analytics.ongoing_events, completed: analytics.completed_events }
    : { total: totalCount || events.length, upcoming: events.filter(e => e.status === "upcoming").length, ongoing: events.filter(e => e.status === "ongoing").length, completed: events.filter(e => e.status === "completed").length };

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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

        {/* Total Events */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
              <Calendar className="w-5 h-5" style={{ color: "#6b96ff" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-56 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Total number of events in the system.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-2xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>{stats.total}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Total Events</div>
        </div>

        {/* Upcoming */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
              <Clock className="w-5 h-5" style={{ color: "#6b96ff" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-56 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Events scheduled to start in the future.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-2xl font-bold" style={{ color: "#6b96ff", marginBottom: "2px" }}>{stats.upcoming}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Upcoming</div>
        </div>

        {/* Ongoing */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
              <CheckCircle className="w-5 h-5" style={{ color: "#4fcfa5" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-56 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Events currently in progress.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-2xl font-bold" style={{ color: "#4fcfa5", marginBottom: "2px" }}>{stats.ongoing}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Ongoing</div>
        </div>

        {/* Completed */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 114, 128, 0.08)" }}>
              <Calendar className="w-5 h-5" style={{ color: "#6b7280" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-56 p-3 text-xs rounded-xl z-50" style={tooltipStyle}>
                Events that have already concluded.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-2xl font-bold" style={{ color: "#6b7280", marginBottom: "2px" }}>{stats.completed}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Completed</div>
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
                placeholder="Search by title, description, or specialization..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                style={insetInputStyle}
              />
            </div>

            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              {/* Event Type Filter - Searchable Dropdown */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-48 relative" ref={typeDropdownRef}>
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="w-full px-3 py-2 text-sm rounded-xl text-left flex items-center justify-between gap-2"
                    style={insetInputStyle}
                  >
                    <span className="truncate">{getTypeDisplayLabel()}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {isTypeDropdownOpen && (
                    <div
                      className="absolute z-50 mt-1 w-full bg-white rounded-xl max-h-80 overflow-hidden"
                      style={{ boxShadow: "6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.7)" }}
                    >
                      <div className="p-2 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={typeSearchTerm}
                            onChange={(e) => setTypeSearchTerm(e.target.value)}
                            placeholder="Search types..."
                            className="w-full pl-8 pr-8 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)" }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {typeSearchTerm && (
                            <button onClick={() => setTypeSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-64">
                        <button
                          onClick={() => { setTypeFilter("all"); setIsTypeDropdownOpen(false); setTypeSearchTerm(""); }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${typeFilter === "all" ? "bg-gray-50 font-medium" : ""}`}
                        >
                          All Types
                        </button>
                        {filteredTypes.length > 0 ? (
                          filteredTypes.map((type) => (
                            <button
                              key={type}
                              onClick={() => { setTypeFilter(type); setIsTypeDropdownOpen(false); setTypeSearchTerm(""); }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${typeFilter === type ? "bg-gray-50 font-medium" : ""}`}
                            >
                              {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">No types found</div>
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
                  onChange={(e) => setStatusFilter(e.target.value as EventStatus | "all")}
                  className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                  style={insetInputStyle}
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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

          {/* Right side: Add Event Button */}
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
              Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Events Table */}
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
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
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
                {/* S.No */}
                <div className="w-6 h-4 bg-gray-200 rounded" />
                {/* Image + Title */}
                <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="w-44 h-4 bg-gray-200 rounded" />
                </div>
                {/* Type */}
                <div className="w-24 h-6 bg-gray-200 rounded-lg" />
                {/* Specialization */}
                <div className="w-24 h-6 bg-gray-200 rounded-full" />
                {/* Date */}
                <div className="w-20 h-3.5 bg-gray-200 rounded" />
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
        ) : !events?.length ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No events found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <EventTable
              events={events}
              onView={handleView}
              onEdit={handleEdit}
            />

            {/* Pagination */}
            {!loading && events.length > 0 && (
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
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} events
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor="eventPageSize" className="text-xs text-gray-600">Per page:</label>
                        <select
                          id="eventPageSize"
                          value={pageSize}
                          onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                          className="px-2 py-1 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          style={{ background: "#ffffff", border: "none", boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.5)" }}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
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
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <AddEditEventModal
        event={selectedEvent}
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleAddEditSubmit}
      />
    </div>
  );
}
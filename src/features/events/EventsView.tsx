import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, X, Calendar } from "lucide-react";
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
      // Calculate from mock data
      const total = mockEvents.length;
      const upcoming = mockEvents.filter((e: Event) => e.status === "upcoming").length;
      const ongoing = mockEvents.filter((e: Event) => e.status === "ongoing").length;
      const completed = mockEvents.filter((e: Event) => e.status === "completed").length;
      const cancelled = mockEvents.filter((e: Event) => e.status === "cancelled").length;
      setAnalytics({ 
        total_events: total, 
        upcoming_events: upcoming, 
        ongoing_events: ongoing,
        completed_events: completed,
        cancelled_events: cancelled,
        success: true
      });
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

      // Try to fetch from API, fallback to mock data on error
      try {
        const response = await eventService.getEvents(filters);
        setEvents(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockEvents];

        // Apply status filter
        if (statusFilter !== "all") {
          filteredData = filteredData.filter(e => e.status === statusFilter);
        }

        // Apply type filter
        if (typeFilter !== "all") {
          filteredData = filteredData.filter(e => e.event_type === typeFilter);
        }

        // Apply search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            e =>
              e.title.toLowerCase().includes(search) ||
              e.description.toLowerCase().includes(search) ||
              e.specialization.toLowerCase().includes(search)
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

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, typeFilter, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  // Close type dropdown when clicking outside
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
  const handleView = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedEvent(null);
    setIsAddEditModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsAddEditModalOpen(true);
  };

  // Submit handlers
  const handleAddEditSubmit = async (data: CreateEventDTO): Promise<{ error?: string }> => {
    try {
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
      const errorMessage = error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || (selectedEvent ? "Failed to update event. Please try again." : "Failed to add event. Please try again.");
      return { error: errorMessage };
    }
  };

  // Filter types based on search term
  const filteredTypes = EVENT_TYPES.filter((type) =>
    type.toLowerCase().includes(typeSearchTerm.toLowerCase())
  );

  // Get display label for selected type
  const getTypeDisplayLabel = () => {
    if (typeFilter === "all") return "All Types";
    return typeFilter.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  // Use API analytics data if available
  const stats = analytics
    ? {
        total: analytics.total_events,
        upcoming: analytics.upcoming_events,
        ongoing: analytics.ongoing_events,
        completed: analytics.completed_events,
        // cancelled: analytics.cancelled_events,
      }
    : {
        total: totalCount || events.length,
        upcoming: events.filter(e => e.status === "upcoming").length,
        ongoing: events.filter(e => e.status === "ongoing").length,
        completed: events.filter(e => e.status === "completed").length,
        // cancelled: events.filter(e => e.status === "cancelled").length,
      };

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Total Events</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Upcoming</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {stats.upcoming}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Ongoing</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.ongoing}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-gray-600 mt-1">
              {stats.completed}
            </div>
          )}
        </div>

        {/* <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Cancelled</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-red-600 mt-1">
              {stats.cancelled}
            </div>
          )}
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
                placeholder="Search by title, description, or specialization..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-4 min-w-0">
              {/* Event Type Filter - Searchable Dropdown */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-48 relative" ref={typeDropdownRef}>
                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-left flex items-center justify-between gap-2 bg-white"
                  >
                    <span className="truncate">{getTypeDisplayLabel()}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {isTypeDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={typeSearchTerm}
                            onChange={(e) => setTypeSearchTerm(e.target.value)}
                            placeholder="Search types..."
                            className="w-full pl-8 pr-8 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {typeSearchTerm && (
                            <button
                              onClick={() => setTypeSearchTerm("")}
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
                            setTypeFilter("all");
                            setIsTypeDropdownOpen(false);
                            setTypeSearchTerm("");
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                            typeFilter === "all" ? "bg-gray-100 font-medium" : ""
                          }`}
                        >
                          All Types
                        </button>
                        {filteredTypes.length > 0 ? (
                          filteredTypes.map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                setTypeFilter(type);
                                setIsTypeDropdownOpen(false);
                                setTypeSearchTerm("");
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                typeFilter === type ? "bg-gray-100 font-medium" : ""
                              }`}
                            >
                              {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No types found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EventStatus | "all")}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right side: Add Event Button */}
          <div className="flex justify-end lg:justify-normal shrink-0">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No events found. Try adjusting your filters.
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
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} events
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
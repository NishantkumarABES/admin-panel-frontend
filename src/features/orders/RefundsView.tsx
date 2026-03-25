import { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import type { RefundRequest, RefundAnalytics, RefundStatus, RefundType } from "./order.types";
import { mockRefundRequests } from "./order.types";
import RefundSummaryCards from "./components/RefundSummaryCards";
import RefundsTable from "./components/RefundsTable";
import ReviewRefundModal from "./components/ReviewRefundModal";
import * as refundService from "../../services/refund.service";

export default function RefundsView() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<RefundAnalytics | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RefundStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<RefundType | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Modal states
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Compute analytics from mock data
  const computeAnalytics = (data: RefundRequest[]): RefundAnalytics => {
    return {
      total_refunds: data.length,
      pending_refunds: data.filter((r) => r.status === "refund_requested" || r.status === "under_review").length,
      approved_refunds: data.filter((r) => r.status === "approved").length,
      rejected_refunds: data.filter((r) => r.status === "rejected").length,
      total_refund_amount: data
        .filter((r) => r.status === "refund_completed")
        .reduce((sum, r) => sum + r.refund_amount, 0),
    };
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await refundService.getRefundAnalytics();
      setAnalytics(response.data);
    } catch {
      console.log("Using mock refund analytics");
      setAnalytics(computeAnalytics(mockRefundRequests));
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch refunds
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        refund_type: typeFilter !== "all" ? typeFilter : undefined,
        search: searchTerm || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page: currentPage,
        page_size: pageSize,
      };

      try {
        const response = await refundService.getRefunds(filters);
        setRefunds(response.data.results || []);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
      } catch {
        console.log("Using mock refund data — API not available");
        let filteredData = [...mockRefundRequests];

        if (statusFilter !== "all") {
          filteredData = filteredData.filter((r) => r.status === statusFilter);
        }
        if (typeFilter !== "all") {
          filteredData = filteredData.filter((r) => r.refund_type === typeFilter);
        }
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            (r) =>
              r.id.toLowerCase().includes(search) ||
              r.order_id.toLowerCase().includes(search) ||
              r.user.name.toLowerCase().includes(search) ||
              r.user.email.toLowerCase().includes(search) ||
              r.reason.toLowerCase().includes(search)
          );
        }
        if (dateFrom) {
          filteredData = filteredData.filter((r) => new Date(r.requested_at) >= new Date(dateFrom));
        }
        if (dateTo) {
          filteredData = filteredData.filter((r) => new Date(r.requested_at) <= new Date(dateTo));
        }

        // Pagination
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        setTotalCount(filteredData.length);
        setHasNext(end < filteredData.length);
        setHasPrevious(currentPage > 1);
        setRefunds(filteredData.slice(start, end));
      }
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRefunds();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, typeFilter, dateFrom, dateTo, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, dateFrom, dateTo]);



  const handleReview = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setIsReviewModalOpen(true);
  };

  const handleApprove = async (refundId: string, adminNotes?: string) => {
    try {
      await refundService.approveRefund(refundId, adminNotes);
    } catch {
      console.log("Mock: Refund approved", refundId, adminNotes);
    }
    fetchRefunds();
    fetchAnalytics();
  };

  const handleReject = async (refundId: string, reason: string, adminNotes?: string) => {
    try {
      await refundService.rejectRefund(refundId, reason, adminNotes);
    } catch {
      console.log("Mock: Refund rejected", refundId, reason, adminNotes);
    }
    fetchRefunds();
    fetchAnalytics();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
  };


  const hasActiveFilters = searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFrom || dateTo;

  const totalPages = Math.ceil(totalCount / pageSize);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* Summary Cards */}
      <RefundSummaryCards analytics={analytics} loading={analyticsLoading} />

      {/* Filters and Actions */}
      <div className="clay-card min-w-0" style={{ padding: "14px 18px" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 min-w-0">
          {/* Left side: Search + Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:gap-3 min-w-0 flex-1">
            {/* Search */}
            <div className="flex-1 min-w-0 w-full sm:min-w-72 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Refund ID, Order ID, or customer..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                style={insetInputStyle}
              />
            </div>

            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              {/* Status Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-44">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as RefundStatus | "all")}
                  className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                  style={insetInputStyle}
                >
                  <option value="all">All Status</option>
                  <option value="refund_requested">Refund Requested</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="refund_initiated">Refund Initiated</option>
                  <option value="refund_completed">Refund Completed</option>
                  <option value="refund_failed">Refund Failed</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2 min-w-0 sm:min-w-28">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as RefundType | "all")}
                  className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                  style={insetInputStyle}
                >
                  <option value="all">All Types</option>
                  <option value="full">Full</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  style={insetInputStyle}
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  style={insetInputStyle}
                />
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

      {/* Refunds Table */}
      <div className="clay-card overflow-hidden" style={{ padding: 0, maxHeight: "438px", display: "flex", flexDirection: "column" }}>
        {loading ? (
          /* Skeleton Loading Rows */
          <div className="w-full">
            <div
              className="px-4 py-3"
              style={{ background: "#f8f9fb", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
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
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="w-32 h-4 bg-gray-200 rounded" />
                  <div className="w-44 h-3 bg-gray-100 rounded" />
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded" />
                <div className="w-16 h-3.5 bg-gray-200 rounded" />
                <div className="w-12 h-5 bg-gray-200 rounded-full" />
                <div className="w-24 h-6 bg-gray-200 rounded-full" />
                <div className="w-20 h-3.5 bg-gray-200 rounded" />
                <div className="w-14 h-3.5 bg-gray-200 rounded" />
                <div className="flex gap-1.5">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : refunds.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No refund requests found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <RefundsTable
              refunds={refunds}
              onReview={handleReview}
            />

            {/* Pagination */}
            {!loading && refunds.length > 0 && (
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
                        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} refunds
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor="refundPageSize" className="text-xs text-gray-600">Per page:</label>
                        <select
                          id="refundPageSize"
                          value={pageSize}
                          onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
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
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={!hasPrevious}
                        className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        title="Previous page"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev
                      </button>

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



      <ReviewRefundModal
        refund={selectedRefund}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedRefund(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

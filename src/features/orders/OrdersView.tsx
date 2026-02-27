import { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";
import type { Order, OrderAnalytics, OrderStatus } from "./order.types";
import { mockOrders } from "./order.types";
import OrderSummaryCards from "./components/OrderSummaryCards";
import OrdersTable from "./components/OrdersTable";
import RevenueSidePanel from "./components/RevenueSidePanel";
import OrderDetailsModal from "./components/OrderDetailsModal";
import UpdateStatusModal from "./components/UpdateStatusModal";
import AddOrderModal from "./components/AddOrderModal";
import * as orderService from "../../services/order.service";

export default function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);

  const today = new Date().toDateString();

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await orderService.getOrderAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      const todayOrders = mockOrders.filter(
        (o) => new Date(o.created_at).toDateString() === today
      );
      setAnalytics({
        total_orders: todayOrders.length,
        pending_payments: mockOrders.filter((o) => o.status === "pending_payment").length,
        processing_orders: mockOrders.filter((o) => o.status === "processing").length,
        delivered_orders: mockOrders.filter((o) => o.status === "delivered").length,
        cancelled_orders: mockOrders.filter((o) => o.status === "cancelled").length,
        total_revenue: todayOrders.reduce((sum, o) => sum + o.total_amount, 0),
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page: currentPage,
        page_size: pageSize,
      };

      try {
        const response = await orderService.getOrders(filters);
        setOrders(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockOrders];

        if (statusFilter !== "all") {
          filteredData = filteredData.filter((o) => o.status === statusFilter);
        }
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            (o) =>
              o.id.toLowerCase().includes(search) ||
              o.user.name.toLowerCase().includes(search) ||
              o.user.email.toLowerCase().includes(search)
          );
        }
        if (dateFrom) {
          filteredData = filteredData.filter((o) => new Date(o.created_at) >= new Date(dateFrom));
        }
        if (dateTo) {
          filteredData = filteredData.filter((o) => new Date(o.created_at) <= new Date(dateTo));
        }

        setOrders(filteredData);
        setTotalCount(filteredData.length);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => { fetchOrders(); }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, dateFrom, dateTo, currentPage, pageSize]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, dateFrom, dateTo]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateStatusModalOpen(true);
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      await orderService.updateOrderStatus({ id: orderId, status, note });
      fetchOrders();
      fetchAnalytics();
    } catch (error) {
      console.error("Failed to update order status:", error);
      throw error;
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const handleCreateOrder = async (data: {
    user_id: string;
    address_id: string;
    items: Array<{ product_id: string; quantity: number }>;
    payment_method: string;
    payment_reference?: string;
    status?: string;
  }) => {
    try {
      await orderService.createOrder(data);
      fetchOrders();
      fetchAnalytics();
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || dateFrom || dateTo;

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* Summary Cards */}
      <OrderSummaryCards analytics={analytics} loading={analyticsLoading} />

      {/* Main content: Revenue Panel (left) + Table (right) */}
      <div className="flex flex-col xl:flex-row gap-4 min-w-0">
        {/* Left: Revenue Side Panel */}
        <div className="w-full xl:w-64 shrink-0">
          <RevenueSidePanel analytics={analytics} loading={analyticsLoading} />
        </div>

        {/* Right: Filters + Table */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
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
                    placeholder="Search by Order ID or customer name..."
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
                      onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
                      className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                      style={insetInputStyle}
                    >
                      <option value="all">All Status</option>
                      <option value="pending_payment">Pending Payment</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
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

              {/* Right side: Add Order Button */}
              <div className="flex justify-end lg:justify-normal shrink-0">
                <button
                  onClick={() => setIsAddOrderModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap shrink-0"
                  style={{
                    background: "#1f2937",
                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Order
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="clay-card overflow-hidden" style={{ padding: 0, maxHeight: "520px", display: "flex", flexDirection: "column" }}>
            {loading ? (
              /* Skeleton Loading Rows */
              <div className="w-full">
                <div
                  className="px-4 py-3"
                  style={{ background: "#f8f9fb", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse ml-auto" />
                  </div>
                </div>
                {[...Array(pageSize)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-4 py-4 animate-pulse"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    {/* Order ID */}
                    <div className="w-20 h-4 bg-gray-200 rounded" />
                    {/* Customer */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="w-32 h-4 bg-gray-200 rounded" />
                      <div className="w-44 h-3 bg-gray-100 rounded" />
                    </div>
                    {/* Items */}
                    <div className="w-12 h-3.5 bg-gray-200 rounded" />
                    {/* Total */}
                    <div className="w-16 h-3.5 bg-gray-200 rounded" />
                    {/* Status */}
                    <div className="w-24 h-6 bg-gray-200 rounded-full" />
                    {/* Date */}
                    <div className="w-20 h-3.5 bg-gray-200 rounded" />
                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                      <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No orders found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <OrdersTable
                  orders={orders}
                  onView={handleViewDetails}
                  onUpdateStatus={handleUpdateStatus}
                />

                {/* Pagination */}
                {!loading && orders.length > 0 && (
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
                            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} orders
                          </div>
                          <div className="flex items-center gap-2">
                            <label htmlFor="pageSize" className="text-xs text-gray-600">Per page:</label>
                            <select
                              id="pageSize"
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
        </div>
      </div>

      {/* Modals */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
      />

      <UpdateStatusModal
        order={selectedOrder}
        isOpen={isUpdateStatusModalOpen}
        onClose={() => {
          setIsUpdateStatusModalOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleStatusUpdate}
      />

      <AddOrderModal
        isOpen={isAddOrderModalOpen}
        onClose={() => setIsAddOrderModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
}
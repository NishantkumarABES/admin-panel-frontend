import { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";
import type { Order, OrderAnalytics, OrderStatus } from "./order.types";
import { mockOrders } from "./order.types";
import OrderSummaryCards from "./components/OrderSummaryCards";
import OrdersTable from "./components/OrdersTable";
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

  // Get first day of current month and today's date
  const getDefaultDates = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 2);
    return {
      from: firstDay.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDates();
  const [dateFrom, setDateFrom] = useState(defaultDates.from);
  const [dateTo, setDateTo] = useState(defaultDates.to);

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
      // Calculate from mock data
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

        // Apply status filter
        if (statusFilter !== "all") {
          filteredData = filteredData.filter((o) => o.status === statusFilter);
        }

        // Apply search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            (o) =>
              o.id.toLowerCase().includes(search) ||
              o.user.name.toLowerCase().includes(search) ||
              o.user.email.toLowerCase().includes(search)
          );
        }

        // Apply date filters
        if (dateFrom) {
          filteredData = filteredData.filter(
            (o) => new Date(o.created_at) >= new Date(dateFrom)
          );
        }
        if (dateTo) {
          filteredData = filteredData.filter(
            (o) => new Date(o.created_at) <= new Date(dateTo)
          );
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

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, dateFrom, dateTo, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

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

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <div className="space-y-6 min-w-0 max-w-full">
        {/* Summary Cards */}
        <OrderSummaryCards analytics={analytics} loading={analyticsLoading} />

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
                  placeholder="Search by Order ID or customer name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Filters group */}
              <div className="flex flex-wrap items-center gap-4 min-w-0">
                {/* Status Filter */}
                <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                  <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
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

                {/* Date Filters */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="From date"
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="To date"
                  />
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Right side: Action Button */}
            <div className="flex justify-end lg:justify-normal shrink-0">
              <button
                onClick={() => setIsAddOrderModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Order
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No orders found. Try adjusting your filters.
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
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          Showing {(currentPage - 1) * pageSize + 1} to{" "}
                          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} orders
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
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                          onClick={() => setCurrentPage((prev) => prev + 1)}
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
    </div>
  );
}
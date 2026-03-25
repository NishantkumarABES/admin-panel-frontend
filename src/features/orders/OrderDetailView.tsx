import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  MapPin,
  Package,
  CreditCard,
  Clock,
  FileText,
  RotateCcw,
  ShoppingBag,
  Calendar,
  Mail,
  Phone,
  Hash,
} from "lucide-react";
import type { Order, OrderStatus } from "./order.types";
import { mockOrders } from "./order.types";
import OrderStatusBadge from "./components/OrderStatusBadge";
import UpdateStatusModal from "./components/UpdateStatusModal";
import productPlaceholder from "../../assets/placeholders/product.png";
import * as orderService from "../../services/order.service";
import toast from "react-hot-toast";

// ── Helpers ────────────────────────────────────────────────────
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const formatCurrency = (amount?: number | null) => {
  const safeAmount = Number(amount) || 0;
  return `₹${safeAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const calculateUnitPrice = (item: {
  base_price: number;
  discount_percentage: number;
  tax_percentage: number;
}) => {
  const basePrice = Number(item.base_price) || 0;
  const discountAmount = (basePrice * (Number(item.discount_percentage) || 0)) / 100;
  const priceAfterDiscount = basePrice - discountAmount;
  const taxAmount = (priceAfterDiscount * (Number(item.tax_percentage) || 0)) / 100;
  return priceAfterDiscount + taxAmount;
};

const insetPanelStyle = {
  background: "#f8f9fb",
  boxShadow:
    "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

// ── Main Component ─────────────────────────────────────────────
export default function OrderDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await orderService.getOrderById(id);
      setOrder(response.data.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      const mockOrder = mockOrders.find((o) => o.id === id);
      if (mockOrder) {
        setOrder(mockOrder);
      } else {
        toast.error("Failed to load order details");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      await orderService.updateOrderStatus({ id: orderId, status, note });
      toast.success("Order status updated");
      fetchOrder();
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
      throw error;
    }
  };

  // ── Loading Skeleton ───────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">
        <div className="flex items-center gap-3">
          <div className="w-28 h-8 clay-skeleton rounded-xl" />
        </div>
        <div className="clay-card">
          <div className="flex items-start gap-6 animate-pulse">
            <div className="w-14 h-14 bg-gray-200 rounded-xl shrink-0" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="w-48 h-6 bg-gray-200 rounded" />
              <div className="w-32 h-4 bg-gray-100 rounded" />
              <div className="flex gap-2 mt-2">
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="clay-card animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full mb-3" />
              <div className="w-20 h-5 bg-gray-200 rounded mb-1" />
              <div className="w-16 h-3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="clay-card animate-pulse space-y-3">
              <div className="w-32 h-4 bg-gray-200 rounded" />
              <div className="w-full h-24 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Not Found ──────────────────────────────────────────────
  if (!order) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">
        <div className="clay-card text-center py-16">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Order Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="clay-btn inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // ── Main Render ────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* ── Breadcrumb / Back + Actions ───────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/orders")}
          className="clay-btn flex items-center gap-2 text-sm"
          style={{ padding: "6px 14px", fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-gray-500">Orders</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {order.order_number}
          </span>
        </button>

        <button
          onClick={() => setIsUpdateStatusModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap"
          style={{
            background: "#1f2937",
            boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
          }}
        >
          <RotateCcw className="w-4 h-4" />
          Update Status
        </button>
      </div>

      {/* ── Customer Header Card ──────────────────────────────── */}
      <div className="clay-card">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div
            className="flex items-center justify-center w-14 h-14 rounded-xl shrink-0"
            style={{
              background: "rgba(107, 150, 255, 0.08)",
              boxShadow: "3px 3px 8px rgba(0,0,0,0.06), -3px -3px 8px rgba(255,255,255,0.8)",
            }}
          >
            <User className="w-7 h-7" style={{ color: "#6b96ff" }} />
          </div>

          {/* Customer Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-0.5">{order.user.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {order.user.email}
              </span>
              {order.user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {order.user.phone}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {order.payment_method}
              </span>
            </div>
          </div>

          {/* Order Meta — right side */}
          <div className="text-right shrink-0 space-y-1">
            <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
              <Hash className="w-3.5 h-3.5" />
              {order.order_number}
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(order.created_at)}
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(order.total_amount)}</div>
          </div>
        </div>
      </div>

      {/* ── Quick Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="clay-card min-w-0">
          <div className="clay-circle mb-2" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
            <Package className="w-4 h-4" style={{ color: "#6b96ff" }} />
          </div>
          <div className="text-lg font-bold text-gray-900">
            {order.items.length}
          </div>
          <div className="text-xs text-gray-500">{order.items.length === 1 ? "Item" : "Items"}</div>
        </div>
        <div className="clay-card min-w-0">
          <div className="clay-circle mb-2" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
            <CreditCard className="w-4 h-4" style={{ color: "#4fcfa5" }} />
          </div>
          <div className="text-lg font-bold" style={{ color: "#4fcfa5" }}>
            {formatCurrency(order.subtotal_amount || 0)}
          </div>
          <div className="text-xs text-gray-500">Subtotal</div>
        </div>
        <div className="clay-card min-w-0">
          <div className="clay-circle mb-2" style={{ background: "rgba(162, 133, 255, 0.08)" }}>
            <ShoppingBag className="w-4 h-4" style={{ color: "#a285ff" }} />
          </div>
          <div className="text-lg font-bold" style={{ color: "#a285ff" }}>
            {formatCurrency(order.shipping_charge || 0)}
          </div>
          <div className="text-xs text-gray-500">Shipping</div>
        </div>
        <div className="clay-card min-w-0">
          <div className="clay-circle mb-2" style={{ background: "rgba(255, 197, 84, 0.08)" }}>
            <CreditCard className="w-4 h-4" style={{ color: "#ffc554" }} />
          </div>
          <div className="text-lg font-bold" style={{ color: "#ffc554" }}>
            {formatCurrency(order.total_amount)}
          </div>
          <div className="text-xs text-gray-500">Total Paid</div>
        </div>
      </div>

      {/* ── Order Items (Full Width) ──────────────────────────── */}
      <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            Order Items
          </h3>
          <span className="text-xs text-gray-400">
            Unit Price = Base − Discount + Tax
          </span>
        </div>
        <div
          className="rounded-xl overflow-hidden overflow-x-auto"
          style={{ border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <table className="w-full">
            <thead
              style={{
                background: "#f8f9fb",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Base Price</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Discount</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Tax</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Unit Price</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Qty</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image_url || productPlaceholder}
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded-lg shrink-0"
                        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                      />
                      <div className="min-w-0">
                        <div
                          className="text-sm font-medium text-gray-900 break-words cursor-pointer hover:underline"
                          style={{ color: "#6b96ff" }}
                          onClick={() => navigate(`/products/${item.product.id}`)}
                        >
                          {item.product.name}
                        </div>
                        {item.product.sku && (
                          <div className="text-xs text-gray-400 mt-0.5">SKU: {item.product.sku}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-gray-900 whitespace-nowrap">
                    {formatCurrency(item.base_price)}
                  </td>
                  <td className="px-3 py-3 text-center text-sm whitespace-nowrap">
                    {item.discount_percentage > 0 ? (
                      <span className="text-emerald-600 font-medium">-{item.discount_percentage}%</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-sm whitespace-nowrap">
                    {item.tax_percentage > 0 ? (
                      <span className="text-red-500">+{item.tax_percentage}%</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-gray-900 whitespace-nowrap">
                    {formatCurrency(calculateUnitPrice(item))}
                  </td>
                  <td className="px-3 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-3 py-3 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                    {formatCurrency(item.final_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Three-Column Detail Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Delivery Address */}
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3
            className="text-sm font-semibold text-gray-900 pb-2 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <MapPin className="w-4 h-4 text-gray-400" />
            Delivery Address
          </h3>
          <div className="rounded-xl p-4" style={insetPanelStyle}>
            <div className="text-sm font-medium text-gray-900">{order.address.name}</div>
            <div className="text-xs text-gray-500 mt-1">{order.address.phone}</div>
            <div className="text-xs text-gray-600 mt-2 leading-relaxed">
              {order.address.address_line}
              <br />
              {order.address.city}, {order.address.state} {order.address.postal_code}
              <br />
              {order.address.country}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3
            className="text-sm font-semibold text-gray-900 pb-2 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <CreditCard className="w-4 h-4 text-gray-400" />
            Payment Information
          </h3>
          <div className="rounded-xl p-4 space-y-3" style={insetPanelStyle}>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Method</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {order.payment_method}
              </span>
            </div>
            {order.payment_reference && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Transaction ID</span>
                <span className="text-sm font-mono text-gray-900">{order.payment_reference}</span>
              </div>
            )}
            {order.coupon_code && (
              <div
                className="pt-2 space-y-2"
                style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Coupon</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.coupon_code}
                    {order.coupon_type && order.coupon_value && (
                      <span
                        className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: "rgba(79, 207, 165, 0.12)", color: "#2d9e7a" }}
                      >
                        {order.coupon_type === "percentage"
                          ? `${order.coupon_value}% OFF`
                          : `₹${order.coupon_value} OFF`}
                      </span>
                    )}
                  </span>
                </div>
                {order.coupon_discount != null && order.coupon_discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Discount</span>
                    <span style={{ color: "#4fcfa5" }} className="text-sm font-medium">
                      -{formatCurrency(order.coupon_discount)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Price Summary */}
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3
            className="text-sm font-semibold text-gray-900 pb-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            Price Summary
          </h3>
          <div className="rounded-xl p-4 space-y-3" style={insetPanelStyle}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(order.subtotal_amount || 0)}</span>
            </div>
            {order.shipping_charge != null && order.shipping_charge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">{formatCurrency(order.shipping_charge)}</span>
              </div>
            )}
            {order.coupon_discount != null && order.coupon_discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Coupon Discount</span>
                <span style={{ color: "#4fcfa5" }} className="font-medium">
                  -{formatCurrency(order.coupon_discount)}
                </span>
              </div>
            )}
            <div
              className="flex justify-between pt-3"
              style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
            >
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline & Notes (conditional) ────────────────────── */}
      {(order.timeline && order.timeline.length > 0) || order.notes ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Order Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3
                className="text-sm font-semibold text-gray-900 pb-2 flex items-center gap-2"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
              >
                <Clock className="w-4 h-4 text-gray-400" />
                Order Timeline
              </h3>
              <div className="rounded-xl p-4" style={insetPanelStyle}>
                <div className="space-y-3">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full mt-1"
                          style={{ background: "#6b96ff" }}
                        />
                        {index < order.timeline!.length - 1 && (
                          <div className="w-px flex-1 min-h-[20px] bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <OrderStatusBadge status={event.status} size="sm" />
                          <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(event.timestamp)}</span>
                        </div>
                        {event.note && (
                          <p className="text-xs text-gray-600 mt-1">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3
                className="text-sm font-semibold text-gray-900 pb-2 flex items-center gap-2"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
              >
                <FileText className="w-4 h-4 text-gray-400" />
                Notes
              </h3>
              <div className="rounded-xl p-4" style={insetPanelStyle}>
                <p className="text-sm text-gray-600 leading-relaxed">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* ── Update Status Modal ──────────────────────────────── */}
      <UpdateStatusModal
        order={order}
        isOpen={isUpdateStatusModalOpen}
        onClose={() => setIsUpdateStatusModalOpen(false)}
        onSubmit={handleStatusUpdate}
      />
    </div>
  );
}

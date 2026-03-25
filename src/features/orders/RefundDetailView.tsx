import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CreditCard,
  Clock,
  FileText,
  RotateCcw,
  AlertTriangle,
  Mail,
  Phone,
  Hash,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import type { RefundRequest, OrderStatus, RefundStatus } from "./order.types";
import { mockRefundRequests } from "./order.types";
import RefundStatusBadge from "./components/RefundStatusBadge";
import OrderStatusBadge from "./components/OrderStatusBadge";
import ReviewRefundModal from "./components/ReviewRefundModal";
import * as refundService from "../../services/refund.service";
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

const insetPanelStyle = {
  background: "#f8f9fb",
  boxShadow:
    "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

const TIMELINE_DOT_COLORS: Record<string, string> = {
  refund_requested: "#f59e0b",
  under_review: "#3b82f6",
  approved: "#22c55e",
  rejected: "#ef4444",
  refund_initiated: "#a855f7",
  refund_completed: "#10b981",
  refund_failed: "#f43f5e",
};

const formatShortDate = (dateString: string) =>
  new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// ── Main Component ─────────────────────────────────────────────
export default function RefundDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [refund, setRefund] = useState<RefundRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchRefund = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await refundService.getRefundById(id);
      setRefund(response.data.data);
    } catch (error) {
      console.error("Failed to fetch refund:", error);
      const mockRefund = mockRefundRequests.find((r) => r.id === id);
      if (mockRefund) {
        setRefund(mockRefund);
      } else {
        toast.error("Failed to load refund details");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRefund();
  }, [fetchRefund]);

  const handleApprove = async (refundId: string, adminNotes?: string) => {
    try {
      await refundService.approveRefund(refundId, adminNotes);
      toast.success("Refund approved");
      fetchRefund();
    } catch {
      console.log("Mock: Refund approved", refundId, adminNotes);
    }
  };

  const handleReject = async (refundId: string, reason: string, adminNotes?: string) => {
    try {
      await refundService.rejectRefund(refundId, reason, adminNotes);
      toast.success("Refund rejected");
      fetchRefund();
    } catch {
      console.log("Mock: Refund rejected", refundId, reason, adminNotes);
    }
  };

  const canReview = refund?.status === "refund_requested" || refund?.status === "under_review";

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
  if (!refund) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">
        <div className="clay-card text-center py-16">
          <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Refund Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            The refund request you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/refunds")}
            className="clay-btn inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Refunds
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
          onClick={() => navigate("/refunds")}
          className="clay-btn flex items-center gap-2 text-sm"
          style={{ padding: "6px 14px", fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-gray-500">Refunds</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {refund.id}
          </span>
        </button>

        {canReview && (
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap"
            style={{
              background: "#1f2937",
              boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Review Refund
          </button>
        )}
      </div>

      {/* ── Customer Header Card ──────────────────────────────── */}
      <div className="clay-card">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div
            className="flex items-center justify-center w-14 h-14 rounded-xl shrink-0"
            style={{
              background: "rgba(255, 112, 112, 0.08)",
              boxShadow: "3px 3px 8px rgba(0,0,0,0.06), -3px -3px 8px rgba(255,255,255,0.8)",
            }}
          >
            <RotateCcw className="w-7 h-7" style={{ color: "#ff7070" }} />
          </div>

          {/* Customer Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-0.5">{refund.user.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {refund.user.email}
              </span>
              {refund.user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {refund.user.phone}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <RefundStatusBadge status={refund.status} />
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                style={
                  refund.refund_type === "full"
                    ? { background: "rgba(107, 150, 255, 0.08)", color: "#4b7cf3", borderColor: "rgba(107, 150, 255, 0.2)" }
                    : { background: "rgba(162, 133, 255, 0.08)", color: "#8b6fff", borderColor: "rgba(162, 133, 255, 0.2)" }
                }
              >
                {refund.refund_type === "full" ? "Full Refund" : "Partial Refund"}
              </span>
            </div>
          </div>

          {/* Refund Meta — right side */}
          <div className="text-right shrink-0 space-y-1">
            <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
              <Hash className="w-3.5 h-3.5" />
              {refund.id}
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(refund.requested_at)}
            </div>
            <div className="text-2xl font-bold mt-1" style={{ color: "#ff7070" }}>
              {formatCurrency(refund.refund_amount)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="clay-card min-w-0">
          <div className="clay-circle mb-2" style={{ background: "rgba(255, 112, 112, 0.08)" }}>
            <RotateCcw className="w-4 h-4" style={{ color: "#ff7070" }} />
          </div>
          <div className="text-lg font-bold" style={{ color: "#ff7070" }}>
            {formatCurrency(refund.refund_amount)}
          </div>
          <div className="text-xs text-gray-500">Refund Amount</div>
        </div>
        <div className="clay-card min-w-0">
          <div className="clay-circle mb-2" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
            <Package className="w-4 h-4" style={{ color: "#6b96ff" }} />
          </div>
          <div
            className="text-sm font-bold cursor-pointer hover:underline"
            style={{ color: "#6b96ff" }}
            onClick={() => navigate(`/orders/${refund.order_id}`)}
          >
            {refund.order_number || refund.order_id}
          </div>
          <div className="text-xs text-gray-500">Order</div>
        </div>
        <div className="clay-card min-w-0">
          <div className="clay-circle mb-2" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
            <CreditCard className="w-4 h-4" style={{ color: "#4fcfa5" }} />
          </div>
          <div className="text-lg font-bold" style={{ color: "#4fcfa5" }}>
            {formatCurrency(refund.order_total_amount ? parseFloat(refund.order_total_amount) : 0)}
          </div>
          <div className="text-xs text-gray-500">Order Total</div>
        </div>
        <div className="clay-card min-w-0">
          <div className="clay-circle mb-2" style={{ background: "rgba(162, 133, 255, 0.08)" }}>
            <CreditCard className="w-4 h-4" style={{ color: "#a285ff" }} />
          </div>
          <div className="text-lg font-bold capitalize" style={{ color: "#a285ff" }}>
            {refund.payment_method || "N/A"}
          </div>
          <div className="text-xs text-gray-500">Payment Method</div>
        </div>
      </div>

      {/* ── Refund Reason (Full Width, only if non-empty) ──────── */}
      {(refund.reason || refund.user_notes) && (
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3
            className="text-sm font-semibold text-gray-900 pb-2 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <FileText className="w-4 h-4 text-gray-400" />
            Refund Reason
          </h3>
          <div className="rounded-xl p-4 space-y-2" style={insetPanelStyle}>
            {refund.reason && (
              <div className="text-sm font-medium text-gray-900">{refund.reason}</div>
            )}
            {refund.user_notes && (
              <p className="text-xs text-gray-600 italic">"{refund.user_notes}"</p>
            )}
          </div>
        </div>
      )}

      {/* ── Rejection Reason (conditional, full width) ─────────── */}
      {refund.status === "rejected" && refund.rejection_reason && (
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3
            className="text-sm font-semibold pb-2 flex items-center gap-2"
            style={{ color: "#ff7070", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <AlertTriangle className="w-4 h-4" />
            Rejection Reason
          </h3>
          <div className="rounded-xl p-4" style={{ ...insetPanelStyle, background: "rgba(255, 112, 112, 0.04)" }}>
            <p className="text-sm text-gray-900">{refund.rejection_reason}</p>
          </div>
        </div>
      )}

      {/* ── Order Items (Full Width Table) ──────────────────── */}
      {refund.items && refund.items.length > 0 && (
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              Order Items
            </h3>
            <span className="text-xs text-gray-400">
              {refund.items.length} {refund.items.length === 1 ? "item" : "items"}
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
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Qty</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {refund.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-gray-900 whitespace-nowrap">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-3 py-3 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Three-Column Detail Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Order Information */}
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3
            className="text-sm font-semibold text-gray-900 pb-2 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <Package className="w-4 h-4 text-gray-400" />
            Order Information
          </h3>
          <div className="rounded-xl p-4 space-y-3" style={insetPanelStyle}>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Order ID</span>
              <span
                className="text-sm font-mono cursor-pointer hover:underline"
                style={{ color: "#6b96ff" }}
                onClick={() => navigate(`/orders/${refund.order_id}`)}
              >
                {refund.order_number || refund.order_id}
              </span>
            </div>
            {refund.order_status && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Order Status</span>
                <OrderStatusBadge status={refund.order_status as OrderStatus} size="sm" />
              </div>
            )}
            {refund.order_total_amount && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Order Total</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(parseFloat(refund.order_total_amount))}
                </span>
              </div>
            )}
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
              <span className="text-sm font-medium text-gray-900 capitalize">{refund.payment_method || "N/A"}</span>
            </div>
            {refund.payment_reference && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Transaction ID</span>
                <span className="text-sm font-mono text-gray-900">{refund.payment_reference}</span>
              </div>
            )}
            {refund.payment_gateway_reference && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Gateway Ref</span>
                <span className="text-sm font-mono text-gray-900">{refund.payment_gateway_reference}</span>
              </div>
            )}
            {refund.refund_initiated_at && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Initiated</span>
                <span className="text-sm text-gray-900">{formatDate(refund.refund_initiated_at)}</span>
              </div>
            )}
            {refund.refund_completed_at && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Completed</span>
                <span className="text-sm text-gray-900">{formatDate(refund.refund_completed_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reviewed By / Admin Notes */}
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3
            className="text-sm font-semibold text-gray-900 pb-2 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            Review Details
          </h3>
          {refund.reviewed_by ? (
            <div className="rounded-xl p-4 space-y-3" style={insetPanelStyle}>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Reviewer</span>
                <span className="text-sm font-medium text-gray-900">{refund.reviewed_by.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Email</span>
                <span className="text-sm text-gray-900">{refund.reviewed_by.email}</span>
              </div>
              {refund.reviewed_at && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Reviewed At</span>
                  <span className="text-sm text-gray-900">{formatDate(refund.reviewed_at)}</span>
                </div>
              )}
              {refund.admin_notes && (
                <div className="pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="text-xs text-gray-500 mb-1">Admin Notes</div>
                  <p className="text-sm text-gray-600">{refund.admin_notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl p-4" style={insetPanelStyle}>
              <p className="text-sm text-gray-400 text-center py-2">Not yet reviewed</p>
              {refund.admin_notes && (
                <div className="pt-2 mt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="text-xs text-gray-500 mb-1">Admin Notes</div>
                  <p className="text-sm text-gray-600">{refund.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Horizontal Refund Timeline ─────────────────────────── */}
      {refund.timeline && refund.timeline.length > 0 && (
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3
            className="text-sm font-semibold text-gray-900 pb-2 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <Clock className="w-4 h-4 text-gray-400" />
            Refund Timeline
          </h3>
          <div className="rounded-xl px-4 py-5 overflow-x-auto" style={insetPanelStyle}>
            <div className="flex items-start" style={{ minWidth: `${refund.timeline.length * 160}px` }}>
              {refund.timeline.map((event, index) => {
                const dotColor = TIMELINE_DOT_COLORS[event.status] || "#6b7280";
                const isLast = index === refund.timeline!.length - 1;
                return (
                  <div key={index} className="flex items-start flex-1" style={{ minWidth: "140px" }}>
                    {/* Step */}
                    <div className="flex flex-col items-center" style={{ width: "100%" }}>
                      {/* Dot row with connector lines */}
                      <div className="flex items-center w-full">
                        {/* Left connector */}
                        <div
                          className="flex-1 h-0.5"
                          style={{
                            background: index === 0 ? "transparent" : `linear-gradient(to right, ${TIMELINE_DOT_COLORS[refund.timeline![index - 1].status] || '#d1d5db'}60, ${dotColor}60)`,
                          }}
                        />
                        {/* Dot */}
                        <div
                          className="w-4 h-4 rounded-full shrink-0 relative"
                          style={{
                            background: dotColor,
                            boxShadow: `0 0 0 4px ${dotColor}20`,
                          }}
                        />
                        {/* Right connector */}
                        <div
                          className="flex-1 h-0.5"
                          style={{
                            background: isLast ? "transparent" : `${dotColor}40`,
                          }}
                        />
                      </div>
                      {/* Content below dot */}
                      <div className="text-center mt-3 px-1">
                        <RefundStatusBadge status={event.status as RefundStatus} size="sm" />
                        <div className="text-xs text-gray-400 mt-1.5 whitespace-nowrap">
                          {formatShortDate(event.timestamp)}
                        </div>
                        {event.note && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.note}</p>
                        )}
                        {event.actor && (
                          <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>by {event.actor}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Review Modal ─────────────────────────────────────── */}
      <ReviewRefundModal
        refund={refund}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

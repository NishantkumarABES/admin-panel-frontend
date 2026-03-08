import { User, Package, CreditCard, Clock, FileText, RotateCcw, AlertTriangle } from "lucide-react";
import type { RefundRequest, OrderStatus } from "../order.types";
import RefundStatusBadge from "./RefundStatusBadge";
import OrderStatusBadge from "./OrderStatusBadge";
import RefundTimelineView from "./RefundTimelineView";

interface RefundDetailsModalProps {
    refund: RefundRequest | null;
    isOpen: boolean;
    onClose: () => void;
    onReview?: (refund: RefundRequest) => void;
}

export default function RefundDetailsModal({ refund, isOpen, onClose, onReview }: RefundDetailsModalProps) {
    if (!isOpen || !refund) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatCurrency = (amount?: number | null) => {
        const safeAmount = Number(amount) || 0;
        return `₹${safeAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const insetPanelStyle = {
        background: "#f8f9fb",
        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
    };

    const canReview = refund.status === "refund_requested" || refund.status === "under_review";

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-[18px] w-full max-w-2xl max-h-[90vh] flex flex-col"
                    style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sticky Header */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Refund Details</h2>
                            <p className="text-xs text-gray-500 mt-0.5">ID: {refund.id}</p>
                        </div>
                        <RefundStatusBadge status={refund.status} />
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">
                        <div className="space-y-5">

                            {/* Refund Summary */}
                            <div
                                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl"
                                style={insetPanelStyle}
                            >
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Refund Amount</div>
                                    <div className="text-xl font-bold" style={{ color: "#ff7070" }}>
                                        {formatCurrency(refund.refund_amount)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 mb-1">Type</div>
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
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 mb-1">Requested</div>
                                    <div className="text-sm font-medium text-gray-900">{formatDate(refund.requested_at)}</div>
                                </div>
                            </div>

                            {/* Refund Reason */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-sm font-semibold text-gray-900">Refund Reason</h3>
                                </div>
                                <div className="rounded-xl p-4 space-y-2" style={insetPanelStyle}>
                                    <div className="text-sm font-medium text-gray-900">{refund.reason}</div>
                                    {refund.user_notes && (
                                        <p className="text-xs text-gray-600 italic">"{refund.user_notes}"</p>
                                    )}
                                </div>
                            </div>

                            {/* Rejection Info */}
                            {refund.status === "rejected" && refund.rejection_reason && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4" style={{ color: "#ff7070" }} />
                                        <h3 className="text-sm font-semibold" style={{ color: "#ff7070" }}>Rejection Reason</h3>
                                    </div>
                                    <div className="rounded-xl p-4" style={{ ...insetPanelStyle, background: "rgba(255, 112, 112, 0.04)" }}>
                                        <p className="text-sm text-gray-900">{refund.rejection_reason}</p>
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes */}
                            {refund.admin_notes && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        <h3 className="text-sm font-semibold text-gray-900">Admin Notes</h3>
                                    </div>
                                    <div className="rounded-xl p-4" style={insetPanelStyle}>
                                        <p className="text-sm text-gray-600">{refund.admin_notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Order Information */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-sm font-semibold text-gray-900">Order Information</h3>
                                </div>
                                <div className="rounded-xl p-4 space-y-3" style={insetPanelStyle}>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Order ID</span>
                                        <span className="text-sm font-mono" style={{ color: "#6b96ff" }}>{refund.order_number || refund.order_id}</span>
                                    </div>
                                    {refund.order_status && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Order Status</span>
                                            <OrderStatusBadge status={refund.order_status as OrderStatus} size="sm" />
                                        </div>
                                    )}
                                    {refund.order_total_amount && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Order Total</span>
                                            <span className="text-sm font-medium text-gray-900">{formatCurrency(parseFloat(refund.order_total_amount))}</span>
                                        </div>
                                    )}

                                    {/* Order items preview */}
                                    {refund.items && refund.items.length > 0 && (
                                        <div className="pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                                            <div className="text-xs text-gray-500 mb-2">Items ({refund.items.length})</div>
                                            <div className="space-y-2">
                                                {refund.items.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">{item.product_name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                Qty: {item.quantity} × {formatCurrency(item.price)}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900 shrink-0">
                                                            {formatCurrency(item.total)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-sm font-semibold text-gray-900">Customer</h3>
                                </div>
                                <div className="rounded-xl p-4 space-y-2" style={insetPanelStyle}>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Name</span>
                                        <span className="text-sm font-medium text-gray-900">{refund.user.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Email</span>
                                        <span className="text-sm font-medium text-gray-900">{refund.user.email}</span>
                                    </div>
                                    {refund.user.phone && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Phone</span>
                                            <span className="text-sm font-medium text-gray-900">{refund.user.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment & Gateway Information */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-sm font-semibold text-gray-900">Payment Information</h3>
                                </div>
                                <div className="rounded-xl p-4 space-y-2" style={insetPanelStyle}>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Payment Method</span>
                                        <span className="text-sm font-medium text-gray-900 capitalize">{refund.payment_method || 'N/A'}</span>
                                    </div>
                                    {refund.payment_reference && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Transaction ID</span>
                                            <span className="text-sm font-mono text-gray-900">{refund.payment_reference}</span>
                                        </div>
                                    )}
                                    {refund.payment_gateway_reference && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Refund Gateway Ref</span>
                                            <span className="text-sm font-mono text-gray-900">{refund.payment_gateway_reference}</span>
                                        </div>
                                    )}
                                    {refund.refund_initiated_at && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Refund Initiated</span>
                                            <span className="text-sm text-gray-900">{formatDate(refund.refund_initiated_at)}</span>
                                        </div>
                                    )}
                                    {refund.refund_completed_at && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Refund Completed</span>
                                            <span className="text-sm text-gray-900">{formatDate(refund.refund_completed_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reviewed By */}
                            {refund.reviewed_by && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <h3 className="text-sm font-semibold text-gray-900">Reviewed By</h3>
                                    </div>
                                    <div className="rounded-xl p-4 space-y-2" style={insetPanelStyle}>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Name</span>
                                            <span className="text-sm font-medium text-gray-900">{refund.reviewed_by.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Email</span>
                                            <span className="text-sm font-medium text-gray-900">{refund.reviewed_by.email}</span>
                                        </div>
                                        {refund.reviewed_at && (
                                            <div className="flex justify-between">
                                                <span className="text-xs text-gray-500">Reviewed At</span>
                                                <span className="text-sm text-gray-900">{formatDate(refund.reviewed_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Refund Timeline */}
                            {refund.timeline && refund.timeline.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <h3 className="text-sm font-semibold text-gray-900">Refund Timeline</h3>
                                    </div>
                                    <div className="rounded-xl p-4" style={insetPanelStyle}>
                                        <RefundTimelineView events={refund.timeline} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sticky Footer */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div className="text-xs text-gray-400">Refund ID: {refund.id}</div>
                        <div className="flex items-center gap-2">
                            {canReview && onReview && (
                                <button
                                    onClick={() => { onClose(); onReview(refund); }}
                                    className="flex items-center gap-1.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                                    style={{
                                        padding: "6px 18px",
                                        fontSize: "13px",
                                        background: "#1f2937",
                                        boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                                    }}
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Review
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="clay-btn"
                                style={{ fontSize: "13px", padding: "6px 18px" }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

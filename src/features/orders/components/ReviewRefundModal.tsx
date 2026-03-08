import { useState } from "react";
import type { RefundRequest } from "../order.types";
import RefundStatusBadge from "./RefundStatusBadge";

interface ReviewRefundModalProps {
    refund: RefundRequest | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (refundId: string, adminNotes?: string) => Promise<void>;
    onReject: (refundId: string, reason: string, adminNotes?: string) => Promise<void>;
}

const REJECTION_REASONS = [
    "Product was used and cannot be restocked",
    "Refund request outside return window",
    "Refund policy does not cover change-of-mind for opened consumable items",
    "Product was delivered as described",
    "Insufficient evidence of defect or damage",
    "Other",
];

export default function ReviewRefundModal({ refund, isOpen, onClose, onApprove, onReject }: ReviewRefundModalProps) {
    const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [customRejectionReason, setCustomRejectionReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !refund) return null;

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const handleSubmit = async () => {
        if (!decision) return;
        setIsSubmitting(true);
        try {
            if (decision === "approve") {
                await onApprove(refund.id, adminNotes || undefined);
            } else {
                const reason = rejectionReason === "Other" ? customRejectionReason : rejectionReason;
                if (!reason) return;
                await onReject(refund.id, reason, adminNotes || undefined);
            }
            handleClose();
        } catch (error) {
            console.error("Failed to process refund decision:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setDecision(null);
        setAdminNotes("");
        setRejectionReason("");
        setCustomRejectionReason("");
        onClose();
    };

    const insetInputStyle = {
        background: "#eff1f5",
        border: "none",
        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
    };

    const insetPanelStyle = {
        background: "#f8f9fb",
        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
    };

    const canSubmit =
        decision === "approve" ||
        (decision === "reject" && (rejectionReason === "Other" ? customRejectionReason.trim() : rejectionReason));

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-[18px] w-full max-w-lg max-h-[90vh] flex flex-col"
                    style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Review Refund Request</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{refund.id}</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">
                        <div className="space-y-5">
                            {/* Refund Summary */}
                            <div className="rounded-xl p-4 space-y-3" style={insetPanelStyle}>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Current Status</span>
                                    <RefundStatusBadge status={refund.status} size="sm" />
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Order</span>
                                    <span className="text-sm font-mono" style={{ color: "#6b96ff" }}>{refund.order_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Customer</span>
                                    <span className="text-sm font-medium text-gray-900">{refund.user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Refund Amount</span>
                                    <span className="text-sm font-bold" style={{ color: "#ff7070" }}>
                                        {formatCurrency(refund.refund_amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Type</span>
                                    <span className="text-sm font-medium text-gray-900 capitalize">{refund.refund_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Reason</span>
                                    <span className="text-sm text-gray-900">{refund.reason}</span>
                                </div>
                                {refund.user_notes && (
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Customer Notes</div>
                                        <p className="text-xs text-gray-600 italic">"{refund.user_notes}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Decision */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Decision</h3>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDecision("approve")}
                                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${decision === "approve"
                                            ? "text-white"
                                            : "text-green-700 hover:bg-green-50"
                                            }`}
                                        style={
                                            decision === "approve"
                                                ? {
                                                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                                    borderColor: "#22c55e",
                                                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                                                }
                                                : { borderColor: "#bbf7d0", background: "transparent" }
                                        }
                                    >
                                        ✓ Approve
                                    </button>
                                    <button
                                        onClick={() => setDecision("reject")}
                                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${decision === "reject"
                                            ? "text-white"
                                            : "text-red-700 hover:bg-red-50"
                                            }`}
                                        style={
                                            decision === "reject"
                                                ? {
                                                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                                    borderColor: "#ef4444",
                                                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                                                }
                                                : { borderColor: "#fecaca", background: "transparent" }
                                        }
                                    >
                                        ✕ Reject
                                    </button>
                                </div>
                            </div>

                            {/* Rejection Reason (if rejecting) */}
                            {decision === "reject" && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-900 block mb-2">
                                        Rejection Reason <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        style={insetInputStyle}
                                    >
                                        <option value="">Select a reason...</option>
                                        {REJECTION_REASONS.map((reason) => (
                                            <option key={reason} value={reason}>
                                                {reason}
                                            </option>
                                        ))}
                                    </select>
                                    {rejectionReason === "Other" && (
                                        <textarea
                                            value={customRejectionReason}
                                            onChange={(e) => setCustomRejectionReason(e.target.value)}
                                            placeholder="Please specify the rejection reason..."
                                            rows={2}
                                            className="mt-2 w-full px-3 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                            style={insetInputStyle}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Admin Notes */}
                            {decision && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-900 block mb-2">
                                        Admin Notes <span className="text-gray-400">(optional)</span>
                                    </label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add internal notes about this decision..."
                                        rows={3}
                                        className="w-full px-3 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                        style={insetInputStyle}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="flex items-center justify-end gap-3 px-6 py-4 shrink-0"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <button
                            onClick={handleClose}
                            className="clay-btn"
                            style={{ fontSize: "13px", padding: "6px 18px" }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit || isSubmitting}
                            className="flex items-center gap-1.5 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                padding: "6px 18px",
                                fontSize: "13px",
                                background: decision === "reject" ? "#ef4444" : "#1f2937",
                                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                            }}
                        >
                            {isSubmitting
                                ? "Processing..."
                                : decision === "approve"
                                    ? "Approve Refund"
                                    : decision === "reject"
                                        ? "Reject Refund"
                                        : "Select Decision"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

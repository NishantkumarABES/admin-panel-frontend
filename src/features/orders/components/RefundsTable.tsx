import { useNavigate } from "react-router-dom";
import { Eye, ClipboardCheck, CheckCircle, XCircle } from "lucide-react";
import type { RefundRequest } from "../order.types";
import RefundStatusBadge from "./RefundStatusBadge";

interface RefundsTableProps {
    refunds: RefundRequest[];
    onReview: (refund: RefundRequest) => void;
}

export default function RefundsTable({ refunds, onReview }: RefundsTableProps) {
    const navigate = useNavigate();
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const actionBtnStyle = (color: string) => ({
        color,
        background: "transparent",
        boxShadow: "none",
    });

    const handleHover = (e: React.MouseEvent<HTMLButtonElement>, color: string, entering: boolean) => {
        if (entering) {
            e.currentTarget.style.background = `${color}12`;
            e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
        } else {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.boxShadow = "none";
        }
    };

    return (
        <div className="overflow-hidden min-w-0 flex-1" style={{ overflowY: "auto" }}>
            <div className="overflow-x-auto min-w-0 h-full">
                <table className="w-full table-auto divide-y divide-gray-100 min-w-max">
                    <thead
                        style={{
                            background: "#f8f9fb",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                        }}
                    >
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Customer
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Order ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Refund Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Requested
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Payment
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {refunds.map((refund) => (
                            <tr key={refund.id} className="hover:bg-gray-50/60 transition-colors">
                                {/* Customer */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{refund.user.name}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[180px]">{refund.user.email}</div>
                                    </div>
                                </td>

                                {/* Order ID */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span
                                        className="text-sm font-mono cursor-pointer hover:underline"
                                        style={{ color: "#6b96ff" }}
                                        onClick={() => navigate(`/orders/${refund.order_id}`)}
                                    >
                                        {refund.order_number || refund.order_id}
                                    </span>
                                </td>

                                {/* Refund Amount */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatCurrency(refund.refund_amount)}
                                </td>

                                {/* Type */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                                        style={
                                            refund.refund_type === "full"
                                                ? { background: "rgba(107, 150, 255, 0.08)", color: "#4b7cf3", borderColor: "rgba(107, 150, 255, 0.2)" }
                                                : { background: "rgba(162, 133, 255, 0.08)", color: "#8b6fff", borderColor: "rgba(162, 133, 255, 0.2)" }
                                        }
                                    >
                                        {refund.refund_type === "full" ? "Full" : "Partial"}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <RefundStatusBadge status={refund.status} size="sm" />
                                </td>

                                {/* Requested Date */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {formatDate(refund.requested_at)}
                                </td>

                                {/* Payment Method */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                    {refund.payment_method || 'N/A'}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`/refunds/${refund.id}`)}
                                            className="p-1.5 rounded-lg transition-all duration-200"
                                            title="View details"
                                            style={actionBtnStyle("#6b96ff")}
                                            onMouseEnter={(e) => handleHover(e, "rgba(107, 150, 255)", true)}
                                            onMouseLeave={(e) => handleHover(e, "rgba(107, 150, 255)", false)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {/* Review button — shown for actionable statuses */}
                                        {(refund.status === "refund_requested" || refund.status === "under_review") && (
                                            <button
                                                onClick={() => onReview(refund)}
                                                className="p-1.5 rounded-lg transition-all duration-200"
                                                title="Review refund"
                                                style={actionBtnStyle("#f59e0b")}
                                                onMouseEnter={(e) => handleHover(e, "rgba(245, 158, 11)", true)}
                                                onMouseLeave={(e) => handleHover(e, "rgba(245, 158, 11)", false)}
                                            >
                                                <ClipboardCheck className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Quick approve/reject indicators for reviewed statuses */}
                                        {refund.status === "approved" && (
                                            <span className="p-1.5" title="Approved">
                                                <CheckCircle className="w-4 h-4" style={{ color: "#4fcfa5" }} />
                                            </span>
                                        )}
                                        {refund.status === "rejected" && (
                                            <span className="p-1.5" title="Rejected">
                                                <XCircle className="w-4 h-4" style={{ color: "#ff7070" }} />
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

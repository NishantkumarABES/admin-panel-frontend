import { Edit2, Trash2, Eye, Tag, Percent, IndianRupee, Clock, Users } from "lucide-react";
import type { Coupon } from "../coupon.types";

interface CouponCardProps {
    coupon: Coupon;
    onView: (coupon: Coupon) => void;
    onEdit: (coupon: Coupon) => void;
    onDelete: (coupon: Coupon) => void;
    onToggleStatus: (coupon: Coupon) => void;
    isExpired?: boolean;
}

export default function CouponCard({
    coupon,
    onView,
    onEdit,
    onDelete,
    onToggleStatus,
    isExpired = false,
}: CouponCardProps) {
    const isPercentage = coupon.discount_type === "percentage";
    const discountLabel = isPercentage
        ? `${parseFloat(coupon.discount_value)}% OFF`
        : `₹${parseFloat(coupon.discount_value)} OFF`;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    const usagePercent = coupon.max_uses
        ? Math.min(100, Math.round((coupon.current_uses / coupon.max_uses) * 100))
        : 0;

    return (
        <div
            className="clay-card overflow-hidden flex flex-col"
            style={{ padding: 0, opacity: isExpired ? 0.7 : 1 }}
        >
            {/* Gradient Header */}
            <div
                className="relative px-5 py-5 overflow-hidden"
                style={{
                    background: isExpired
                        ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                        : isPercentage
                            ? "linear-gradient(135deg, #a285ff 0%, #7c5ce0 100%)"
                            : "linear-gradient(135deg, #6b96ff 0%, #4f6fdb 100%)",
                }}
            >
                {/* Decorative circles */}
                <div
                    className="absolute -right-4 -top-4 rounded-full"
                    style={{
                        width: "80px",
                        height: "80px",
                        background: "rgba(255,255,255,0.08)",
                    }}
                />
                <div
                    className="absolute -right-2 bottom-0 rounded-full"
                    style={{
                        width: "48px",
                        height: "48px",
                        background: "rgba(255,255,255,0.05)",
                    }}
                />

                {/* Coupon Code */}
                <div className="relative z-10">
                    <p
                        className="text-xs font-medium uppercase tracking-wider mb-1"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                        Coupon Code
                    </p>
                    <p
                        className="text-lg font-bold text-white tracking-wider"
                        style={{ letterSpacing: "0.08em" }}
                    >
                        {coupon.code}
                    </p>
                </div>

                {/* Discount Badge */}
                <div
                    className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                        background: "rgba(255,255,255,0.2)",
                        color: "#fff",
                        backdropFilter: "blur(4px)",
                    }}
                >
                    {isPercentage ? (
                        <Percent className="w-3 h-3" />
                    ) : (
                        <IndianRupee className="w-3 h-3" />
                    )}
                    {discountLabel}
                </div>

                {/* Status Badge */}
                <button
                    onClick={() => onToggleStatus(coupon)}
                    className="absolute bottom-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
                    style={
                        isExpired
                            ? {
                                background: "rgba(0,0,0,0.3)",
                                color: "#ffffff",
                                border: "none",
                                backdropFilter: "blur(4px)",
                            }
                            : coupon.is_active
                                ? {
                                    background: "rgba(79, 207, 165, 0.9)",
                                    color: "#ffffff",
                                    border: "none",
                                    backdropFilter: "blur(4px)",
                                }
                                : {
                                    background: "rgba(0,0,0,0.3)",
                                    color: "#ffffff",
                                    border: "none",
                                    backdropFilter: "blur(4px)",
                                }
                    }
                    title={isExpired ? "Expired" : `Click to ${coupon.is_active ? "deactivate" : "activate"}`}
                    disabled={isExpired}
                >
                    {isExpired ? "Expired" : coupon.is_active ? "Active" : "Inactive"}
                </button>
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col gap-3">
                {/* Description */}
                {coupon.description && (
                    <p
                        className="text-xs text-gray-500 line-clamp-2"
                        title={coupon.description}
                    >
                        {coupon.description}
                    </p>
                )}

                {/* Info chips */}
                <div className="flex flex-wrap gap-2">
                    {coupon.min_purchase_amount && (
                        <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                            style={{
                                background: "rgba(107, 150, 255, 0.08)",
                                color: "#6b96ff",
                            }}
                        >
                            <IndianRupee className="w-3 h-3" />
                            Min ₹{parseFloat(coupon.min_purchase_amount).toFixed(0)}
                        </span>
                    )}
                    {coupon.max_discount_amount && (
                        <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                            style={{
                                background: "rgba(79, 207, 165, 0.08)",
                                color: "#2f9e7e",
                            }}
                        >
                            Max ₹{parseFloat(coupon.max_discount_amount).toFixed(0)}
                        </span>
                    )}
                    <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{
                            background: isPercentage
                                ? "rgba(162, 133, 255, 0.08)"
                                : "rgba(107, 150, 255, 0.08)",
                            color: isPercentage ? "#a285ff" : "#6b96ff",
                        }}
                    >
                        <Tag className="w-3 h-3" />
                        {isPercentage ? "Percentage" : "Fixed"}
                    </span>
                </div>

                {/* Usage Progress */}
                {coupon.max_uses && (
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Usage
                            </span>
                            <span className="text-[11px] font-medium text-gray-700">
                                {coupon.current_uses}/{coupon.max_uses}
                            </span>
                        </div>
                        <div
                            className="w-full h-1.5 rounded-full overflow-hidden"
                            style={{
                                background: "#eff1f5",
                                boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.06)",
                            }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${usagePercent}%`,
                                    background:
                                        usagePercent >= 90
                                            ? "#ef4444"
                                            : usagePercent >= 60
                                                ? "#f59e0b"
                                                : "#4fcfa5",
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Validity Dates */}
                <div
                    className="flex items-center gap-1.5 text-[11px] text-gray-400"
                    title={`Valid: ${formatDate(coupon.valid_from)} – ${formatDate(coupon.valid_until)}`}
                >
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>
                        {formatDate(coupon.valid_from)} — {formatDate(coupon.valid_until)}
                    </span>
                </div>

                {/* Actions */}
                <div
                    className="flex items-center justify-end gap-2 mt-auto pt-3"
                    style={{
                        borderTop: "1px solid rgba(0,0,0,0.06)",
                        marginTop: "4px",
                    }}
                >
                    <button
                        onClick={() => onView(coupon)}
                        className="p-1.5 rounded-lg transition-all duration-200"
                        title="View details"
                        style={{ color: "#6b7280" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(0, 0, 0, 0.04)";
                            e.currentTarget.style.boxShadow =
                                "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(coupon)}
                        className="p-1.5 rounded-lg transition-all duration-200"
                        title="Edit coupon"
                        style={{ color: "#6b7280" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(0, 0, 0, 0.04)";
                            e.currentTarget.style.boxShadow =
                                "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(coupon)}
                        className="p-1.5 rounded-lg transition-all duration-200"
                        title="Delete coupon"
                        style={{ color: "#ff7070" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 112, 112, 0.08)";
                            e.currentTarget.style.boxShadow =
                                "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

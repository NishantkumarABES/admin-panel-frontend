import { Tag, Calendar, Hash, IndianRupee, BarChart2, FileText } from "lucide-react";
import type { Coupon } from "../coupon.types";
import Modal from "../../../components/common/Modal";

interface CouponDetailsModalProps {
    coupon: Coupon | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function CouponDetailsModal({ coupon, isOpen, onClose }: CouponDetailsModalProps) {
    if (!coupon) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
        });
    };

    const isExpired = new Date(coupon.valid_until) < new Date();
    const isNotYetValid = new Date(coupon.valid_from) > new Date();
    const isMaxUsesReached = coupon.max_uses ? coupon.current_uses >= coupon.max_uses : false;
    const usagePercent = coupon.max_uses ? Math.min((coupon.current_uses / coupon.max_uses) * 100, 100) : null;

    const InfoItem = ({
        icon: Icon, label, value,
    }: {
        icon: React.ElementType;
        label: string;
        value: string | number | undefined | React.ReactNode;
    }) => {
        if (!value && value !== 0) return null;
        return (
            <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-sm text-gray-900">{value}</div>
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Coupon Details" size="md">
            {/* Header */}
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{ background: "rgba(162, 133, 255, 0.10)", boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}
                    >
                        <Tag className="w-5 h-5" style={{ color: "#a285ff" }} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 font-mono">{coupon.code}</h3>
                        <p className="text-xs text-gray-500">
                            {coupon.discount_type === "percentage" ? "Percentage Discount" : "Fixed Amount Discount"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    {isExpired && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(255,112,112,0.12)", color: "#dc2626" }}>
                            Expired
                        </span>
                    )}
                    {isNotYetValid && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(255,197,84,0.12)", color: "#b45309" }}>
                            Not Yet Valid
                        </span>
                    )}
                    {isMaxUsesReached && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(0,0,0,0.07)", color: "#6b7280" }}>
                            Max Uses Reached
                        </span>
                    )}
                    <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium ml-1"
                        style={
                            coupon.is_active
                                ? { background: "rgba(79,207,165,0.12)", color: "#16a34a" }
                                : { background: "rgba(0,0,0,0.05)", color: "#6b7280" }
                        }
                    >
                        {coupon.is_active ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>

            {/* Info Grid — Neumorphic Inset Panel */}
            <div
                className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 px-3 rounded-xl my-3"
                style={{
                    background: "#f8f9fb",
                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                }}
            >
                <InfoItem
                    icon={IndianRupee}
                    label="Discount Value"
                    value={
                        <span className="font-semibold" style={{ color: "#4fcfa5" }}>
                            {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                        </span>
                    }
                />
                <InfoItem icon={Hash} label="Max Uses" value={coupon.max_uses ? coupon.max_uses : "Unlimited"} />
                <InfoItem icon={Calendar} label="Valid From" value={formatDate(coupon.valid_from)} />
                <InfoItem icon={Calendar} label="Valid Until" value={formatDate(coupon.valid_until)} />
                {coupon.min_purchase_amount && (
                    <InfoItem icon={IndianRupee} label="Min Purchase Amount" value={`₹${coupon.min_purchase_amount}`} />
                )}
                {coupon.max_discount_amount && (
                    <InfoItem icon={IndianRupee} label="Max Discount Amount" value={`₹${coupon.max_discount_amount}`} />
                )}
                {coupon.description && (
                    <div className="col-span-2 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                            <div className="text-xs text-gray-500">Description</div>
                            <div className="text-sm text-gray-900">{coupon.description}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Usage Progress */}
            <div className="py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-2 mb-2">
                    <BarChart2 className="w-4 h-4 text-gray-400" />
                    <div className="text-xs text-gray-500">Usage</div>
                    <span className="ml-auto text-sm font-medium text-gray-900">
                        {coupon.current_uses} {coupon.max_uses ? `/ ${coupon.max_uses}` : "uses"}
                    </span>
                </div>
                {usagePercent !== null && (
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${usagePercent}%`,
                                background: usagePercent >= 100
                                    ? "#ff7070"
                                    : usagePercent >= 75
                                        ? "#ffc554"
                                        : "#4fcfa5",
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div
                className="flex items-center justify-between pt-4 mt-2"
                style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
                <div className="text-xs text-gray-500 space-x-4">
                    <span>Created: {new Date(coupon.created_at).toLocaleDateString()}</span>
                </div>
                <button
                    onClick={onClose}
                    className="clay-btn"
                    style={{ fontSize: "13px", padding: "6px 16px" }}
                >
                    Close
                </button>
            </div>
        </Modal>
    );
}

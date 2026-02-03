import { Calendar, TrendingUp, IndianRupee, ShoppingCart, AlertCircle } from "lucide-react";
import type { Coupon } from "../coupon.types";
import Modal from "../../../components/common/Modal";
import StatusBadge from "../../../components/common/StatusBadge";


interface CouponDetailsModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CouponDetailsModal({
  coupon,
  isOpen,
  onClose,
}: CouponDetailsModalProps) {

  if (!coupon) return null;

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number | undefined | React.ReactNode;
  }) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex items-start gap-2 py-2">
        <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-sm text-gray-900 font-medium">{value}</div>
        </div>
      </div>
    );
  };

  const isExpired = new Date(coupon.valid_until) < new Date();
  const isNotYetValid = new Date(coupon.valid_from) > new Date();
  const usagePercentage = coupon.max_uses
    ? (coupon.current_uses / coupon.max_uses) * 100
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Coupon Details" size="md">
      <div className="space-y-4">
        {/* Header with Coupon Info */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-mono font-bold text-gray-900">
              {coupon.code}
            </h3>
            <StatusBadge
              status={coupon.is_active && !isExpired ? "active" : "inactive"}
              size="sm"
            />
          </div>
          {coupon.description && (
            <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {isExpired && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Expired
              </span>
            )}
            {isNotYetValid && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                Not Yet Valid
              </span>
            )}
            {coupon.max_uses && coupon.current_uses >= coupon.max_uses && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                Max Uses Reached
              </span>
            )}
          </div>
        </div>

        {/* Two Column Grid Layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column - Discount Information */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">
              Discount
            </h4>
            <InfoRow
              icon={TrendingUp}
              label="Type"
              value={
                <span className="capitalize">
                  {coupon.discount_type}
                </span>
              }
            />
            <InfoRow
              icon={IndianRupee}
              label="Value"
              value={
                <span className="font-semibold text-emerald-600">
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}%`
                    : `₹${parseFloat(coupon.discount_value).toFixed(2)}`}
                </span>
              }
            />
            {coupon.min_purchase_amount && (
              <InfoRow
                icon={ShoppingCart}
                label="Min Purchase"
                value={`₹${parseFloat(coupon.min_purchase_amount).toFixed(2)}`}
              />
            )}
            {coupon.max_discount_amount && coupon.discount_type === "percentage" && (
              <InfoRow
                icon={AlertCircle}
                label="Max Discount"
                value={`₹${parseFloat(coupon.max_discount_amount).toFixed(2)}`}
              />
            )}
          </div>

          {/* Right Column - Validity & Usage */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">
              Validity & Usage
            </h4>
            <InfoRow
              icon={Calendar}
              label="Valid From"
              value={new Date(coupon.valid_from).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
            <InfoRow
              icon={Calendar}
              label="Valid Until"
              value={
                <span className={isExpired ? "text-red-600" : ""}>
                  {new Date(coupon.valid_until).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              }
            />
            <div className="pt-2">
              <div className="text-xs text-gray-500 mb-1">Usage</div>
              <div className="text-sm text-gray-900 font-medium">
                {coupon.current_uses} / {coupon.max_uses || "∞"}
              </div>
              {coupon.max_uses && (
                <div className="mt-1.5">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${usagePercentage >= 100
                        ? "bg-red-500"
                        : usagePercentage >= 75
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                        }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
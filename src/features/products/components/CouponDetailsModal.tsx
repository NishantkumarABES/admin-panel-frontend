import { Calendar, TrendingUp, DollarSign, ShoppingCart, AlertCircle } from "lucide-react";
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
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-0.5">{label}</div>
          <div className="text-sm text-gray-900">{value}</div>
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
    <Modal isOpen={isOpen} onClose={onClose} title="Coupon Details" size="lg">
      <div className="space-y-6">
        {/* Header with Coupon Info */}
        <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-mono font-bold text-gray-900">
                {coupon.code}
              </h3>
              <StatusBadge 
                status={coupon.is_active && !isExpired ? "active" : "inactive"} 
                size="sm" 
              />
            </div>
            {coupon.description && (
              <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {isExpired && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                  Expired
                </span>
              )}
              {isNotYetValid && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  Not Yet Valid
                </span>
              )}
              {coupon.max_uses && coupon.current_uses >= coupon.max_uses && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  Max Uses Reached
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Discount Information */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Discount Information
          </h4>
          <div className="space-y-2">
            <InfoRow
              icon={TrendingUp}
              label="Discount Type"
              value={
                <span className="capitalize font-medium">
                  {coupon.discount_type}
                </span>
              }
            />
            <InfoRow
              icon={DollarSign}
              label="Discount Value"
              value={
                <span className="font-semibold text-emerald-600 text-base">
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}% off`
                    : `₹${parseFloat(coupon.discount_value).toFixed(2)} off`}
                </span>
              }
            />
            {coupon.min_purchase_amount && (
              <InfoRow
                icon={ShoppingCart}
                label="Minimum Purchase Amount"
                value={`₹${parseFloat(coupon.min_purchase_amount).toFixed(2)}`}
              />
            )}
            {coupon.max_discount_amount && coupon.discount_type === "percentage" && (
              <InfoRow
                icon={AlertCircle}
                label="Maximum Discount Amount"
                value={`₹${parseFloat(coupon.max_discount_amount).toFixed(2)}`}
              />
            )}
          </div>
        </div>

        {/* Validity Period */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Validity Period
          </h4>
          <div className="space-y-2">
            <InfoRow
              icon={Calendar}
              label="Valid From"
              value={new Date(coupon.valid_from).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <InfoRow
              icon={Calendar}
              label="Valid Until"
              value={
                <span className={isExpired ? "text-red-600 font-medium" : ""}>
                  {new Date(coupon.valid_until).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {isExpired && " (Expired)"}
                </span>
              }
            />
          </div>
        </div>

        {/* Usage Statistics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Usage Statistics
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Uses</span>
              <span className="font-semibold text-gray-900">
                {coupon.current_uses} {coupon.max_uses ? `/ ${coupon.max_uses}` : "/ Unlimited"}
              </span>
            </div>
            {coupon.max_uses && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Usage Progress</span>
                  <span>{usagePercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercentage >= 100
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
            {!coupon.max_uses && (
              <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-3">
                <strong>Note:</strong> This coupon has no usage limit.
              </div>
            )}
          </div>
        </div>      
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
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
import { Eye, Edit2, Trash2, Tag } from "lucide-react";
import type { Coupon } from "../coupon.types";

interface CouponTableProps {
  coupons: Coupon[];
  onView: (coupon: Coupon) => void;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon) => void;
}

export default function CouponTable({ coupons, onView, onEdit, onDelete, onToggleStatus }: CouponTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}%`;
    } else {
      return `₹${coupon.discount_value}`;
    }
  };

  const getUsageDisplay = (coupon: Coupon) => {
    if (!coupon.max_uses) {
      return `${coupon.current_uses} / ∞`;
    }
    return `${coupon.current_uses} / ${coupon.max_uses}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto divide-y divide-gray-100 min-w-max">
        <thead
          style={{
            background: "#f8f9fb",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
              Code
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
              Discount
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
              Usage
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
              Valid From
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
              Valid Until
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 font-mono">{coupon.code}</span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm font-medium" style={{ color: "#4fcfa5" }}>
                  {getDiscountDisplay(coupon)}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{getUsageDisplay(coupon)}</span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{formatDate(coupon.valid_from)}</span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{formatDate(coupon.valid_until)}</span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <button
                  onClick={() => onToggleStatus(coupon)}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
                  style={
                    coupon.is_active
                      ? {
                        background: "rgba(79, 207, 165, 0.12)",
                        color: "#16a34a",
                        boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.05), inset -1px -1px 2px rgba(255,255,255,0.5)",
                      }
                      : {
                        background: "rgba(0,0,0,0.05)",
                        color: "#6b7280",
                        boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.05), inset -1px -1px 2px rgba(255,255,255,0.5)",
                      }
                  }
                  title={`Click to ${coupon.is_active ? "deactivate" : "activate"}`}
                >
                  {coupon.is_active ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(coupon)}
                    className="p-1.5 rounded-lg transition-all duration-200"
                    title="View coupon"
                    style={{ color: "#6b96ff" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(107, 150, 255, 0.08)";
                      e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
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
                      e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
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
                      e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

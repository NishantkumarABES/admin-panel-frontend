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
      return `${coupon.current_uses} / Unlimited`;
    }
    return `${coupon.current_uses} / ${coupon.max_uses}`;
  };
  // console.log(coupons);
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Discount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valid From
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valid Until
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">

          {coupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{coupon.code}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-emerald-600">
                  {getDiscountDisplay(coupon)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{getUsageDisplay(coupon)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{formatDate(coupon.valid_from)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{formatDate(coupon.valid_until)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onToggleStatus(coupon)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${coupon.is_active
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  title={`Click to ${coupon.is_active ? "deactivate" : "activate"}`}
                >
                  {coupon.is_active ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(coupon)}
                    className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                    title="View coupon"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(coupon)}
                    className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                    title="Edit coupon"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(coupon)}
                    className="text-red-600 hover:text-red-900 transition-colors p-1"
                    title="Delete coupon"
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

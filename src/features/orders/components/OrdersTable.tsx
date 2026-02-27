import { Eye, RefreshCw } from "lucide-react";
import type { Order } from "../order.types";
import OrderStatusBadge from "./OrderStatusBadge";
import { PAYMENT_METHOD_LABELS } from "../order.types";

interface OrdersTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onUpdateStatus: (order: Order) => void;
}

export default function OrdersTable({ orders, onView, onUpdateStatus }: OrdersTableProps) {
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
                Order Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Address
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                {/* Customer */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[180px]">{order.user.email}</div>
                  </div>
                </td>

                {/* Order Date */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(order.created_at)}
                </td>

                {/* Status */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <OrderStatusBadge status={order.status} size="sm" />
                </td>

                {/* Payment */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {order.payment_method}
                </td>

                {/* Amount */}
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(order.total_amount)}
                </td>

                {/* Items */}
                <td className="px-4 py-4 text-sm text-gray-900">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </td>

                {/* Address */}
                <td className="px-4 py-4 text-sm text-gray-600">
                  <div className="max-w-[160px] truncate">
                    {order.address.address_line}, {order.address.city}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(order)}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      title="View details"
                      style={{ color: "#6b96ff" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(107, 150, 255, 0.08)";
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
                      onClick={() => onUpdateStatus(order)}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      title="Update status"
                      style={{ color: "#f59e0b" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(245, 158, 11, 0.08)";
                        e.currentTarget.style.boxShadow =
                          "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
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

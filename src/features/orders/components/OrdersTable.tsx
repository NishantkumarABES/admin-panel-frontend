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
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              {/* Customer */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                  <div className="text-sm text-gray-500 truncate">{order.user.email}</div>
                </div>
              </td>

              {/* Order Date */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatDate(order.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <OrderStatusBadge status={order.status} size="sm" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                {PAYMENT_METHOD_LABELS[order.payment_method]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCurrency(order.total_amount)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <div className="max-w-xs truncate">
                  {order.address.address_line}, {order.address.city}
                </div>
              </td>

              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(order)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdateStatus(order)}
                    className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                    title="Update status"
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
  );
}


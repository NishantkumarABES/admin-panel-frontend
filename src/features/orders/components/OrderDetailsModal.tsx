import { X, User, MapPin, Package, CreditCard, Clock, FileText } from "lucide-react";
import type { Order } from "../order.types";
import OrderStatusBadge from "./OrderStatusBadge";
import { PAYMENT_METHOD_LABELS } from "../order.types";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-500 mt-1">Order ID: {order.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto flex-1">
            <div className="space-y-6">
              {/* Status & Date */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Order Date</div>
                  <div className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">Customer Information</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900">{order.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">{order.user.email}</span>
                  </div>
                  {order.user.phone && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm font-medium text-gray-900">{order.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900">{order.address.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{order.address.phone}</div>
                  <div className="text-sm text-gray-600 mt-2">
                    {order.address.address_line}<br />
                    {order.address.city}, {order.address.state} {order.address.postal_code}<br />
                    {order.address.country}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">Order Items</h3>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.product.image_url && (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded border border-gray-200"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                                {item.product.sku && (
                                  <div className="text-xs text-gray-500">SKU: {item.product.sku}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">
                            {formatCurrency(item.final_price / item.quantity)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            {formatCurrency(item.final_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Breakdown */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatCurrency(order.subtotal || 0)}</span>
                  </div>
                  {order.discount && order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600">-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  {order.shipping_charge && order.shipping_charge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-900">{formatCurrency(order.shipping_charge)}</span>
                    </div>
                  )}
                  {order.tax && order.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (GST):</span>
                      <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-lg text-gray-900">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">Payment Information</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {PAYMENT_METHOD_LABELS[order.payment_method]}
                    </span>
                  </div>
                  {order.payment_reference && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Transaction ID:</span>
                      <span className="text-sm font-mono text-gray-900">{order.payment_reference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              {order.timeline && order.timeline.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Order Timeline</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {order.timeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <OrderStatusBadge status={event.status} size="sm" />
                              <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
                            </div>
                            {event.note && (
                              <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Notes</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

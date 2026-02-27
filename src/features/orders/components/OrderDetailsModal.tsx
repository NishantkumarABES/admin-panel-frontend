import { User, MapPin, Package, CreditCard, Clock, FileText } from "lucide-react";
import type { Order } from "../order.types";
import OrderStatusBadge from "./OrderStatusBadge";
// import { PAYMENT_METHOD_LABELS } from "../order.types";
import productPlaceholder from "../../../assets/placeholders/product.png";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCurrency = (amount?: number | null) => {
    const safeAmount = Number(amount) || 0;
    return `₹${safeAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const calculateUnitPrice = (item: {
    base_price: number;
    discount_percentage: number;
    tax_percentage: number;
  }) => {
    const basePrice = Number(item.base_price) || 0;
    const discountAmount = (basePrice * (Number(item.discount_percentage) || 0)) / 100;
    const priceAfterDiscount = basePrice - discountAmount;
    const taxAmount = (priceAfterDiscount * (Number(item.tax_percentage) || 0)) / 100;
    return priceAfterDiscount + taxAmount;
  };

  const insetPanelStyle = {
    background: "#f8f9fb",
    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-[18px] w-full max-w-2xl max-h-[90vh] flex flex-col"
          style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Header */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
              <p className="text-xs text-gray-500 mt-0.5">ID: {order.id}</p>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 px-6 py-4">
            <div className="space-y-5">
              {/* Status & Date */}
              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={insetPanelStyle}
              >
                <div>
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Order Date</div>
                  <div className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">Customer Information</h3>
                </div>
                <div className="rounded-xl p-4 space-y-2" style={insetPanelStyle}>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Name</span>
                    <span className="text-sm font-medium text-gray-900">{order.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-900">{order.user.email}</span>
                  </div>
                  {order.user.phone && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Phone</span>
                      <span className="text-sm font-medium text-gray-900">{order.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">Delivery Address</h3>
                </div>
                <div className="rounded-xl p-4" style={insetPanelStyle}>
                  <div className="text-sm font-medium text-gray-900">{order.address.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{order.address.phone}</div>
                  <div className="text-xs text-gray-600 mt-2">
                    {order.address.address_line}
                    <br />
                    {order.address.city}, {order.address.state} {order.address.postal_code}
                    <br />
                    {order.address.country}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">Order Items</h3>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Unit Price is calculated after applying discount and tax on the base price.
                </p>
                <div
                  className="rounded-xl overflow-hidden overflow-x-auto"
                  style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <table className="w-full">
                    <thead
                      style={{
                        background: "#f8f9fb",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Base</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Disc</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Tax</th>
                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Unit</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Qty</th>
                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={item.product.image_url || productPlaceholder}
                                alt={item.product.name}
                                className="w-8 h-8 object-cover rounded-lg shrink-0"
                                style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                              />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 break-words">{item.product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right text-sm text-gray-900 whitespace-nowrap">
                            {formatCurrency(item.base_price)}
                          </td>
                          <td className="px-3 py-3 text-center text-sm whitespace-nowrap">
                            {item.discount_percentage > 0 ? (
                              <span className="text-emerald-600 font-medium">-{item.discount_percentage}%</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center text-sm whitespace-nowrap">
                            {item.tax_percentage > 0 ? (
                              <span className="text-red-500">+{item.tax_percentage}%</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right text-sm text-gray-900 whitespace-nowrap">
                            {formatCurrency(calculateUnitPrice(item))}
                          </td>
                          <td className="px-3 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-3 py-3 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                            {formatCurrency(item.final_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Price Breakdown</h3>
                <div className="rounded-xl p-4 space-y-2" style={insetPanelStyle}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(order.subtotal_amount || 0)}</span>
                  </div>
                  {order.shipping_charge && order.shipping_charge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-gray-900">{formatCurrency(order.shipping_charge)}</span>
                    </div>
                  )}
                  {order.coupon_code && (
                    <div
                      className="pt-2 mt-1 space-y-2"
                      style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Coupon Applied</span>
                        <span className="text-gray-900 font-medium">
                          {order.coupon_code}
                          {order.coupon_type && order.coupon_value && (
                            <span
                              className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ background: "rgba(79, 207, 165, 0.12)", color: "#2d9e7a" }}
                            >
                              {order.coupon_type === "percentage"
                                ? `${order.coupon_value}% OFF`
                                : `₹${order.coupon_value} OFF`}
                            </span>
                          )}
                        </span>
                      </div>
                      {order.coupon_discount != null && order.coupon_discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Coupon Discount</span>
                          <span style={{ color: "#4fcfa5" }} className="font-medium">
                            -{formatCurrency(order.coupon_discount)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className="flex justify-between pt-2 mt-1"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">Payment Information</h3>
                </div>
                <div className="rounded-xl p-4 space-y-2" style={insetPanelStyle}>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Payment Method</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.payment_method}
                    </span>
                  </div>
                  {order.payment_reference && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Transaction ID</span>
                      <span className="text-sm font-mono text-gray-900">{order.payment_reference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              {order.timeline && order.timeline.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Order Timeline</h3>
                  </div>
                  <div className="rounded-xl p-4" style={insetPanelStyle}>
                    <div className="space-y-3">
                      {order.timeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div
                            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                            style={{ background: "#6b96ff" }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <OrderStatusBadge status={event.status} size="sm" />
                              <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
                            </div>
                            {event.note && (
                              <p className="text-xs text-gray-600 mt-1">{event.note}</p>
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
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                  </div>
                  <div className="rounded-xl p-4" style={insetPanelStyle}>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            <div className="text-xs text-gray-400">Order ID: {order.id}</div>
            <button
              onClick={onClose}
              className="clay-btn"
              style={{ fontSize: "13px", padding: "6px 18px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

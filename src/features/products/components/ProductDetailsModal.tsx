import { useState, useEffect } from "react";
import { Package, Tag, DollarSign, FileText, Box, Ticket } from "lucide-react"; // pill
import type { Product } from "../product.types";
import type { Coupon } from "../coupon.types";
import Modal from "../../../components/common/Modal";
import StatusBadge from "../../../components/common/StatusBadge";
import * as couponService from "../../../services/coupon.service";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product, isOpen, onClose,
}: ProductDetailsModalProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  // Fetch coupons for this product
  useEffect(() => {
    if (product && isOpen) {
      fetchProductCoupons();
    }
  }, [product, isOpen]);

  const fetchProductCoupons = async () => {
    if (!product) return;
    try {
      setCouponsLoading(true);
      const response = await couponService.getCouponsByProductId(product.id);
      setCoupons(response.data);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      setCoupons([]);
    } finally {
      setCouponsLoading(false);
    }
  };

  if (!product) return null;
  // const BackendBaseURL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8000';
  const InfoRow = ({
    icon: Icon, label, value,
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

  const calculateTotalPrice = () => {
    const basePrice = Number(product?.price) || 0;
    const discountPercentage = Number(product?.discount_percentage) || 0;
    const taxPercentage = Number(product?.tax_percentage) || 0;
    const discountAmount = (basePrice * discountPercentage) / 100;
    const priceAfterDiscount = basePrice - discountAmount;
    const taxAmount = (priceAfterDiscount * taxPercentage) / 100;
    return (priceAfterDiscount + taxAmount).toFixed(2);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" size="lg">
      <div className="space-y-6">
        {/* Header with Product Info */}
        <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{product.category}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={product.is_active ? "active" : "inactive"} size="sm" />
              {product.stock_quantity === 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Product Information
          </h4>
          <div className="space-y-2">
            <InfoRow icon={Tag} label="SKU" value={product.sku} />
            <InfoRow icon={Package} label="Category" value={product.category} />
            <InfoRow 
              icon={FileText} 
              label="Description" 
              value={product.description || "No description available"} 
            />
          </div>
        </div>

        {/* Pricing Information */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Pricing Information
          </h4>
          <div className="space-y-2">
            <InfoRow
              icon={DollarSign}
              label="Base Price"
              value={`₹${parseFloat(product.price).toFixed(2)}`}
            />
            {parseFloat(product.discount_percentage) > 0 && (
              <InfoRow
                icon={DollarSign}
                label="Discount"
                value={
                  <span className="font-medium text-emerald-600">
                    {product.discount_percentage}% off
                  </span>
                }
              />
            )}
            <InfoRow
              icon={DollarSign}
              label="Tax Percentage"
              value={`${product.tax_percentage}%`}
            />
            <InfoRow
              icon={DollarSign}
              label="Total Price (incl. discount & tax)"
              value={
                <span className="font-semibold text-emerald-600">
                  ₹{calculateTotalPrice()}
                </span>
              }
            />
          </div>
        </div>

        {/* Pricing with Coupons */}
        {coupons.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Price Breakdown with Available Coupons
            </h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-gray-900">Original Price</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ₹{parseFloat(product.price).toFixed(2)}
                    </td>
                  </tr>
                  {coupons
                    .filter((coupon) => coupon.is_active)
                    .map((coupon) => {
                      const basePrice = parseFloat(product.price);
                      let discountAmount = 0;

                      if (coupon.discount_type === "percentage") {
                        discountAmount = (basePrice * parseFloat(coupon.discount_value)) / 100;
                        if (coupon.max_discount_amount) {
                          discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount_amount));
                        }
                      } else {
                        discountAmount = parseFloat(coupon.discount_value);
                      }

                      const finalPrice = Math.max(0, basePrice - discountAmount);

                      return (
                        <tr key={coupon.id} className="bg-emerald-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                {coupon.code}
                              </span>
                              <span className="text-gray-600 text-xs">
                                ({coupon.discount_type === "percentage"
                                  ? `${coupon.discount_value}%`
                                  : `₹${parseFloat(coupon.discount_value).toFixed(2)}`} off)
                              </span>
                            </div>
                            {coupon.min_purchase_amount && parseFloat(coupon.min_purchase_amount) > basePrice && (
                              <div className="text-xs text-amber-600 mt-1">
                                Min. purchase: ₹{parseFloat(coupon.min_purchase_amount).toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-gray-500 line-through text-xs">
                                ₹{basePrice.toFixed(2)}
                              </span>
                              <span className="font-semibold text-emerald-600">
                                ₹{finalPrice.toFixed(2)}
                              </span>
                              <span className="text-xs text-emerald-600">
                                Save ₹{discountAmount.toFixed(2)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-3">
              <strong>Note:</strong> Tax ({product.tax_percentage}%) will be applied after coupon discount.
            </div>
          </div>
        )}

        {/* Stock & Requirements */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Stock & Requirements
          </h4>
          <div className="space-y-2">
            <InfoRow
              icon={Box}
              label="Stock Quantity"
              value={
                <span className={`font-medium ${
                  product.stock_quantity === 0
                    ? "text-red-600"
                    : product.stock_quantity < 50
                      ? "text-amber-600"
                      : "text-gray-900"
                }`}>
                  {product.stock_quantity} units
                </span>
              }
            />
          </div>
        </div>

        {/* Product Images */}
        {product.images && product.images.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Product Images
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((image) => (
                <div key={image.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={image.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Coupons */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Product Coupons
          </h4>
          {couponsLoading ? (
            <div className="text-sm text-gray-600 py-4">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="text-sm text-gray-600 py-4 text-center border border-gray-200 rounded-lg bg-gray-50">
              No coupons available for this product
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-sm">
                          {coupon.code}
                        </span>
                        {coupon.is_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-900 font-medium">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}% off`
                          : `₹${parseFloat(coupon.discount_value).toFixed(2)} off`}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <span className="font-medium">Valid:</span> {new Date(coupon.valid_from).toLocaleDateString()} - {new Date(coupon.valid_until).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Uses:</span> {coupon.current_uses}/{coupon.max_uses || "∞"}
                    </div>
                    {coupon.min_purchase_amount && (
                      <div className="col-span-2">
                        <span className="font-medium">Min Purchase:</span> ₹{parseFloat(coupon.min_purchase_amount).toFixed(2)}
                      </div>
                    )}
                    {coupon.max_discount_amount && (
                      <div className="col-span-2">
                        <span className="font-medium">Max Discount:</span> ₹{parseFloat(coupon.max_discount_amount).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
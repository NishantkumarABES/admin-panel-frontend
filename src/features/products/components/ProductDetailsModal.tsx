import { Package, Tag, IndianRupee, FileText, Box } from "lucide-react";
import type { Product } from "../product.types";
import StatusBadge from "../../../components/common/StatusBadge";
import productPlaceholder from "../../../assets/placeholders/product.png";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product, isOpen, onClose,
}: ProductDetailsModalProps) {
  if (!isOpen || !product) return null;

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
            <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 px-6 py-4">
            {/* Header: image + name + status */}
            <div className="flex items-start justify-between gap-4 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3">
                <img
                  src={product.images?.[0]?.image || productPlaceholder}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={product.is_active ? "active" : "inactive"} size="sm" />
                {product.stock_quantity === 0 && (
                  <StatusBadge status="outofstock" size="sm" />
                )}
              </div>
            </div>

            {/* Content Grid — Inset Panel */}
            <div
              className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 px-3 rounded-xl my-3"
              style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
              }}
            >
              <InfoItem icon={Package} label="Category" value={product.category} />
              <InfoItem
                icon={Box}
                label="Stock Quantity"
                value={
                  <span className={`font-medium ${product.stock_quantity === 0
                    ? "text-red-600"
                    : product.stock_quantity < 50
                      ? "text-amber-600"
                      : "text-gray-900"
                    }`}>
                    {product.stock_quantity} units
                  </span>
                }
              />

              <InfoItem
                icon={IndianRupee}
                label="Base Price"
                value={`₹${parseFloat(product.price).toFixed(2)}`}
              />
              <InfoItem
                icon={IndianRupee}
                label="Unit Price (after discount & tax)"
                value={
                  <span className="font-semibold" style={{ color: "#4fcfa5" }}>
                    ₹{calculateTotalPrice()}
                  </span>
                }
              />
              {parseFloat(product.discount_percentage) > 0 && (
                <InfoItem
                  icon={Tag}
                  label="Discount"
                  value={
                    <span className="font-medium text-emerald-600">
                      {product.discount_percentage}% off
                    </span>
                  }
                />
              )}
              <InfoItem
                icon={IndianRupee}
                label="Tax Percentage"
                value={
                  <span className="font-medium text-red-500">
                    {product.tax_percentage}%
                  </span>
                }
              />

              {product.description && (
                <div className="col-span-2 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Description</div>
                    <div className="text-sm text-gray-900">{product.description}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Images */}
            {product.images && product.images.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "12px" }}>
                <div className="text-xs text-gray-500 mb-2">Product Images</div>
                <div className="grid grid-cols-3 gap-2">
                  {product.images.map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square rounded-lg overflow-hidden"
                      style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}
                    >
                      <img src={image.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            <div className="text-xs text-gray-500">
              Product ID: {product.id}
            </div>
            <button
              onClick={onClose}
              className="clay-btn"
              style={{ fontSize: "13px", padding: "6px 16px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
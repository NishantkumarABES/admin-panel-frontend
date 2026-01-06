import { Package, Tag, DollarSign, FileText, Pill, Box } from "lucide-react";
import type { Product } from "../product.types";
import Modal from "../../../components/common/Modal";
import StatusBadge from "../../../components/common/StatusBadge";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
}: ProductDetailsModalProps) {
  if (!product) return null;

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

  const calculateTotalPrice = () => {
    const basePrice = parseFloat(product.price);
    const taxAmount = (basePrice * parseFloat(product.tax_percentage)) / 100;
    return (basePrice + taxAmount).toFixed(2);
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
            <p className="text-sm text-gray-600 mb-3">{product.category_name}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={product.is_active ? "active" : "inactive"} size="sm" />
              {product.is_prescription_required && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Prescription Required
                </span>
              )}
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
            <InfoRow icon={Package} label="Category" value={product.category_name} />
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
            <InfoRow 
              icon={DollarSign} 
              label="Tax Percentage" 
              value={`${product.tax_percentage}%`} 
            />
            <InfoRow 
              icon={DollarSign} 
              label="Total Price (incl. tax)" 
              value={
                <span className="font-semibold text-emerald-600">
                  ₹{calculateTotalPrice()}
                </span>
              }
            />
          </div>
        </div>

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
            <InfoRow 
              icon={Pill} 
              label="Prescription Required" 
              value={product.is_prescription_required ? "Yes" : "No"} 
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
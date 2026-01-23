import { Package, Tag, IndianRupee, FileText, Box } from "lucide-react"; // pill
import type { Product } from "../product.types";
import Modal from "../../../components/common/Modal";
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
      <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
        <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
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
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" size="lg">
      <div className="space-y-4">
        {/* Header with Product Info */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500">Product ID: {product.id}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={product.is_active ? "active" : "inactive"} size="sm" />
            {product.stock_quantity === 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Product Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Product Information
              </h4>
              <div>
                <InfoRow icon={Tag} label="SKU" value={product.sku} />
                <InfoRow icon={Package} label="Category" value={product.category} />
                <InfoRow
                  icon={FileText}
                  label="Description"
                  value={product.description || "No description available"}
                />
              </div>
            </div>

            {/* Stock & Requirements */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Stock & Requirements
              </h4>
              <div>
                <InfoRow
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
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Pricing Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Pricing Information
              </h4>
              <div>
                <InfoRow
                  icon={IndianRupee}
                  label="Base Price"
                  value={`₹${parseFloat(product.price).toFixed(2)}`}
                />
                {parseFloat(product.discount_percentage) > 0 && (
                  <InfoRow
                    icon={IndianRupee}
                    label="Discount"
                    value={
                      <span className="font-medium text-emerald-600">
                        {product.discount_percentage}% off
                      </span>
                    }
                  />
                )}
                <InfoRow
                  icon={IndianRupee}
                  label="Tax Percentage"
                  value={`${product.tax_percentage}%`}
                />
                <InfoRow
                  icon={IndianRupee}
                  label="Total Price (incl. discount & tax)"
                  value={
                    <span className="font-semibold text-emerald-600">
                      ₹{calculateTotalPrice()}
                    </span>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Images - Full Width */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Product Images
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {product.images && product.images.length > 0 ? (
              product.images.map((image) => (
                <div key={image.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={image.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={productPlaceholder}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
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
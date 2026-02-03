import { Eye, Edit } from "lucide-react";
import type { Product } from "../product.types";
import StatusBadge from "../../../components/common/StatusBadge";
import productPlaceholder from "../../../assets/placeholders/product.png";

interface ProductTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  // onDelete: (product: Product) => void;
}

export default function ProductTable({
  products, onView, onEdit,
}: ProductTableProps) {
  // const BackendBaseURL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8000';
  // console.log(BackendBaseURL);
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  const calculateTotalPrice = (product: Product) => {
    const basePrice = Number(product?.price) || 0;
    const discountPercentage = Number(product?.discount_percentage) || 0;
    const taxPercentage = Number(product?.tax_percentage) || 0;
    const discountAmount = (basePrice * discountPercentage) / 100;
    const priceAfterDiscount = basePrice - discountAmount;
    const taxAmount = (priceAfterDiscount * taxPercentage) / 100;
    return (priceAfterDiscount + taxAmount).toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-w-0">
      <div className="overflow-x-auto min-w-0">
        <table className="w-full table-auto divide-y divide-gray-200 min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-115">
                Product Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Brand
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Base Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Unit Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0]?.image || productPlaceholder}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-xs text-gray-500 max-w-xs truncate">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                {/* <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">
                    {product.sku}
                  </div>
                </td> */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {product.category}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">
                    {product.brand || "-"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{parseFloat(product.price).toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1">
                    {(
                      <div className="text-xs text-emerald-600">
                        -{product.discount_percentage}% off
                      </div>
                    )}
                    <div className="text-xs text-red-500">
                      +{product.tax_percentage}% tax
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{calculateTotalPrice(product)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${product.stock_quantity === 0
                    ? "text-red-600"
                    : product.stock_quantity < 50
                      ? "text-amber-600"
                      : "text-gray-900"
                    }`}>
                    {product.stock_quantity} units
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={product.stock_quantity > 0 ? "instock" : "outofstock"} size="sm" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(product)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
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
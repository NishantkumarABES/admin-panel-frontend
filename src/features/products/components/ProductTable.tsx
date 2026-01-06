import { Eye, Edit } from "lucide-react";
import type { Product } from "../product.types";
import StatusBadge from "../../../components/common/StatusBadge";

interface ProductTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  // onDelete: (product: Product) => void;
}

export default function ProductTable({
  products,
  onView,
  onEdit,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-w-0">
      <div className="overflow-x-auto min-w-0">
        <table className="w-full table-auto divide-y divide-gray-200 min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Product Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Prescription
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
                  <div className="flex items-center">
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
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">
                    {product.sku}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {product.category_name}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{parseFloat(product.price).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    +{product.tax_percentage}% tax
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    product.stock_quantity === 0 
                      ? "text-red-600" 
                      : product.stock_quantity < 50 
                        ? "text-amber-600" 
                        : "text-gray-900"
                  }`}>
                    {product.stock_quantity} units
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {product.is_prescription_required ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Rx Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      No Rx
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={product.is_active ? "active" : "inactive"} size="sm" />
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
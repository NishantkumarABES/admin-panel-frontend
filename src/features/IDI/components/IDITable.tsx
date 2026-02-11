import { Eye, Pencil } from "lucide-react"; // Trash2 is imported but not used
import type { IDI } from "../idi.types";
import StatusBadge from "../../../components/common/StatusBadge";

interface IDITableProps {
  IDIList: IDI[];
  onView: (IDI: IDI) => void;
  onEdit: (IDI: IDI) => void;
  onDelete: (IDI: IDI) => void;
}

export default function IDITable({
  IDIList, onView, onEdit,
  // onDelete, 
}: IDITableProps) {
  if (IDIList.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No drugs found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drug Name (Generic)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drug Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Therapeutic Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {IDIList.map((IDI, index) => (
              <tr key={IDI.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    <div className="font-medium">{IDI.drugNameGeneric}</div>
                    <div className="text-xs text-gray-500">
                      {(() => {
                        const brands = IDI.brandsInIndia.split(',').map(b => b.trim()).filter(Boolean);
                        const displayBrands = brands.slice(0, 2).join(', ');
                        return brands.length > 2 ? `${displayBrands}...` : displayBrands;
                      })()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {IDI.drugClass}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {IDI.therapeuticCategory}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={IDI.status} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(IDI.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(IDI)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(IDI)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {/* <button
                      onClick={() => onDelete(IDI)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button> */}
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

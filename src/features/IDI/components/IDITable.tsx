import { Eye, Pencil, Pill } from "lucide-react";
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
}: IDITableProps) {
  if (IDIList.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">No drugs found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden min-w-0">
      <div className="overflow-x-auto">
        <table className="w-full table-auto divide-y divide-gray-100 min-w-max">
          <thead
            style={{
              background: "#f8f9fb",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                S.No
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-64">
                Drug Name (Generic)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Drug Class
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Therapeutic Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Last Updated
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {IDIList.map((IDI, index) => (
              <tr key={IDI.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(107,150,255,0.15) 0%, rgba(162,133,255,0.15) 100%)",
                        boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.05), inset -2px -2px 4px rgba(255,255,255,0.6)",
                      }}
                    >
                      <Pill className="w-4 h-4" style={{ color: "#6b96ff" }} />
                    </div>
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
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  {IDI.drugClass}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  {IDI.therapeuticCategory}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={IDI.status} size="sm" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(IDI.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(IDI)}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      title="View"
                      style={{ color: "#6b96ff" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(107, 150, 255, 0.08)";
                        e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(IDI)}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      title="Edit"
                      style={{ color: "#6b7280" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.04)";
                        e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Pencil className="w-4 h-4" />
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

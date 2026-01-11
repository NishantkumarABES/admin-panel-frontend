import { Eye, Edit, Trash2 } from "lucide-react";
import type { AdvisoryMember } from "../advisory.types";
import StatusBadge from "../../../components/common/StatusBadge";

interface AdvisoryTableProps {
  members: AdvisoryMember[];
  onView: (member: AdvisoryMember) => void;
  onEdit: (member: AdvisoryMember) => void;
  onDelete: (member: AdvisoryMember) => void;
}

export default function AdvisoryTable({
  members,
  onView,
  onEdit,
  onDelete,
}: AdvisoryTableProps) {
  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No advisory members found</p>
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
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Specialization
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Experience
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Contact Details
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
            {members.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {member && (
                      <img
                        src={
                          member.image
                            ? member.image
                            : member.gender === "male"
                              ? "/src/assets/placeholders/male_doctor.jpg"
                              : "/src/assets/placeholders/female_doctor.jpg"
                        }
                        alt={member.full_name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="text-sm font-medium text-gray-900">
                      {member.full_name}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 wrap-break-words">
                  <div className="text-sm text-gray-900">
                    {member.specialization}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.years_of_experience} years
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.phone}
                  <div className="text-sm text-gray-500">{member.email}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={member.status} size="sm" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(member)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(member)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      title="Edit Member"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(member)}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
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

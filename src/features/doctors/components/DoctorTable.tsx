import { Eye, Edit, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { DoctorUser } from "../doctor.types";
import StatusBadge from "../../../components/common/StatusBadge";
import maleDoctorPlaceholder from "../../../assets/placeholders/male_doctor.jpg";
import femaleDoctorPlaceholder from "../../../assets/placeholders/female_doctor.jpg";

type SortDirection = "asc" | "desc" | null;
type DoctorSortField = "full_name" | "specialization" | "license_number" | "years_of_experience" | "phone" | "is_active";

interface DoctorTableProps {
  doctors: DoctorUser[];
  onView: (doctor: DoctorUser) => void;
  onEdit: (doctor: DoctorUser) => void;
  onDelete: (doctor: DoctorUser) => void;
  sortField?: DoctorSortField | null;
  sortDirection?: SortDirection;
  onSort?: (field: DoctorSortField) => void;
}

export default function DoctorTable({
  doctors, onView, onEdit, sortField, sortDirection, onSort,
}: DoctorTableProps) {

  // Get sort icon for a field

  const getSortIcon = (field: DoctorSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="w-4 h-4 text-gray-900" />;
    }
    return <ArrowDown className="w-4 h-4 text-gray-900" />;
  };

  if (doctors.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No doctors found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-w-0">
      <div className="overflow-x-auto min-w-0">
        <table className="w-full table-auto divide-y divide-gray-200 min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => onSort?.("full_name")}
              >
                <div className="flex items-center gap-1">
                  Doctor's Name
                  {getSortIcon("full_name")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => onSort?.("specialization")}
              >
                <div className="flex items-center gap-1">
                  Speciality
                  {getSortIcon("specialization")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => onSort?.("license_number")}
              >
                <div className="flex items-center gap-1">
                  License Number
                  {getSortIcon("license_number")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => onSort?.("years_of_experience")}
              >
                <div className="flex items-center gap-1">
                  Yr of Experience
                  {getSortIcon("years_of_experience")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => onSort?.("phone")}
              >
                <div className="flex items-center gap-1">
                  Contact Details
                  {getSortIcon("phone")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => onSort?.("is_active")}
              >
                <div className="flex items-center gap-1">
                  Status
                  {getSortIcon("is_active")}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <tr
                key={doctor.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {doctor && (
                      <img
                        src={
                          doctor.doctor_profile?.profile_photo
                            ? doctor.doctor_profile.profile_photo
                            : doctor.gender?.toLowerCase() === "male"
                              ? maleDoctorPlaceholder
                              : femaleDoctorPlaceholder
                        }
                        alt={doctor.full_name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="text-sm font-medium text-gray-900">
                      Dr. {doctor.full_name}
                    </div>

                  </div>
                </td>
                <td className="px-4 py-4  wrap-break-words">
                  <div className="text-sm text-gray-900">
                    {doctor.doctor_profile?.specialization}
                  </div>
                </td>
                {/* <td className="px-4 py-4 max-w-xs">
                  <div className="text-sm text-gray-900 wrap-break-words">
                    <div>{doctor.clinic_address}</div>
                  </div>
                </td> */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {doctor.doctor_profile?.license_number}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {doctor.doctor_profile?.years_of_experience} years
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {doctor.phone}
                  <div className="text-sm text-gray-500">
                    {doctor.email}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={doctor.state} size="sm" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(doctor)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(doctor)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      title="Edit Doctor"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {/* <button
                      onClick={() => onDelete(doctor)}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Delete Doctor"
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

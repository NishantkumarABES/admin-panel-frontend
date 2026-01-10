import { Eye, Edit } from "lucide-react"; // Trash2
import type { DoctorUser } from "../doctor.types";
import StatusBadge from "../../../components/common/StatusBadge";

interface DoctorTableProps {
  doctors: DoctorUser[];
  onView: (doctor: DoctorUser) => void;
  onEdit: (doctor: DoctorUser) => void;
  onDelete: (doctor: DoctorUser) => void;
}

export default function DoctorTable({
  doctors, onView, onEdit, // onDelete is currently unused
}: DoctorTableProps) {
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Doctor's Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                speciality
              </th>
              {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Location
              </th> */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                License Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                yr of Experience
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
                          doctor.image
                            ? doctor.image
                            : doctor.gender === "male"
                              ? "/src/assets/placeholders/male_doctor.jpg"
                              : "/src/assets/placeholders/female_doctor.jpg"
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
                    {doctor.specialization}
                  </div>
                </td>
                {/* <td className="px-4 py-4 max-w-xs">
                  <div className="text-sm text-gray-900 wrap-break-words">
                    <div>{doctor.clinic_address}</div>
                  </div>
                </td> */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {doctor.license_number}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {doctor.years_of_experience} years
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {doctor.phone}
                  <div className="text-sm text-gray-500">
                    {doctor.email}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={doctor.is_active ? "active" : "inactive"} size="sm" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(doctor)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
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

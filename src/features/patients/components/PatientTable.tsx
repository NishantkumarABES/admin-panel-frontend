import { Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { PatientUser } from "../patient.types";
import { calculateAge } from "../../../utils/calculateAge";
import StatusBadge from "../../../components/common/StatusBadge";
import malePatientPlaceholder from "../../../assets/placeholders/male_patient.jpg";
import femalePatientPlaceholder from "../../../assets/placeholders/female_patient.jpg";

type SortDirection = "asc" | "desc" | null;
type PatientSortField = "full_name" | "email" | "phone" | "is_active";

interface PatientTableProps {
    patients: PatientUser[];
    onView: (patient: PatientUser) => void;
    sortField?: PatientSortField | null;
    sortDirection?: SortDirection;
    onSort?: (field: PatientSortField) => void;
}

export default function PatientTable({
    patients, onView, sortField, sortDirection, onSort,
}: PatientTableProps) {

    const getSortIcon = (field: PatientSortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        }
        if (sortDirection === "asc") {
            return <ArrowUp className="w-4 h-4 text-gray-900" />;
        }
        return <ArrowDown className="w-4 h-4 text-gray-900" />;
    };

    if (patients.length === 0) {
        return (
            <div className="clay-card" style={{ textAlign: "center", padding: "48px" }}>
                <p className="text-gray-500">No patients found</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden min-w-0">
            <div className="overflow-x-auto min-w-0">
                <table className="w-full table-auto divide-y divide-gray-100 min-w-max">
                    <thead
                        style={{
                            background: "#f8f9fb",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                    >
                        <tr>
                            <th
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => onSort?.("full_name")}
                            >
                                <div className="flex items-center gap-1">
                                    Full Name
                                    {getSortIcon("full_name")}
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => onSort?.("email")}
                            >
                                <div className="flex items-center gap-1">
                                    Email
                                    {getSortIcon("email")}
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => onSort?.("phone")}
                            >
                                <div className="flex items-center gap-1">
                                    Phone
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
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Gender
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Age
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Registration Date
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {patients.map((patient) => (
                            <tr
                                key={patient.id}
                                className="hover:bg-gray-50/60 transition-colors"
                            >
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        {patient && (
                                            <img
                                                src={
                                                    patient.image
                                                        ? patient.image
                                                        : patient.gender === "male"
                                                            ? malePatientPlaceholder
                                                            : femalePatientPlaceholder
                                                }
                                                alt={patient.full_name}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                        )}
                                        <div className="text-sm font-medium text-gray-900">
                                            {patient.full_name}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{patient.email}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{patient.phone}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <StatusBadge status={patient.state} size="sm" />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 capitalize">
                                        {patient.gender ?? "—"}
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {calculateAge(patient.date_of_birth) !== null
                                            ? `${calculateAge(patient.date_of_birth)} yrs`
                                            : "—"}
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {patient.created_at
                                            ? new Date(patient.created_at).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            : "—"}
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onView(patient)}
                                            className="p-1.5 rounded-lg transition-all duration-200"
                                            title="View Profile"
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

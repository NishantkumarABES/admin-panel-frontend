import type { DoctorStatus } from "../../features/doctors/doctor.types";
import type { TopicStatus } from "../../features/topics/topic.types";

interface StatusBadgeProps {
  status: DoctorStatus | TopicStatus | "active" | "inactive";
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const statusStyles = {
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    suspended: "bg-gray-50 text-gray-700 border-gray-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-amber-50 text-amber-700 border-amber-200",
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    scheduled: "bg-amber-50 text-amber-700 border-amber-200",
    draft: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const statusLabels = {
    verified: "Verified",
    pending: "Pending",
    rejected: "Rejected",
    suspended: "Suspended",
    active: "Active",
    inactive: "Inactive",
    published: "Published",
    scheduled: "Scheduled",
    draft: "Draft",
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full border
        ${sizeClasses[size]}
        ${statusStyles[status]}
      `}
    >
      {statusLabels[status]}
    </span>
  );
}

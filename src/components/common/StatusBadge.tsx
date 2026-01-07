
import type { TopicStatus } from "../../features/topics/topic.types";
import type { ProductStatus } from "../../features/products/product.types";

interface StatusBadgeProps {
  status: TopicStatus | ProductStatus | "active" | "inactive" | "draft";
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const statusStyles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-amber-50 text-amber-700 border-amber-200",
    instock: "bg-emerald-50 text-emerald-700 border-emerald-200",
    outofstock: "bg-amber-50 text-amber-700 border-amber-200",
    draft: "bg-gray-50 text-gray-700 border-gray-200",
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    unpublished: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const statusLabels = {
    instock: "In Stock",
    outofstock: "Out of Stock",
    active: "Active",
    inactive: "Inactive",
    published: "Published",
    unpublished: "Unpublished",
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

import type { OrderStatus } from "../order.types";
import { ORDER_STATUS_CONFIG } from "../order.types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md";
}

export default function OrderStatusBadge({ status, size = "md" }: OrderStatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const config = ORDER_STATUS_CONFIG[status];

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full border
        ${sizeClasses[size]}
        ${config.color}
        ${config.bgColor}
        ${config.borderColor}
      `}
    >
      {config.label}
    </span>
  );
}

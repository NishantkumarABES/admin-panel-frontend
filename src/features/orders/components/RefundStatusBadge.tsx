import type { RefundStatus } from "../order.types";
import { REFUND_STATUS_CONFIG } from "../order.types";

interface RefundStatusBadgeProps {
    status: RefundStatus;
    size?: "sm" | "md";
}

export default function RefundStatusBadge({ status, size = "md" }: RefundStatusBadgeProps) {
    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
    };

    const config = REFUND_STATUS_CONFIG[status];

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

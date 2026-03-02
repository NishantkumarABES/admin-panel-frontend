import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface DashboardMetricCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    iconBg: string;
    growth?: number;
    growthLabel?: string;
    linkTo?: string;
}

export default function DashboardMetricCard({
    title,
    value,
    icon,
    iconBg,
    growth,
    growthLabel = "from last month",
    linkTo,
}: DashboardMetricCardProps) {
    const isPositive = growth !== undefined && growth >= 0;
    const growthColor = isPositive ? "#4fcfa5" : "#ff7070";

    const content = (
        <div className="clay-card dash-metric-card h-full flex flex-col justify-between">
            <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
                <div
                    className="clay-circle"
                    style={{ background: iconBg, width: "40px", height: "40px" }}
                >
                    {icon}
                </div>
                {growth !== undefined && (
                    <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{
                            background: isPositive ? "rgba(79, 207, 165, 0.1)" : "rgba(255, 112, 112, 0.1)",
                            color: growthColor,
                        }}
                        title={`${isPositive ? "+" : ""}${growth.toFixed(1)}% ${growthLabel}`}
                    >
                        {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                        ) : (
                            <TrendingDown className="w-3 h-3" />
                        )}
                        {isPositive ? "+" : ""}
                        {growth.toFixed(1)}%
                    </div>
                )}
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900" style={{ marginBottom: "2px", letterSpacing: "-0.02em" }}>
                    {typeof value === "number" ? value.toLocaleString() : value}
                </div>
                <div className="text-xs font-medium" style={{ color: "#6b7280" }}>
                    {title}
                </div>
            </div>
        </div>
    );

    if (linkTo) {
        return (
            <Link to={linkTo} className="block" style={{ textDecoration: "none" }}>
                {content}
            </Link>
        );
    }

    return content;
}

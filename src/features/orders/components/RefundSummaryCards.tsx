import {
    RotateCcw, Clock, CheckCircle, XCircle, Zap, CheckCheck,
    IndianRupee, Percent
} from "lucide-react";
import type { RefundAnalytics } from "../order.types";

interface RefundSummaryCardsProps {
    analytics: RefundAnalytics | null;
    loading: boolean;
}

interface StatCard {
    label: string;
    value: number | string;
    icon: React.ComponentType<any>;
    iconColor: string;
    iconBg: string;
    valueStyle?: React.CSSProperties;
    isCurrency?: boolean;
    isPercentage?: boolean;
}

export default function RefundSummaryCards({ analytics, loading }: RefundSummaryCardsProps) {
    const cards: StatCard[] = [
        {
            label: "Total Requests",
            value: analytics?.total_refund_requests ?? 0,
            icon: RotateCcw,
            iconColor: "#6b96ff",
            iconBg: "rgba(107, 150, 255, 0.08)",
        },
        {
            label: "Pending Review",
            value: analytics?.pending_review ?? 0,
            icon: Clock,
            iconColor: "#ffc554",
            iconBg: "rgba(255, 197, 84, 0.08)",
            valueStyle: { color: "#ffc554" },
        },
        {
            label: "Approved",
            value: analytics?.approved ?? 0,
            icon: CheckCircle,
            iconColor: "#4fcfa5",
            iconBg: "rgba(79, 207, 165, 0.08)",
            valueStyle: { color: "#4fcfa5" },
        },
        {
            label: "Rejected",
            value: analytics?.rejected ?? 0,
            icon: XCircle,
            iconColor: "#ff7070",
            iconBg: "rgba(255, 112, 112, 0.08)",
            valueStyle: { color: "#ff7070" },
        },
        {
            label: "Processing",
            value: analytics?.processing ?? 0,
            icon: Zap,
            iconColor: "#a285ff",
            iconBg: "rgba(162, 133, 255, 0.08)",
            valueStyle: { color: "#a285ff" },
        },
        {
            label: "Completed",
            value: analytics?.completed ?? 0,
            icon: CheckCheck,
            iconColor: "#10b981",
            iconBg: "rgba(16, 185, 129, 0.08)",
            valueStyle: { color: "#10b981" },
        },
        {
            label: "Refund Amount",
            value: analytics?.total_refund_amount ?? 0,
            icon: IndianRupee,
            iconColor: "#ff7070",
            iconBg: "rgba(255, 112, 112, 0.08)",
            valueStyle: { color: "#ff7070" },
            isCurrency: true,
        },
        {
            label: "Refund Rate",
            value: analytics?.refund_rate_percentage ?? 0,
            icon: Percent,
            iconColor: "#8b95a3",
            iconBg: "rgba(139, 149, 163, 0.08)",
            valueStyle: { color: "#8b95a3" },
            isPercentage: true,
        },
    ];

    const formatCurrency = (value: number) =>
        `₹${value.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div key={card.label} className="clay-card min-w-0 h-30 flex flex-col justify-end" style={{ position: "relative" }}>
                        <div className="clay-circle" style={{ background: card.iconBg, position: "absolute", top: "12px", right: "12px" }}>
                            <Icon className="w-5 h-5" style={{ color: card.iconColor }} />
                        </div>
                        <div style={{ marginTop: "4px" }}>
                            {loading ? (
                                <div className="clay-skeleton" style={{ height: "32px", marginBottom: "6px", width: "60%" }} />
                            ) : (
                                <div
                                    className="text-2xl font-bold"
                                    style={{ ...(card.valueStyle ?? {}), marginBottom: "2px" }}
                                >
                                    {card.isCurrency
                                        ? formatCurrency(Number(card.value))
                                        : card.isPercentage
                                            ? `${Number(card.value).toFixed(1)}%`
                                            : Number(card.value).toLocaleString()}
                                </div>
                            )}
                            <span className="text-xs" style={{ color: "#111827" }}>{card.label}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

import {
    RotateCcw, Clock, CheckCircle, XCircle,
    IndianRupee
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
}

export default function RefundSummaryCards({ analytics, loading }: RefundSummaryCardsProps) {
    const cards: StatCard[] = [
        {
            label: "Total Requests",
            value: analytics?.total_refunds ?? 0,
            icon: RotateCcw,
            iconColor: "#6b96ff",
            iconBg: "rgba(107, 150, 255, 0.08)",
        },
        {
            label: "Pending Review",
            value: analytics?.pending_refunds ?? 0,
            icon: Clock,
            iconColor: "#ffc554",
            iconBg: "rgba(255, 197, 84, 0.08)",
            valueStyle: { color: "#ffc554" },
        },
        {
            label: "Approved",
            value: analytics?.approved_refunds ?? 0,
            icon: CheckCircle,
            iconColor: "#4fcfa5",
            iconBg: "rgba(79, 207, 165, 0.08)",
            valueStyle: { color: "#4fcfa5" },
        },
        {
            label: "Rejected",
            value: analytics?.rejected_refunds ?? 0,
            icon: XCircle,
            iconColor: "#ff7070",
            iconBg: "rgba(255, 112, 112, 0.08)",
            valueStyle: { color: "#ff7070" },
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
    ];

    const formatCurrency = (value: number) =>
        `₹${value.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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

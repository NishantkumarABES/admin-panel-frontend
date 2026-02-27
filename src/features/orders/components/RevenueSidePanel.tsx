import { IndianRupee, RotateCcw, DollarSign, TrendingUp } from "lucide-react";
import type { OrderAnalytics } from "../order.types";

interface RevenueSidePanelProps {
    analytics: OrderAnalytics | null;
    loading: boolean;
}

interface RevenueCard {
    label: string;
    value: number;
    icon: React.ComponentType<any>;
    iconColor: string;
    iconBg: string;
    valueStyle: React.CSSProperties;
}

export default function RevenueSidePanel({ analytics, loading }: RevenueSidePanelProps) {
    const totalRevenue = analytics?.total_revenue ?? 0;
    const refundAmount = analytics?.refund_amount ?? 0;
    const netRevenue = totalRevenue - refundAmount;
    const totalOrders = analytics?.total_orders ?? 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const cards: RevenueCard[] = [
        {
            label: "Total Revenue",
            value: totalRevenue,
            icon: IndianRupee,
            iconColor: "#4fcfa5",
            iconBg: "rgba(79, 207, 165, 0.08)",
            valueStyle: { color: "#4fcfa5" },
        },
        {
            label: "Refund Amount",
            value: refundAmount,
            icon: RotateCcw,
            iconColor: "#ff7070",
            iconBg: "rgba(255, 112, 112, 0.08)",
            valueStyle: { color: "#ff7070" },
        },
        {
            label: "Net Revenue",
            value: netRevenue,
            icon: DollarSign,
            iconColor: "#6b96ff",
            iconBg: "rgba(107, 150, 255, 0.08)",
            valueStyle: { color: "#6b96ff" },
        },
        {
            label: "Avg Order Value",
            value: avgOrderValue,
            icon: TrendingUp,
            iconColor: "#a285ff",
            iconBg: "rgba(162, 133, 255, 0.08)",
            valueStyle: { color: "#a285ff" },
        },
    ];

    const formatCurrency = (value: number) =>
        `₹${value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
                className="text-xs font-semibold uppercase"
                style={{ color: "#9ca3af", letterSpacing: "0.05em" }}
            >
                Revenue Panel
            </div>
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div key={card.label} className="clay-card min-w-0" style={{ position: "relative" }}>
                        <div
                            className="clay-circle"
                            style={{ background: card.iconBg, position: "absolute", top: "12px", right: "12px" }}
                        >
                            <Icon className="w-5 h-5" style={{ color: card.iconColor }} />
                        </div>
                        <div style={{ marginTop: "4px" }}>
                            {loading ? (
                                <div
                                    className="clay-skeleton"
                                    style={{ height: "28px", marginBottom: "6px", width: "70%" }}
                                />
                            ) : (
                                <div
                                    className="text-xl font-bold"
                                    style={{ ...card.valueStyle, marginBottom: "2px" }}
                                >
                                    {formatCurrency(card.value)}
                                </div>
                            )}
                            <span className="text-xs" style={{ color: "#111827" }}>
                                {card.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

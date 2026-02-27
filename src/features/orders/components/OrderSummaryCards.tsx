import { Package, Clock, Truck, CheckCircle, XCircle, CreditCard, RotateCcw } from "lucide-react";
import type { OrderAnalytics } from "../order.types";

interface OrderSummaryCardsProps {
  analytics: OrderAnalytics | null;
  loading: boolean;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  iconColor: string;
  iconBg: string;
  valueColor?: string;
  valueStyle?: React.CSSProperties;
}

export default function OrderSummaryCards({ analytics, loading }: OrderSummaryCardsProps) {

  const statusCards: StatCard[] = [
    {
      label: "Total Orders",
      value: analytics?.total_orders ?? 0,
      icon: Package,
      iconColor: "#6b96ff",
      iconBg: "rgba(107, 150, 255, 0.08)",
      valueColor: "text-gray-900",
    },
    {
      label: "Paid",
      value: analytics?.paid_orders ?? 0,
      icon: CreditCard,
      iconColor: "#4fcfa5",
      iconBg: "rgba(79, 207, 165, 0.08)",
      valueStyle: { color: "#4fcfa5" },
    },
    {
      label: "Pending",
      value: analytics?.pending_payments ?? 0,
      icon: Clock,
      iconColor: "#ffc554",
      iconBg: "rgba(255, 197, 84, 0.08)",
      valueStyle: { color: "#ffc554" },
    },
    {
      label: "Processing",
      value: analytics?.processing_orders ?? 0,
      icon: Truck,
      iconColor: "#a285ff",
      iconBg: "rgba(162, 133, 255, 0.08)",
      valueStyle: { color: "#a285ff" },
    },
    {
      label: "Delivered",
      value: analytics?.delivered_orders ?? 0,
      icon: CheckCircle,
      iconColor: "#4fcfa5",
      iconBg: "rgba(79, 207, 165, 0.08)",
      valueStyle: { color: "#4fcfa5" },
    },
    {
      label: "Cancelled",
      value: analytics?.cancelled_orders ?? 0,
      icon: XCircle,
      iconColor: "#ff7070",
      iconBg: "rgba(255, 112, 112, 0.08)",
      valueStyle: { color: "#ff7070" },
    },
    {
      label: "Refunded",
      value: analytics?.refunded_orders ?? 0,
      icon: RotateCcw,
      iconColor: "#8b95a3",
      iconBg: "rgba(139, 149, 163, 0.08)",
      valueStyle: { color: "#8b95a3" },
    },
  ];

  const totalOrders = analytics?.total_orders ?? 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {statusCards.map((card) => {
        const Icon = card.icon;
        const pct = totalOrders > 0 && card.label !== "Total Orders"
          ? ((card.value / totalOrders) * 100).toFixed(1)
          : null;

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
                  className={`text-2xl font-bold ${card.valueColor ?? ""}`}
                  style={{ ...(card.valueStyle ?? {}), marginBottom: "2px" }}
                >
                  {card.value.toLocaleString()}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#111827" }}>{card.label}</span>
                {pct !== null && !loading && (
                  <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>({pct}%)</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

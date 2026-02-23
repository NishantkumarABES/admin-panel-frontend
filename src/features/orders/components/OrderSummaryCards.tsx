import { Package, Clock, Truck, CheckCircle, XCircle, DollarSign, HelpCircle } from "lucide-react";
import type { OrderAnalytics } from "../order.types";

interface OrderSummaryCardsProps {
  analytics: OrderAnalytics | null;
  loading: boolean;
}

export default function OrderSummaryCards({ analytics, loading }: OrderSummaryCardsProps) {
  const cards = [
    {
      label: "Total Orders",
      value: analytics?.total_orders ?? 0,
      icon: Package,
      iconColor: "#6b96ff",
      iconBg: "rgba(107, 150, 255, 0.08)",
      valueColor: "text-gray-900",
      tooltip: "Total number of orders placed in the system.",
    },
    {
      label: "Pending Payments",
      value: analytics?.pending_payments ?? 0,
      icon: Clock,
      iconColor: "#ffc554",
      iconBg: "rgba(255, 197, 84, 0.08)",
      valueColor: undefined,
      valueStyle: { color: "#ffc554" },
      tooltip: "Orders awaiting payment confirmation.",
    },
    {
      label: "Processing",
      value: analytics?.processing_orders ?? 0,
      icon: Truck,
      iconColor: "#a285ff",
      iconBg: "rgba(162, 133, 255, 0.08)",
      valueColor: undefined,
      valueStyle: { color: "#a285ff" },
      tooltip: "Orders currently being processed or shipped.",
    },
    {
      label: "Delivered",
      value: analytics?.delivered_orders ?? 0,
      icon: CheckCircle,
      iconColor: "#4fcfa5",
      iconBg: "rgba(79, 207, 165, 0.08)",
      valueColor: undefined,
      valueStyle: { color: "#4fcfa5" },
      tooltip: "Orders successfully delivered to customers.",
    },
    {
      label: "Cancelled",
      value: analytics?.cancelled_orders ?? 0,
      icon: XCircle,
      iconColor: "#ff7070",
      iconBg: "rgba(255, 112, 112, 0.08)",
      valueColor: undefined,
      valueStyle: { color: "#ff7070" },
      tooltip: "Orders that have been cancelled.",
    },
    {
      label: "Total Revenue",
      value: analytics?.total_revenue ?? 0,
      icon: DollarSign,
      iconColor: "#4fcfa5",
      iconBg: "rgba(79, 207, 165, 0.08)",
      valueColor: undefined,
      valueStyle: { color: "#4fcfa5" },
      isRevenue: true,
      tooltip: "Total revenue generated from all delivered orders.",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="clay-card min-w-0">
            <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
              <div className="clay-circle" style={{ background: card.iconBg }}>
                <Icon className="w-5 h-5" style={{ color: card.iconColor }} />
              </div>
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-52 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                  {card.tooltip}
                </div>
              </div>
            </div>
            {loading ? (
              <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
            ) : (
              <div
                className={`text-xl font-bold ${card.valueColor ?? ""}`}
                style={{ ...(card.valueStyle ?? {}), marginBottom: "2px" }}
              >
                {card.isRevenue
                  ? `₹${(card.value as number).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                  : card.value}
              </div>
            )}
            <div className="text-xs" style={{ color: "#111827" }}>
              {card.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

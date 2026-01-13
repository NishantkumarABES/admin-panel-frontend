import { Package, Clock, Truck, CheckCircle, XCircle, DollarSign } from "lucide-react";
import type { OrderAnalytics } from "../order.types";

interface OrderSummaryCardsProps {
  analytics: OrderAnalytics | null;
  loading: boolean;
}

export default function OrderSummaryCards({ analytics, loading }: OrderSummaryCardsProps) {
  const cards = [
    {
      label: "Total Orders",
      value: analytics?.total_orders_today ?? 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Pending Payments",
      value: analytics?.pending_payments ?? 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      label: "Processing Orders",
      value: analytics?.processing_orders ?? 0,
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Delivered Orders",
      value: analytics?.delivered_orders ?? 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Cancelled Orders",
      value: analytics?.cancelled_orders ?? 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      label: "Total Revenue",
      value: analytics?.total_revenue_today ?? 0,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      isRevenue: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 truncate">{card.label}</div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
            ) : (
              <div className={`text-2xl font-bold ${card.color} mt-1`}>
                {card.isRevenue ? `₹${card.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : card.value}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

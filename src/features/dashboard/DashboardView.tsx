import { Stethoscope, Users, Package, BookOpen, AlertCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  getDashboardMetrics,
  getPendingActions,
  getTopSellingProducts,
  getRevenueAnalytics,
  getOrderStatusAnalytics,
  type DashboardMetrics,
  type PendingActions,
} from "../../services/dashboard.service";
import OrderStatusDistributionChart, {
  type OrderStatusData,
} from "../../components/charts/OrderStatusDistributionChart";
import RevenueOverTimeChart, {
  type RevenueDataPoint,
} from "../../components/charts/RevenueOverTimeChart";
import TopSellingProductsChart, {
  type TopProductData,
} from "../../components/charts/TopSellingProductsChart";
import { generateMockOrderStatusData, generateMockRevenueData, generateMockTopProducts } from "../../utils/mockAnalyticsData";

import DashboardMetricCard from "./components/DashboardMetricCard";
import DashboardWelcomeHeader from "./components/DashboardWelcomeHeader";
import DashboardQuickActions from "./components/DashboardQuickActions";
import DashboardActivityFeed from "./components/DashboardActivityFeed";
import DashboardRepositOverview from "./components/DashboardRepositOverview";

export default function DashboardView() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pendingActions, setPendingActions] = useState<PendingActions | null>(null);
  const [pendingActionsLoading, setPendingActionsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Order Analytics State
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>([]);
  const [orderAnalyticsLoading, setOrderAnalyticsLoading] = useState(true);



  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardMetrics();
        setMetrics(response.data);
      } catch (err) {
        setError("Failed to load dashboard metrics");
        console.error("Error fetching dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchPendingActions = async () => {
      try {
        setPendingActionsLoading(true);
        const response = await getPendingActions();
        setPendingActions(response.data);
      } catch (err) {
        console.error("Error fetching pending actions:", err);
      } finally {
        setPendingActionsLoading(false);
      }
    };
    const timer = setTimeout(() => fetchPendingActions(), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchOrderAnalytics = async () => {
      setOrderAnalyticsLoading(true);
      try {
        const [topProductsRes, revenueRes, orderStatusRes] = await Promise.all([
          getTopSellingProducts(),
          getRevenueAnalytics(),
          getOrderStatusAnalytics(),
        ]);

        setTopProducts(
          topProductsRes.data.map((p) => ({
            id: p.id,
            name: p.name,
            quantity_sold: p.quantity_sold,
            revenue: p.revenue,
            image_url: p.image_url,
          }))
        );

        setRevenueData(
          revenueRes.data.map((r) => ({
            date: r.date,
            revenue: r.revenue,
            orders: r.orders,
          }))
        );

        setOrderStatusData(
          orderStatusRes.data.map((o) => ({
            status: o.status as OrderStatusData["status"],
            count: o.count,
            percentage: o.percentage,
          }))
        );
      } catch (err) {
        console.error("Error fetching order analytics:", err);
        console.log("Using mock order analytics data for development");
        setTopProducts(generateMockTopProducts());
        setRevenueData(generateMockRevenueData());
        setOrderStatusData(generateMockOrderStatusData());
      } finally {
        setOrderAnalyticsLoading(false);
      }
    };
    const timer = setTimeout(() => fetchOrderAnalytics(), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleRevenueFilterChange = useCallback(
    async (year: number, month: number | null) => {
      try {
        const res = await getRevenueAnalytics(year, month ?? undefined);
        setRevenueData(
          res.data.map((r) => ({
            date: r.date,
            revenue: r.revenue,
            orders: r.orders,
          }))
        );
      } catch (err) {
        console.error("Error fetching filtered revenue data:", err);
      }
    },
    []
  );

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    getDashboardMetrics()
      .then((response) => setMetrics(response.data))
      .catch(() => setError("Failed to load dashboard metrics"))
      .finally(() => setLoading(false));
  };



  // ─── Loading State ─────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Welcome skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="clay-skeleton" style={{ height: "28px", width: "280px", marginBottom: "8px" }} />
            <div className="clay-skeleton" style={{ height: "16px", width: "400px" }} />
          </div>
        </div>

        {/* Metric cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="clay-card" style={{ padding: "20px" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                <div className="clay-skeleton" style={{ height: "40px", width: "40px", borderRadius: "50%" }} />
                <div className="clay-skeleton" style={{ height: "20px", width: "52px", borderRadius: "9999px" }} />
              </div>
              <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
              <div className="clay-skeleton" style={{ height: "14px", width: "60%" }} />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="clay-card">
          <div className="clay-skeleton" style={{ height: "20px", width: "200px", marginBottom: "16px" }} />
          <div className="clay-skeleton" style={{ height: "280px" }} />
        </div>

        {/* Two-column chart skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="clay-card">
              <div className="clay-skeleton" style={{ height: "20px", width: "180px", marginBottom: "16px" }} />
              <div className="clay-skeleton" style={{ height: "260px" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "400px" }}>
        <div className="clay-card text-center" style={{ maxWidth: "420px", padding: "40px" }}>
          <div
            className="clay-circle mx-auto"
            style={{
              width: "56px",
              height: "56px",
              background: "rgba(255, 112, 112, 0.1)",
              marginBottom: "16px",
            }}
          >
            <AlertCircle className="w-6 h-6" style={{ color: "#ff7070" }} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900" style={{ marginBottom: "8px" }}>
            Unable to load dashboard
          </h3>
          <p className="text-sm" style={{ color: "#6b7280", marginBottom: "20px" }}>
            {error}. Please check your connection and try again.
          </p>
          <button
            onClick={handleRetry}
            className="clay-btn"
            style={{
              background: "#111827",
              color: "#ffffff",
              padding: "10px 24px",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  // ─── Main Dashboard ────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Section 1: Welcome Header */}
      <div className="dash-animate-in dash-animate-delay-0">
        <DashboardWelcomeHeader />
      </div>

      {/* Section 2: KPI Metric Cards */}
      <div className="dash-animate-in dash-animate-delay-1">
        <div className="dashboard-metrics-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardMetricCard
            title="Total Doctors"
            value={metrics.doctors.total}
            icon={<Stethoscope className="w-5 h-5" style={{ color: "#6b96ff" }} />}
            iconBg="rgba(107, 150, 255, 0.1)"
            growth={metrics.doctors.growth_percent}
            linkTo="/doctors"
          />
          <DashboardMetricCard
            title="Total Patients"
            value={metrics.patients.total}
            icon={<Users className="w-5 h-5" style={{ color: "#a285ff" }} />}
            iconBg="rgba(162, 133, 255, 0.1)"
            growth={metrics.patients.growth_percent}
            linkTo="/patients"
          />
          <DashboardMetricCard
            title="Total Topics"
            value={metrics.topics.total}
            icon={<BookOpen className="w-5 h-5" style={{ color: "#4fcfa5" }} />}
            iconBg="rgba(79, 207, 165, 0.1)"
            growth={metrics.topics.growth_percent}
            linkTo="/topics"
          />
          <DashboardMetricCard
            title="Total Products"
            value={metrics.products.total}
            icon={<Package className="w-5 h-5" style={{ color: "#ff9f47" }} />}
            iconBg="rgba(255, 159, 71, 0.1)"
            growth={metrics.products.growth_percent}
            linkTo="/products"
          />
        </div>
      </div>

      {/* Section 3: Revenue Chart — Hero (Full Width) */}
      <div className="dash-animate-in dash-animate-delay-2">
        {orderAnalyticsLoading ? (
          <div className="clay-card-strong">
            <div className="clay-skeleton" style={{ height: "20px", width: "200px", marginBottom: "16px" }} />
            <div className="clay-skeleton" style={{ height: "16px", width: "300px", marginBottom: "16px" }} />
            <div className="clay-skeleton" style={{ height: "280px" }} />
          </div>
        ) : (
          <div className="dashboard-chart-container">
            <RevenueOverTimeChart data={revenueData} onFilterChange={handleRevenueFilterChange} />
          </div>
        )}
      </div>

      {/* Section 4: Two-Column Charts */}
      <div className="dash-animate-in dash-animate-delay-3">
        {orderAnalyticsLoading ? (
          <div className="dashboard-charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="clay-card">
                <div className="clay-skeleton" style={{ height: "20px", width: "180px", marginBottom: "16px" }} />
                <div className="clay-skeleton" style={{ height: "16px", width: "250px", marginBottom: "16px" }} />
                <div className="clay-skeleton" style={{ height: "260px" }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="dashboard-chart-container">
              <TopSellingProductsChart data={topProducts} />
            </div>
            <div className="dashboard-chart-container">
              <OrderStatusDistributionChart data={orderStatusData} />
            </div>
          </div>
        )}
      </div>

      {/* Section 5: My Reposit | Quick Actions | Platform Overview */}
      <div className="dash-animate-in dash-animate-delay-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <DashboardRepositOverview />
          <DashboardQuickActions
            pendingActions={pendingActions}
            loading={pendingActionsLoading}
          />
          <DashboardActivityFeed
            metrics={metrics}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
import { Users, Stethoscope, BookOpen, TrendingUp, AlertCircle, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getDashboardMetrics, getPendingActions, getTopSellingProducts, getRevenueAnalytics, getOrderStatusAnalytics, type DashboardMetrics, type PendingActions } from "../../services/dashboard.service";
import OrderStatusDistributionChart, { type OrderStatusData } from "../../components/charts/OrderStatusDistributionChart";
import RevenueOverTimeChart, { type RevenueDataPoint } from "../../components/charts/RevenueOverTimeChart";
import TopSellingProductsChart, { type TopProductData } from "../../components/charts/TopSellingProductsChart";
import { generateMockOrderStatusData, generateMockRevenueData, generateMockTopProducts } from "../../utils/mockAnalyticsData";

export default function DashboardView() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  // const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
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

  // Separate effect for pending actions - loads after metrics
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

    // Delay fetch slightly to ensure progressive loading from top to bottom
    const timer = setTimeout(() => {
      fetchPendingActions();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Fetch Order Analytics data
  useEffect(() => {
    const fetchOrderAnalytics = async () => {
      setOrderAnalyticsLoading(true);
      try {
        const [topProductsRes, revenueRes, orderStatusRes] = await Promise.all([
          getTopSellingProducts(),
          getRevenueAnalytics(),
          getOrderStatusAnalytics()
        ]);

        // Map API response to chart-compatible format
        setTopProducts(topProductsRes.data.map(p => ({
          id: p.id,
          name: p.name,
          quantity_sold: p.quantity_sold,
          revenue: p.revenue,
          image_url: p.image_url
        })));

        setRevenueData(revenueRes.data.map(r => ({
          date: r.date,
          revenue: r.revenue,
          orders: r.orders
        })));

        setOrderStatusData(orderStatusRes.data.map(o => ({
          status: o.status as OrderStatusData['status'],
          count: o.count,
          percentage: o.percentage
        })));
      } catch (err) {
        console.error("Error fetching order analytics:", err);
        // Use mock data as fallback
        console.log("Using mock order analytics data for development");
        setTopProducts(generateMockTopProducts());
        setRevenueData(generateMockRevenueData());
        setOrderStatusData(generateMockOrderStatusData());
      } finally {
        setOrderAnalyticsLoading(false);
      }
    };

    // Delay slightly for progressive loading
    const timer = setTimeout(() => {
      fetchOrderAnalytics();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Handler for revenue chart year/month filter
  const handleRevenueFilterChange = useCallback(async (year: number, month: number | null) => {
    try {
      const res = await getRevenueAnalytics(year, month ?? undefined);
      setRevenueData(res.data.map(r => ({
        date: r.date,
        revenue: r.revenue,
        orders: r.orders
      })));
    } catch (err) {
      console.error("Error fetching filtered revenue data:", err);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="clay-card" style={{ padding: "24px" }}>
              <div className="clay-skeleton" style={{ height: "44px", width: "44px", borderRadius: "50%", marginBottom: "16px" }} />
              <div className="clay-skeleton" style={{ height: "32px", marginBottom: "8px" }} />
              <div className="clay-skeleton" style={{ height: "16px", width: "66%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clay-card" style={{ background: "rgba(255, 140, 140, 0.15)" }}>
        <div className="flex items-center gap-2" style={{ color: "#c53030" }}>
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (

    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Key Metrics */}
      <div className="dashboard-metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-card">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
              <Stethoscope className="w-6 h-6" style={{ color: "#6b96ff" }} />
            </div>
            <TrendingUp className="w-5 h-5" style={{ color: "#4fcfa5" }} />
          </div>
          <div className="text-xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>
            {metrics.doctors.total.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: "#111827" }}>Total Doctors</div>
          <div className="text-xs" style={{ color: "#4fcfa5", marginTop: "4px" }}>
            +{metrics.doctors.growth_percent.toFixed(1)}% from last month
          </div>
        </div>

        <div className="clay-card">
          <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
            <div className="clay-circle" style={{ background: "rgba(162, 133, 255, 0.08)" }}>
              <Users className="w-6 h-6" style={{ color: "#a285ff" }} />
            </div>
            <TrendingUp className="w-5 h-5" style={{ color: "#4fcfa5" }} />
          </div>
          <div className="text-xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>
            {metrics.patients.total.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: "#111827" }}>Total Patients</div>
          <div className="text-xs" style={{ color: "#4fcfa5", marginTop: "4px" }}>
            +{metrics.patients.growth_percent.toFixed(1)}% from last month
          </div>
        </div>

        <div className="clay-card">
          <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
            <div className="clay-circle" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
              <BookOpen className="w-6 h-6" style={{ color: "#4fcfa5" }} />
            </div>
            <TrendingUp className="w-5 h-5" style={{ color: "#4fcfa5" }} />
          </div>
          <div className="text-xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>
            {metrics.topics.total.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: "#111827" }}>Total Topics</div>
          <div className="text-xs" style={{ color: "#4fcfa5", marginTop: "4px" }}>
            +{metrics.topics.growth_percent.toFixed(1)}% from last month
          </div>
        </div>

        <div className="clay-card">
          <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
            <div className="clay-circle" style={{ background: "rgba(255, 159, 71, 0.08)" }}>
              <Package className="w-6 h-6" style={{ color: "#ff9f47" }} />
            </div>
            <TrendingUp className="w-5 h-5" style={{ color: "#4fcfa5" }} />
          </div>
          <div className="text-xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>
            {metrics.products.total.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: "#111827" }}>Total Products</div>
          <div className="text-xs" style={{ color: "#4fcfa5", marginTop: "4px" }}>
            {metrics.products.growth_percent.toFixed(1)}% from last month
          </div>
        </div>
      </div>

      {/* Order Analytics Section */}
      <div>
        {/* <div className="flex items-center gap-2" style={{ marginBottom: "20px" }}>
          <ShoppingCart className="w-5 h-5" style={{ color: "#ff9f47" }} />
          <h2 className="text-lg font-semibold text-gray-900">Order Analytics</h2>
        </div> */}
        {/* Two Column Layout */}
        {orderAnalyticsLoading ? (
          <div className="dashboard-charts-grid grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="clay-card">
                <div className="clay-skeleton" style={{ height: "24px", width: "192px", marginBottom: "16px" }} />
                <div className="clay-skeleton" style={{ height: "16px", width: "256px", marginBottom: "16px" }} />
                <div className="clay-skeleton" style={{ height: "256px" }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-charts-grid grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="dashboard-chart-container">
              <TopSellingProductsChart data={topProducts} />
            </div>
            <div className="dashboard-chart-container">
              <OrderStatusDistributionChart data={orderStatusData} />
            </div>
          </div>
        )}

        {/* Revenue Over Time - Full Width */}
        <div style={{ marginTop: "12px" }}>
          {orderAnalyticsLoading ? (
            <div className="clay-card-strong">
              <div className="clay-skeleton" style={{ height: "24px", width: "192px", marginBottom: "16px" }} />
              <div className="clay-skeleton" style={{ height: "16px", width: "256px", marginBottom: "16px" }} />
              <div className="clay-skeleton" style={{ height: "256px" }} />
            </div>
          ) : (
            <div className="dashboard-chart-container">
              <RevenueOverTimeChart data={revenueData} onFilterChange={handleRevenueFilterChange} />
            </div>
          )}
        </div>
      </div>

      {/* Pending Actions */}
      <div className="clay-card">
        <div className="flex items-center gap-2" style={{ marginBottom: "10px" }}>
          <AlertCircle className="w-5 h-5" style={{ color: "#ffc554" }} />
          <h2 className="text-lg font-semibold text-gray-900">Pending Actions</h2>
        </div>
        {pendingActionsLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="clay-inset flex items-center justify-between">
                <div className="flex-1">
                  <div className="clay-skeleton" style={{ height: "16px", width: "192px", marginBottom: "8px" }} />
                  <div className="clay-skeleton" style={{ height: "12px", width: "256px" }} />
                </div>
                <div className="clay-skeleton" style={{ height: "36px", width: "80px", borderRadius: "16px" }} />
              </div>
            ))}
          </div>
        ) : pendingActions ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingActions.out_of_stock_products > 0 && (
              <div className="clay-inset pending-action-card flex items-center justify-between" style={{ background: "rgba(255, 112, 112, 0.08)" }}>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {pendingActions.out_of_stock_products} Products Out of Stock
                  </div>
                  <div className="text-xs" style={{ color: "#6b7280", marginTop: "4px" }}>
                    Review and restock products to avoid order issues
                  </div>
                </div>
                <Link
                  to="/products"
                  className="clay-btn clay-btn-mobile-full"
                >
                  Review
                </Link>
              </div>
            )}

            {pendingActions.unpublished_topics > 0 && (
              <div className="clay-inset pending-action-card flex items-center justify-between" style={{ background: "rgba(255, 197, 84, 0.08)" }}>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {pendingActions.unpublished_topics} Unpublished Topics
                  </div>
                  <div className="text-xs" style={{ color: "#6b7280", marginTop: "4px" }}>
                    Review and publish pending topics
                  </div>
                </div>
                <Link
                  to="/topics"
                  className="clay-btn clay-btn-mobile-full"
                >
                  Review
                </Link>
              </div>
            )}

            {pendingActions.unpublished_advt > 0 && (
              <div className="clay-inset pending-action-card flex items-center justify-between" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {pendingActions.unpublished_advt} Unpublished Advertisements
                  </div>
                  <div className="text-xs" style={{ color: "#6b7280", marginTop: "4px" }}>
                    Review and publish pending advertisements
                  </div>
                </div>
                <Link
                  to="/advertisements"
                  className="clay-btn clay-btn-mobile-full"
                >
                  Review
                </Link>
              </div>
            )}

            {pendingActions.out_of_stock_products === 0 &&
              pendingActions.unpublished_topics === 0 &&
              pendingActions.unpublished_advt === 0 && (
                <div className="text-sm text-center" style={{ color: "#6b7280", padding: "16px 0" }}>
                  No pending actions at this time
                </div>
              )}
          </div>
        ) : (
          <div className="text-sm text-center" style={{ color: "#6b7280", padding: "16px 0" }}>
            Failed to load pending actions
          </div>
        )}
      </div>
    </div>
  );
}
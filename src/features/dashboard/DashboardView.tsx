import { Users, Stethoscope, BookOpen, TrendingUp, AlertCircle, Package, BarChart3, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboardMetrics, getDashboardAnalytics, getPendingActions, type DashboardMetrics, type DashboardAnalytics, type PendingActions } from "../../services/dashboard.service";
import OrderStatusDistributionChart, { type OrderStatusData } from "../../components/charts/OrderStatusDistributionChart";
import RevenueOverTimeChart, { type RevenueDataPoint } from "../../components/charts/RevenueOverTimeChart";
import TopSellingProductsChart, { type TopProductData } from "../../components/charts/TopSellingProductsChart";
import { generateMockAnalytics, generateMockOrderStatusData, generateMockRevenueData, generateMockTopProducts } from "../../utils/mockAnalyticsData";

export default function DashboardView() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [pendingActions, setPendingActions] = useState<PendingActions | null>(null);
  const [pendingActionsLoading, setPendingActionsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchAnalytics = async () => {

      try {
        const response = await getDashboardAnalytics();
        setAnalytics(response.data);
      } catch (err) {
        console.error("Error fetching dashboard analytics:", err);
        // Use mock data for development if API is not ready
        console.log("Using mock analytics data for development");
        setAnalytics(generateMockAnalytics());
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-800">
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

    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics.doctors.total.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Doctors</div>
          <div className="text-xs text-emerald-600 mt-2">
            +{metrics.doctors.growth_percent.toFixed(1)}% from last month
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics.patients.total.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Patients</div>
          <div className="text-xs text-emerald-600 mt-2">
            +{metrics.patients.growth_percent.toFixed(1)}% from last month
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics.topics.total.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Topics</div>
          <div className="text-xs text-emerald-600 mt-2">
            +{metrics.topics.growth_percent.toFixed(1)}% from last month
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics.products.total.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Products</div>
          <div className="text-xs text-emerald-600 mt-2">
            {metrics.products.growth_percent.toFixed(1)}% from last month
          </div>
        </div>
      </div>

      {/* Order Analytics Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Order Analytics</h2>
          </div>
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopSellingProductsChart data={generateMockTopProducts()} />
            <OrderStatusDistributionChart data={generateMockOrderStatusData()} />
          </div>

          {/* Revenue Over Time - Full Width */}
          <RevenueOverTimeChart data={generateMockRevenueData()} />
        </div>
      </div>

      {/* Pending Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-gray-900">Pending Actions</h2>
        </div>
        {pendingActionsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 animate-pulse">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-64"></div>
                </div>
                <div className="h-9 w-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : pendingActions ? (
          <div className="space-y-3">
            {pendingActions.out_of_stock_products > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {pendingActions.out_of_stock_products} Products Out of Stock
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Review and restock products to avoid order issues
                  </div>
                </div>
                <Link
                  to="/products"
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Review
                </Link>
              </div>
            )}

            {pendingActions.unpublished_topics > 0 && (
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {pendingActions.unpublished_topics} Unpublished Topics
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Review and publish pending topics
                  </div>
                </div>
                <Link
                  to="/topics"
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Review
                </Link>
              </div>
            )}

            {pendingActions.unpublished_advt > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {pendingActions.unpublished_advt} Unpublished Advertisements
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Review and publish pending advertisements
                  </div>
                </div>
                <Link
                  to="/advertisements"
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Review
                </Link>
              </div>
            )}

            {pendingActions.out_of_stock_products === 0 &&
              pendingActions.unpublished_topics === 0 &&
              pendingActions.unpublished_advt === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No pending actions at this time
                </div>
              )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            Failed to load pending actions
          </div>
        )}
      </div>
    </div>
  );
}
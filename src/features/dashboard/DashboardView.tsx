import { Users, Stethoscope, BookOpen, TrendingUp, AlertCircle, Package, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboardMetrics, getDashboardAnalytics, getPendingActions, type DashboardMetrics, type DashboardAnalytics, type PendingActions } from "../../services/dashboard.service";
import GrowthTrendChart from "../../components/charts/GrowthTrendChart";
import SpecializationChart from "../../components/charts/SpecializationChart";
import CategoryDistributionChart from "../../components/charts/CategoryDistributionChart";
import UserStatusChart from "../../components/charts/UserStatusChart";
import VerificationChart from "../../components/charts/VerificationChart";
import StatusDistributionChart from "../../components/charts/StatusDistributionChart";
import { generateMockAnalytics } from "../../utils/mockAnalyticsData";

export default function DashboardView() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [pendingActions, setPendingActions] = useState<PendingActions | null>(null);
  const [pendingActionsLoading, setPendingActionsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

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
      if (!showAnalytics) return;

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
  }, [showAnalytics]);

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
    <div className="space-y-6 -mt-6">
      {/* Header with Analytics Toggle */}
      <div className="flex items-center justify-between">
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-600 mt-1">Monitor your platform's key metrics and analytics</p>
        </div> */}
        {/*
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            showAnalytics
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
        </button>
        */}
      </div>

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

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Dr. Sarah Johnson verified
              </div>
              <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
            </div>
          </div>
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                New product "Medical Supplies Kit" added
              </div>
              <div className="text-xs text-gray-500 mt-1">4 hours ago</div>
            </div>
          </div>
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Event "Healthcare Conference 2025" created
              </div>
              <div className="text-xs text-gray-500 mt-1">6 hours ago</div>
            </div>
          </div>
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Dr. Michael Chen registration pending review
              </div>
              <div className="text-xs text-gray-500 mt-1">8 hours ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && analytics && (
        <div className="space-y-6">
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Detailed Analytics</h2>
            </div>

            {/* Growth Trend Chart - Full Width */}
            {analytics.growthTrend && analytics.growthTrend.length > 0 && (
              <div className="mb-6">
                <GrowthTrendChart data={analytics.growthTrend} />
              </div>
            )}

            {/* Two Column Layout for Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Specialization Chart */}
              {analytics.specializations && analytics.specializations.length > 0 && (
                <SpecializationChart data={analytics.specializations} />
              )}

              {/* Topic Categories Chart */}
              {analytics.topicCategories && analytics.topicCategories.length > 0 && (
                <CategoryDistributionChart
                  data={analytics.topicCategories}
                  title="Topic Categories Distribution"
                />
              )}
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* User Status Chart */}
              {analytics.userStatus && analytics.userStatus.length > 0 && (
                <UserStatusChart data={analytics.userStatus} />
              )}

              {/* Verification Status Chart */}
              {analytics.verification && analytics.verification.length > 0 && (
                <VerificationChart data={analytics.verification} />
              )}

              {/* Topic Status Distribution */}
              {analytics.topicStatus && analytics.topicStatus.length > 0 && (
                <StatusDistributionChart
                  data={analytics.topicStatus}
                  title="Content Status"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State for Analytics */}
      {showAnalytics && !analytics && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        </div>
      )}
    </div>
  );
}
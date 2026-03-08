import { api } from "./api";

export interface MetricData {
  total: number;
  growth_percent: number;
}

export interface GrowthDataPoint {
  month: string;
  doctors: number;
  patients: number;
}

export interface SpecializationData {
  name: string;
  count: number;
}

export interface CategoryData {
  category: string;
  count: number;
}

export interface StatusData {
  status: string;
  count: number;
}

export interface VerificationData {
  verified: number;
  unverified: number;
  label: string;
}

export interface UserStatusData {
  active: number;
  inactive: number;
  type: string;
}

export interface DashboardMetrics {
  doctors: MetricData;
  patients: MetricData;
  topics: MetricData;
  products: MetricData;
}

export interface DashboardAnalytics {
  metrics: DashboardMetrics;
  growthTrend: GrowthDataPoint[];
  specializations: SpecializationData[];
  topicCategories: CategoryData[];
  topicStatus: StatusData[];
  userStatus: UserStatusData[];
  verification: VerificationData[];
}

// Get dashboard metrics
export const getDashboardMetrics = () =>
  api.get<DashboardMetrics>("/analytics/admin/dashboard/metrics/");

export interface PendingActions {
  out_of_stock_products: number;
  unpublished_topics: number;
  unpublished_advt: number;
  pending_books: number;
  in_review_books: number;
  draft_articles: number;
  in_review_articles: number;
  pending_videos: number;
  in_review_videos: number;
  draft_jobs: number;
  in_review_jobs: number;
  pending_videos_topics: number;
}

// Get dashboard metrics
export const getPendingActions = () =>
  api.get<PendingActions>("/analytics/admin/dashboard/pending-actions/");


// Order Analytics Types
export interface TopSellingProduct {
  id: string;
  name: string;
  quantity_sold: number;
  revenue: number;
  image_url?: string;
}

export interface RevenueAnalyticsDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusAnalytics {
  status: string;
  count: number;
  percentage: number;
}

// Get top selling products
export const getTopSellingProducts = () =>
  api.get<TopSellingProduct[]>("/analytics/admin/dashboard/top-selling-products/");

// Get revenue analytics
export const getRevenueAnalytics = (year?: number, month?: number) => {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());
  const query = params.toString();
  return api.get<RevenueAnalyticsDataPoint[]>(`/analytics/admin/dashboard/revenue-analytics/${query ? `?${query}` : ""}`);
};

// Get order status analytics
export const getOrderStatusAnalytics = () =>
  api.get<OrderStatusAnalytics[]>("/analytics/admin/dashboard/order-status-analytics/");

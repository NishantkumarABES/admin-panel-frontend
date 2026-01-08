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

// Get comprehensive dashboard analytics
export const getDashboardAnalytics = () =>
  api.get<DashboardAnalytics>("/analytics/admin/dashboard/comprehensive/");

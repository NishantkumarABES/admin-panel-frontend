import { api } from "./api";

export interface MetricData {
  total: number;
  growth_percent: number;
}

export interface DashboardMetrics {
  doctors: MetricData;
  patients: MetricData;
  topics: MetricData;
}

// Get dashboard metrics
export const getDashboardMetrics = () =>
  api.get<DashboardMetrics>("/analytics/admin/dashboard/metrics/");

import type { DashboardAnalytics } from '../services/dashboard.service';
import type { OrderStatusData } from '../components/charts/OrderStatusDistributionChart';
import type { RevenueDataPoint } from '../components/charts/RevenueOverTimeChart';
import type { TopProductData } from '../components/charts/TopSellingProductsChart';
import type { OrderStatus } from '../features/orders/order.types';

/**
 * Generate mock order status distribution data
 */
export const generateMockOrderStatusData = (): OrderStatusData[] => {
  const statuses: OrderStatus[] = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  const counts = [23, 45, 28, 52, 187, 12, 8];
  const total = counts.reduce((a, b) => a + b, 0);

  return statuses.map((status, index) => ({
    status,
    count: counts[index],
    percentage: (counts[index] / total) * 100
  }));
};

/**
 * Generate mock revenue over time data
 */
export const generateMockRevenueData = (): RevenueDataPoint[] => {
  return [
    { date: 'Jan 1', revenue: 45000, orders: 12 },
    { date: 'Jan 8', revenue: 62000, orders: 18 },
    { date: 'Jan 15', revenue: 58000, orders: 15 },
    { date: 'Jan 22', revenue: 89000, orders: 24 },
    { date: 'Jan 29', revenue: 72000, orders: 21 },
    { date: 'Feb 5', revenue: 95000, orders: 28 },
    { date: 'Feb 12', revenue: 115000, orders: 35 },
    { date: 'Feb 19', revenue: 98000, orders: 29 },
    { date: 'Feb 26', revenue: 125000, orders: 38 },
    { date: 'Mar 5', revenue: 142000, orders: 42 }
  ];
};

/**
 * Generate mock top selling products data
 */
export const generateMockTopProducts = (): TopProductData[] => {
  return [
    { id: '1', name: 'Premium Stethoscope', quantity_sold: 156, revenue: 389844 },
    { id: '2', name: 'Digital BP Monitor', quantity_sold: 142, revenue: 425858 },
    { id: '3', name: 'Pulse Oximeter Pro', quantity_sold: 98, revenue: 146902 },
    { id: '4', name: 'ECG Machine Portable', quantity_sold: 45, revenue: 404955 },
    { id: '5', name: 'Surgical Kit Complete', quantity_sold: 67, revenue: 200933 },
    { id: '6', name: 'Medical Thermometer', quantity_sold: 234, revenue: 70200 },
    { id: '7', name: 'First Aid Kit Premium', quantity_sold: 189, revenue: 94500 },
    { id: '8', name: 'Nebulizer Machine', quantity_sold: 78, revenue: 195000 }
  ];
};

/**
 * Generate mock analytics data for development and testing
 * This can be removed once the backend API is ready
 */
export const generateMockAnalytics = (): DashboardAnalytics => {
  return {
    metrics: {
      doctors: {
        total: 1247,
        growth_percent: 12.5
      },
      patients: {
        total: 8932,
        growth_percent: 18.3
      },
      topics: {
        total: 342,
        growth_percent: 8.7
      },
      products: {
        total: 156,
        growth_percent: 5.2
      }
    },
    growthTrend: [
      { month: 'Jan', doctors: 950, patients: 6200 },
      { month: 'Feb', doctors: 1020, patients: 6800 },
      { month: 'Mar', doctors: 1085, patients: 7300 },
      { month: 'Apr', doctors: 1140, patients: 7850 },
      { month: 'May', doctors: 1195, patients: 8400 },
      { month: 'Jun', doctors: 1247, patients: 8932 }
    ],
    specializations: [
      { name: 'Cardiology', count: 142 },
      { name: 'Neurology', count: 128 },
      { name: 'Pediatrics', count: 115 },
      { name: 'Dermatology', count: 98 },
      { name: 'Orthopedics', count: 87 },
      { name: 'Psychiatry', count: 76 },
      { name: 'General Medicine', count: 185 },
      { name: 'Gynecology', count: 92 },
      { name: 'Ophthalmology', count: 68 },
      { name: 'ENT', count: 54 }
    ],
    topicCategories: [
      { category: 'Cardiology', count: 58 },
      { category: 'Neurology', count: 42 },
      { category: 'General Health', count: 95 },
      { category: 'Dermatology', count: 38 },
      { category: 'Nutrition', count: 65 },
      { category: 'Physical Therapy', count: 28 },
      { category: 'Sleep Disorders', count: 16 }
    ],
    topicStatus: [
      { status: 'published', count: 285 },
      { status: 'draft', count: 42 },
      { status: 'scheduled', count: 15 }
    ],
    userStatus: [
      { type: 'Doctors', active: 1189, inactive: 58 },
      { type: 'Patients', active: 8456, inactive: 476 }
    ],
    verification: [
      { label: 'Doctor Email', verified: 1198, unverified: 49 },
      { label: 'Doctor Phone', verified: 1142, unverified: 105 },
      { label: 'Patient Email', verified: 8234, unverified: 698 },
      { label: 'Patient Phone', verified: 7856, unverified: 1076 }
    ]
  };
};

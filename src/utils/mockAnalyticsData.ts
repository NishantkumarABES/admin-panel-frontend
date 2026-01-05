import type { DashboardAnalytics } from '../services/dashboard.service';

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

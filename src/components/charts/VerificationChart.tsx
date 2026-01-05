import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { VerificationData } from '../../services/dashboard.service';

interface VerificationChartProps {
  data: VerificationData[];
}

export default function VerificationChart({ data }: VerificationChartProps) {
  // Transform data for stacked bar chart
  const chartData = data.map(item => ({
    label: item.label,
    Verified: item.verified,
    Unverified: item.unverified,
    total: item.verified + item.unverified,
    verifiedPercent: ((item.verified / (item.verified + item.unverified)) * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">{data.label}</p>
          <p className="text-sm text-gray-600">
            Verified: <span className="font-medium text-emerald-600">{data.Verified}</span>
          </p>
          <p className="text-sm text-gray-600">
            Unverified: <span className="font-medium text-amber-600">{data.Unverified}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1 pt-1 border-t border-gray-100">
            Total: <span className="font-medium">{data.total}</span> ({data.verifiedPercent}% verified)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px' }}
            iconType="circle"
          />
          <Bar dataKey="Verified" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Unverified" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

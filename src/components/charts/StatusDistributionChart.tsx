import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { StatusData } from '../../services/dashboard.service';

interface StatusDistributionChartProps {
  data: StatusData[];
  title: string;
}

const STATUS_COLORS: Record<string, string> = {
  published: '#10b981',
  draft: '#f59e0b',
  scheduled: '#3b82f6',
  archived: '#6b7280',
  enabled: '#10b981',
  disabled: '#ef4444',
  active: '#10b981',
  inactive: '#ef4444',
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444'
};

export default function StatusDistributionChart({ data, title }: StatusDistributionChartProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  const getColor = (status: string) => {
    return STATUS_COLORS[status.toLowerCase()] || '#6b7280';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalCount) * 100).toFixed(1);
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-900 capitalize">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry: any) => {
    const percent = entry.percent || 0;
    const status = entry.status || '';
    return `${status}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Total Items</span>
        <span className="text-lg font-bold text-gray-900">{totalCount.toLocaleString()}</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data as any}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="status"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
            formatter={(value) => <span className="capitalize">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

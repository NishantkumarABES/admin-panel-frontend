import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ORDER_STATUS_CONFIG, type OrderStatus } from '../../features/orders/order.types';

export interface OrderStatusData {
    status: OrderStatus;
    count: number;
    percentage: number;
}

interface OrderStatusDistributionChartProps {
    data: OrderStatusData[];
}

const STATUS_COLORS: Record<OrderStatus, string> = {
    pending_payment: '#f59e0b',
    paid: '#3b82f6',
    processing: '#8b5cf6',
    shipped: '#6366f1',
    delivered: '#10b981',
    cancelled: '#ef4444',
    refunded: '#6b7280'
};

export default function OrderStatusDistributionChart({ data }: OrderStatusDistributionChartProps) {
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const status = payload[0].payload.status as OrderStatus;
            const config = ORDER_STATUS_CONFIG[status];
            const percentage = ((payload[0].value / totalCount) * 100).toFixed(1);
            return (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-semibold text-gray-900">{config?.label || status}</p>
                    <p className="text-sm text-gray-600">
                        Count: <span className="font-medium">{payload[0].value.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Percentage: <span className="font-medium">{percentage}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Status Distribution</h3>
            <p className="text-sm text-gray-500 mb-4">Distribution of orders across processing stages</p>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="text-xl font-bold text-gray-900">{totalCount.toLocaleString()}</span>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={data as any}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={160}
                        innerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        paddingAngle={2}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={STATUS_COLORS[entry.status] || '#6b7280'}
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Status Count Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
                {data.map((item) => {
                    const config = ORDER_STATUS_CONFIG[item.status];
                    const percentage = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0';
                    return (
                        <div
                            key={item.status}
                            className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50"
                        >
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: STATUS_COLORS[item.status] }}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-gray-500 truncate">{config?.label || item.status}</div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {item.count.toLocaleString()}
                                    <span className="text-xs font-normal text-gray-400 ml-1">({percentage}%)</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

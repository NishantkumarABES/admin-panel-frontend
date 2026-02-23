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
    pending_payment: '#ffc554',
    paid: '#6b96ff',
    processing: '#a285ff',
    shipped: '#7a86ff',
    delivered: '#4fcfa5',
    cancelled: '#ff7070',
    refunded: '#8b95a3'
};

export default function OrderStatusDistributionChart({ data }: OrderStatusDistributionChartProps) {
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const status = payload[0].payload.status as OrderStatus;
            const config = ORDER_STATUS_CONFIG[status];
            const percentage = ((payload[0].value / totalCount) * 100).toFixed(1);
            return (
                <div className="clay-tooltip">
                    <p className="text-sm font-semibold text-gray-900">{config?.label || status}</p>
                    <p className="text-sm" style={{ color: "#6b7280" }}>
                        Count: <span className="font-medium">{payload[0].value.toLocaleString()}</span>
                    </p>
                    <p className="text-sm" style={{ color: "#6b7280" }}>
                        Percentage: <span className="font-medium">{percentage}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="clay-card">
            <h3 className="font-semibold text-gray-900" style={{ fontSize: "18px", marginBottom: "8px" }}>Order Status Distribution</h3>
            <p className="text-sm" style={{ color: "#6b7280", marginBottom: "16px" }}>Distribution of orders across processing stages</p>
            <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                <span className="text-sm" style={{ color: "#6b7280" }}>Total Orders</span>
                <span className="text-xl font-bold text-gray-900">{totalCount.toLocaleString()}</span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={data as any}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={140}
                        innerRadius={70}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        paddingAngle={2}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={STATUS_COLORS[entry.status] || '#9ca3af'}
                                stroke="#f7f8fa"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Status Count Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" style={{ marginTop: "16px" }}>
                {data.map((item) => {
                    const config = ORDER_STATUS_CONFIG[item.status];
                    const percentage = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0';
                    return (
                        <div
                            key={item.status}
                            className="clay-inset flex items-center gap-2"
                            style={{ padding: "10px 12px" }}
                        >
                            <div
                                className="flex-shrink-0"
                                style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: STATUS_COLORS[item.status] }}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs truncate" style={{ color: "#9ca3af" }}>{config?.label || item.status}</div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {item.count.toLocaleString()}
                                    <span className="text-xs font-normal ml-1" style={{ color: "#9ca3af" }}>({percentage}%)</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

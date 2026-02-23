import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

interface RevenueOverTimeChartProps {
    data: RevenueDataPoint[];
}

export default function RevenueOverTimeChart({ data }: RevenueOverTimeChartProps) {
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)}L`;
        } else if (value >= 1000) {
            return `₹${(value / 1000).toFixed(1)}K`;
        }
        return `₹${value}`;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="clay-tooltip">
                    <p className="text-sm font-semibold text-gray-900" style={{ marginBottom: "8px" }}>{label}</p>
                    <p className="text-sm" style={{ color: "#6b7280" }}>
                        Revenue: <span className="font-medium" style={{ color: "#4fcfa5" }}>₹{payload[0]?.value?.toLocaleString()}</span>
                    </p>
                    <p className="text-sm" style={{ color: "#4b5563" }}>
                        Orders: <span className="font-medium" style={{ color: "#6b96ff" }}>{payload[1]?.value?.toLocaleString()}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="clay-card-strong">
            <h3 className="font-semibold text-gray-900" style={{ fontSize: "18px", marginBottom: "8px" }}>Revenue Over Time</h3>
            <p className="text-sm" style={{ color: "#6b7280", marginBottom: "16px" }}>Financial performance trends and order volume</p>
            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "16px" }}>
                <div className="clay-inset" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
                    <span className="text-xs font-medium" style={{ color: "#4fcfa5" }}>Total Revenue</span>
                    <div className="text-lg font-bold" style={{ color: "#3dba8e" }}>₹{totalRevenue.toLocaleString()}</div>
                </div>
                <div className="clay-inset" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
                    <span className="text-xs font-medium" style={{ color: "#6b96ff" }}>Total Orders</span>
                    <div className="text-lg font-bold" style={{ color: "#4d7de6" }}>{totalOrders.toLocaleString()}</div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4fcfa5" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#4fcfa5" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6b96ff" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#6b96ff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#4fcfa5"
                        style={{ fontSize: '12px' }}
                        tickFormatter={formatCurrency}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#6b96ff"
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                        iconType="circle"
                    />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4fcfa5"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue (₹)"
                        strokeWidth={2}
                    />
                    <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="#6b96ff"
                        fillOpacity={1}
                        fill="url(#colorOrders)"
                        name="Orders"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

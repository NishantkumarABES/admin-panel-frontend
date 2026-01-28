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
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
                    <p className="text-sm text-gray-600">
                        Revenue: <span className="font-medium text-emerald-600">₹{payload[0]?.value?.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Orders: <span className="font-medium text-blue-600">{payload[1]?.value?.toLocaleString()}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Over Time</h3>
            <p className="text-sm text-gray-500 mb-4">Financial performance trends and order volume</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-emerald-50 rounded-lg p-3">
                    <span className="text-xs text-emerald-600 font-medium">Total Revenue</span>
                    <div className="text-lg font-bold text-emerald-700">₹{totalRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                    <span className="text-xs text-blue-600 font-medium">Total Orders</span>
                    <div className="text-lg font-bold text-blue-700">{totalOrders.toLocaleString()}</div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#10b981"
                        style={{ fontSize: '12px' }}
                        tickFormatter={formatCurrency}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#3b82f6"
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: '14px' }}
                        iconType="circle"
                    />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue (₹)"
                        strokeWidth={2}
                    />
                    <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="#3b82f6"
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

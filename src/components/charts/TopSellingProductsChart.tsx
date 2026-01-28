import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

export interface TopProductData {
    id: string;
    name: string;
    quantity_sold: number;
    revenue: number;
    image_url?: string;
}

interface TopSellingProductsChartProps {
    data: TopProductData[];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

export default function TopSellingProductsChart({ data }: TopSellingProductsChartProps) {
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalQuantity = data.reduce((sum, item) => sum + item.quantity_sold, 0);

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)}L`;
        } else if (value >= 1000) {
            return `₹${(value / 1000).toFixed(1)}K`;
        }
        return `₹${value}`;
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const product = payload[0].payload as TopProductData;
            return (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs">
                    <p className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</p>
                    <p className="text-sm text-gray-600">
                        Revenue: <span className="font-medium text-emerald-600">₹{product.revenue.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Quantity Sold: <span className="font-medium text-blue-600">{product.quantity_sold.toLocaleString()}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // Truncate product names for chart display
    const chartData = data.map((item, index) => ({
        ...item,
        shortName: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        rank: index + 1
    }));

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-sm text-gray-500 mb-4">Best performing products by revenue</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-emerald-50 rounded-lg p-3">
                    <span className="text-xs text-emerald-600 font-medium">Total Revenue</span>
                    <div className="text-lg font-bold text-emerald-700">{formatCurrency(totalRevenue)}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                    <span className="text-xs text-blue-600 font-medium">Units Sold</span>
                    <div className="text-lg font-bold text-blue-700">{totalQuantity.toLocaleString()}</div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                    <XAxis
                        type="number"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tickFormatter={formatCurrency}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="shortName"
                        stroke="#6b7280"
                        style={{ fontSize: '11px' }}
                        width={100}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                    <Bar
                        dataKey="revenue"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={30}
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Product list below chart */}
            <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Product Details</div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data.slice(0, 5).map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                >
                                    {index + 1}
                                </div>
                                <span className="text-sm text-gray-900 font-medium line-clamp-1" title={product.name}>
                                    {product.name}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">₹{product.revenue.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">{product.quantity_sold} units</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

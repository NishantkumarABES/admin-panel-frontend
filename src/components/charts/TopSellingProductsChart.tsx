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

const COLORS = ['#4fcfa5', '#6b96ff', '#a285ff', '#ffc554', '#ff7070', '#5bb8ff', '#c990ff', '#ff9f47'];

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
                <div className="clay-tooltip" style={{ maxWidth: "280px" }}>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2" style={{ marginBottom: "8px" }}>{product.name}</p>
                    <p className="text-sm" style={{ color: "#6b7280" }}>
                        Revenue: <span className="font-medium" style={{ color: "#4fcfa5" }}>₹{product.revenue.toLocaleString()}</span>
                    </p>
                    <p className="text-sm" style={{ color: "#4b5563" }}>
                        Quantity Sold: <span className="font-medium" style={{ color: "#6b96ff" }}>{product.quantity_sold.toLocaleString()}</span>
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
        <div className="clay-card h-full">
            <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: "18px" }}>Top Selling Products</h3>
                <TrendingUp className="w-5 h-5" style={{ color: "#4fcfa5" }} />
            </div>
            <p className="text-sm" style={{ color: "#6b7280", marginBottom: "16px" }}>Best performing products by revenue</p>

            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "16px" }}>
                <div className="clay-inset" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
                    <span className="text-xs font-medium" style={{ color: "#4fcfa5" }}>Total Revenue</span>
                    <div className="text-lg font-bold" style={{ color: "#3dba8e" }}>{formatCurrency(totalRevenue)}</div>
                </div>
                <div className="clay-inset" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
                    <span className="text-xs font-medium" style={{ color: "#6b96ff" }}>Units Sold</span>
                    <div className="text-lg font-bold" style={{ color: "#4d7de6" }}>{totalQuantity.toLocaleString()}</div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" horizontal={true} vertical={false} />
                    <XAxis
                        type="number"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        tickFormatter={formatCurrency}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="shortName"
                        stroke="#9ca3af"
                        style={{ fontSize: '11px' }}
                        width={100}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                    <Bar
                        dataKey="revenue"
                        radius={[0, 8, 8, 0]}
                        maxBarSize={30}
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Product list below chart */}
            {/* <div style={{ marginTop: "16px", paddingTop: "16px" }}>
                <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "#9ca3af", marginBottom: "8px" }}>Product Details</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "192px", overflowY: "auto" }}>
                    {data.slice(0, 5).map((product, index) => (
                        <div
                            key={product.id}
                            className="flex items-center justify-between"
                            style={{
                                padding: "8px",
                                borderRadius: "16px",
                                transition: "transform 0.2s ease",
                                cursor: "default"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex items-center justify-center text-white text-xs font-bold"
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        backgroundColor: COLORS[index % COLORS.length]
                                    }}
                                >
                                    {index + 1}
                                </div>
                                <span className="text-sm text-gray-900 font-medium line-clamp-1" title={product.name}>
                                    {product.name}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">₹{product.revenue.toLocaleString()}</div>
                                <div className="text-xs" style={{ color: "#9ca3af" }}>{product.quantity_sold} units</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
        </div>
    );
}

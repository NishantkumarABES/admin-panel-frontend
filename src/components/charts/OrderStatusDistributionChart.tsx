import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ORDER_STATUS_CONFIG, type OrderStatus } from '../../features/orders/order.types';
import { ShoppingBag, CreditCard, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

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
    const paidCount = data.find(d => d.status === 'paid')?.count ?? 0;
    const refundedCount = data.find(d => d.status === 'refunded')?.count ?? 0;
    const deliveredCount = data.find(d => d.status === 'delivered')?.count ?? 0;
    const cancelledCount = data.find(d => d.status === 'cancelled')?.count ?? 0;

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

    const paidPct = totalCount > 0 ? ((paidCount / totalCount) * 100).toFixed(1) : '0';
    const refundedPct = totalCount > 0 ? ((refundedCount / totalCount) * 100).toFixed(1) : '0';
    const deliveredPct = totalCount > 0 ? ((deliveredCount / totalCount) * 100).toFixed(1) : '0';
    const cancelledPct = totalCount > 0 ? ((cancelledCount / totalCount) * 100).toFixed(1) : '0';

    return (
        <div className="clay-card h-full" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: "18px", marginBottom: "4px" }}>Order Status Distribution</h3>
                <p className="text-sm" style={{ color: "#6b7280" }}>Distribution of orders across processing stages</p>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-5 gap-3">
                {/* Total Orders */}
                <div className="clay-inset" style={{ padding: '14px', textAlign: 'center', background: 'rgba(107, 150, 255, 0.04)' }}>
                    <div className="flex items-center justify-center" style={{ marginBottom: '8px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(107, 150, 255, 0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <ShoppingBag style={{ width: '18px', height: '18px', color: '#6b96ff' }} />
                        </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900" style={{ lineHeight: 1.2 }}>{totalCount.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: '#6b7280', marginTop: '2px' }}>Total Orders</div>
                </div>

                {/* Paid Orders */}
                <div className="clay-inset" style={{ padding: '14px', textAlign: 'center', background: 'rgba(79, 207, 165, 0.04)' }}>
                    <div className="flex items-center justify-center" style={{ marginBottom: '8px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(79, 207, 165, 0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <CreditCard style={{ width: '18px', height: '18px', color: '#4fcfa5' }} />
                        </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900" style={{ lineHeight: 1.2 }}>{paidCount.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: '#6b7280', marginTop: '2px' }}>Paid Orders</div>
                    <div className="text-xs font-medium" style={{ color: '#4fcfa5', marginTop: '2px' }}>{paidPct}%</div>
                </div>

                {/* Refunded Orders */}
                <div className="clay-inset" style={{ padding: '14px', textAlign: 'center', background: 'rgba(139, 149, 163, 0.04)' }}>
                    <div className="flex items-center justify-center" style={{ marginBottom: '8px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(139, 149, 163, 0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <RotateCcw style={{ width: '18px', height: '18px', color: '#8b95a3' }} />
                        </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900" style={{ lineHeight: 1.2 }}>{refundedCount.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: '#6b7280', marginTop: '2px' }}>Refunded Orders</div>
                    <div className="text-xs font-medium" style={{ color: '#ff7070', marginTop: '2px' }}>{refundedPct}%</div>
                </div>

                {/* Delivered Orders */}
                <div className="clay-inset" style={{ padding: '14px', textAlign: 'center', background: 'rgba(79, 207, 165, 0.04)' }}>
                    <div className="flex items-center justify-center" style={{ marginBottom: '8px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(79, 207, 165, 0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <CheckCircle style={{ width: '18px', height: '18px', color: '#4fcfa5' }} />
                        </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900" style={{ lineHeight: 1.2 }}>{deliveredCount.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: '#6b7280', marginTop: '2px' }}>Delivered</div>
                    <div className="text-xs font-medium" style={{ color: '#4fcfa5', marginTop: '2px' }}>{deliveredPct}%</div>
                </div>

                {/* Cancelled Orders */}
                <div className="clay-inset" style={{ padding: '14px', textAlign: 'center', background: 'rgba(255, 112, 112, 0.04)' }}>
                    <div className="flex items-center justify-center" style={{ marginBottom: '8px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(255, 112, 112, 0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <XCircle style={{ width: '18px', height: '18px', color: '#ff7070' }} />
                        </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900" style={{ lineHeight: 1.2 }}>{cancelledCount.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: '#6b7280', marginTop: '2px' }}>Cancelled</div>
                    <div className="text-xs font-medium" style={{ color: '#ff7070', marginTop: '2px' }}>{cancelledPct}%</div>
                </div>
            </div>

            {/* Chart + Legend Row */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Donut Chart */}
                <div style={{ flex: '1 1 220px', minWidth: '200px' }}>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={data as any}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={115}
                                innerRadius={60}
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
                </div>

                {/* Legend List */}
                <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
                    {data.map((item) => {
                        const config = ORDER_STATUS_CONFIG[item.status];
                        const pct = totalCount > 0 ? ((item.count / totalCount) * 100) : 0;
                        return (
                            <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                                    backgroundColor: STATUS_COLORS[item.status]
                                }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                                        <span className="text-xs" style={{ color: '#374151', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {config?.label || item.status}
                                        </span>
                                        <span className="text-xs font-semibold" style={{ color: '#111827', marginLeft: '8px', whiteSpace: 'nowrap' }}>
                                            {item.count.toLocaleString()}
                                        </span>
                                    </div>
                                    {/* Mini progress bar */}
                                    <div style={{ height: '4px', borderRadius: '2px', background: '#f0f1f3', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: '2px',
                                            background: STATUS_COLORS[item.status],
                                            width: `${pct}%`,
                                            transition: 'width 0.6s ease'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

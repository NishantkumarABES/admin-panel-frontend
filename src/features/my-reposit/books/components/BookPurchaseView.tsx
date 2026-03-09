import { useState, useEffect } from "react";
import {
    IndianRupee,
    ShoppingCart,
    Users,
    TrendingUp,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Eye,
    Search,
    Filter,
    HelpCircle,
} from "lucide-react";
import { MOCK_PURCHASES, type PurchaseStatus, type PaymentMethod, type BookPurchase, type BookPurchaseStats } from "../books.types";
import * as bookService from "../../../../services/book.service";
import BookPurchaseDetailsModal from "./BookPurchaseDetailsModal";

// ─── Mock Types ──────────────────────────────────────────────────────────

const MOCK_STATS: BookPurchaseStats = {
    totalRevenue: 45200,
    totalPurchases: 128,
    activeBuyers: 87,
    avgOrderValue: 353,
    refundRequests: 3,
};

// ─── Helpers ─────────────────────────────────────────────────────────────
function getStatusBadge(status: PurchaseStatus) {
    const styles: Record<PurchaseStatus, string> = {
        paid: "bg-emerald-100 text-emerald-800",
        pending_payment: "bg-amber-100 text-amber-800",
    };
    const labels: Record<PurchaseStatus, string> = {
        paid: "Paid",
        pending_payment: "Pending Payment",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
        >
            {labels[status]}
        </span>
    );
}

function getPaymentBadge(method: PaymentMethod) {
    const styles: Record<PaymentMethod, string> = {
        upi: "bg-violet-100 text-violet-800",
        card: "bg-blue-100 text-blue-800",
        netbanking: "bg-gray-100 text-gray-800",
        wallet: "bg-cyan-100 text-cyan-800",
    };
    const labels: Record<PaymentMethod, string> = {
        upi: "UPI",
        card: "Card",
        netbanking: "Net Banking",
        wallet: "Wallet",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[method]}`}
        >
            {labels[method]}
        </span>
    );
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

// ─── Component ───────────────────────────────────────────────────────────
export default function BookPurchaseView() {
    const PAGE_SIZE = 5;

    // Data states
    const [purchases, setPurchases] = useState<BookPurchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<BookPurchaseStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [selectedPurchase, setSelectedPurchase] = useState<BookPurchase | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    // Filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<PurchaseStatus | "">("")
    const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "">("")

    // Fetch metrics
    const fetchMetrics = async () => {
        try {
            setStatsLoading(true);
            const data = await bookService.getBookPurchaseMetrics();
            setStats(data);
        } catch {
            console.log("Using mock purchase metrics");
            setStats(MOCK_STATS);
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch purchases
    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const filters = {
                order_status: statusFilter || undefined,
                payment_method: paymentFilter || undefined,
                search: searchTerm || undefined,
                page: currentPage,
                page_size: PAGE_SIZE,
            };

            try {
                const response = await bookService.getBookPurchases(filters);
                setPurchases(response.results || []);
                setTotalCount(response.count);
                setHasNext(response.next !== null);
                setHasPrevious(response.previous !== null);
            } catch {
                console.log("Using mock purchase data — API not available");
                let filteredData = [...MOCK_PURCHASES];

                if (statusFilter) {
                    filteredData = filteredData.filter((p) => p.order_status === statusFilter);
                }
                if (paymentFilter) {
                    filteredData = filteredData.filter((p) => p.payment_method === paymentFilter);
                }
                if (searchTerm) {
                    const search = searchTerm.toLowerCase();
                    filteredData = filteredData.filter(
                        (p) =>
                            p.buyer_email.toLowerCase().includes(search) ||
                            p.book_title.toLowerCase().includes(search) ||
                            p.buyer_email.toLowerCase().includes(search)
                    );
                }

                const start = (currentPage - 1) * PAGE_SIZE;
                const end = start + PAGE_SIZE;
                setTotalCount(filteredData.length);
                setHasNext(end < filteredData.length);
                setHasPrevious(currentPage > 1);
                setPurchases(filteredData.slice(start, end));
            }
        } catch (error) {
            console.error("Failed to fetch purchases:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPurchases();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, paymentFilter, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, paymentFilter]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE;

    const hasActiveFilters = searchTerm || statusFilter || paymentFilter;

    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("");
        setPaymentFilter("");
        setCurrentPage(1);
    };

    const getPageNumbers = (): (number | "ellipsis")[] => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | "ellipsis")[] = [];
        if (currentPage <= 3) { pages.push(1, 2, 3, 4, "ellipsis", totalPages); }
        else if (currentPage >= totalPages - 2) { pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages); }
        else { pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages); }
        return pages;
    };

    const statCards = [
        { label: "Total Revenue", value: stats ? formatCurrency(stats.totalRevenue) : "—", icon: IndianRupee, color: "#4fcfa5", bg: "rgba(79, 207, 165, 0.08)", tooltip: "Total revenue earned from all book purchases." },
        { label: "Total Purchases", value: stats ? stats.totalPurchases.toString() : "—", icon: ShoppingCart, color: "#6b96ff", bg: "rgba(107, 150, 255, 0.08)", tooltip: "Total number of book purchase transactions." },
        { label: "Active Buyers", value: stats ? stats.activeBuyers.toString() : "—", icon: Users, color: "#a78bfa", bg: "rgba(167, 139, 250, 0.08)", tooltip: "Number of unique buyers who have made purchases." },
        { label: "Avg. Order Value", value: stats ? formatCurrency(stats.avgOrderValue) : "—", icon: TrendingUp, color: "#ffc554", bg: "rgba(255, 197, 84, 0.08)", tooltip: "Average value per purchase order." },
        { label: "Refund Requests", value: stats ? stats.refundRequests.toString() : "—", icon: RotateCcw, color: "#ff7070", bg: "rgba(255, 112, 112, 0.08)", tooltip: "Number of refund requests received." },
    ];

    return (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {statCards.map((stat) => (
                    <div key={stat.label} className="clay-card min-w-0">
                        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
                            <div className="clay-circle" style={{ background: stat.bg }}>
                                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>
                            <div className="group relative">
                                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                                <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                                    {stat.tooltip}
                                </div>
                            </div>
                        </div>
                        {statsLoading ? (
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" style={{ marginBottom: "2px" }} />
                        ) : (
                            <div className="text-2xl font-bold" style={{ color: stat.color, marginBottom: "2px" }}>{stat.value}</div>
                        )}
                        <div className="text-xs" style={{ color: "#111827" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="clay-card min-w-0" style={{ padding: "14px 18px" }}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:gap-3 min-w-0 flex-1">
                        <div className="flex-1 min-w-0 w-full sm:min-w-75 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search buyer, book, email, transaction..."
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 min-w-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value as PurchaseStatus | "");
                                        setCurrentPage(1);
                                    }}
                                    className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                    style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }}
                                >
                                    <option value="">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending_payment">Pending Payment</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                <select
                                    value={paymentFilter}
                                    onChange={(e) => {
                                        setPaymentFilter(e.target.value as PaymentMethod | "");
                                        setCurrentPage(1);
                                    }}
                                    className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                    style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)" }}
                                >
                                    <option value="">All Payments</option>
                                    <option value="card">Card</option>
                                    <option value="upi">UPI</option>
                                    <option value="netbanking">Net Banking</option>
                                    <option value="wallet">Wallet</option>
                                </select>
                            </div>
                            {hasActiveFilters && (
                                <button onClick={handleClearFilters} className="clay-btn text-sm whitespace-nowrap" style={{ padding: "6px 14px", fontSize: "13px" }}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="clay-card overflow-hidden" style={{ padding: 0 }}>
                {loading ? (
                    <div className="p-8 text-center"><p className="text-gray-400">Loading purchases...</p></div>
                ) : !purchases.length ? (
                    <div className="p-8 text-center"><p className="text-gray-500 mb-4">No purchases found. Try adjusting your filters.</p></div>
                ) : (
                    <>
                        <div className="overflow-x-auto min-w-0">
                            <table className="w-full table-auto divide-y divide-gray-100 min-w-max">
                                <thead style={{ background: "#f8f9fb", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Buyer</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Book</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {purchases.map((purchase: BookPurchase) => (
                                        <tr key={purchase.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-medium text-gray-900">{purchase.buyer_name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{purchase.buyer_email}</div>
                                            </td>
                                            <td className="px-4 py-4" style={{ maxWidth: "240px" }}>
                                                <div className="text-sm font-medium text-gray-900 break-words">{purchase.book_title}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{purchase.book_author}</div>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-gray-900">{formatCurrency(purchase.amount)}</td>
                                            <td className="px-4 py-4">{getPaymentBadge(purchase.payment_method)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                {new Date(purchase.purchase_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-4 py-4">{getStatusBadge(purchase.order_status)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setSelectedPurchase(purchase)}
                                                        title="View Details"
                                                        className="p-1.5 rounded-lg transition-all duration-200"
                                                        style={{ color: "#6b96ff" }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(107, 150, 255, 0.08)"; e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {purchases.length > 0 && (
                            <div className="px-5 py-3" style={{ background: "#eff1f5", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)" }}>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-gray-600">
                                            Showing {start + 1} to {Math.min(start + PAGE_SIZE, totalCount)} of {totalCount} purchases
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={!hasPrevious}
                                            className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            style={{ padding: "5px 10px", fontSize: "12px" }}
                                            title="Previous page"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" /> Prev
                                        </button>
                                        {getPageNumbers().map((page, idx) =>
                                            page === "ellipsis" ? (
                                                <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-gray-400 select-none">…</span>
                                            ) : (
                                                <button key={page} onClick={() => setCurrentPage(page)} className="min-w-[28px] h-7 rounded-lg text-xs font-semibold transition-all" title={`Go to page ${page}`}
                                                    style={currentPage === page ? { background: "#1f2937", color: "white", boxShadow: "2px 2px 5px rgba(0,0,0,0.15)" } : { background: "#eff1f5", color: "#6b7280", boxShadow: "2px 2px 4px rgba(0,0,0,0.08), -2px -2px 4px rgba(255,255,255,0.6)" }}>
                                                    {page}
                                                </button>
                                            )
                                        )}
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={!hasNext}
                                            className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            style={{ padding: "5px 10px", fontSize: "12px" }}
                                            title="Next page"
                                        >
                                            Next <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ────── Purchase Detail Modal ────── */}
            <BookPurchaseDetailsModal
                purchase={selectedPurchase}
                isOpen={!!selectedPurchase}
                onClose={() => setSelectedPurchase(null)}
            />
        </>
    );
}

import { useState, useMemo } from "react";
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

// ─── Mock Types ──────────────────────────────────────────────────────────
type PurchaseStatus = "completed" | "pending" | "refunded";
type PaymentMethod = "UPI" | "Credit Card" | "Debit Card" | "Net Banking";

interface BookPurchase {
    id: string;
    buyer_name: string;
    buyer_email: string;
    book_title: string;
    book_author: string;
    amount: number;
    payment_method: PaymentMethod;
    transaction_id: string;
    purchase_date: string;
    status: PurchaseStatus;
}

// ─── Mock Data ───────────────────────────────────────────────────────────
const MOCK_PURCHASES: BookPurchase[] = [
    {
        id: "p1",
        buyer_name: "Dr. Ankit Sharma",
        buyer_email: "ankit.sharma@hospital.in",
        book_title: "Harrison's Principles of Internal Medicine",
        book_author: "J. Larry Jameson",
        amount: 1499,
        payment_method: "UPI",
        transaction_id: "TXN20260201A1",
        purchase_date: "2026-02-17",
        status: "completed",
    },
    {
        id: "p2",
        buyer_name: "Dr. Priya Menon",
        buyer_email: "priya.menon@clinic.in",
        book_title: "Robbins & Cotran Pathologic Basis of Disease",
        book_author: "Vinay Kumar",
        amount: 1250,
        payment_method: "Credit Card",
        transaction_id: "TXN20260201B2",
        purchase_date: "2026-02-17",
        status: "completed",
    },
    {
        id: "p3",
        buyer_name: "Dr. Rajesh Iyer",
        buyer_email: "r.iyer@medcenter.in",
        book_title: "Guyton and Hall Textbook of Medical Physiology",
        book_author: "John E. Hall",
        amount: 899,
        payment_method: "Net Banking",
        transaction_id: "TXN20260202C3",
        purchase_date: "2026-02-16",
        status: "pending",
    },
    {
        id: "p4",
        buyer_name: "Dr. Sana Khan",
        buyer_email: "sana.k@hospital.in",
        book_title: "Bailey & Love's Short Practice of Surgery",
        book_author: "Norman Williams",
        amount: 1100,
        payment_method: "UPI",
        transaction_id: "TXN20260202D4",
        purchase_date: "2026-02-16",
        status: "completed",
    },
    {
        id: "p5",
        buyer_name: "Dr. Vikram Patel",
        buyer_email: "vpatel@university.in",
        book_title: "Schwartz's Principles of Surgery",
        book_author: "F. Charles Brunicardi",
        amount: 1350,
        payment_method: "Debit Card",
        transaction_id: "TXN20260203E5",
        purchase_date: "2026-02-15",
        status: "refunded",
    },
    {
        id: "p6",
        buyer_name: "Dr. Meera Nair",
        buyer_email: "meera.n@medschool.in",
        book_title: "Gray's Anatomy for Students",
        book_author: "Richard Drake",
        amount: 799,
        payment_method: "Credit Card",
        transaction_id: "TXN20260203F6",
        purchase_date: "2026-02-15",
        status: "completed",
    },
    {
        id: "p7",
        buyer_name: "Dr. Arun Mehta",
        buyer_email: "arun.m@health.in",
        book_title: "Nelson Textbook of Pediatrics",
        book_author: "Robert M. Kliegman",
        amount: 1600,
        payment_method: "UPI",
        transaction_id: "TXN20260204G7",
        purchase_date: "2026-02-14",
        status: "completed",
    },
    {
        id: "p8",
        buyer_name: "Dr. Neha Gupta",
        buyer_email: "neha.g@clinic.in",
        book_title: "Williams Obstetrics",
        book_author: "F. Gary Cunningham",
        amount: 950,
        payment_method: "Net Banking",
        transaction_id: "TXN20260204H8",
        purchase_date: "2026-02-14",
        status: "completed",
    },
    {
        id: "p9",
        buyer_name: "Dr. Karthik Rajan",
        buyer_email: "karthik.r@hospital.in",
        book_title: "Current Medical Diagnosis & Treatment",
        book_author: "Maxine A. Papadakis",
        amount: 699,
        payment_method: "Debit Card",
        transaction_id: "TXN20260205I9",
        purchase_date: "2026-02-13",
        status: "pending",
    },
    {
        id: "p10",
        buyer_name: "Dr. Fatima Begum",
        buyer_email: "fatima.b@medcenter.in",
        book_title: "Sabiston Textbook of Surgery",
        book_author: "Courtney M. Townsend",
        amount: 1450,
        payment_method: "UPI",
        transaction_id: "TXN20260205J10",
        purchase_date: "2026-02-12",
        status: "completed",
    },
    {
        id: "p11",
        buyer_name: "Dr. Suresh Babu",
        buyer_email: "suresh.b@hospital.in",
        book_title: "Goodman & Gilman's Pharmacological Basis",
        book_author: "Laurence Brunton",
        amount: 1200,
        payment_method: "Credit Card",
        transaction_id: "TXN20260206K11",
        purchase_date: "2026-02-11",
        status: "completed",
    },
    {
        id: "p12",
        buyer_name: "Dr. Aarti Deshmukh",
        buyer_email: "aarti.d@clinic.in",
        book_title: "Ganong's Review of Medical Physiology",
        book_author: "Kim E. Barrett",
        amount: 550,
        payment_method: "UPI",
        transaction_id: "TXN20260206L12",
        purchase_date: "2026-02-10",
        status: "refunded",
    },
    {
        id: "p13",
        buyer_name: "Dr. Rohan Kapoor",
        buyer_email: "rohan.k@university.in",
        book_title: "Lange Clinical Neurology and Neuroanatomy",
        book_author: "Roger P. Simon",
        amount: 420,
        payment_method: "Net Banking",
        transaction_id: "TXN20260207M13",
        purchase_date: "2026-02-09",
        status: "completed",
    },
    {
        id: "p14",
        buyer_name: "Dr. Lata Krishnan",
        buyer_email: "lata.k@medschool.in",
        book_title: "Kaplan & Sadock's Comprehensive Textbook",
        book_author: "Benjamin J. Sadock",
        amount: 1700,
        payment_method: "Credit Card",
        transaction_id: "TXN20260207N14",
        purchase_date: "2026-02-08",
        status: "completed",
    },
    {
        id: "p15",
        buyer_name: "Dr. Imran Siddiqui",
        buyer_email: "imran.s@hospital.in",
        book_title: "Braunwald's Heart Disease",
        book_author: "Douglas P. Zipes",
        amount: 1850,
        payment_method: "Debit Card",
        transaction_id: "TXN20260208O15",
        purchase_date: "2026-02-07",
        status: "refunded",
    },
];

const MOCK_STATS = {
    totalRevenue: 45200,
    totalPurchases: 128,
    activeBuyers: 87,
    avgOrderValue: 353,
    refundRequests: 3,
};

// ─── Helpers ─────────────────────────────────────────────────────────────
function getStatusBadge(status: PurchaseStatus) {
    const styles: Record<PurchaseStatus, string> = {
        completed: "bg-emerald-100 text-emerald-800",
        pending: "bg-amber-100 text-amber-800",
        refunded: "bg-red-100 text-red-800",
    };
    const labels: Record<PurchaseStatus, string> = {
        completed: "Completed",
        pending: "Pending",
        refunded: "Refunded",
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
        UPI: "bg-violet-100 text-violet-800",
        "Credit Card": "bg-blue-100 text-blue-800",
        "Debit Card": "bg-cyan-100 text-cyan-800",
        "Net Banking": "bg-gray-100 text-gray-800",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[method]}`}
        >
            {method}
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
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPurchase, setSelectedPurchase] =
        useState<BookPurchase | null>(null);

    // Filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<PurchaseStatus | "">("")
    const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "">("")

    // Filtered data
    const filteredPurchases = useMemo(() => {
        return MOCK_PURCHASES.filter((p) => {
            const matchesSearch =
                !searchTerm ||
                p.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.buyer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = !statusFilter || p.status === statusFilter;
            const matchesPayment = !paymentFilter || p.payment_method === paymentFilter;
            return matchesSearch && matchesStatus && matchesPayment;
        });
    }, [searchTerm, statusFilter, paymentFilter]);

    const totalPages = Math.ceil(filteredPurchases.length / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE;
    const paginatedPurchases = filteredPurchases.slice(start, start + PAGE_SIZE);

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
        { label: "Total Revenue", value: formatCurrency(MOCK_STATS.totalRevenue), icon: IndianRupee, color: "#4fcfa5", bg: "rgba(79, 207, 165, 0.08)", tooltip: "Total revenue earned from all book purchases." },
        { label: "Total Purchases", value: MOCK_STATS.totalPurchases.toString(), icon: ShoppingCart, color: "#6b96ff", bg: "rgba(107, 150, 255, 0.08)", tooltip: "Total number of book purchase transactions." },
        { label: "Active Buyers", value: MOCK_STATS.activeBuyers.toString(), icon: Users, color: "#a78bfa", bg: "rgba(167, 139, 250, 0.08)", tooltip: "Number of unique buyers who have made purchases." },
        { label: "Avg. Order Value", value: formatCurrency(MOCK_STATS.avgOrderValue), icon: TrendingUp, color: "#ffc554", bg: "rgba(255, 197, 84, 0.08)", tooltip: "Average value per purchase order." },
        { label: "Refund Requests", value: MOCK_STATS.refundRequests.toString(), icon: RotateCcw, color: "#ff7070", bg: "rgba(255, 112, 112, 0.08)", tooltip: "Number of refund requests received." },
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
                        <div className="text-2xl font-bold" style={{ color: stat.color, marginBottom: "2px" }}>{stat.value}</div>
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
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="refunded">Refunded</option>
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
                                    <option value="UPI">UPI</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="Debit Card">Debit Card</option>
                                    <option value="Net Banking">Net Banking</option>
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
                {!paginatedPurchases.length ? (
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
                                    {paginatedPurchases.map((purchase) => (
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
                                            <td className="px-4 py-4">{getStatusBadge(purchase.status)}</td>
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
                        {paginatedPurchases.length > 0 && (
                            <div className="px-5 py-3" style={{ background: "#eff1f5", boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)" }}>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-gray-600">
                                            Showing {start + 1} to {Math.min(start + PAGE_SIZE, filteredPurchases.length)} of {filteredPurchases.length} purchases
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
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
                                            disabled={currentPage === totalPages}
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
            {selectedPurchase && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => setSelectedPurchase(null)}
                    />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="relative bg-white rounded-xl shadow-xl w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Purchase Details
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Transaction ID</span>
                                        <span className="font-mono text-gray-900">{selectedPurchase.transaction_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Buyer</span>
                                        <span className="text-gray-900 font-medium">{selectedPurchase.buyer_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Email</span>
                                        <span className="text-gray-900">{selectedPurchase.buyer_email}</span>
                                    </div>
                                    <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.06)" }} />
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Book</span>
                                        <span className="text-gray-900 font-medium text-right max-w-[200px]">{selectedPurchase.book_title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Author</span>
                                        <span className="text-gray-900">{selectedPurchase.book_author}</span>
                                    </div>
                                    <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.06)" }} />
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Amount</span>
                                        <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedPurchase.amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Payment</span>
                                        {getPaymentBadge(selectedPurchase.payment_method)}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Status</span>
                                        {getStatusBadge(selectedPurchase.status)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Date</span>
                                        <span className="text-gray-900">
                                            {new Date(selectedPurchase.purchase_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setSelectedPurchase(null)}
                                        className="clay-btn"
                                        style={{ fontSize: "13px", padding: "6px 16px" }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

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

// ─── Stat Card ───────────────────────────────────────────────────────────
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
                <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg ${bgColor}`}
                >
                    <span className={color}>{icon}</span>
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        {title}
                    </div>
                    <div className="text-xl font-bold text-gray-900 mt-0.5">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
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

    return (
        <>
            <div className="flex flex-col xl:flex-row gap-6 min-w-0">
                {/* ────── Left: Stat Cards ────── */}
                <div className="w-full xl:w-64 shrink-0 flex flex-row xl:flex-col gap-4 flex-wrap">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(MOCK_STATS.totalRevenue)}
                        icon={<IndianRupee className="w-5 h-5" />}
                        color="text-emerald-600"
                        bgColor="bg-emerald-50"
                    />
                    <StatCard
                        title="Total Purchases"
                        value={MOCK_STATS.totalPurchases.toString()}
                        icon={<ShoppingCart className="w-5 h-5" />}
                        color="text-blue-600"
                        bgColor="bg-blue-50"
                    />
                    <StatCard
                        title="Active Buyers"
                        value={MOCK_STATS.activeBuyers.toString()}
                        icon={<Users className="w-5 h-5" />}
                        color="text-violet-600"
                        bgColor="bg-violet-50"
                    />
                    <StatCard
                        title="Avg. Order Value"
                        value={formatCurrency(MOCK_STATS.avgOrderValue)}
                        icon={<TrendingUp className="w-5 h-5" />}
                        color="text-amber-600"
                        bgColor="bg-amber-50"
                    />
                    <StatCard
                        title="Refund Requests"
                        value={MOCK_STATS.refundRequests.toString()}
                        icon={<RotateCcw className="w-5 h-5" />}
                        color="text-red-600"
                        bgColor="bg-red-50"
                    />
                </div>

                {/* ────── Right: Purchase Table ────── */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Recent Purchases
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Showing {filteredPurchases.length} of {MOCK_PURCHASES.length} purchase transactions
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/50">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                {/* Search */}
                                <div className="flex-1 min-w-0 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Search buyer, book, email, transaction..."
                                        className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="flex items-center gap-2 min-w-0">
                                    <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value as PurchaseStatus | "");
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                    >
                                        <option value="">All Status</option>
                                        <option value="completed">Completed</option>
                                        <option value="pending">Pending</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>

                                {/* Payment Method Filter */}
                                <div className="flex items-center gap-2 min-w-0">
                                    <select
                                        value={paymentFilter}
                                        onChange={(e) => {
                                            setPaymentFilter(e.target.value as PaymentMethod | "");
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                    >
                                        <option value="">All Payments</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Debit Card">Debit Card</option>
                                        <option value="Net Banking">Net Banking</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Buyer
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Book
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedPurchases.map((purchase) => (
                                        <tr
                                            key={purchase.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {purchase.buyer_name}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {purchase.buyer_email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 max-w-[200px] truncate">
                                                    {purchase.book_title}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {purchase.book_author}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {formatCurrency(
                                                    purchase.amount
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getPaymentBadge(
                                                    purchase.payment_method
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                                                {new Date(
                                                    purchase.purchase_date
                                                ).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(
                                                    purchase.status
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() =>
                                                        setSelectedPurchase(
                                                            purchase
                                                        )
                                                    }
                                                    title="View Details"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-600">
                                    {filteredPurchases.length > 0 ? (
                                        <>Showing {start + 1} to{" "}
                                            {Math.min(
                                                start + PAGE_SIZE,
                                                filteredPurchases.length
                                            )}{" "}
                                            of {filteredPurchases.length} purchases</>
                                    ) : (
                                        <>No purchases found</>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) =>
                                                Math.max(1, p - 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <div className="px-3 py-1.5 text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) =>
                                                Math.min(totalPages, p + 1)
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                            className="relative bg-white rounded-lg shadow-xl w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Purchase Details
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Transaction ID
                                        </span>
                                        <span className="font-mono text-gray-900">
                                            {selectedPurchase.transaction_id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Buyer
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                            {selectedPurchase.buyer_name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Email
                                        </span>
                                        <span className="text-gray-900">
                                            {selectedPurchase.buyer_email}
                                        </span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Book
                                        </span>
                                        <span className="text-gray-900 font-medium text-right max-w-[200px]">
                                            {selectedPurchase.book_title}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Author
                                        </span>
                                        <span className="text-gray-900">
                                            {selectedPurchase.book_author}
                                        </span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">
                                            Amount
                                        </span>
                                        <span className="text-lg font-bold text-gray-900">
                                            {formatCurrency(
                                                selectedPurchase.amount
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">
                                            Payment
                                        </span>
                                        {getPaymentBadge(
                                            selectedPurchase.payment_method
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">
                                            Status
                                        </span>
                                        {getStatusBadge(
                                            selectedPurchase.status
                                        )}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Date
                                        </span>
                                        <span className="text-gray-900">
                                            {new Date(
                                                selectedPurchase.purchase_date
                                            ).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() =>
                                            setSelectedPurchase(null)
                                        }
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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

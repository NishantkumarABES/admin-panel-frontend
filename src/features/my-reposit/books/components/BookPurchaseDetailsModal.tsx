import { ShoppingCart, User, Mail, BookOpen, CreditCard, Calendar, Hash } from "lucide-react";
import type { BookPurchase, PurchaseStatus, PaymentMethod } from "../books.types";

interface BookPurchaseDetailsModalProps {
    purchase: BookPurchase | null;
    isOpen: boolean;
    onClose: () => void;
}

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
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
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
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[method]}`}>
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

export default function BookPurchaseDetailsModal({ purchase, isOpen, onClose }: BookPurchaseDetailsModalProps) {
    if (!isOpen || !purchase) return null;

    const InfoItem = ({
        icon: Icon, label, value,
    }: {
        icon: React.ElementType;
        label: string;
        value: string | number | undefined | null | React.ReactNode;
    }) => {
        if (!value && value !== 0) return null;
        return (
            <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-sm text-gray-900">{value}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-[18px] w-full max-w-lg max-h-[90vh] flex flex-col"
                    style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sticky Header */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <h2 className="text-lg font-semibold text-gray-900">Purchase Details</h2>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">
                        {/* Header: icon + book title + status */}
                        <div className="flex items-start justify-between gap-4 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)"
                                    }}
                                >
                                    <ShoppingCart className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{purchase.book_title}</h3>
                                    <p className="text-xs text-gray-500">by {purchase.book_author}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                                {getStatusBadge(purchase.order_status)}
                                {getPaymentBadge(purchase.payment_method)}
                            </div>
                        </div>

                        {/* Buyer Information — Inset Panel */}
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Buyer Information</h4>
                            <div
                                className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 px-3 rounded-xl"
                                style={{
                                    background: "#f8f9fb",
                                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                }}
                            >
                                <InfoItem icon={User} label="Buyer Name" value={purchase.buyer_name} />
                                <InfoItem icon={Mail} label="Email" value={purchase.buyer_email} />
                            </div>
                        </div>

                        {/* Order Information — Inset Panel */}
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Information</h4>
                            <div
                                className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 px-3 rounded-xl"
                                style={{
                                    background: "#f8f9fb",
                                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                }}
                            >
                                <InfoItem icon={BookOpen} label="Book Title" value={purchase.book_title} />
                                <InfoItem icon={BookOpen} label="Author" value={purchase.book_author} />
                                <InfoItem icon={CreditCard} label="Payment Method" value={getPaymentBadge(purchase.payment_method)} />
                                <InfoItem icon={Hash} label="Transaction ID" value={purchase.transaction_id || "—"} />
                                <InfoItem
                                    icon={Calendar}
                                    label="Purchase Date"
                                    value={new Date(purchase.purchase_date).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                />
                            </div>
                        </div>

                        {/* Amount Summary */}
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Payment Summary</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Amount", value: formatCurrency(purchase.amount) },
                                    { label: "Status", value: purchase.order_status === "paid" ? "Paid" : "Pending" },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-xl p-3 text-center"
                                        style={{
                                            background: "#f8f9fb",
                                            boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                        }}
                                    >
                                        <div className="text-base font-bold text-gray-900">{stat.value}</div>
                                        <div className="text-xs text-gray-500">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sticky Footer */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div className="text-xs text-gray-500">
                            Purchase ID: {purchase.id}
                            {purchase.transaction_id && <> · TXN: {purchase.transaction_id}</>}
                        </div>
                        <button
                            onClick={onClose}
                            className="clay-btn"
                            style={{ fontSize: "13px", padding: "6px 16px" }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

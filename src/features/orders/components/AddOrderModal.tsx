import { useState, useEffect } from "react";
import { Search, Plus, Minus, Trash2, AlertCircle, X } from "lucide-react";
import type { OrderStatus, PaymentMethod } from "../order.types";
import { ORDER_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from "../order.types";

interface User {
    id: string;
    full_name: string;
    email: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    sku?: string;
}

interface Address {
    id: string;
    name: string;
    address_line: string;
    city: string;
    state: string;
    postal_code: string;
}

interface OrderItem {
    product: Product;
    quantity: number;
}

interface AddOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        user_id: string;
        address_id: string;
        items: Array<{ product_id: string; quantity: number }>;
        payment_method: string;
        payment_reference?: string;
        status?: string;
    }) => Promise<void>;
}

export default function AddOrderModal({ isOpen, onClose, onSubmit }: AddOrderModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userSearch, setUserSearch] = useState("");

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
    const [paymentReference, setPaymentReference] = useState("");
    const [status, setStatus] = useState<OrderStatus>("pending_payment");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchUsers = async (search?: string) => {
        try {
            const { api } = await import("../../../services/api");
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            params.append("page_size", "50");
            const response = await api.get<{ results: User[] }>(`/auth/admin/all-users/?${params.toString()}`);
            setUsers(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    const fetchAddresses = async (userId: string) => {
        try {
            setLoadingAddresses(true);
            const { api } = await import("../../../services/api");
            const response = await api.get<{ success: boolean; results: Address[] }>(
                `/commerce/admin/users/${userId}/addresses/`
            );
            setAddresses(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch addresses:", err);
            setAddresses([]);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const fetchProducts = async (search?: string) => {
        try {
            const { api } = await import("../../../services/api");
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            params.append("page_size", "50");
            const response = await api.get<{ results: Product[] }>(`/commerce/admin/products/?${params.toString()}`);
            setProducts(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            fetchProducts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || selectedUser) return;
        const timer = setTimeout(() => { fetchUsers(userSearch || undefined); }, 300);
        return () => clearTimeout(timer);
    }, [userSearch, isOpen, selectedUser]);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => { fetchProducts(productSearch || undefined); }, 300);
        return () => clearTimeout(timer);
    }, [productSearch, isOpen]);

    useEffect(() => {
        if (selectedUser) {
            fetchAddresses(selectedUser.id);
            setSelectedAddress(null);
        }
    }, [selectedUser]);

    const handleAddProduct = (product: Product) => {
        const existingIndex = orderItems.findIndex((item) => item.product.id === product.id);
        if (existingIndex >= 0) {
            const updated = [...orderItems];
            updated[existingIndex].quantity += 1;
            setOrderItems(updated);
        } else {
            setOrderItems([...orderItems, { product, quantity: 1 }]);
        }
        setProductSearch("");
    };

    const handleUpdateQuantity = (productId: string, delta: number) => {
        setOrderItems((items) =>
            items.map((item) =>
                item.product.id === productId
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const handleRemoveItem = (productId: string) => {
        setOrderItems((items) => items.filter((item) => item.product.id !== productId));
    };

    const calculateTotal = () =>
        orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!selectedUser) { setError("Please select a customer"); return; }
        if (!selectedAddress) { setError("Please select a delivery address"); return; }
        if (orderItems.length === 0) { setError("Please add at least one product"); return; }
        setLoading(true);
        try {
            await onSubmit({
                user_id: selectedUser.id,
                address_id: selectedAddress.id,
                items: orderItems.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
                payment_method: paymentMethod,
                payment_reference: paymentReference || undefined,
                status,
            });
            handleClose();
        } catch (err: any) {
            setError(err?.message || "Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedUser(null);
        setSelectedAddress(null);
        setOrderItems([]);
        setPaymentMethod("cod");
        setPaymentReference("");
        setStatus("pending_payment");
        setError("");
        setUserSearch("");
        setProductSearch("");
        onClose();
    };

    if (!isOpen) return null;

    const filteredUsers = users.filter(
        (user) =>
            user.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email?.toLowerCase().includes(userSearch.toLowerCase())
    );

    const filteredProducts = products.filter(
        (product) =>
            product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
            product.sku?.toLowerCase().includes(productSearch.toLowerCase())
    );

    const insetInputStyle = {
        background: "#eff1f5",
        border: "none",
        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
    };

    const insetPanelStyle = {
        background: "#f8f9fb",
        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-[18px] w-full max-w-2xl max-h-[90vh] flex flex-col"
                    style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sticky Header */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <h2 className="text-lg font-semibold text-gray-900">Create New Order</h2>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">
                        <form id="add-order-form" onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                {/* Error Banner */}
                                {error && (
                                    <div
                                        className="flex items-start gap-2 p-3 rounded-xl text-sm text-red-600"
                                        style={{ background: "rgba(255, 112, 112, 0.08)", border: "1px solid rgba(255, 112, 112, 0.2)" }}
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                {/* Customer Selection */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Customer <span className="text-red-500">*</span>
                                    </label>
                                    {selectedUser ? (
                                        <div
                                            className="flex items-center justify-between p-3 rounded-xl"
                                            style={insetPanelStyle}
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{selectedUser.full_name}</div>
                                                <div className="text-xs text-gray-500">{selectedUser.email}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedUser(null)}
                                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                placeholder="Search customers by name or email..."
                                                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                                style={insetInputStyle}
                                            />
                                            {userSearch && filteredUsers.length > 0 && (
                                                <div
                                                    className="absolute z-10 w-full mt-1 rounded-xl max-h-48 overflow-y-auto"
                                                    style={{
                                                        background: "#fff",
                                                        boxShadow: "6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.7)",
                                                    }}
                                                >
                                                    {filteredUsers.map((user) => (
                                                        <button
                                                            key={user.id}
                                                            type="button"
                                                            onClick={() => { setSelectedUser(user); setUserSearch(""); }}
                                                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50/80 transition-colors"
                                                        >
                                                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                                            <div className="text-xs text-gray-500">{user.email}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Address Selection */}
                                {selectedUser && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                            Delivery Address <span className="text-red-500">*</span>
                                        </label>
                                        {loadingAddresses ? (
                                            <div className="text-sm text-gray-500 py-2">Loading addresses...</div>
                                        ) : addresses.length === 0 ? (
                                            <div className="text-sm text-gray-500 p-3 rounded-xl" style={insetPanelStyle}>
                                                No addresses found for this customer.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {addresses.map((address) => (
                                                    <label
                                                        key={address.id}
                                                        className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
                                                        style={
                                                            selectedAddress?.id === address.id
                                                                ? {
                                                                    background: "rgba(107, 150, 255, 0.06)",
                                                                    boxShadow: "0 0 0 1.5px #6b96ff, inset 2px 2px 5px rgba(107, 150, 255, 0.04)",
                                                                }
                                                                : insetPanelStyle
                                                        }
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="address"
                                                            checked={selectedAddress?.id === address.id}
                                                            onChange={() => setSelectedAddress(address)}
                                                            className="mt-1 accent-blue-500"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{address.name}</div>
                                                            <div className="text-xs text-gray-600">
                                                                {address.address_line}, {address.city}, {address.state} – {address.postal_code}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Products */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Products <span className="text-red-500">*</span>
                                    </label>

                                    <div className="relative mb-3">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Search products by name or SKU..."
                                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            style={insetInputStyle}
                                        />
                                        {productSearch && filteredProducts.length > 0 && (
                                            <div
                                                className="absolute z-10 w-full mt-1 rounded-xl max-h-48 overflow-y-auto"
                                                style={{
                                                    background: "#fff",
                                                    boxShadow: "6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.7)",
                                                }}
                                            >
                                                {filteredProducts.map((product) => (
                                                    <button
                                                        key={product.id}
                                                        type="button"
                                                        onClick={() => handleAddProduct(product)}
                                                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50/80 transition-colors flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                            {product.sku && <div className="text-xs text-gray-500">SKU: {product.sku}</div>}
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900 shrink-0 ml-3">
                                                            ₹{product.price.toLocaleString("en-IN")}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Items */}
                                    {orderItems.length > 0 && (
                                        <div
                                            className="rounded-xl overflow-hidden"
                                            style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                                        >
                                            {orderItems.map((item) => (
                                                <div
                                                    key={item.product.id}
                                                    className="flex items-center justify-between p-3"
                                                    style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 truncate">{item.product.name}</div>
                                                        <div className="text-xs text-gray-500">₹{item.product.price.toLocaleString("en-IN")} each</div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                                                className="p-1 rounded-lg transition-all"
                                                                style={{ color: "#6b7280" }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = "rgba(0,0,0,0.06)";
                                                                    e.currentTarget.style.boxShadow = "inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.5)";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = "transparent";
                                                                    e.currentTarget.style.boxShadow = "none";
                                                                }}
                                                            >
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className="w-7 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                                                className="p-1 rounded-lg transition-all"
                                                                style={{ color: "#6b7280" }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = "rgba(0,0,0,0.06)";
                                                                    e.currentTarget.style.boxShadow = "inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.5)";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = "transparent";
                                                                    e.currentTarget.style.boxShadow = "none";
                                                                }}
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <div className="w-24 text-right text-sm font-medium text-gray-900">
                                                            ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(item.product.id)}
                                                            className="p-1 rounded-lg transition-all"
                                                            style={{ color: "#ff7070" }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = "rgba(255, 112, 112, 0.08)";
                                                                e.currentTarget.style.boxShadow = "inset 1px 1px 3px rgba(0,0,0,0.06), inset -1px -1px 3px rgba(255,255,255,0.5)";
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = "transparent";
                                                                e.currentTarget.style.boxShadow = "none";
                                                            }}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Total row */}
                                            <div className="flex justify-between px-3 py-2.5" style={{ background: "#f8f9fb" }}>
                                                <span className="text-sm font-semibold text-gray-900">Total</span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    ₹{calculateTotal().toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Method & Reference */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Payment Method</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                            className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            style={insetInputStyle}
                                        >
                                            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                            Payment Reference <span className="text-gray-400">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentReference}
                                            onChange={(e) => setPaymentReference(e.target.value)}
                                            placeholder="Transaction ID"
                                            className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            style={insetInputStyle}
                                        />
                                    </div>
                                </div>

                                {/* Initial Status */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Initial Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as OrderStatus)}
                                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        style={insetInputStyle}
                                    >
                                        {Object.entries(ORDER_STATUS_CONFIG).map(([value, config]) => (
                                            <option key={value} value={value}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Sticky Footer */}
                    <div
                        className="flex items-center justify-end gap-3 px-6 py-4 shrink-0"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="clay-btn disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontSize: "13px", padding: "6px 18px" }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="add-order-form"
                            disabled={loading || !selectedUser || !selectedAddress || orderItems.length === 0}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: "#1f2937",
                                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                            }}
                        >
                            {loading ? "Creating..." : "Create Order"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

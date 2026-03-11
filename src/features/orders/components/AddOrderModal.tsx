import { useState, useEffect } from "react";
import { Search, Plus, Minus, Trash2, AlertCircle, X } from "lucide-react";
import type { OrderStatus, PaymentMethod } from "../order.types";
import { ORDER_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from "../order.types";
import Modal from "../../../components/common/Modal";

interface User {
    id: string;
    full_name: string;
    email: string;
}

interface ProductImage {
    id: string;
    image: string;
    created_at: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    final_price: number;
    sku?: string;
    images?: ProductImage[];
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
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Add scrollbar styles
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

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
        orderItems.reduce((sum, item) => sum + item.product.final_price * item.quantity, 0);

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
            setSubmitSuccess(true);
            setTimeout(() => { handleClose(); }, 1500);
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
        setSubmitSuccess(false);
        onClose();
    };

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

    const inputStyle = (hasError = false) => ({
        background: "#ffffff",
        border: hasError ? "1px solid #ef4444" : "1px solid #e5e7eb",
        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
    });

    const sectionStyle = {
        background: "#f8f9fb",
        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Create New Order"
            size="md"
        >
            <div className="flex flex-col h-full">
                {/* Close Button - Top Right with Click Animation */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 z-10 active:scale-95 active:shadow-inner"
                    style={{
                        background: "#f8f9fb",
                        boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.6)"
                    }}
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Success State */}
                {submitSuccess ? (
                    <div className="space-y-4 max-h-[calc(80vh-140px)] overflow-y-auto pr-2 custom-scrollbar" style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#cbd5e1 transparent'
                    }}>
                        <div className="rounded-xl p-4" style={{ background: "rgba(79, 207, 165, 0.08)", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)" }}>
                            <p className="text-sm text-emerald-800">
                                Order has been successfully created.
                            </p>
                        </div>

                        {/* Done Button - Fixed at Bottom */}
                        <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
                            borderTop: "1px solid rgba(0,0,0,0.06)",
                            marginLeft: "-2px",
                            marginRight: "-2px",
                            paddingLeft: "2px",
                            paddingRight: "2px"
                        }}>
                            <button
                                onClick={handleClose}
                                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                                style={{
                                    background: "#1f2937",
                                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                                }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Scrollable Form Content */
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar" style={{
                            maxHeight: 'calc(80vh - 140px)',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#cbd5e1 transparent'
                        }}>
                            {/* Error Message */}
                            {error && (
                                <div className="flex items-start gap-3 p-3 rounded-xl" style={{
                                    background: "#fee",
                                    border: "1px solid #fcc"
                                }}>
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Customer Selection Section */}
                            <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                    Customer
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Customer *
                                    </label>
                                    {selectedUser ? (
                                        <div
                                            className="flex items-center justify-between p-3 rounded-xl"
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #e5e7eb",
                                                boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                                            }}
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
                                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                                style={inputStyle()}
                                            />
                                            {userSearch && filteredUsers.length > 0 && (
                                                <div
                                                    className="absolute z-50 w-full mt-1 bg-white rounded-xl max-h-48 overflow-y-auto"
                                                    style={{
                                                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)",
                                                        border: "1px solid #e5e7eb"
                                                    }}
                                                >
                                                    {filteredUsers.map((user) => (
                                                        <button
                                                            key={user.id}
                                                            type="button"
                                                            onClick={() => { setSelectedUser(user); setUserSearch(""); }}
                                                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
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
                            </div>

                            {/* Address Selection Section */}
                            {selectedUser && (
                                <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                        Delivery Address
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Address *
                                        </label>
                                        {loadingAddresses ? (
                                            <div className="text-sm text-gray-500 py-2">Loading addresses...</div>
                                        ) : addresses.length === 0 ? (
                                            <div className="text-sm text-gray-500 p-3 rounded-xl" style={{
                                                background: "#ffffff",
                                                border: "1px solid #e5e7eb",
                                                boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                                            }}>
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
                                                                : {
                                                                    background: "#ffffff",
                                                                    border: "1px solid #e5e7eb",
                                                                    boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                                                                }
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
                                </div>
                            )}

                            {/* Products Section */}
                            <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                    Products
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search & Add Products *
                                    </label>
                                    <div className="relative mb-3">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Search products by name or SKU..."
                                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                            style={inputStyle()}
                                        />
                                        {productSearch && filteredProducts.length > 0 && (
                                            <div
                                                className="absolute z-50 w-full mt-1 bg-white rounded-xl max-h-48 overflow-y-auto"
                                                style={{
                                                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)",
                                                    border: "1px solid #e5e7eb"
                                                }}
                                            >
                                                {filteredProducts.map((product) => (
                                                    <button
                                                        key={product.id}
                                                        type="button"
                                                        onClick={() => handleAddProduct(product)}
                                                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                                                    >
                                                        {product.images && product.images.length > 0 && (
                                                            <img
                                                                src={product.images[0].image}
                                                                alt={product.name}
                                                                className="w-9 h-9 rounded-lg object-cover shrink-0"
                                                                style={{ border: "1px solid #e5e7eb" }}
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                            {product.sku && <div className="text-xs text-gray-500">SKU: {product.sku}</div>}
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900 shrink-0 ml-3">
                                                            ₹{product.final_price.toLocaleString("en-IN")}
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
                                            style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {orderItems.map((item) => (
                                                <div
                                                    key={item.product.id}
                                                    className="flex items-center justify-between p-3"
                                                    style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        {item.product.images && item.product.images.length > 0 && (
                                                            <img
                                                                src={item.product.images[0].image}
                                                                alt={item.product.name}
                                                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                                                                style={{ border: "1px solid #e5e7eb" }}
                                                            />
                                                        )}
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">{item.product.name}</div>
                                                            <div className="text-xs text-gray-500">₹{item.product.final_price.toLocaleString("en-IN")} each</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                                                className="p-1 rounded-lg transition-all hover:bg-gray-100"
                                                                style={{ color: "#6b7280" }}
                                                            >
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className="w-7 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                                                className="p-1 rounded-lg transition-all hover:bg-gray-100"
                                                                style={{ color: "#6b7280" }}
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <div className="w-24 text-right text-sm font-medium text-gray-900">
                                                            ₹{(item.product.final_price * item.quantity).toLocaleString("en-IN")}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(item.product.id)}
                                                            className="p-1 rounded-lg transition-all hover:bg-red-50"
                                                            style={{ color: "#ff7070" }}
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
                            </div>

                            {/* Payment Details Section */}
                            <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                    Payment Details
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                            style={inputStyle()}
                                        >
                                            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Reference <span className="text-gray-400">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentReference}
                                            onChange={(e) => setPaymentReference(e.target.value)}
                                            placeholder="Transaction ID"
                                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                            style={inputStyle()}
                                        />
                                    </div>
                                </div>

                                {/* Initial Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Initial Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as OrderStatus)}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                        style={inputStyle()}
                                    >
                                        {Object.entries(ORDER_STATUS_CONFIG).map(([value, config]) => (
                                            <option key={value} value={value}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button - Fixed Footer at Bottom */}
                        <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
                            borderTop: "1px solid rgba(0,0,0,0.06)",
                            marginLeft: "-2px",
                            marginRight: "-2px",
                            paddingLeft: "2px",
                            paddingRight: "2px"
                        }}>
                            <button
                                type="submit"
                                disabled={loading || !selectedUser || !selectedAddress || orderItems.length === 0}
                                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{
                                    background: "#1f2937",
                                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <span>Create Order</span>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}

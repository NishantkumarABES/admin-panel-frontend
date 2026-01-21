import { useState, useEffect } from "react";
import { X, Search, Plus, Minus, Trash2, AlertCircle } from "lucide-react";
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
    // User selection
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userSearch, setUserSearch] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Address selection
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    // Product selection
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    // Order details
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
    const [paymentReference, setPaymentReference] = useState("");
    const [status, setStatus] = useState<OrderStatus>("pending_payment");

    // Form state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Import API
    const fetchUsers = async (search?: string) => {
        try {
            setLoadingUsers(true);
            const { api } = await import("../../../services/api");
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            params.append("page_size", "50");

            const response = await api.get<{ results: User[] }>(`/auth/admin/all-users/?${params.toString()}`);
            setUsers(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchAddresses = async (userId: string) => {
        try {
            setLoadingAddresses(true);
            const { api } = await import("../../../services/api");
            const response = await api.get<{ success: boolean; results: Address[] }>(`/commerce/admin/users/${userId}/addresses/`);
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
            setLoadingProducts(true);
            const { api } = await import("../../../services/api");
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            params.append("page_size", "50");

            const response = await api.get<{ results: Product[] }>(`/commerce/admin/products/?${params.toString()}`);
            setProducts(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            fetchProducts();
        }
    }, [isOpen]);

    // Refetch users when search term changes (with debounce)
    useEffect(() => {
        if (!isOpen || selectedUser) return;

        const timer = setTimeout(() => {
            fetchUsers(userSearch || undefined);
        }, 300);

        return () => clearTimeout(timer);
    }, [userSearch, isOpen, selectedUser]);

    // Refetch products when search term changes (with debounce)
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            fetchProducts(productSearch || undefined);
        }, 300);

        return () => clearTimeout(timer);
    }, [productSearch, isOpen]);

    useEffect(() => {
        if (selectedUser) {
            fetchAddresses(selectedUser.id);
            setSelectedAddress(null);
        }
    }, [selectedUser]);

    const handleAddProduct = (product: Product) => {
        const existingIndex = orderItems.findIndex(item => item.product.id === product.id);
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
        setOrderItems(items =>
            items.map(item => {
                if (item.product.id === productId) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const handleRemoveItem = (productId: string) => {
        setOrderItems(items => items.filter(item => item.product.id !== productId));
    };

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!selectedUser) {
            setError("Please select a user");
            return;
        }

        if (!selectedAddress) {
            setError("Please select an address");
            return;
        }

        if (orderItems.length === 0) {
            setError("Please add at least one product");
            return;
        }

        setLoading(true);

        try {
            await onSubmit({
                user_id: selectedUser.id,
                address_id: selectedAddress.id,
                items: orderItems.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity
                })),
                payment_method: paymentMethod,
                payment_reference: paymentReference || undefined,
                status
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

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearch.toLowerCase())
    );

    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.sku?.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity" />

            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Create New Order</h2>
                        <button
                            onClick={handleClose}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
                        <div className="px-6 py-4 space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* User Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer <span className="text-red-500">*</span>
                                </label>
                                {selectedUser ? (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                        <div>
                                            <div className="font-medium text-gray-900">{selectedUser.full_name}</div>
                                            <div className="text-sm text-gray-500">{selectedUser.email}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUser(null)}
                                            className="text-gray-400 hover:text-gray-600"
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
                                            placeholder="Search customers..."
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                        {userSearch && filteredUsers.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {filteredUsers.map(user => (
                                                    <button
                                                        key={user.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setUserSearch("");
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50"
                                                    >
                                                        <div className="font-medium">{user.full_name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delivery Address <span className="text-red-500">*</span>
                                    </label>
                                    {loadingAddresses ? (
                                        <div className="text-sm text-gray-500">Loading addresses...</div>
                                    ) : addresses.length === 0 ? (
                                        <div className="text-sm text-gray-500">No addresses found for this user</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {addresses.map(address => (
                                                <label
                                                    key={address.id}
                                                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedAddress?.id === address.id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="address"
                                                        checked={selectedAddress?.id === address.id}
                                                        onChange={() => setSelectedAddress(address)}
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{address.name}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {address.address_line}, {address.city}, {address.state} - {address.postal_code}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Products <span className="text-red-500">*</span>
                                </label>

                                {/* Product Search */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    {productSearch && filteredProducts.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {filteredProducts.map(product => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => handleAddProduct(product)}
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                                                >
                                                    <div>
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-sm text-gray-500">{product.sku}</div>
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        ₹{product.price.toLocaleString()}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Items */}
                                {orderItems.length > 0 && (
                                    <div className="border rounded-lg divide-y">
                                        {orderItems.map(item => (
                                            <div key={item.product.id} className="p-3 flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{item.product.name}</div>
                                                    <div className="text-sm text-gray-500">₹{item.product.price.toLocaleString()} each</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                                            className="p-1 hover:bg-gray-100 rounded"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-8 text-center">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                                            className="p-1 hover:bg-gray-100 rounded"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="w-24 text-right font-medium">
                                                        ₹{(item.product.price * item.quantity).toLocaleString()}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item.product.id)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="p-3 bg-gray-50 flex justify-between">
                                            <span className="font-medium">Total</span>
                                            <span className="font-bold text-lg">₹{calculateTotal().toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Method
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Reference
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentReference}
                                        onChange={(e) => setPaymentReference(e.target.value)}
                                        placeholder="Transaction ID (optional)"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Initial Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {Object.entries(ORDER_STATUS_CONFIG).map(([value, config]) => (
                                        <option key={value} value={value}>{config.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !selectedUser || !selectedAddress || orderItems.length === 0}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create Order"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

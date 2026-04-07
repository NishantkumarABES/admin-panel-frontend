import { useState, useEffect } from "react";
import { Plus, Search, Filter, Tag, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type CreateSoCouponDTO, type SoCoupon, type UpdateSoCouponDTO } from "./so_coupon.types";
import SoCouponCard from "./components/SoCouponCard";
import AddEditSoCouponModal from "./components/AddEditSoCouponModal";
import SoCouponDetailsModal from "./components/SoCouponDetailsModal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import * as soCouponService from "../../../services/so-coupon.service";

export default function SoCouponView() {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState<SoCoupon[]>([]);
    const [couponsLoading, setCouponsLoading] = useState(true);
    const [couponSearchTerm, setCouponSearchTerm] = useState("");
    const [couponTypeFilter, setCouponTypeFilter] = useState<string>("all");
    const [couponStatusFilter, setCouponStatusFilter] = useState<string>("all");
    const [selectedCoupon, setSelectedCoupon] = useState<SoCoupon | null>(null);
    const [isAddEditCouponModalOpen, setIsAddEditCouponModalOpen] = useState(false);
    const [isDeleteCouponDialogOpen, setIsDeleteCouponDialogOpen] = useState(false);
    const [isCouponDetailsModalOpen, setIsCouponDetailsModalOpen] = useState(false);
    const [isExpiredSectionOpen, setIsExpiredSectionOpen] = useState(false);

    const fetchCoupons = async () => {
        try {
            setCouponsLoading(true);
            const filters: any = {};
            if (couponSearchTerm) filters.search = couponSearchTerm;
            if (couponTypeFilter !== "all") filters.coupon_type = couponTypeFilter;
            if (couponStatusFilter !== "all") filters.is_active = couponStatusFilter === "active";

            const response = await soCouponService.getSoCoupons(filters);
            const couponsData = response.data?.results || response.data;
            if (Array.isArray(couponsData)) {
                setCoupons(couponsData);
            } else {
                setCoupons([]);
            }
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
            setCoupons([]);
        } finally {
            setCouponsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { fetchCoupons(); }, 300);
        return () => clearTimeout(timer);
    }, [couponSearchTerm, couponTypeFilter, couponStatusFilter]);

    // Split coupons into active and expired
    const now = new Date();
    const activeCoupons = coupons.filter(c => new Date(c.valid_until) >= now);
    const expiredCoupons = coupons.filter(c => new Date(c.valid_until) < now);

    const handleCouponSubmit = async (data: CreateSoCouponDTO | UpdateSoCouponDTO): Promise<{ error?: string }> => {
        try {
            if ('id' in data && data.id) {
                await soCouponService.updateSoCoupon(data as UpdateSoCouponDTO);
            } else {
                await soCouponService.createSoCoupon(data as CreateSoCouponDTO);
            }
            fetchCoupons();
            return {};
        } catch (error: any) {
            console.error("Failed to save coupon:", error);
            const errorMessage = error?.response?.data?.message
                || error?.response?.data?.error
                || error?.message
                || "Failed to save coupon. Please try again.";
            return { error: errorMessage };
        }
    };

    const handleViewCoupon = (coupon: SoCoupon) => { setSelectedCoupon(coupon); setIsCouponDetailsModalOpen(true); };
    const handleCreateCoupon = () => { setSelectedCoupon(null); setIsAddEditCouponModalOpen(true); };
    const handleEditCoupon = (coupon: SoCoupon) => { setSelectedCoupon(coupon); setIsAddEditCouponModalOpen(true); };
    const handleDeleteCoupon = (coupon: SoCoupon) => { setSelectedCoupon(coupon); setIsDeleteCouponDialogOpen(true); };

    const handleToggleCouponStatus = async (coupon: SoCoupon) => {
        try {
            await soCouponService.updateSoCoupon({ id: coupon.id, is_active: !coupon.is_active });
            fetchCoupons();
        } catch (error) {
            console.error("Failed to toggle coupon status:", error);
        }
    };

    const handleConfirmDeleteCoupon = async () => {
        if (!selectedCoupon) return;
        try {
            await soCouponService.deleteSoCoupon(selectedCoupon.id);
            fetchCoupons();
            setIsDeleteCouponDialogOpen(false);
            setSelectedCoupon(null);
        } catch (error) {
            console.error("Failed to delete coupon:", error);
        }
    };

    const handleClearCouponFilters = () => {
        setCouponSearchTerm("");
        setCouponTypeFilter("all");
        setCouponStatusFilter("all");
    };

    const hasCouponActiveFilters = couponSearchTerm || couponTypeFilter !== "all" || couponStatusFilter !== "all";

    const insetInputStyle = {
        background: "#eff1f5",
        border: "none",
        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

            {/* Active Coupons Section */}
            <div className="clay-card overflow-hidden" style={{ padding: 0 }}>
                {/* Filters */}
                <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fafbfc" }}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 min-w-0">
                        <button
                            onClick={() => navigate("/other")}
                            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                            title="Back to Other"
                            style={insetInputStyle}
                        >
                            <ArrowLeft className="w-4 h-4 text-gray-600" />
                        </button>

                        {/* Search */}
                        <div className="flex-1 min-w-0 w-full sm:min-w-64 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={couponSearchTerm}
                                onChange={(e) => setCouponSearchTerm(e.target.value)}
                                placeholder="Search coupons by code..."
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                style={insetInputStyle}
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-36">
                            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                            <select
                                value={couponTypeFilter}
                                onChange={(e) => setCouponTypeFilter(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                style={insetInputStyle}
                            >
                                <option value="all">All Types</option>
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-36">
                            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                            <select
                                value={couponStatusFilter}
                                onChange={(e) => setCouponStatusFilter(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                style={insetInputStyle}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {hasCouponActiveFilters && (
                            <button
                                onClick={handleClearCouponFilters}
                                className="clay-btn text-sm whitespace-nowrap"
                                style={{ padding: "6px 14px", fontSize: "13px" }}
                            >
                                Clear Filters
                            </button>
                        )}

                        {/* Create Coupon Button */}
                        <button
                            onClick={handleCreateCoupon}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap shrink-0"
                            style={{
                                background: "#1f2937",
                                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Create Coupon
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {couponsLoading ? (
                        /* Skeleton Loaders */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="clay-skeleton overflow-hidden"
                                    style={{ borderRadius: "14px", height: "220px" }}
                                >
                                    <div
                                        className="w-full animate-pulse"
                                        style={{ height: "100px", background: "rgba(0,0,0,0.04)" }}
                                    />
                                    <div className="p-4 space-y-3">
                                        <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse" />
                                        <div className="flex gap-2">
                                            <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse" />
                                            <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse" />
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-200 rounded animate-pulse" />
                                        <div className="w-2/3 h-3 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activeCoupons.length === 0 && expiredCoupons.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-16">
                            <div
                                className="clay-circle mb-4"
                                style={{
                                    width: "64px",
                                    height: "64px",
                                    background: "rgba(45, 212, 191, 0.06)",
                                }}
                            >
                                <Tag className="w-7 h-7" style={{ color: "rgba(45, 212, 191, 0.4)" }} />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                                No coupons created yet
                            </h3>
                            <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
                                Create discount coupons for second opinion consultations. Coupons help make consultations more accessible.
                            </p>
                            <button
                                onClick={handleCreateCoupon}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                                style={{
                                    background: "#1f2937",
                                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                                }}
                            >
                                <Plus className="w-4 h-4" />
                                Create Your First Coupon
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Active Coupons Grid */}
                            {activeCoupons.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {activeCoupons.map((coupon) => (
                                        <SoCouponCard
                                            key={coupon.id}
                                            coupon={coupon}
                                            onView={handleViewCoupon}
                                            onEdit={handleEditCoupon}
                                            onDelete={handleDeleteCoupon}
                                            onToggleStatus={handleToggleCouponStatus}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-sm text-gray-500">
                                    No active coupons found.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Expired Coupons Section */}
            {!couponsLoading && expiredCoupons.length > 0 && (
                <div className="clay-card overflow-hidden" style={{ padding: 0 }}>
                    {/* Expired Section Header */}
                    <button
                        onClick={() => setIsExpiredSectionOpen(!isExpiredSectionOpen)}
                        className="w-full px-5 py-3 flex items-center justify-between gap-2 text-left transition-colors hover:bg-gray-50/50"
                        style={{
                            background: "transparent",
                            border: "none",
                            borderBottomWidth: isExpiredSectionOpen ? "1px" : "0",
                            borderBottomStyle: "solid",
                            borderBottomColor: "rgba(0,0,0,0.06)",
                            cursor: "pointer",
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="clay-circle"
                                style={{ background: "rgba(156, 163, 175, 0.08)", width: "32px", height: "32px" }}
                            >
                                <Tag className="w-4 h-4" style={{ color: "#9ca3af" }} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-600">Expired Coupons</h2>
                                <p className="text-xs text-gray-400">{expiredCoupons.length} expired coupon{expiredCoupons.length !== 1 ? "s" : ""}</p>
                            </div>
                        </div>
                        {isExpiredSectionOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </button>

                    {/* Expired Coupons Grid */}
                    {isExpiredSectionOpen && (
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {expiredCoupons.map((coupon) => (
                                    <SoCouponCard
                                        key={coupon.id}
                                        coupon={coupon}
                                        isExpired
                                        onView={handleViewCoupon}
                                        onEdit={handleEditCoupon}
                                        onDelete={handleDeleteCoupon}
                                        onToggleStatus={handleToggleCouponStatus}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <SoCouponDetailsModal
                coupon={selectedCoupon}
                isOpen={isCouponDetailsModalOpen}
                onClose={() => {
                    setIsCouponDetailsModalOpen(false);
                    setSelectedCoupon(null);
                }}
            />

            <AddEditSoCouponModal
                coupon={selectedCoupon}
                isOpen={isAddEditCouponModalOpen}
                onClose={() => {
                    setIsAddEditCouponModalOpen(false);
                    setSelectedCoupon(null);
                }}
                onSubmit={handleCouponSubmit}
            />

            <ConfirmDialog
                isOpen={isDeleteCouponDialogOpen}
                onClose={() => {
                    setIsDeleteCouponDialogOpen(false);
                    setSelectedCoupon(null);
                }}
                onConfirm={handleConfirmDeleteCoupon}
                title="Delete Coupon"
                message={`Are you sure you want to delete coupon "${selectedCoupon?.code}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}

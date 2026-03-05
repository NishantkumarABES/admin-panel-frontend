import { useState, useEffect } from "react";
import { Plus, Search, Filter, Image as ImageIcon } from "lucide-react";
import type { Banner, CreateBannerDTO, UpdateBannerDTO } from "./banner.types";
import BannerCard from "./components/BannerCard";
import AddEditBannerModal from "./components/AddEditBannerModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import * as bannerService from "../../services/banner.service";

export default function BannersView() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (searchTerm) filters.search = searchTerm;
            if (statusFilter !== "all")
                filters.is_active = statusFilter === "active";

            const response = await bannerService.getBanners(filters);
            const bannersData = response.data;
            if (Array.isArray(bannersData)) {
                // Sort by order field ascending (if order exists)
                setBanners(
                    bannersData.sort(
                        (a: Banner, b: Banner) => (a.order ?? 0) - (b.order ?? 0)
                    )
                );
            } else {
                setBanners([]);
            }
        } catch (error) {
            console.error("Failed to fetch banners:", error);
            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBanners();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter]);

    const handleSubmit = async (
        data: CreateBannerDTO | UpdateBannerDTO
    ): Promise<{ error?: string }> => {
        try {
            if ("id" in data && data.id) {
                await bannerService.updateBanner(data as UpdateBannerDTO);
            } else {
                await bannerService.createBanner(data as CreateBannerDTO);
            }
            fetchBanners();
            return {};
        } catch (error: any) {
            console.error("Failed to save banner:", error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to save banner. Please try again.";
            return { error: errorMessage };
        }
    };

    const handleCreate = () => {
        setSelectedBanner(null);
        setIsAddEditModalOpen(true);
    };
    const handleEdit = (banner: Banner) => {
        setSelectedBanner(banner);
        setIsAddEditModalOpen(true);
    };
    const handleDelete = (banner: Banner) => {
        setSelectedBanner(banner);
        setIsDeleteDialogOpen(true);
    };

    const handleToggleStatus = async (banner: Banner) => {
        try {
            // Optimistic update
            setBanners((prev) =>
                prev.map((b) =>
                    b.id === banner.id
                        ? { ...b, is_active: !b.is_active }
                        : b
                )
            );
            await bannerService.updateBanner({
                id: banner.id,
                is_active: !banner.is_active,
            });
        } catch (error) {
            console.error("Failed to toggle banner status:", error);
            // Revert on error
            setBanners((prev) =>
                prev.map((b) =>
                    b.id === banner.id
                        ? { ...b, is_active: banner.is_active }
                        : b
                )
            );
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedBanner) return;
        try {
            await bannerService.deleteBanner(selectedBanner.id);
            fetchBanners();
            setIsDeleteDialogOpen(false);
            setSelectedBanner(null);
        } catch (error) {
            console.error("Failed to delete banner:", error);
        }
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
    };

    const hasActiveFilters = searchTerm || statusFilter !== "all";

    const insetInputStyle = {
        background: "#eff1f5",
        border: "none",
        boxShadow:
            "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
    };

    return (
        <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            className="min-w-0 max-w-full"
        >
            <div className="clay-card overflow-hidden" style={{ padding: 0 }}>
                {/* Header */}
                <div
                    className="px-5 py-3 flex items-center justify-between gap-2"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="clay-circle"
                            style={{
                                background: "rgba(107, 150, 255, 0.08)",
                                width: "32px",
                                height: "32px",
                            }}
                        >
                            <ImageIcon
                                className="w-4 h-4"
                                style={{ color: "#6b96ff" }}
                            />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">
                                Application Banners
                            </h2>
                            <p className="text-xs text-gray-500">
                                Manage promotional banners displayed in the app
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap shrink-0"
                        style={{
                            background: "#1f2937",
                            boxShadow:
                                "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Create Banner
                    </button>
                </div>

                {/* Filters */}
                <div
                    className="px-5 py-3"
                    style={{
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        background: "#fafbfc",
                    }}
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 min-w-0">
                        {/* Search */}
                        <div className="flex-1 min-w-0 w-full sm:min-w-64 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search banners by title..."
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                style={insetInputStyle}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-36">
                            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                style={insetInputStyle}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="clay-btn text-sm whitespace-nowrap"
                                style={{
                                    padding: "6px 14px",
                                    fontSize: "13px",
                                }}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {loading ? (
                        /* Skeleton Loaders */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="clay-skeleton overflow-hidden"
                                    style={{
                                        borderRadius: "18px",
                                        height: "320px",
                                    }}
                                >
                                    <div
                                        className="w-full animate-pulse"
                                        style={{
                                            aspectRatio: "16 / 9",
                                            background:
                                                "rgba(0,0,0,0.04)",
                                        }}
                                    />
                                    <div className="p-4 space-y-3">
                                        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                                        <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse" />
                                        <div className="flex gap-2">
                                            <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse" />
                                            <div className="w-12 h-5 bg-gray-200 rounded-full animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : banners.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-16">
                            <div
                                className="clay-circle mb-4"
                                style={{
                                    width: "64px",
                                    height: "64px",
                                    background: "rgba(107, 150, 255, 0.06)",
                                }}
                            >
                                <ImageIcon
                                    className="w-7 h-7"
                                    style={{
                                        color: "rgba(107, 150, 255, 0.4)",
                                    }}
                                />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                                No banners created yet
                            </h3>
                            <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
                                Create promotional banners to display in
                                the app. Banners help drive engagement and
                                highlight important campaigns.
                            </p>
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                                style={{
                                    background: "#1f2937",
                                    boxShadow:
                                        "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                                }}
                            >
                                <Plus className="w-4 h-4" />
                                Create Your First Banner
                            </button>
                        </div>
                    ) : (
                        /* Banner Cards Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {banners.map((banner) => (
                                <BannerCard
                                    key={banner.id}
                                    banner={banner}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggleStatus={handleToggleStatus}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AddEditBannerModal
                banner={selectedBanner}
                isOpen={isAddEditModalOpen}
                onClose={() => {
                    setIsAddEditModalOpen(false);
                    setSelectedBanner(null);
                }}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedBanner(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Banner"
                message={`Are you sure you want to delete banner "${selectedBanner?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}

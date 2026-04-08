import { useState, useEffect, useRef } from "react";
import { Plus, Search, LayoutGrid, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AppCategory, CreateAppCategoryDTO, UpdateAppCategoryDTO } from "./app_categories.types";
import CategoryCard from "./components/CategoryCard";
import AddEditCategoryModal from "./components/AddEditCategoryModal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import * as appCategoryService from "../../../services/app-category.service";

export default function AppCategoriesView() {
    const navigate = useNavigate();
    const isFirstSearchEffectRun = useRef(true);
    const [categories, setCategories] = useState<AppCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<AppCategory | null>(null);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (searchTerm) filters.search = searchTerm;

            const response = await appCategoryService.getAppCategories(filters);
            const data = response.data;
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (isFirstSearchEffectRun.current) {
            isFirstSearchEffectRun.current = false;
            return;
        }

        const timer = setTimeout(() => { fetchCategories(); }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSubmit = async (data: CreateAppCategoryDTO | UpdateAppCategoryDTO): Promise<{ error?: string }> => {
        try {
            if ('id' in data && data.id) {
                await appCategoryService.updateAppCategory(data as UpdateAppCategoryDTO);
            } else {
                await appCategoryService.createAppCategory(data as CreateAppCategoryDTO);
            }
            fetchCategories();
            return {};
        } catch (error: any) {
            console.error("Failed to save category:", error);
            const errorMessage = error?.response?.data?.message
                || error?.response?.data?.error
                || error?.message
                || "Failed to save category. Please try again.";
            return { error: errorMessage };
        }
    };

    const handleCreate = () => { setSelectedCategory(null); setIsAddEditModalOpen(true); };
    const handleEdit = (category: AppCategory) => { setSelectedCategory(category); setIsAddEditModalOpen(true); };
    const handleDelete = (category: AppCategory) => { setSelectedCategory(category); setIsDeleteDialogOpen(true); };

    const handleConfirmDelete = async () => {
        if (!selectedCategory) return;
        try {
            await appCategoryService.deleteAppCategory(selectedCategory.id);
            fetchCategories();
            setIsDeleteDialogOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };

    const insetInputStyle = {
        background: "#eff1f5",
        border: "none",
        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">
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
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search categories..."
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                style={insetInputStyle}
                            />
                        </div>

                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="clay-btn text-sm whitespace-nowrap"
                                style={{ padding: "6px 14px", fontSize: "13px" }}
                            >
                                Clear
                            </button>
                        )}

                        {/* Create Category Button */}
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap shrink-0"
                            style={{
                                background: "#1f2937",
                                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Create Category
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {loading ? (
                        /* Skeleton Loaders */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="clay-skeleton overflow-hidden"
                                    style={{ borderRadius: "14px", height: "240px" }}
                                >
                                    <div
                                        className="w-full animate-pulse"
                                        style={{ height: "140px", background: "rgba(0,0,0,0.04)" }}
                                    />
                                    <div className="p-4 space-y-3">
                                        <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" />
                                        <div className="w-1/3 h-3 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : categories.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-16">
                            <div
                                className="clay-circle mb-4"
                                style={{
                                    width: "64px",
                                    height: "64px",
                                    background: "rgba(99, 102, 241, 0.06)",
                                }}
                            >
                                <LayoutGrid className="w-7 h-7" style={{ color: "rgba(99, 102, 241, 0.4)" }} />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                                No categories found
                            </h3>
                            <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
                                Create appointment categories to organize doctors by specialization. Categories help patients find the right doctor.
                            </p>
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                                style={{
                                    background: "#1f2937",
                                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                                }}
                            >
                                <Plus className="w-4 h-4" />
                                Create Your First Category
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {categories.map((category) => (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AddEditCategoryModal
                category={selectedCategory}
                isOpen={isAddEditModalOpen}
                onClose={() => {
                    setIsAddEditModalOpen(false);
                    setSelectedCategory(null);
                }}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedCategory(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${selectedCategory?.label}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}

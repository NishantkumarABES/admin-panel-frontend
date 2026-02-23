import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, X, HelpCircle, Package, CheckSquare, XSquare, Tag } from "lucide-react";
import type { Product, CreateProductDTO, ProductAnalytics, ProductStatus } from "./product.types";
import { mockProducts, PRODUCT_CATEGORIES } from "./product.types";
import { type CreateCouponDTO, type Coupon, type UpdateCouponDTO } from "./coupon.types";
import ProductTable from "./components/ProductTable";
import ProductDetailsModal from "./components/ProductDetailsModal";
import AddEditProductModal from "./components/AddEditProductModal";
import CouponTable from "./components/CouponTable";
import AddEditCouponModal from "./components/AddEditCouponModal";
import CouponDetailsModal from "./components/CouponDetailsModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import * as productService from "../../services/product.service";
import * as couponService from "../../services/coupon.service";

export default function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [userTypeFilter, setUserTypeFilter] = useState<"all" | "patients" | "doctors" | "both">("all");
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);

  // Category dropdown states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);

  // Coupon states
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [couponSearchTerm, setCouponSearchTerm] = useState("");
  const [couponTypeFilter, setCouponTypeFilter] = useState<string>("all");
  const [couponStatusFilter, setCouponStatusFilter] = useState<string>("all");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isAddEditCouponModalOpen, setIsAddEditCouponModalOpen] = useState(false);
  const [isDeleteCouponDialogOpen, setIsDeleteCouponDialogOpen] = useState(false);
  const [isCouponDetailsModalOpen, setIsCouponDetailsModalOpen] = useState(false);

  // Fetch products analytics
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await productService.getProductsAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      const total = mockProducts.length;
      const active = mockProducts.filter((p: Product) => p.is_active).length;
      const inactive = total - active;
      setAnalytics({ total_products: total, instock_products: active, outofstock_products: inactive, success: true });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const filters: any = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        user_type: userTypeFilter !== "all" ? userTypeFilter : undefined,
        search: searchTerm || undefined,
        page: currentPage,
        page_size: pageSize,
      };

      if (userTypeFilter === "patients") {
        filters.for_patients = true;
      } else if (userTypeFilter === "doctors") {
        filters.for_doctors = true;
      } else if (userTypeFilter === "both") {
        filters.for_patients = true;
        filters.for_doctors = true;
      }

      try {
        const response = await productService.getProducts(filters);
        setProducts(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockProducts];

        if (statusFilter !== "all") {
          filteredData = filteredData.filter(p =>
            statusFilter === "instock" ? p.is_active : !p.is_active
          );
        }
        if (categoryFilter !== "all") {
          filteredData = filteredData.filter(p => p.category === categoryFilter);
        }
        if (userTypeFilter === "patients") {
          filteredData = filteredData.filter(p => p.for_patients);
        } else if (userTypeFilter === "doctors") {
          filteredData = filteredData.filter(p => p.for_doctors);
        } else if (userTypeFilter === "both") {
          filteredData = filteredData.filter(p => p.for_patients && p.for_doctors);
        }
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            p =>
              p.name.toLowerCase().includes(search) ||
              p.sku.toLowerCase().includes(search) ||
              p.description.toLowerCase().includes(search)
          );
        }
        setProducts(filteredData);
        setTotalCount(filteredData.length);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setCouponsLoading(true);
      const filters: any = {};
      if (couponSearchTerm) filters.search = couponSearchTerm;
      if (couponTypeFilter !== "all") filters.coupon_type = couponTypeFilter;
      if (couponStatusFilter !== "all") filters.is_active = couponStatusFilter === "active";

      const response = await couponService.getCoupons(filters);
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
    fetchAnalytics();
    fetchCoupons();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { fetchProducts(); }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter, currentPage, pageSize, userTypeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchCoupons(); }, 300);
    return () => clearTimeout(timer);
  }, [couponSearchTerm, couponTypeFilter, couponStatusFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, categoryFilter, userTypeFilter]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
        setCategorySearchTerm("");
      }
    };
    if (isCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isCategoryDropdownOpen]);

  // Handlers
  const handleView = (product: Product) => { setSelectedProduct(product); setIsDetailsModalOpen(true); };
  const handleAdd = () => { setSelectedProduct(null); setIsAddEditModalOpen(true); };
  const handleEdit = (product: Product) => { setSelectedProduct(product); setIsAddEditModalOpen(true); };

  const handleAddEditSubmit = async (data: CreateProductDTO): Promise<{ error?: string }> => {
    try {
      if (selectedProduct) {
        await productService.updateProduct({ ...data, id: selectedProduct.id });
      } else {
        await productService.createProduct(data);
      }
      fetchProducts();
      fetchAnalytics();
      return {};
    } catch (error: any) {
      console.error("Failed to save product:", error);
      const errorMessage = error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || (selectedProduct ? "Failed to update product. Please try again." : "Failed to add product. Please try again.");
      return { error: errorMessage };
    }
  };

  const handleCouponSubmit = async (data: CreateCouponDTO | UpdateCouponDTO): Promise<{ error?: string }> => {
    try {
      if ('id' in data && data.id) {
        await couponService.updateCoupon(data as UpdateCouponDTO);
      } else {
        await couponService.createCoupon(data as CreateCouponDTO);
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

  const handleViewCoupon = (coupon: Coupon) => { setSelectedCoupon(coupon); setIsCouponDetailsModalOpen(true); };
  const handleCreateCoupon = () => { setSelectedCoupon(null); setIsAddEditCouponModalOpen(true); };
  const handleEditCoupon = (coupon: Coupon) => { setSelectedCoupon(coupon); setIsAddEditCouponModalOpen(true); };
  const handleDeleteCoupon = (coupon: Coupon) => { setSelectedCoupon(coupon); setIsDeleteCouponDialogOpen(true); };

  const handleToggleCouponStatus = async (coupon: Coupon) => {
    try {
      await couponService.updateCoupon({ id: coupon.id, is_active: !coupon.is_active });
      fetchCoupons();
    } catch (error) {
      console.error("Failed to toggle coupon status:", error);
    }
  };

  const handleConfirmDeleteCoupon = async () => {
    if (!selectedCoupon) return;
    try {
      await couponService.deleteCoupon(selectedCoupon.id);
      fetchCoupons();
      setIsDeleteCouponDialogOpen(false);
      setSelectedCoupon(null);
    } catch (error) {
      console.error("Failed to delete coupon:", error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setUserTypeFilter("all");
  };

  const filteredCategories = PRODUCT_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const getCategoryDisplayLabel = () => {
    if (categoryFilter === "all") return "All Categories";
    return categoryFilter;
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || categoryFilter !== "all" || userTypeFilter !== "all";

  const totalPages = Math.ceil(totalCount / pageSize);

  // Build pagination page numbers with ellipsis
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
    }
    return pages;
  };

  const handleClearCouponFilters = () => {
    setCouponSearchTerm("");
    setCouponTypeFilter("all");
    setCouponStatusFilter("all");
  };

  const hasCouponActiveFilters = couponSearchTerm || couponTypeFilter !== "all" || couponStatusFilter !== "all";

  const stats = analytics
    ? {
      total: analytics.total_products,
      instock: analytics.instock_products,
      outofstock: analytics.outofstock_products,
    }
    : {
      total: totalCount || products.length,
      instock: products.filter(p => p.is_active).length,
      outofstock: products.filter(p => !p.is_active).length,
    };

  const insetInputStyle = {
    background: "#eff1f5",
    border: "none",
    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Total Products */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
              <Package className="w-5 h-5" style={{ color: "#6b96ff" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                The total number of products in the system.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-xl font-bold text-gray-900" style={{ marginBottom: "2px" }}>{stats.total}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Total Products</div>
        </div>

        {/* In Stock */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
              <CheckSquare className="w-5 h-5" style={{ color: "#4fcfa5" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                Products currently available with stock greater than zero.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-xl font-bold" style={{ color: "#4fcfa5", marginBottom: "2px" }}>{stats.instock}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>In Stock</div>
        </div>

        {/* Out of Stock */}
        <div className="clay-card min-w-0">
          <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
            <div className="clay-circle" style={{ background: "rgba(255, 112, 112, 0.08)" }}>
              <XSquare className="w-5 h-5" style={{ color: "#ff7070" }} />
            </div>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                Products with zero stock quantity.
              </div>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
          ) : (
            <div className="text-xl font-bold" style={{ color: "#ff7070", marginBottom: "2px" }}>{stats.outofstock}</div>
          )}
          <div className="text-xs" style={{ color: "#111827" }}>Out of Stock</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="clay-card min-w-0" style={{ padding: "14px 18px" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 min-w-0">
          {/* Left side: Search + Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:gap-3 min-w-0 flex-1">
            {/* Search */}
            <div className="flex-1 min-w-0 w-full sm:min-w-75 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, brand, or description..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                style={insetInputStyle}
              />
            </div>

            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              {/* Category Filter - Searchable Dropdown */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-52 relative" ref={categoryDropdownRef}>
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full px-3 py-2 text-sm rounded-xl text-left flex items-center justify-between gap-2"
                    style={insetInputStyle}
                  >
                    <span className="truncate">{getCategoryDisplayLabel()}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <div
                      className="absolute z-50 mt-1 w-full bg-white rounded-xl max-h-80 overflow-hidden"
                      style={{ boxShadow: "6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.7)" }}
                    >
                      <div className="p-2 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={categorySearchTerm}
                            onChange={(e) => setCategorySearchTerm(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-8 pr-8 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)" }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {categorySearchTerm && (
                            <button onClick={() => setCategorySearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-64">
                        <button
                          onClick={() => { setCategoryFilter("all"); setIsCategoryDropdownOpen(false); setCategorySearchTerm(""); }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${categoryFilter === "all" ? "bg-gray-50 font-medium" : ""}`}
                        >
                          All Categories
                        </button>
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <button
                              key={category}
                              onClick={() => { setCategoryFilter(category); setIsCategoryDropdownOpen(false); setCategorySearchTerm(""); }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${categoryFilter === category ? "bg-gray-50 font-medium" : ""}`}
                            >
                              {category}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">No categories found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ProductStatus | "all")}
                  className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                  style={insetInputStyle}
                >
                  <option value="all">All Status</option>
                  <option value="instock">In Stock</option>
                  <option value="outofstock">Out of Stock</option>
                </select>
              </div>

              {/* User Type Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value as "all" | "patients" | "doctors" | "both")}
                  className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                  style={insetInputStyle}
                >
                  <option value="all">All Users</option>
                  <option value="patients">For Patients</option>
                  <option value="doctors">For Doctors</option>
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="clay-btn text-sm whitespace-nowrap"
                  style={{ padding: "6px 14px", fontSize: "13px" }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Right side: Add Product Button */}
          <div className="flex justify-end lg:justify-normal shrink-0">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap shrink-0"
              style={{
                background: "#1f2937",
                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
              }}
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="clay-card overflow-hidden" style={{ padding: 0 }}>
        {loading ? (
          /* Skeleton Loading Rows */
          <div className="w-full">
            <div
              className="px-4 py-3"
              style={{ background: "#f8f9fb", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse ml-auto" />
              </div>
            </div>
            {[...Array(pageSize)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-4 animate-pulse"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
              >
                {/* Image + Name */}
                <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="w-44 h-4 bg-gray-200 rounded" />
                  <div className="w-28 h-3 bg-gray-100 rounded" />
                </div>
                {/* Category */}
                <div className="w-24 h-6 bg-gray-200 rounded-lg" />
                {/* Price */}
                <div className="w-16 h-3.5 bg-gray-200 rounded" />
                {/* Status */}
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                {/* Actions */}
                <div className="flex gap-1.5">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No products found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <ProductTable
              products={products}
              onView={handleView}
              onEdit={handleEdit}
            />

            {/* Products Pagination */}
            {!loading && products.length > 0 && (
              <div
                className="px-5 py-3"
                style={{
                  background: "#eff1f5",
                  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-600">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} products
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor="productPageSize" className="text-xs text-gray-600">Per page:</label>
                        <select
                          id="productPageSize"
                          value={pageSize}
                          onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                          className="px-2 py-1 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          style={{ background: "#ffffff", border: "none", boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.5)" }}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!hasPrevious}
                        className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        title="Previous page"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev
                      </button>

                      {/* Page Number Buttons */}
                      {getPageNumbers().map((page, idx) =>
                        page === "ellipsis" ? (
                          <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-gray-400 select-none">…</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className="min-w-[28px] h-7 rounded-lg text-xs font-semibold transition-all"
                            style={
                              currentPage === page
                                ? { background: "#1f2937", color: "white", boxShadow: "2px 2px 5px rgba(0,0,0,0.15)" }
                                : { background: "#eff1f5", color: "#6b7280", boxShadow: "2px 2px 4px rgba(0,0,0,0.08), -2px -2px 4px rgba(255,255,255,0.6)" }
                            }
                            title={`Go to page ${page}`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!hasNext}
                        className="clay-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        title="Next page"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Coupons Section */}
      <div className="clay-card overflow-hidden" style={{ padding: 0 }}>
        {/* Coupon Section Header */}
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="clay-circle" style={{ background: "rgba(162, 133, 255, 0.08)", width: "32px", height: "32px" }}>
            <Tag className="w-4 h-4" style={{ color: "#a285ff" }} />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Coupons Management</h2>
        </div>

        {/* Coupon Filters */}
        <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fafbfc" }}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 min-w-0">
            {/* Left side: Search + Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:gap-3 min-w-0 flex-1">
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

              {/* Clear Coupon Filters */}
              {hasCouponActiveFilters && (
                <button
                  onClick={handleClearCouponFilters}
                  className="clay-btn text-sm whitespace-nowrap"
                  style={{ padding: "6px 14px", fontSize: "13px" }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Create Coupon Button */}
            <div className="flex justify-end lg:justify-normal shrink-0">
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
        </div>

        {/* Coupon Table */}
        {couponsLoading ? (
          /* Skeleton Loading Rows */
          <div className="w-full">
            <div
              className="px-4 py-3"
              style={{ background: "#f8f9fb", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse ml-auto" />
              </div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-4 animate-pulse"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
              >
                {/* Code */}
                <div className="w-28 h-4 bg-gray-200 rounded" />
                {/* Type */}
                <div className="w-20 h-6 bg-gray-200 rounded-lg" />
                {/* Value */}
                <div className="w-16 h-3.5 bg-gray-200 rounded" />
                {/* Min Order */}
                <div className="w-16 h-3.5 bg-gray-200 rounded" />
                {/* Status */}
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                {/* Actions */}
                <div className="flex gap-1.5 ml-auto">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No coupons found. Create a coupon to get started.
          </div>
        ) : (
          <CouponTable
            coupons={coupons}
            onView={handleViewCoupon}
            onEdit={handleEditCoupon}
            onDelete={handleDeleteCoupon}
            onToggleStatus={handleToggleCouponStatus}
          />
        )}
      </div>

      {/* Modals */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <AddEditProductModal
        product={selectedProduct}
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleAddEditSubmit}
      />

      <CouponDetailsModal
        coupon={selectedCoupon}
        isOpen={isCouponDetailsModalOpen}
        onClose={() => {
          setIsCouponDetailsModalOpen(false);
          setSelectedCoupon(null);
        }}
      />

      <AddEditCouponModal
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
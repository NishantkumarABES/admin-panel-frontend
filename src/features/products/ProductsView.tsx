import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
import type { Product, CreateProductDTO, ProductAnalytics, ProductStatus } from "./product.types.ts";
import { mockProducts, PRODUCT_CATEGORIES } from "./product.types.ts";
import { type CreateCouponDTO, type Coupon, type UpdateCouponDTO } from "./coupon.types";
import ProductTable from "./components/ProductTable";
import ProductDetailsModal from "./components/ProductDetailsModal";
import AddEditProductModal from "./components/AddEditProductModal";
import CouponTable from "./components/CouponTable";
import AddEditCouponModal from "./components/AddEditCouponModal";
import CouponDetailsModal from "./components/CouponDetailsModal.tsx";
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
  // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Coupon states
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [couponSearchTerm, setCouponSearchTerm] = useState("");
  const [couponTypeFilter, setCouponTypeFilter] = useState<string>("all");
  const [couponStatusFilter, setCouponStatusFilter] = useState<string>("all");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  // const [isCreateCouponModalOpen, setIsCreateCouponModalOpen] = useState(false);
  // const [isEditCouponModalOpen, setIsEditCouponModalOpen] = useState(false);
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
      // Calculate from mock data
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

      // Add user type filter
      if (userTypeFilter === "patients") {
        filters.for_patients = true;
      } else if (userTypeFilter === "doctors") {
        filters.for_doctors = true;
      } else if (userTypeFilter === "both") {
        filters.for_patients = true;
        filters.for_doctors = true;
      }

      // Try to fetch from API, fallback to mock data on error
      try {
        const response = await productService.getProducts(filters);
        setProducts(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockProducts];

        // Apply status filter
        if (statusFilter !== "all") {
          filteredData = filteredData.filter(p =>
            statusFilter === "instock" ? p.is_active : !p.is_active
          );
        }

        // Apply category filter
        if (categoryFilter !== "all") {
          filteredData = filteredData.filter(p => p.category === categoryFilter);
        }

        // Apply user type filter
        if (userTypeFilter === "patients") {
          filteredData = filteredData.filter(p => p.for_patients);
        } else if (userTypeFilter === "doctors") {
          filteredData = filteredData.filter(p => p.for_doctors);
        } else if (userTypeFilter === "both") {
          filteredData = filteredData.filter(p => p.for_patients && p.for_doctors);
        }

        // Apply search filter
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


  // Fetch coupons from API with filters
  const fetchCoupons = async () => {
    try {
      setCouponsLoading(true);
      const filters: any = {};

      if (couponSearchTerm) {
        filters.search = couponSearchTerm;
      }

      if (couponTypeFilter !== "all") {
        filters.coupon_type = couponTypeFilter;
      }

      if (couponStatusFilter !== "all") {
        filters.is_active = couponStatusFilter === "active";
      }

      // Call API
      const response = await couponService.getCoupons(filters);
      const couponsData = response.data?.results || response.data;

      if (Array.isArray(couponsData)) {
        setCoupons(couponsData);
      } else {
        console.error("Unexpected coupons API response format:", response.data);
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
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter, currentPage, pageSize, userTypeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCoupons();
    }, 300);

    return () => clearTimeout(timer);
  }, [couponSearchTerm, couponTypeFilter, couponStatusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, userTypeFilter]);

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
  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsAddEditModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsAddEditModalOpen(true);
  };

  // const handleDelete = (product: Product) => {
  //   setSelectedProduct(product);
  //   setIsDeleteDialogOpen(true);
  // };

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

  // const handleCreateCoupon = () => {
  //   setIsCreateCouponModalOpen(true);
  // };

  const handleCouponSubmit = async (data: CreateCouponDTO | UpdateCouponDTO): Promise<{ error?: string }> => {
    try {
      if ('id' in data && data.id) {
        // Edit mode
        await couponService.updateCoupon(data as UpdateCouponDTO);
      } else {
        // Create mode
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

  const handleViewCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsCouponDetailsModalOpen(true);
  };

  // const handleEditCoupon = (coupon: Coupon) => {
  //   setSelectedCoupon(coupon);
  //   setIsEditCouponModalOpen(true);
  // };

  const handleCreateCoupon = () => {
    setSelectedCoupon(null);
    setIsAddEditCouponModalOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsAddEditCouponModalOpen(true);
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteCouponDialogOpen(true);
  };

  const handleToggleCouponStatus = async (coupon: Coupon) => {
    try {
      await couponService.updateCoupon({
        id: coupon.id,
        is_active: !coupon.is_active,
      });
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

  // const handleConfirmDelete = async () => {
  //   if (!selectedProduct) return;
  //   try {
  //     await productService.deleteProduct(selectedProduct.id);
  //     fetchProducts();
  //     fetchAnalytics();
  //   } catch (error) {
  //     console.error("Failed to delete product:", error);
  //   }
  // };

  // Clear filters handler
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setUserTypeFilter("all");
  };

  // Filter categories based on search term
  const filteredCategories = PRODUCT_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Get display label for selected category
  const getCategoryDisplayLabel = () => {
    if (categoryFilter === "all") return "All Categories";
    return categoryFilter;
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter !== "all" || categoryFilter !== "all" || userTypeFilter !== "all";

  // Clear coupon filters handler
  const handleClearCouponFilters = () => {
    setCouponSearchTerm("");
    setCouponTypeFilter("all");
    setCouponStatusFilter("all");
  };

  // Check if any coupon filters are active
  const hasCouponActiveFilters = couponSearchTerm || couponTypeFilter !== "all" || couponStatusFilter !== "all";

  // Use API analytics data if available
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

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Total Products</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">In Stock Products</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.instock}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Out of Stock Products</div>
          {analyticsLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {stats.outofstock}
            </div>
          )}
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 min-w-0">
          {/* Left side: Search + Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap sm:gap-4 min-w-0 flex-1">
            {/* Search */}
            <div className="flex-1 min-w-0 w-full sm:min-w-75 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, brand, or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-4 min-w-0">
              {/* Category Filter - Searchable Dropdown */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-48 relative" ref={categoryDropdownRef}>
                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-left flex items-center justify-between gap-2 bg-white"
                  >
                    <span className="truncate">{getCategoryDisplayLabel()}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={categorySearchTerm}
                            onChange={(e) => setCategorySearchTerm(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-8 pr-8 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {categorySearchTerm && (
                            <button
                              onClick={() => setCategorySearchTerm("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Options List */}
                      <div className="overflow-y-auto max-h-64">
                        <button
                          onClick={() => {
                            setCategoryFilter("all");
                            setIsCategoryDropdownOpen(false);
                            setCategorySearchTerm("");
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${categoryFilter === "all" ? "bg-gray-100 font-medium" : ""
                            }`}
                        >
                          All Categories
                        </button>
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <button
                              key={category}
                              onClick={() => {
                                setCategoryFilter(category);
                                setIsCategoryDropdownOpen(false);
                                setCategorySearchTerm("");
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${categoryFilter === category ? "bg-gray-100 font-medium" : ""
                                }`}
                            >
                              {category}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No categories found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ProductStatus | "all")}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                >
                  <option value="all">All Status</option>
                  <option value="instock">In Stock</option>
                  <option value="outofstock">Out of Stock</option>
                </select>
              </div>

              {/* User Type Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                <select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value as "all" | "patients" | "doctors" | "both")}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                >
                  <option value="all">All Users</option>
                  <option value="patient">For Patients</option>
                  <option value="doctor">For Doctors</option>
                  {/* <option value="both">For Both</option> */}
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Right side: Action Buttons */}
          <div className="flex justify-end lg:justify-normal shrink-0">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No products found. Try adjusting your filters.
          </div>
        ) : (
          <>
            <ProductTable
              products={products}
              onView={handleView}
              onEdit={handleEdit}
            // onDelete={handleDelete}
            />

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} products
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor="pageSize" className="text-sm text-gray-600">
                          Per page:
                        </label>
                        <select
                          id="pageSize"
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!hasPrevious}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <div className="px-3 py-1.5 text-sm text-gray-600">
                        Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!hasNext}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Coupons Management</h2>
        </div>

        {/* Coupon Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 min-w-0">
            {/* Left side: Search + Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap sm:gap-4 min-w-0 flex-1">
              {/* Search */}
              <div className="flex-1 min-w-0 w-full sm:min-w-64 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={couponSearchTerm}
                  onChange={(e) => setCouponSearchTerm(e.target.value)}
                  placeholder="Search coupons by code..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                <select
                  value={couponTypeFilter}
                  onChange={(e) => setCouponTypeFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                >
                  <option value="all">All Types</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                <select
                  value={couponStatusFilter}
                  onChange={(e) => setCouponStatusFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Right side: Create Coupon Button */}
            <div className="flex justify-end lg:justify-normal shrink-0">
              <button
                onClick={handleCreateCoupon}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                Create Coupon
              </button>
            </div>
          </div>
        </div>

        {/* Coupon Table */}
        {couponsLoading ? (
          <div className="p-8 text-center text-gray-600">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
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

        {!loading && products.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} products
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="text-sm text-gray-600">
                      Per page:
                    </label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!hasPrevious}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="px-3 py-1.5 text-sm text-gray-600">
                    Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!hasNext}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
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

      {/* <CreateCouponModal
        isOpen={isCreateCouponModalOpen}
        onClose={() => setIsCreateCouponModalOpen(false)}
        onSubmit={handleCouponSubmit}
      />

      <EditCouponModal
        coupon={selectedCoupon}
        isOpen={isEditCouponModalOpen}
        onClose={() => {
          setIsEditCouponModalOpen(false);
          setSelectedCoupon(null);
        }}
        onSubmit={handleEditCouponSubmit}
      /> */}

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

      {/* <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      /> */}
    </div>
  );
}
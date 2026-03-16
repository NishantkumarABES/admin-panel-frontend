import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Package, Tag, IndianRupee, Box, RefreshCw, Users, Calendar, FileText, ImageIcon } from "lucide-react";
import type { Product, CreateProductDTO } from "./product.types";
import { PRODUCT_CATEGORY_LABELS, mockProducts } from "./product.types";
import StatusBadge from "../../components/common/StatusBadge";
import AddEditProductModal from "./components/AddEditProductModal";
import * as productService from "../../services/product.service";
import productPlaceholder from "../../assets/placeholders/product.png";

export default function ProductDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      setProduct(response.data);
    } catch (error) {
      console.log("Using mock data - API not available");
      const mock = mockProducts.find((p) => p.id === id);
      if (mock) setProduct(mock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleEditSubmit = async (
    data: CreateProductDTO
  ): Promise<{ error?: string }> => {
    try {
      if (product) {
        await productService.updateProduct({ ...data, id: product.id });
      }
      fetchProduct();
      return {};
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update product. Please try again.";
      return { error: errorMessage };
    }
  };

  const calculateTotalPrice = (p: Product) => {
    const basePrice = Number(p?.price) || 0;
    const discountPercentage = Number(p?.discount_percentage) || 0;
    const taxPercentage = Number(p?.tax_percentage) || 0;
    const discountAmount = (basePrice * discountPercentage) / 100;
    const priceAfterDiscount = basePrice - discountAmount;
    const taxAmount = (priceAfterDiscount * taxPercentage) / 100;
    return (priceAfterDiscount + taxAmount).toFixed(2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Loading Skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        className="min-w-0 max-w-full"
      >
        {/* Back button skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-24 h-8 clay-skeleton rounded-xl" />
        </div>

        {/* Header skeleton */}
        <div className="clay-card">
          <div className="flex items-start gap-6 animate-pulse">
            <div className="w-28 h-28 bg-gray-200 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="w-64 h-6 bg-gray-200 rounded" />
              <div className="w-32 h-4 bg-gray-100 rounded" />
              <div className="flex gap-2 mt-2">
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="clay-card animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full mb-3" />
              <div className="w-20 h-5 bg-gray-200 rounded mb-1" />
              <div className="w-16 h-3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="clay-card animate-pulse space-y-3">
            <div className="w-32 h-4 bg-gray-200 rounded" />
            <div className="w-full h-24 bg-gray-100 rounded-xl" />
          </div>
          <div className="clay-card animate-pulse space-y-3">
            <div className="w-32 h-4 bg-gray-200 rounded" />
            <div className="w-full h-24 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Not Found ─────────────────────────────────────────────────
  if (!product) {
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        className="min-w-0 max-w-full"
      >
        <div className="clay-card text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Product Not Found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="clay-btn inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const mainImage =
    product.images?.[selectedImageIndex]?.image || productPlaceholder;
  const discountAmount =
    (Number(product.price) * Number(product.discount_percentage)) / 100;
  const priceAfterDiscount = Number(product.price) - discountAmount;
  const taxAmount =
    (priceAfterDiscount * Number(product.tax_percentage)) / 100;

  // ── Main Render ───────────────────────────────────────────────
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      className="min-w-0 max-w-full"
    >
      {/* ── Breadcrumb / Back ───────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/products")}
          className="clay-btn flex items-center gap-2 text-sm"
          style={{ padding: "6px 14px", fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-gray-500">Products</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </button>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap"
          style={{
            background: "#1f2937",
            boxShadow:
              "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
          }}
        >
          <Edit className="w-4 h-4" />
          Edit Product
        </button>
      </div>

      {/* ── Product Header ──────────────────────────────────── */}
      <div className="clay-card">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Image area */}
          <div className="shrink-0">
            <div
              className="w-28 h-28 rounded-2xl overflow-hidden"
              style={{
                boxShadow:
                  "inset 2px 2px 6px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(255,255,255,0.5)",
              }}
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnail strip */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-1.5 mt-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className="w-8 h-8 rounded-lg overflow-hidden transition-all"
                    style={{
                      border:
                        selectedImageIndex === idx
                          ? "2px solid #6b96ff"
                          : "2px solid transparent",
                      opacity: selectedImageIndex === idx ? 1 : 0.6,
                    }}
                  >
                    <img
                      src={img.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {product.name}
                </h1>
                <p className="text-sm text-gray-500 mb-3">
                  SKU: {product.sku}
                </p>
              </div>
            </div>

            {/* Status badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusBadge
                status={product.stock_quantity > 0 ? "instock" : "outofstock"}
                size="sm"
              />
              <StatusBadge
                status={product.is_active ? "active" : "inactive"}
                size="sm"
              />
              {product.is_refundable && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(107, 150, 255, 0.08)",
                    color: "#6b96ff",
                  }}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refundable
                </span>
              )}
            </div>

            {/* Audience badges */}
            <div className="flex items-center gap-2">
              {product.for_patients && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: "rgba(79, 207, 165, 0.08)",
                    color: "#10b981",
                  }}
                >
                  <Users className="w-3 h-3" />
                  For Patients
                </span>
              )}
              {product.for_doctors && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: "rgba(162, 133, 255, 0.08)",
                    color: "#a285ff",
                  }}
                >
                  <Users className="w-3 h-3" />
                  For Doctors
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Base Price */}
        <div className="clay-card min-w-0">
          <div
            className="clay-circle mb-2"
            style={{ background: "rgba(107, 150, 255, 0.08)" }}
          >
            <IndianRupee className="w-4 h-4" style={{ color: "#6b96ff" }} />
          </div>
          <div className="text-lg font-bold text-gray-900">
            ₹{parseFloat(product.price).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">Base Price</div>
        </div>

        {/* Unit Price */}
        <div className="clay-card min-w-0">
          <div
            className="clay-circle mb-2"
            style={{ background: "rgba(79, 207, 165, 0.08)" }}
          >
            <IndianRupee className="w-4 h-4" style={{ color: "#4fcfa5" }} />
          </div>
          <div
            className="text-lg font-bold"
            style={{ color: "#4fcfa5" }}
          >
            ₹{calculateTotalPrice(product)}
          </div>
          <div className="text-xs text-gray-500">Unit Price</div>
        </div>

        {/* Stock */}
        <div className="clay-card min-w-0">
          <div
            className="clay-circle mb-2"
            style={{
              background:
                product.stock_quantity === 0
                  ? "rgba(255, 112, 112, 0.08)"
                  : product.stock_quantity < 50
                    ? "rgba(255, 197, 84, 0.08)"
                    : "rgba(79, 207, 165, 0.08)",
            }}
          >
            <Box
              className="w-4 h-4"
              style={{
                color:
                  product.stock_quantity === 0
                    ? "#ff7070"
                    : product.stock_quantity < 50
                      ? "#ffc554"
                      : "#4fcfa5",
              }}
            />
          </div>
          <div
            className={`text-lg font-bold ${product.stock_quantity === 0
                ? "text-red-600"
                : product.stock_quantity < 50
                  ? "text-amber-600"
                  : "text-gray-900"
              }`}
          >
            {product.stock_quantity}
          </div>
          <div className="text-xs text-gray-500">Units in Stock</div>
        </div>

        {/* Discount */}
        <div className="clay-card min-w-0">
          <div
            className="clay-circle mb-2"
            style={{ background: "rgba(162, 133, 255, 0.08)" }}
          >
            <Tag className="w-4 h-4" style={{ color: "#a285ff" }} />
          </div>
          <div className="text-lg font-bold" style={{ color: "#a285ff" }}>
            {product.discount_percentage}%
          </div>
          <div className="text-xs text-gray-500">Discount</div>
        </div>
      </div>

      {/* ── Details Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column — Basic Info */}
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3
            className="text-sm font-semibold text-gray-900 pb-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            Basic Information
          </h3>

          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "#f8f9fb",
              boxShadow:
                "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.6)",
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Category</div>
                  <div className="text-sm font-medium text-gray-900">
                    {PRODUCT_CATEGORY_LABELS[product.category] ||
                      product.category}
                  </div>
                </div>
              </div>

              {/* Brand */}
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Brand</div>
                  <div className="text-sm font-medium text-gray-900">
                    {product.brand || "—"}
                  </div>
                </div>
              </div>

              {/* Refundable */}
              <div className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Refundable</div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.is_refundable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {product.is_refundable ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-start gap-2">
                <Box className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <StatusBadge
                    status={product.is_active ? "active" : "inactive"}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: "#f8f9fb",
                boxShadow:
                  "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.6)",
              }}
            >
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">Description</div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {product.description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Pricing Breakdown */}
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3
            className="text-sm font-semibold text-gray-900 pb-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            Pricing Breakdown
          </h3>

          <div
            className="rounded-xl px-4 py-4"
            style={{
              background: "#f8f9fb",
              boxShadow:
                "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.6)",
            }}
          >
            <div className="space-y-3">
              {/* Base price */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base Price</span>
                <span className="text-sm font-medium text-gray-900">
                  ₹{parseFloat(product.price).toFixed(2)}
                </span>
              </div>

              {/* Discount */}
              {parseFloat(product.discount_percentage) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Discount ({product.discount_percentage}%)
                  </span>
                  <span className="text-sm font-medium text-emerald-600">
                    − ₹{discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Subtotal after discount */}
              {parseFloat(product.discount_percentage) > 0 && (
                <div
                  className="flex items-center justify-between pt-2"
                  style={{
                    borderTop: "1px dashed rgba(0,0,0,0.08)",
                  }}
                >
                  <span className="text-sm text-gray-600">
                    After Discount
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{priceAfterDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Tax */}
              {parseFloat(product.tax_percentage) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Tax ({product.tax_percentage}%)
                  </span>
                  <span className="text-sm font-medium text-red-500">
                    + ₹{taxAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Final price */}
              <div
                className="flex items-center justify-between pt-3"
                style={{
                  borderTop: "2px solid rgba(0,0,0,0.08)",
                }}
              >
                <span className="text-sm font-semibold text-gray-900">
                  Final Unit Price
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: "#4fcfa5" }}
                >
                  ₹{calculateTotalPrice(product)}
                </span>
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "#f8f9fb",
              boxShadow:
                "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.6)",
            }}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Created</div>
                  <div className="text-sm text-gray-700">
                    {formatDate(product.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Last Updated</div>
                  <div className="text-sm text-gray-700">
                    {formatDate(product.updated_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Product ID</div>
                  <div className="text-xs text-gray-500 font-mono">
                    {product.id}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Images Gallery ──────────────────────────── */}
      {product.images && product.images.length > 0 && (
        <div className="clay-card">
          <h3
            className="text-sm font-semibold text-gray-900 pb-3 mb-4 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <ImageIcon className="w-4 h-4 text-gray-400" />
            Product Images
            <span className="text-xs font-normal text-gray-400">
              ({product.images.length})
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {product.images.map((image, idx) => (
              <button
                key={image.id}
                onClick={() => setSelectedImageIndex(idx)}
                className="aspect-square rounded-xl overflow-hidden transition-all"
                style={{
                  boxShadow:
                    selectedImageIndex === idx
                      ? "0 0 0 2px #6b96ff, 4px 4px 10px rgba(0,0,0,0.1)"
                      : "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)",
                }}
              >
                <img
                  src={image.image}
                  alt={`${product.name} ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Edit Modal ──────────────────────────────────────── */}
      <AddEditProductModal
        product={product}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}

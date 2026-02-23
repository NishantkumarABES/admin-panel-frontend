import { useState, useEffect, useRef } from "react";
import type { Product, CreateProductDTO } from "../product.types";
import { PRODUCT_CATEGORIES } from "../product.types";
import { ChevronDown, Search, AlertCircle, X, Upload } from "lucide-react";

interface AddEditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductDTO) => Promise<{ error?: string }>;
}

const initialFormData: CreateProductDTO = {
  name: "",
  category: "",
  description: "",
  price: "",
  discount_percentage: "0",
  tax_percentage: "0",
  is_active: true,
  stock_quantity: 0,
  for_patients: false,
  for_doctors: false,
  images: [],
};

const insetStyle = {
  background: "#eff1f5",
  border: "none",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

const insetErrorStyle = {
  background: "#eff1f5",
  border: "1px solid rgba(255, 112, 112, 0.6)",
  boxShadow: "inset 2px 2px 5px rgba(255, 80, 80, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.4)",
};

export default function AddEditProductModal({
  product, isOpen, onClose, onSubmit,
}: AddEditProductModalProps) {
  const [formData, setFormData] = useState<CreateProductDTO>(initialFormData);
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        brand: product.brand,
        description: product.description,
        price: product.price,
        discount_percentage: product.discount_percentage,
        tax_percentage: product.tax_percentage,
        is_active: product.is_active,
        stock_quantity: product.stock_quantity,
        for_patients: product.for_patients,
        for_doctors: product.for_doctors,
        images: [],
      });
      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images.map(img => img.image));
      }
    } else {
      setFormData(initialFormData);
      setImagePreviews([]);
    }
    setSubmitSuccess(false);
    setSubmitError(null);
    setErrors({});
  }, [product, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = PRODUCT_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...files] }));
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) || [] }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Product name must be less than 50 characters";
    }
    if (!formData.brand?.trim()) {
      newErrors.brand = "Brand is required";
    } else if (formData.brand.length > 50) {
      newErrors.brand = "Brand name must be less than 50 characters";
    }
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (formData.stock_quantity === undefined || formData.stock_quantity < 0) {
      newErrors.stock_quantity = "Stock quantity must be 0 or greater";
    }
    if (!formData.for_patients && !formData.for_doctors) {
      newErrors.for_patients = "Product must be for patients, doctors, or both";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await onSubmit(formData);
      if (result.error) {
        setSubmitError(result.error);
      } else {
        setSubmitSuccess(true);
        setTimeout(() => { handleClose(); }, 1500);
      }
    } catch (error: any) {
      setSubmitError(error?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setCategorySearch("");
    setIsCategoryDropdownOpen(false);
    setSubmitSuccess(false);
    setSubmitError(null);
    setImagePreviews([]);
    onClose();
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
    setCategorySearch("");
    setIsCategoryDropdownOpen(false);
  };

  const getCategoryName = (categoryId: string) => {
    return PRODUCT_CATEGORIES.find(c => c === categoryId) || categoryId;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-[18px] w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Header */}
          <div
            className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {product ? "Edit Product" : "Add Product"}
            </h2>
          </div>

          {/* Scrollable Body */}
          <div className="px-6 py-4">
            {/* Success State */}
            {submitSuccess ? (
              <div className="rounded-xl p-4" style={{ background: "rgba(79, 207, 165, 0.08)", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)" }}>
                <p className="text-sm text-emerald-800">
                  Product <span className="font-semibold">{formData.name}</span> has been successfully{" "}
                  {product ? "updated" : "added"}.
                </p>
              </div>
            ) : (
              <form id="add-edit-product-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {submitError && (
                  <div
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{
                      background: "rgba(255, 112, 112, 0.07)",
                      boxShadow: "inset 2px 2px 5px rgba(255,80,80,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)",
                    }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                {/* Basic Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={errors.name ? insetErrorStyle : insetStyle}
                        placeholder="Enter product name"
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Brand *</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => {
                          setFormData({ ...formData, brand: e.target.value });
                          if (errors.brand) setErrors({ ...errors, brand: "" });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={errors.brand ? insetErrorStyle : insetStyle}
                        placeholder="Enter brand"
                      />
                      {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
                    </div>

                    {/* Category Searchable Dropdown */}
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-sm rounded-xl flex items-center justify-between gap-2 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                          style={errors.category ? insetErrorStyle : insetStyle}
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        >
                          <span className={formData.category ? "text-gray-900" : "text-gray-500"}>
                            {formData.category ? getCategoryName(formData.category) : "Select Category"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isCategoryDropdownOpen && (
                          <div
                            className="absolute z-50 w-full mt-1 bg-white rounded-xl overflow-hidden"
                            style={{ boxShadow: "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.7)" }}
                          >
                            <div className="p-2 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                              <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm"
                                  style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.5)" }}
                                  placeholder="Search categories..."
                                  value={categorySearch}
                                  onChange={(e) => setCategorySearch(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => (
                                  <div
                                    key={category}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${formData.category === category ? "bg-gray-50 font-medium" : ""}`}
                                    onClick={() => handleCategorySelect(category)}
                                  >
                                    {category}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500 text-center">No categories found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <div className="relative">
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className={`w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                          style={errors.description ? insetErrorStyle : insetStyle}
                          placeholder="Enter product description"
                          rows={3}
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                          {formData.description?.length || 0}/500
                        </div>
                      </div>
                      {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                    </div>
                  </div>
                </div>

                {/* Pricing Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => {
                          setFormData({ ...formData, price: e.target.value });
                          if (errors.price) setErrors({ ...errors, price: "" });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={errors.price ? insetErrorStyle : insetStyle}
                        placeholder="0.00"
                        min="0"
                      />
                      {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Discount Percentage (%) — optional</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={insetStyle}
                        placeholder="0.00"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tax Percentage (%) — optional</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.tax_percentage}
                        onChange={(e) => setFormData({ ...formData, tax_percentage: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={insetStyle}
                        placeholder="0.00"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock & Requirements */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Stock & Requirements</h3>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => {
                        setFormData({ ...formData, stock_quantity: parseInt(e.target.value, 10) || 0 });
                        if (errors.stock_quantity) setErrors({ ...errors, stock_quantity: "" });
                      }}
                      className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      style={errors.stock_quantity ? insetErrorStyle : insetStyle}
                      placeholder="0"
                      min="0"
                    />
                    {errors.stock_quantity && <p className="text-xs text-red-500 mt-1">{errors.stock_quantity}</p>}
                  </div>
                </div>

                {/* User Classification */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">User Classification *</h3>
                  <p className="text-xs text-gray-500 mb-3">Select who this product is intended for (at least one must be selected)</p>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.for_patients}
                        onChange={(e) => {
                          setFormData({ ...formData, for_patients: e.target.checked });
                          if (errors.for_patients) setErrors({ ...errors, for_patients: "" });
                        }}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-700">For Patients</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.for_doctors}
                        onChange={(e) => {
                          setFormData({ ...formData, for_doctors: e.target.checked });
                          if (errors.for_patients) setErrors({ ...errors, for_patients: "" });
                        }}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-700">For Doctors</span>
                    </label>
                  </div>
                  {errors.for_patients && <p className="text-xs text-red-500 mt-1">{errors.for_patients}</p>}
                </div>

                {/* Product Images */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Images</h3>
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-500 transition-all hover:text-gray-700"
                      style={{
                        background: "#eff1f5",
                        border: "2px dashed rgba(0,0,0,0.12)",
                        boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.5)",
                      }}
                    >
                      <Upload className="w-5 h-5" />
                      Upload Images
                    </button>

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden group"
                            style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}
                          >
                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </form>
            )}
          </div>

          {/* Sticky Footer */}
          <div
            className="flex items-center justify-end gap-3 px-6 py-4 sticky bottom-0 bg-white"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            {submitSuccess ? (
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                }}
              >
                Done
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="clay-btn disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: "13px", padding: "6px 16px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-edit-product-form"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "#1f2937",
                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{product ? "Updating..." : "Adding..."}</span>
                    </>
                  ) : (
                    <span>{product ? "Update Product" : "Add Product"}</span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

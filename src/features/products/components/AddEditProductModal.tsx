import { useState, useEffect, useRef } from "react";
import type { Product, CreateProductDTO } from "../product.types";
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from "../product.types";
import Modal from "../../../components/common/Modal";
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
  max_quantity_per_user: null,
  for_patients: false,
  for_doctors: false,
  is_refundable: false,
  images: [],
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
  const [existingImageCount, setExistingImageCount] = useState(0);
  const [existingImageIds, setExistingImageIds] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [productNameError, setProductNameError] = useState<string | null>(null);
  const [brandError, setBrandError] = useState<string | null>(null);

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
        max_quantity_per_user: product.max_user_quantity,
        for_patients: product.for_patients,
        for_doctors: product.for_doctors,
        is_refundable: product.is_refundable,
        images: [],
      });
      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images.map(img => img.image));
        setExistingImageCount(product.images.length);
        setExistingImageIds(product.images.map(img => img.id));
      } else {
        setExistingImageCount(0);
        setExistingImageIds([]);
      }
      setDeletedImageIds([]);
    } else {
      setFormData(initialFormData);
      setImagePreviews([]);
      setExistingImageCount(0);
      setExistingImageIds([]);
      setDeletedImageIds([]);
    }
    setSubmitSuccess(false);
    setSubmitError(null);
    setProductNameError(null);
    setBrandError(null);
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

  const filteredCategories = PRODUCT_CATEGORIES.filter((category) => {
    const label = PRODUCT_CATEGORY_LABELS[category] || category;
    return label.toLowerCase().includes(categorySearch.toLowerCase());
  });

  const MAX_IMAGES = 5;

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const currentTotal = imagePreviews.length;
    const remainingSlots = MAX_IMAGES - currentTotal;
    if (remainingSlots <= 0) return;
    const slicedFiles = files.slice(0, remainingSlots);

    const oversizedFiles = slicedFiles.filter(file => file.size > MAX_IMAGE_SIZE);
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({ ...prev, images: `Each image must be less than 2MB. ${oversizedFiles.length} image(s) exceeded the limit.` }));
    } else {
      setErrors(prev => ({ ...prev, images: "" }));
    }

    const allowedFiles = slicedFiles.filter(file => file.size <= MAX_IMAGE_SIZE);
    if (allowedFiles.length === 0) { e.target.value = ""; return; }

    setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...allowedFiles] }));
    const newPreviews = allowedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    if (index < existingImageCount) {
      // Removing an existing server image - track its ID for deletion
      const imageId = existingImageIds[index];
      setDeletedImageIds(prev => [...prev, imageId]);
      setExistingImageIds(prev => prev.filter((_, i) => i !== index));
      setExistingImageCount(prev => prev - 1);
    } else {
      // Removing a newly uploaded image - calculate correct index into formData.images
      const newFileIndex = index - existingImageCount;
      setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== newFileIndex) || [] }));
    }
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
    } else if (!product && formData.stock_quantity === 0) {
      newErrors.stock_quantity = "Stock quantity must be greater than 0 when adding a product";
    }
    if (formData.max_quantity_per_user !== null && formData.max_quantity_per_user !== undefined && formData.max_quantity_per_user < 1) {
      newErrors.max_quantity_per_user = "Max quantity per user must be at least 1";
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
    setProductNameError(null);
    setBrandError(null);
    try {
      const submitData = { ...formData, deleted_image_ids: deletedImageIds.length > 0 ? deletedImageIds : undefined };
      const result = await onSubmit(submitData);
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
    setExistingImageCount(0);
    setExistingImageIds([]);
    setDeletedImageIds([]);
    onClose();
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
    setCategorySearch("");
    setIsCategoryDropdownOpen(false);
  };

  const getCategoryName = (categoryId: string) => {
    return PRODUCT_CATEGORY_LABELS[categoryId] || categoryId;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={product ? "Edit Product" : "Add Product"}
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
                Product <span className="font-semibold">{formData.name}</span> has been successfully {product ? "updated" : "created"}.
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
              {submitError && (
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{
                  background: "#fee",
                  border: "1px solid #fcc"
                }}>
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* Basic Details Section */}
              <div className="rounded-xl px-5 py-4" style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
              }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  Basic Details
                </h3>

                {/* Product Name & Brand - Stacked Vertically */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      maxLength={50}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, name: val });
                        if (errors.name) setErrors({ ...errors, name: "" });
                        if (val.length >= 50) {
                          setProductNameError("Name cannot be more than 50 characters");
                        } else {
                          setProductNameError(null);
                        }
                      }}
                      className={`w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:outline-none transition-all ${productNameError ? 'focus:ring-red-500' : 'focus:ring-gray-900'}`}
                      style={{
                        background: "#ffffff",
                        border: productNameError || errors.name ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="Enter product name"
                    />
                    {(productNameError || errors.name) && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {productNameError || errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      maxLength={50}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, brand: val });
                        if (errors.brand) setErrors({ ...errors, brand: "" });
                        if (val.length >= 50) {
                          setBrandError("Brand cannot be more than 50 characters");
                        } else {
                          setBrandError(null);
                        }
                      }}
                      className={`w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:outline-none transition-all ${brandError ? 'focus:ring-red-500' : 'focus:ring-gray-900'}`}
                      style={{
                        background: "#ffffff",
                        border: brandError || errors.brand ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="Enter brand"
                    />
                    {(brandError || errors.brand) && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {brandError || errors.brand}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category Searchable Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <div
                      className="w-full px-4 py-2.5 text-sm rounded-xl cursor-pointer transition-all focus:ring-2 focus:ring-gray-900"
                      style={{
                        background: "#ffffff",
                        border: errors.category ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    >
                      <div className="flex items-center justify-between">
                        <span className={formData.category ? "text-gray-900" : "text-gray-400"}>
                          {formData.category ? getCategoryName(formData.category) : "Select category"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    {isCategoryDropdownOpen && (
                      <div
                        className="absolute z-50 w-full mt-1 bg-white rounded-xl overflow-hidden"
                        style={{
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)",
                          border: "1px solid #e5e7eb"
                        }}
                      >
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              className="w-full pl-10 pr-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
                              style={{
                                background: "#f8f9fb",
                                border: "1px solid #e5e7eb"
                              }}
                              placeholder="Search categories..."
                              value={categorySearch}
                              onChange={(e) => setCategorySearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* Category List */}
                        <div className="max-h-44 overflow-y-auto">
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                              <div
                                key={category}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${formData.category === category
                                  ? "bg-gray-900 text-white font-medium"
                                  : "hover:bg-gray-50 text-gray-700"
                                  }`}
                                onClick={() => handleCategorySelect(category)}
                              >
                                {PRODUCT_CATEGORY_LABELS[category] || category}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-sm text-gray-400 text-center">
                              No categories found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.category && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: errors.description ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="Enter product description"
                      rows={3}
                    />
                    <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                      {formData.description?.length || 0}/500
                    </div>
                  </div>
                  {errors.description && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Pricing Details Section */}
              <div className="rounded-xl px-5 py-4" style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
              }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  Pricing Details
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => {
                        setFormData({ ...formData, price: e.target.value });
                        if (errors.price) setErrors({ ...errors, price: "" });
                      }}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: errors.price ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="0.00"
                      min="0"
                    />
                    {errors.price && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  {/* Discount % */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="0.00"
                      min="0"
                      max="100"
                    />
                  </div>

                  {/* Tax % */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.tax_percentage}
                      onChange={(e) => setFormData({ ...formData, tax_percentage: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="0.00"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Stock & Availability Section */}
              <div className="rounded-xl px-5 py-4" style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
              }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  Stock & Availability
                </h3>

                {/* Stock Quantity & Max Quantity Per User */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => {
                        setFormData({ ...formData, stock_quantity: parseInt(e.target.value, 10) || 0 });
                        if (errors.stock_quantity) setErrors({ ...errors, stock_quantity: "" });
                      }}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: errors.stock_quantity ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="0"
                      min="0"
                    />
                    {errors.stock_quantity && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.stock_quantity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Qty Per User
                    </label>
                    <input
                      type="number"
                      value={formData.max_quantity_per_user ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, max_quantity_per_user: val === "" ? null : parseInt(val, 10) });
                        if (errors.max_quantity_per_user) setErrors({ ...errors, max_quantity_per_user: "" });
                      }}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: errors.max_quantity_per_user ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="No limit"
                      min="1"
                    />
                    {errors.max_quantity_per_user && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.max_quantity_per_user}
                      </p>
                    )}
                  </div>
                </div>

                {/* User Classification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available For *
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Select who this product is intended for (at least one required)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "for_patients", label: "For Patients" },
                      { key: "for_doctors", label: "For Doctors" }
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, [option.key]: !formData[option.key as keyof CreateProductDTO] });
                          if (errors.for_patients) setErrors({ ...errors, for_patients: "" });
                        }}
                        className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${formData[option.key as keyof CreateProductDTO]
                          ? "text-white"
                          : "text-gray-700 hover:bg-gray-50"
                          }`}
                        style={
                          formData[option.key as keyof CreateProductDTO]
                            ? {
                              background: "#1f2937",
                              boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                            }
                            : {
                              background: "#ffffff",
                              border: "1px solid #e5e7eb",
                              boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.04)"
                            }
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.for_patients && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.for_patients}
                    </p>
                  )}
                </div>

                {/* Refundable Toggle */}
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Refundable
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">Is this product eligible for refunds?</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_refundable: !formData.is_refundable })}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                      style={{
                        background: formData.is_refundable ? "#1f2937" : "#d1d5db",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${formData.is_refundable ? "translate-x-6" : "translate-x-1"
                          }`}
                        style={{ boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.15)" }}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Images Section */}
              <div className="rounded-xl px-5 py-4" style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
              }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  Product Images
                </h3>

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
                    disabled={imagePreviews.length >= MAX_IMAGES}
                    className={`w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all ${imagePreviews.length >= MAX_IMAGES
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                    style={{
                      background: "#ffffff",
                      border: `2px dashed ${imagePreviews.length >= MAX_IMAGES ? '#e5e7eb' : '#d1d5db'}`,
                      boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.03)"
                    }}
                  >
                    <Upload className="w-5 h-5" />
                    {imagePreviews.length >= MAX_IMAGES ? "Maximum images reached" : "Upload Images"}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    {imagePreviews.length}/{MAX_IMAGES} images (max 2MB each)
                  </p>
                  {errors.images && (
                    <p className="text-xs text-red-600 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.images}
                    </p>
                  )}

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
                disabled={isSubmitting}
                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{product ? "Updating..." : "Adding..."}</span>
                  </>
                ) : (
                  <span>{product ? "Update Product" : "Add Product"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

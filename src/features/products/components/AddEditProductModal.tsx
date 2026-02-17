import { useState, useEffect, useRef } from "react";
import type { Product, CreateProductDTO } from "../product.types";
import Modal from "../../../components/common/Modal";
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

export default function AddEditProductModal({
  product, isOpen, onClose, onSubmit,
}: AddEditProductModalProps) {
  // const BackendBaseURL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8000';
  const [formData, setFormData] = useState<CreateProductDTO>(initialFormData);
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Image preview
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
      // Set existing image previews
      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images.map(img => {
          return img.image
        }));
      }
    } else {
      setFormData(initialFormData);
      setImagePreviews([]);
    }
    // Reset submission states when modal opens/closes
    setSubmitSuccess(false);
    setSubmitError(null);
    setErrors({});
  }, [product, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter categories based on search
  const filteredCategories = PRODUCT_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files || []);
  //   if (files.length > 0) {
  //     setFormData({ ...formData, images: files });

  //     // Create previews
  //     const previews = files.map(file => URL.createObjectURL(file));
  //     setImagePreviews(previews);
  //   }
  // };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Append new images to existing ones
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...files],
    }));

    // Append previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // Reset input so the same file can be re-selected if needed
    e.target.value = "";
  };


  // const handleRemoveImage = (index: number) => {
  //   const newImages = formData.images?.filter((_, i) => i !== index) || [];
  //   const newPreviews = imagePreviews.filter((_, i) => i !== index);
  //   setFormData({ ...formData, images: newImages });
  //   setImagePreviews(newPreviews);
  // };
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));

    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validations
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

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

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

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await onSubmit(formData);

      if (result.error) {
        setSubmitError(result.error);
      } else {
        setSubmitSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
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
    // In a real app, you'd look this up from your categories data
    // For now, return the category as is
    return PRODUCT_CATEGORIES.find(c => c === categoryId) || categoryId;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={product ? "Edit Product" : "Add Product"}
      size="lg"
      className={isCategoryDropdownOpen ? "min-h-172" : ""}
    >
      {/* Success State */}
      {submitSuccess ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-800">
              Product <span className="font-semibold">{formData.name}</span> has been successfully {product ? "updated" : "added"}.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        /* Form State */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            </div>
          )}

          {/* Basic Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Basic Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter product name"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => {
                    setFormData({ ...formData, brand: e.target.value });
                    if (errors.brand) setErrors({ ...errors, brand: "" });
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.brand ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter brand"
                />
                {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <div className="relative" ref={dropdownRef}>
                  <div
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent bg-white cursor-pointer ${errors.category ? "border-red-500" : "border-gray-300"}`}
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={formData.category ? "text-gray-900" : "text-gray-500"}>
                        {formData.category ? getCategoryName(formData.category) : "Select Category"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {isCategoryDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${formData.category === category ? "bg-gray-50 font-medium" : ""
                                }`}
                              onClick={() => handleCategorySelect(category)}
                            >
                              {category}
                            </div>
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
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.description ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Enter product description"
                    rows={3}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-1 rounded">
                    {formData.description?.length || 0}/500
                  </div>
                </div>
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Pricing Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.price ? "border-red-500" : "border-gray-300"}`}
                  placeholder="0.00"
                  min="0"
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage (%) - optional
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount_percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_percentage: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Percentage (%) - optional
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tax_percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_percentage: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Stock & Requirements */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Stock & Requirements
            </h3>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    stock_quantity: parseInt(e.target.value, 10) || 0,
                  });
                  if (errors.stock_quantity) setErrors({ ...errors, stock_quantity: "" });
                }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.stock_quantity ? "border-red-500" : "border-gray-300"}`}
                placeholder="0"
                min="0"
              />
              {errors.stock_quantity && <p className="text-xs text-red-500 mt-1">{errors.stock_quantity}</p>}
            </div>
          </div>

          {/* User Classification */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              User Classification *
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Select who this product is intended for (at least one must be selected)
            </p>
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
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
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
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600"
              >
                <Upload className="w-5 h-5" />
                Upload Images
              </button>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </Modal>
  );
}
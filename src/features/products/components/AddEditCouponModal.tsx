import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Coupon, CreateCouponDTO, UpdateCouponDTO } from "../coupon.types";

interface AddEditCouponModalProps {
  coupon?: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCouponDTO | UpdateCouponDTO) => Promise<{ error?: string }>;
}

const initialFormData: CreateCouponDTO = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  max_uses: undefined,
  min_purchase_amount: undefined,
  max_discount_amount: undefined,
  is_active: true,
  valid_from: new Date().toISOString().split("T")[0],
  valid_until: "",
};

export default function AddEditCouponModal({
  coupon,
  isOpen,
  onClose,
  onSubmit,
}: AddEditCouponModalProps) {
  const isEditMode = !!coupon;

  const [formData, setFormData] = useState<CreateCouponDTO | UpdateCouponDTO>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        max_uses: coupon.max_uses,
        min_purchase_amount: coupon.min_purchase_amount,
        max_discount_amount: coupon.max_discount_amount,
        is_active: coupon.is_active,
        valid_from: coupon.valid_from.split("T")[0],
        valid_until: coupon.valid_until.split("T")[0],
      });
    } else {
      setFormData(initialFormData);
    }
    // Reset submission states when modal opens/closes
    setSubmitSuccess(false);
    setSubmitError(null);
  }, [coupon, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = "Coupon code is required";
    } else if (formData.code.length < 3) {
      newErrors.code = "Coupon code must be at least 3 characters";
    }

    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      newErrors.discount_value = "Discount value must be greater than 0";
    }

    if (formData.discount_type === "percentage" && parseFloat(formData.discount_value || "0") > 100) {
      newErrors.discount_value = "Percentage discount cannot exceed 100%";
    }

    if (!formData.valid_until) {
      newErrors.valid_until = "Valid until date is required";
    } else if (formData.valid_from && new Date(formData.valid_until) <= new Date(formData.valid_from)) {
      newErrors.valid_until = "Valid until date must be after valid from date";
    }

    if (formData.max_uses && formData.max_uses <= 0) {
      newErrors.max_uses = "Max uses must be greater than 0";
    }

    if (formData.min_purchase_amount && parseFloat(formData.min_purchase_amount) < 0) {
      newErrors.min_purchase_amount = "Minimum purchase amount cannot be negative";
    }

    if (formData.max_discount_amount && parseFloat(formData.max_discount_amount) < 0) {
      newErrors.max_discount_amount = "Maximum discount amount cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
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
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(false);
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? `Edit Coupon: ${coupon?.code}` : "Create Coupon"}
      size="lg"
    >
      {/* Success State */}
      {submitSuccess ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-800">
              Coupon <span className="font-semibold">{formData.code}</span> has been successfully {isEditMode ? "updated" : "created"}.
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coupon Code */}
            <div className="md:col-span-2">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent uppercase ${errors.code ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="e.g., SAVE20"
              />
              {errors.code && <p className="text-sm text-red-600 mt-1">{errors.code}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.description ? "border-red-500" : "border-gray-300"
                  }`}
              />
            </div>

            {/* Discount Type */}
            <div>
              <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                id="discount_type"
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="discount_value"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.discount_value ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder={formData.discount_type === "percentage" ? "e.g., 20" : "e.g., 100"}
              />
              {errors.discount_value && <p className="text-sm text-red-600 mt-1">{errors.discount_value}</p>}
            </div>

            {/* Valid From */}
            <div>
              <label htmlFor="valid_from" className="block text-sm font-medium text-gray-700 mb-1">
                Valid From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="valid_from"
                name="valid_from"
                value={formData.valid_from}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="valid_until"
                name="valid_until"
                value={formData.valid_until}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.valid_until ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.valid_until && <p className="text-sm text-red-600 mt-1">{errors.valid_until}</p>}
            </div>

            {/* Max Uses */}
            <div>
              <label htmlFor="max_uses" className="block text-sm font-medium text-gray-700 mb-1">
                Max Uses (Optional)
              </label>
              <input
                type="number"
                id="max_uses"
                name="max_uses"
                value={formData.max_uses || ""}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.max_uses ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Unlimited"
              />
              {errors.max_uses && <p className="text-sm text-red-600 mt-1">{errors.max_uses}</p>}
            </div>

            {/* Min Purchase Amount */}
            <div>
              <label htmlFor="min_purchase_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Min Purchase Amount (Optional)
              </label>
              <input
                type="number"
                id="min_purchase_amount"
                name="min_purchase_amount"
                value={formData.min_purchase_amount || ""}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.min_purchase_amount ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="No minimum"
              />
              {errors.min_purchase_amount && <p className="text-sm text-red-600 mt-1">{errors.min_purchase_amount}</p>}
            </div>

            {/* Max Discount Amount */}
            {formData.discount_type === "percentage" && (
              <div className="md:col-span-2">
                <label htmlFor="max_discount_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Discount Amount (Optional)
                </label>
                <input
                  type="number"
                  id="max_discount_amount"
                  name="max_discount_amount"
                  value={formData.max_discount_amount || ""}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.max_discount_amount ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="No maximum"
                />
                {errors.max_discount_amount && <p className="text-sm text-red-600 mt-1">{errors.max_discount_amount}</p>}
              </div>
            )}

            {/* Active Status */}
            <div className="md:col-span-2">
              <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-2">
                Active Status
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.is_active}
                  onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${formData.is_active ? "bg-emerald-600" : "bg-gray-300"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
                <span className={`text-sm font-medium ${formData.is_active ? "text-emerald-600" : "text-gray-500"}`}>
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.is_active
                  ? "This coupon is currently active and can be used by customers."
                  : "This coupon is inactive and cannot be used by customers."}
              </p>
            </div>
          </div>

          {/* Current Usage Info - Only shown in edit mode */}
          {isEditMode && coupon && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-900 mb-1">Current Usage</div>
              <div className="text-sm text-blue-800">
                This coupon has been used {coupon.current_uses} time{coupon.current_uses !== 1 ? "s" : ""}
                {coupon.max_uses ? ` out of ${coupon.max_uses} maximum uses` : ""}.
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
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
                  <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <span>{isEditMode ? "Update Coupon" : "Create Coupon"}</span>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
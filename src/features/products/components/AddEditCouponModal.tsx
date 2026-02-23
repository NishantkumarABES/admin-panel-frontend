import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
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

export default function AddEditCouponModal({ coupon, isOpen, onClose, onSubmit }: AddEditCouponModalProps) {
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
    setSubmitSuccess(false);
    setSubmitError(null);
    setErrors({});
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
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-[18px] w-full max-w-xl max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Header */}
          <div
            className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditMode ? `Edit Coupon: ${coupon?.code}` : "Create Coupon"}
            </h2>
          </div>

          {/* Scrollable Body */}
          <div className="px-6 py-4">
            {/* Success State */}
            {submitSuccess ? (
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(79, 207, 165, 0.08)",
                  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)",
                }}
              >
                <p className="text-sm text-emerald-800">
                  Coupon <span className="font-semibold">{formData.code}</span> has been successfully{" "}
                  {isEditMode ? "updated" : "created"}.
                </p>
              </div>
            ) : (
              <form id="add-edit-coupon-form" onSubmit={handleSubmit} className="space-y-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Coupon Code */}
                  <div className="md:col-span-2">
                    <label htmlFor="code" className="block text-xs font-medium text-gray-600 mb-1">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent uppercase"
                      style={errors.code ? insetErrorStyle : insetStyle}
                      placeholder="e.g., SAVE20"
                    />
                    {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-xs font-medium text-gray-600 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      style={insetStyle}
                      rows={2}
                    />
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label htmlFor="discount_type" className="block text-xs font-medium text-gray-600 mb-1">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="discount_type"
                      name="discount_type"
                      value={formData.discount_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      style={insetStyle}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label htmlFor="discount_value" className="block text-xs font-medium text-gray-600 mb-1">
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
                      className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      style={errors.discount_value ? insetErrorStyle : insetStyle}
                      placeholder={formData.discount_type === "percentage" ? "e.g., 20" : "e.g., 100"}
                    />
                    {errors.discount_value && <p className="text-xs text-red-500 mt-1">{errors.discount_value}</p>}
                  </div>

                  {/* Valid From */}
                  <div>
                    <label htmlFor="valid_from" className="block text-xs font-medium text-gray-600 mb-1">
                      Valid From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="valid_from"
                      name="valid_from"
                      value={formData.valid_from}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      style={insetStyle}
                    />
                  </div>

                  {/* Valid Until */}
                  <div>
                    <label htmlFor="valid_until" className="block text-xs font-medium text-gray-600 mb-1">
                      Valid Until <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="valid_until"
                      name="valid_until"
                      value={formData.valid_until}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      style={errors.valid_until ? insetErrorStyle : insetStyle}
                    />
                    {errors.valid_until && <p className="text-xs text-red-500 mt-1">{errors.valid_until}</p>}
                  </div>

                  {/* Max Uses */}
                  <div>
                    <label htmlFor="max_uses" className="block text-xs font-medium text-gray-600 mb-1">Max Uses (Optional)</label>
                    <input
                      type="number"
                      id="max_uses"
                      name="max_uses"
                      value={formData.max_uses || ""}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      style={errors.max_uses ? insetErrorStyle : insetStyle}
                      placeholder="Unlimited"
                    />
                    {errors.max_uses && <p className="text-xs text-red-500 mt-1">{errors.max_uses}</p>}
                  </div>

                  {/* Min Purchase Amount */}
                  <div>
                    <label htmlFor="min_purchase_amount" className="block text-xs font-medium text-gray-600 mb-1">Min Purchase Amount (Optional)</label>
                    <input
                      type="number"
                      id="min_purchase_amount"
                      name="min_purchase_amount"
                      value={formData.min_purchase_amount || ""}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      style={errors.min_purchase_amount ? insetErrorStyle : insetStyle}
                      placeholder="No minimum"
                    />
                    {errors.min_purchase_amount && <p className="text-xs text-red-500 mt-1">{errors.min_purchase_amount}</p>}
                  </div>

                  {/* Max Discount Amount (percentage only) */}
                  {formData.discount_type === "percentage" && (
                    <div className="md:col-span-2">
                      <label htmlFor="max_discount_amount" className="block text-xs font-medium text-gray-600 mb-1">Max Discount Amount (Optional)</label>
                      <input
                        type="number"
                        id="max_discount_amount"
                        name="max_discount_amount"
                        value={formData.max_discount_amount || ""}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={errors.max_discount_amount ? insetErrorStyle : insetStyle}
                        placeholder="No maximum"
                      />
                      {errors.max_discount_amount && <p className="text-xs text-red-500 mt-1">{errors.max_discount_amount}</p>}
                    </div>
                  )}

                  {/* Active Status Toggle */}
                  <div className="md:col-span-2">
                    <label htmlFor="is_active" className="block text-xs font-medium text-gray-600 mb-2">Active Status</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={formData.is_active}
                        onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${formData.is_active ? "bg-emerald-500" : "bg-gray-300"}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                      <span className={`text-sm font-medium ${formData.is_active ? "text-emerald-600" : "text-gray-500"}`}>
                        {formData.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.is_active
                        ? "This coupon is active and can be used by customers."
                        : "This coupon is inactive and cannot be used by customers."}
                    </p>
                  </div>
                </div>

                {/* Current Usage (edit mode) */}
                {isEditMode && coupon && (
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(107, 150, 255, 0.06)",
                      boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)",
                    }}
                  >
                    <div className="text-xs font-semibold text-gray-700 mb-1">Current Usage</div>
                    <div className="text-sm text-gray-600">
                      This coupon has been used {coupon.current_uses} time{coupon.current_uses !== 1 ? "s" : ""}
                      {coupon.max_uses ? ` out of ${coupon.max_uses} maximum uses` : ""}.
                    </div>
                  </div>
                )}
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
                  form="add-edit-coupon-form"
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
                      <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <span>{isEditMode ? "Update Coupon" : "Create Coupon"}</span>
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
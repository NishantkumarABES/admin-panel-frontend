import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import type { Coupon, CreateCouponDTO, UpdateCouponDTO } from "../coupon.types";
import Modal from "../../../components/common/Modal";

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

export default function AddEditCouponModal({ coupon, isOpen, onClose, onSubmit }: AddEditCouponModalProps) {
  const isEditMode = !!coupon;

  const [formData, setFormData] = useState<CreateCouponDTO | UpdateCouponDTO>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? `Edit Coupon: ${coupon?.code}` : "Create Coupon"}
      size="sm"
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
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: "4px 4px 12px rgba(16, 185, 129, 0.2), -2px -2px 8px rgba(255, 255, 255, 0.1)"
            }}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">
                  Coupon {isEditMode ? "Updated" : "Created"} Successfully!
                </h3>
                <p className="text-white/90 text-xs mt-0.5">
                  <span className="font-medium">{formData.code}</span> has been {isEditMode ? "updated" : "created"}.
                </p>
              </div>
            </div>

            {/* Close Button - Fixed at Bottom */}
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
                Close
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

              {/* Coupon Details Section */}
              <div className="rounded-xl px-5 py-4" style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
              }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  Coupon Details
                </h3>

                {/* Coupon Code */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all uppercase"
                    style={{
                      background: "#ffffff",
                      border: errors.code ? "1px solid #ef4444" : "1px solid #e5e7eb",
                      boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                    }}
                    placeholder="e.g., SAVE20"
                  />
                  {errors.code && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.code}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                    }}
                    rows={2}
                  />
                </div>
              </div>

              {/* Discount Configuration Section */}
              <div className="rounded-xl px-5 py-4" style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
              }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  Discount Configuration
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <select
                      name="discount_type"
                      value={formData.discount_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      name="discount_value"
                      value={formData.discount_value}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: errors.discount_value ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder={formData.discount_type === "percentage" ? "e.g., 20" : "e.g., 100"}
                    />
                    {errors.discount_value && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.discount_value}
                      </p>
                    )}
                  </div>
                </div>

                {/* Max Discount Amount (percentage only) */}
                {formData.discount_type === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Discount Amount
                    </label>
                    <input
                      type="number"
                      name="max_discount_amount"
                      value={formData.max_discount_amount || ""}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: errors.max_discount_amount ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="No maximum"
                    />
                    {errors.max_discount_amount && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.max_discount_amount}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Validity Period Section */}
              <div className="rounded-xl px-5 py-4" style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
              }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  Validity Period
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Valid From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      name="valid_from"
                      value={formData.valid_from}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                    />
                  </div>

                  {/* Valid Until */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      name="valid_until"
                      value={formData.valid_until}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: errors.valid_until ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                    />
                    {errors.valid_until && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.valid_until}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Limits Section */}
              <div className="rounded-xl px-5 py-4" style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
              }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  Usage Limits
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Max Uses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Uses
                    </label>
                    <input
                      type="number"
                      name="max_uses"
                      value={formData.max_uses || ""}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: errors.max_uses ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="Unlimited"
                    />
                    {errors.max_uses && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.max_uses}
                      </p>
                    )}
                  </div>

                  {/* Min Purchase Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Purchase (₹)
                    </label>
                    <input
                      type="number"
                      name="min_purchase_amount"
                      value={formData.min_purchase_amount || ""}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: errors.min_purchase_amount ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="No minimum"
                    />
                    {errors.min_purchase_amount && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.min_purchase_amount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Current Usage (edit mode) */}
                {isEditMode && coupon && (
                  <div className="mt-4 flex items-start gap-2 p-3 rounded-lg" style={{
                    background: "#fef3c7",
                    border: "1px solid #fbbf24"
                  }}>
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      This coupon has been used {coupon.current_uses} time{coupon.current_uses !== 1 ? "s" : ""}
                      {coupon.max_uses ? ` out of ${coupon.max_uses} maximum uses` : ""}.
                    </p>
                  </div>
                )}
              </div>

              {/* Status Section */}
              <div className="rounded-xl px-5 py-4" style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
              }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  Status
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Active Status
                  </label>
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
                  <p className="text-xs text-gray-400 mt-1.5">
                    {formData.is_active
                      ? "This coupon is active and can be used by customers."
                      : "This coupon is inactive and cannot be used by customers."}
                  </p>
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
                    <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                  </>
                ) : (
                  <span>{isEditMode ? "Update Coupon" : "Create Coupon"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
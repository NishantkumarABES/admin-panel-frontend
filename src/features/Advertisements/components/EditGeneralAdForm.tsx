import { useState, useEffect } from "react";
import { Upload, X, ChevronDown, AlertCircle } from "lucide-react";
import type { GeneralAdvertisement, UpdateGeneralAdDTO, UserType } from "../advertisement.types";
import { SPECIALTIES, USER_TYPES } from "../advertisement.types";
import { advertisementService } from "../../../services/advertisement.service";

interface EditGeneralAdFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  advertisement: GeneralAdvertisement;
}

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

export default function EditGeneralAdForm({
  isOpen, onClose, onSuccess, advertisement,
}: EditGeneralAdFormProps) {
  const [formData, setFormData] = useState({
    title: "", url: "",
    status: "enabled" as "enabled" | "disabled",
    target_user: "doctor" as UserType,
  });
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [isSpecialtyDropdownOpen, setIsSpecialtyDropdownOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const allowedExtensions = ["jpg", "jpeg", "png"];

  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title,
        url: advertisement.url,
        status: advertisement.status,
        target_user: advertisement.target_user || "doctor",
      });
      setSelectedSpecialties(advertisement.specializations || []);
      setImagePreview(advertisement.image);
      setImage(null);
      setSubmitSuccess(false);
    }
  }, [advertisement]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.url.trim()) {
      newErrors.url = "URL is required";
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = "Please enter a valid URL";
      }
    }

    if (selectedSpecialties.length === 0) {
      newErrors.specialties = "At least one specialty is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
    setErrors(prev => ({ ...prev, specialties: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      setErrors(prev => ({
        ...prev,
        image: `Only ${allowedExtensions.join(", ")} files are allowed`,
      }));
      return;
    }

    setImage(file);
    setErrors(prev => ({ ...prev, image: "" }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(advertisement.image);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const updateData: UpdateGeneralAdDTO = {
        id: advertisement.id,
        title: formData.title,
        url: formData.url,
        specializations: selectedSpecialties,
        status: formData.status,
        target_user: formData.target_user,
      };

      if (image) {
        updateData.image = image;
      }

      await advertisementService.updateGeneralAd(updateData);

      setSubmitSuccess(true);
      setTimeout(() => {
        setImage(null);
        setErrors({});
        setSubmitSuccess(false);
        onSuccess();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to update advertisement:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to update advertisement. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setImage(null);
      setErrors({});
      setIsSpecialtyDropdownOpen(false);
      setSubmitSuccess(false);
      onClose();
    }
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
            <h2 className="text-lg font-semibold text-gray-900">Edit General Advertisement</h2>
          </div>

          {/* Scrollable Body */}
          <div className="px-6 py-4">
            {/* Success State */}
            {submitSuccess ? (
              <div className="rounded-xl p-4" style={{ background: "rgba(79, 207, 165, 0.08)", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)" }}>
                <p className="text-sm text-emerald-800">
                  Advertisement <span className="font-semibold">{formData.title}</span> has been successfully updated.
                </p>
              </div>
            ) : (
              <form id="edit-ad-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {errors.submit && (
                  <div
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{
                      background: "rgba(255, 112, 112, 0.07)",
                      boxShadow: "inset 2px 2px 5px rgba(255,80,80,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)",
                    }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                )}

                {/* Basic Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value });
                          if (errors.title) setErrors({ ...errors, title: "" });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={errors.title ? insetErrorStyle : insetStyle}
                        placeholder="Enter advertisement title"
                        disabled={isSubmitting}
                      />
                      {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">URL *</label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => {
                          setFormData({ ...formData, url: e.target.value });
                          if (errors.url) setErrors({ ...errors, url: "" });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={errors.url ? insetErrorStyle : insetStyle}
                        placeholder="https://example.com"
                        disabled={isSubmitting}
                      />
                      {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "enabled" | "disabled" })}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={insetStyle}
                        disabled={isSubmitting}
                      >
                        <option value="enabled">Enable</option>
                        <option value="disabled">Disable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Target User *</label>
                      <select
                        value={formData.target_user}
                        onChange={(e) => setFormData({ ...formData, target_user: e.target.value as UserType })}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={insetStyle}
                        disabled={isSubmitting}
                      >
                        {USER_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Specialties *</h3>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen)}
                      className="w-full px-3 py-2 text-sm rounded-xl flex items-center justify-between gap-2 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                      style={errors.specialties ? insetErrorStyle : insetStyle}
                      disabled={isSubmitting}
                    >
                      <span className={selectedSpecialties.length > 0 ? "text-gray-900" : "text-gray-500"}>
                        {selectedSpecialties.length === 0
                          ? "Select specialties"
                          : `${selectedSpecialties.length} selected`}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSpecialtyDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isSpecialtyDropdownOpen && (
                      <div
                        className="absolute z-50 w-full mt-1 bg-white rounded-xl overflow-hidden"
                        style={{ boxShadow: "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.7)" }}
                      >
                        <div className="max-h-48 overflow-y-auto">
                          {SPECIALTIES.map((specialty) => (
                            <label
                              key={specialty}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSpecialties.includes(specialty)}
                                onChange={() => handleSpecialtyToggle(specialty)}
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                disabled={isSubmitting}
                              />
                              <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSpecialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg"
                          style={{
                            background: "rgba(107,150,255,0.10)",
                            color: "#4b6fd4",
                          }}
                        >
                          {specialty}
                          <button
                            type="button"
                            onClick={() => handleSpecialtyToggle(specialty)}
                            className="hover:text-red-600"
                            disabled={isSubmitting}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {errors.specialties && <p className="text-xs text-red-500 mt-1">{errors.specialties}</p>}
                </div>

                {/* Image Upload */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Advertisement Image</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Supported formats: {allowedExtensions.join(", ").toUpperCase()} (Leave empty to keep current image)
                  </p>

                  {!imagePreview ? (
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept={allowedExtensions.map(ext => `.${ext}`).join(",")}
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload-edit"
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor="image-upload-edit"
                        className="w-full px-4 py-3 rounded-xl flex flex-col items-center justify-center gap-2 text-sm text-gray-500 transition-all hover:text-gray-700 cursor-pointer"
                        style={{
                          background: "#eff1f5",
                          border: "2px dashed rgba(0,0,0,0.12)",
                          boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.5)",
                        }}
                      >
                        <Upload className="w-6 h-6" />
                        Click to upload new image
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                        style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/400x200?text=Ad";
                        }}
                      />
                      {image && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          disabled={isSubmitting}
                          title="Remove new image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {!image && (
                        <div className="mt-2">
                          <input
                            type="file"
                            accept={allowedExtensions.map(ext => `.${ext}`).join(",")}
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload-edit-change"
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor="image-upload-edit-change"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 rounded-xl cursor-pointer hover:text-gray-700 transition-colors"
                            style={{
                              background: "#eff1f5",
                              boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.5)",
                            }}
                          >
                            <Upload className="w-4 h-4" />
                            Change Image
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
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
                  form="edit-ad-form"
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
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Advertisement</span>
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

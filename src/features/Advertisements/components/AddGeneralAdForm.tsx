import { useState, useEffect } from "react";
import { Upload, X, ChevronDown, AlertCircle } from "lucide-react";
import type { CreateGeneralAdDTO } from "../advertisement.types";
import { SPECIALTIES, USER_TYPES } from "../advertisement.types";
import type { UserType } from "../advertisement.types";
import { advertisementService } from "../../../services/advertisement.service";
import { isValidUrl } from "../../../utils/common";
import Modal from "../../../components/common/Modal";

interface AddGeneralAdFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const inputStyle = (hasError = false) => ({
  background: "#ffffff",
  border: hasError ? "1px solid #ef4444" : "1px solid #e5e7eb",
  boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
});

const sectionStyle = {
  background: "#f8f9fb",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

export default function AddGeneralAdForm({
  isOpen,
  onClose,
  onSuccess,
}: AddGeneralAdFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
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
    return () => { document.head.removeChild(style); };
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 50) {
      newErrors.title = "Title must be less than 50 characters";
    }

    if (!formData.url.trim()) {
      newErrors.url = "URL is required";
    } else if (formData.url.length > 2048) {
      newErrors.url = "URL must be less than 2048 characters";
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = "Please enter a valid URL";
      }
    }

    if (!image) {
      newErrors.image = "Image is required";
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

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

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

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors(prev => ({
        ...prev,
        image: "Image size must be less than 2MB",
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
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const createData: CreateGeneralAdDTO = {
        title: formData.title,
        url: formData.url,
        image: image!,
        specializations: selectedSpecialties,
        status: formData.status,
        target_user: formData.target_user,
      };

      await advertisementService.createGeneralAd(createData);

      setSubmitSuccess(true);
      setTimeout(() => {
        setFormData({ title: "", url: "", status: "enabled", target_user: "doctor" });
        setSelectedSpecialties([]);
        setImage(null);
        setImagePreview(null);
        setErrors({});
        setSubmitSuccess(false);
        onSuccess();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to create advertisement:", error);
      const detail = error.response?.data?.detail;
      if (detail && typeof detail === "string") {
        const fieldMatch = detail.match(/^(\w+):\s*(.+)$/);
        if (fieldMatch) {
          const [, field, message] = fieldMatch;
          const fieldMap: Record<string, string> = { title: "title", url: "url", image: "image", specializations: "specialties" };
          const mappedField = fieldMap[field.toLowerCase()] || field.toLowerCase();
          setErrors(prev => ({ ...prev, [mappedField]: message.trim() }));
        } else {
          setErrors({ submit: detail });
        }
      } else {
        setErrors({
          submit: "Failed to create advertisement. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ title: "", url: "", status: "enabled", target_user: "doctor" });
      setSelectedSpecialties([]);
      setImage(null);
      setImagePreview(null);
      setErrors({});
      setSubmitSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add General Advertisement"
      size="md"
    >
      <div className="flex flex-col h-full">
        {/* Close Button */}
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
                Advertisement <span className="font-semibold">{formData.title}</span> has been successfully created.
              </p>
            </div>

            <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              marginLeft: "-2px", marginRight: "-2px",
              paddingLeft: "2px", paddingRight: "2px"
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
          <form id="add-ad-form" onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar" style={{
              maxHeight: 'calc(80vh - 140px)',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent'
            }}>
              {/* Error Message */}
              {errors.submit && (
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{
                  background: "#fee", border: "1px solid #fcc"
                }}>
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              {/* Basic Details */}
              <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Basic Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, title: value });
                        if (value.length >= 50) {
                          setErrors({ ...errors, title: "Title must be less than 50 characters" });
                        } else if (errors.title) {
                          setErrors({ ...errors, title: "" });
                        }
                      }}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle(!!errors.title)}
                      placeholder="Enter advertisement title"
                      disabled={isSubmitting}
                      maxLength={50}
                    />
                    {errors.title && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs text-red-600">{errors.title}</p>
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => {
                        setFormData({ ...formData, url: e.target.value });
                        if (errors.url) setErrors({ ...errors, url: "" });
                      }}
                      onBlur={() => {
                        if (!formData.url) {
                          setErrors({ ...errors, url: "URL is required" });
                        } else if (!isValidUrl(formData.url)) {
                          setErrors({ ...errors, url: "Enter a valid URL (example: https://domain.com)" });
                        }
                      }}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle(!!errors.url)}
                      placeholder="https://example.com"
                      disabled={isSubmitting}
                    />
                    {errors.url && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs text-red-600">{errors.url}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "enabled" | "disabled" })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle()}
                      disabled={isSubmitting}
                    >
                      <option value="enabled">Enable</option>
                      <option value="disabled">Disable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target User *</label>
                    <select
                      value={formData.target_user}
                      onChange={(e) => setFormData({ ...formData, target_user: e.target.value as UserType })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle()}
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
              <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Specialties *</h3>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl flex items-center justify-between gap-2 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    style={inputStyle(!!errors.specialties)}
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
                      style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}
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
                  <div className="flex flex-wrap gap-2 mt-3">
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

                {errors.specialties && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <p className="text-xs text-red-600">{errors.specialties}</p>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Advertisement Image *</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Supported formats: {allowedExtensions.join(", ").toUpperCase()} | Max size: 2MB
                </p>

                {!imagePreview ? (
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept={allowedExtensions.map(ext => `.${ext}`).join(",")}
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="image-upload"
                      className="w-full px-4 py-3 rounded-xl flex flex-col items-center justify-center gap-2 text-sm text-gray-500 transition-all hover:text-gray-700 cursor-pointer"
                      style={{
                        background: "#ffffff",
                        border: errors.image ? "2px dashed rgba(255,112,112,0.5)" : "2px dashed rgba(0,0,0,0.12)",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <Upload className="w-6 h-6" />
                      Click to upload image
                    </label>
                  </div>
                ) : (
                  <div className="relative flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-xl"
                      style={{ width: "180px", height: "320px", objectFit: "contain", background: "#f1f5f9", boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {errors.image && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <p className="text-xs text-red-600">{errors.image}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              marginLeft: "-2px", marginRight: "-2px",
              paddingLeft: "2px", paddingRight: "2px"
            }}>
              <button
                type="submit"
                form="add-ad-form"
                disabled={isSubmitting}
                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Advertisement</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

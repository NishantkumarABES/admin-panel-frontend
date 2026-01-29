import { useState } from "react";
import { Upload, X, ChevronDown } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { CreateGeneralAdDTO } from "../advertisement.types";
import { SPECIALTIES, USER_TYPES } from "../advertisement.types";
import type { UserType } from "../advertisement.types";
import { advertisementService } from "../../../services/advertisement.service";
import { isValidUrl } from "../../../utils/common";

interface AddGeneralAdFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

  const allowedExtensions = ["jpg", "jpeg", "png"];

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

    // Create preview
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

      // Reset form
      setFormData({ title: "", url: "", status: "enabled", target_user: "doctor" });
      setSelectedSpecialties([]);
      setImage(null);
      setImagePreview(null);
      setErrors({});

      onSuccess();
    } catch (error: any) {
      console.error("Failed to create advertisement:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to create advertisement. Please try again.",
      });
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
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add General Advertisement" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.title ? "border-red-500" : "border-gray-300"
              }`}
            placeholder="Enter advertisement title"
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL <span className="text-red-500">*</span>
          </label>

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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.url ? "border-red-500" : "border-gray-300"
              }`}
            placeholder="https://example.com"
            disabled={isSubmitting}
          />
          {errors.url && (
            <p className="text-red-500 text-xs mt-1">{errors.url}</p>
          )}
        </div>
        {/* Specialties Multi-Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specialties <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen)}
              className={`w-full px-3 py-2 border rounded-lg text-left focus:ring-2 focus:ring-gray-900 focus:border-transparent flex items-center justify-between ${errors.specialties ? "border-red-500" : "border-gray-300"
                }`}
              disabled={isSubmitting}
            >
              <span className="text-sm text-gray-700">
                {selectedSpecialties.length === 0
                  ? "Select specialties"
                  : `${selectedSpecialties.length} selected`}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSpecialtyDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isSpecialtyDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
            )}
          </div>

          {selectedSpecialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSpecialties.map((specialty) => (
                <span
                  key={specialty}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
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
            <p className="text-red-500 text-xs mt-1">{errors.specialties}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Supported formats: {allowedExtensions.join(", ").toUpperCase()}
          </p>

          {!imagePreview ? (
            <div className="relative">
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
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${errors.image ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload image</p>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
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
            <p className="text-red-500 text-xs mt-1">{errors.image}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as "enabled" | "disabled" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            disabled={isSubmitting}
          >
            <option value="enabled">Enable</option>
            <option value="disabled">Disable</option>
          </select>
        </div>

        {/* User Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target User <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.target_user}
            onChange={(e) => setFormData({ ...formData, target_user: e.target.value as UserType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            disabled={isSubmitting}
          >
            {USER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
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
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Advertisement"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { GeneralAdvertisement, UpdateGeneralAdDTO } from "../advertisement.types";
import { advertisementService } from "../../../services/advertisement.service";

interface EditGeneralAdFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  advertisement: GeneralAdvertisement;
}

export default function EditGeneralAdForm({
  isOpen,
  onClose,
  onSuccess,
  advertisement,
}: EditGeneralAdFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    status: "enabled" as "enabled" | "disabled",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedExtensions = ["jpg", "jpeg", "png"];

  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title,
        url: advertisement.url,
        status: advertisement.status,
      });
      setImagePreview(advertisement.image);
      setImage(null);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        status: formData.status,
      };

      if (image) {
        updateData.image = image;
      }

      await advertisementService.updateGeneralAd(updateData);

      // Reset
      setImage(null);
      setErrors({});

      onSuccess();
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
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit General Advertisement" size="md">
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
              errors.title ? "border-red-500" : "border-gray-300"
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
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
              errors.url ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="https://example.com"
            disabled={isSubmitting}
          />
          {errors.url && (
            <p className="text-red-500 text-xs mt-1">{errors.url}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Supported formats: {allowedExtensions.join(", ").toUpperCase()} (Leave empty to keep current image)
          </p>

          {!imagePreview ? (
            <div className="relative">
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
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  errors.image ? "border-red-500" : "border-gray-300"
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload new image</p>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
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
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Change Image
                  </label>
                </div>
              )}
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
            {isSubmitting ? "Updating..." : "Update Advertisement"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

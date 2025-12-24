import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import type {
  Topic,
  CreateTopicDTO,
  TopicFormat,
  AuthorType,
  DetailPageType,
  PublishTiming,
} from "../topic.types";
import Modal from "../../../components/common/Modal";

interface AddEditTopicModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTopicDTO) => void;
}

const initialFormData: CreateTopicDTO = {
  category: "",
  authorType: "doctor",
  authorId: "",
  title: "",
  description: "",
  format: "format1",
  publishTiming: "now",
};

export default function AddEditTopicModal({
  topic,
  isOpen,
  onClose,
  onSubmit,
}: AddEditTopicModalProps) {
  const [formData, setFormData] = useState<CreateTopicDTO>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (topic) {
      setFormData({
        category: topic.category,
        authorType: topic.authorType,
        authorId: topic.authorId,
        title: topic.title,
        description: topic.description,
        format: topic.format,
        pdfUrl: topic.pdfUrl,
        searchUsers: topic.searchUsers,
        detailPageType: topic.detailPageType,
        externalUrl: topic.externalUrl,
        videoUrl: topic.videoUrl,
        publishTiming: topic.publishTiming,
        scheduledAt: topic.scheduledAt,
      });
      if (topic.image) {
        setImagePreview(topic.image);
      }
    } else {
      setFormData(initialFormData);
      setImagePreview("");
    }
  }, [topic, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setImagePreview("");
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: undefined });
    setImagePreview("");
  };

  const handleFormatChange = (format: TopicFormat) => {
    setFormData({
      ...formData,
      format,
      pdfUrl: undefined,
      searchUsers: undefined,
      detailPageType: undefined,
      externalUrl: undefined,
      videoUrl: undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={topic ? "Edit Topic" : "Add New Topic"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic Format *
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleFormatChange("format1")}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                formData.format === "format1"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Format 1 (PDF)
            </button>
            <button
              type="button"
              onClick={() => handleFormatChange("format2")}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                formData.format === "format2"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Format 2 (Users)
            </button>
            <button
              type="button"
              onClick={() => handleFormatChange("format3")}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                formData.format === "format3"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Format 3 (Video)
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author Type *
              </label>
              <select
                value={formData.authorType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    authorType: e.target.value as AuthorType,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              >
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author ID *
              </label>
              <input
                type="text"
                value={formData.authorId}
                onChange={(e) =>
                  setFormData({ ...formData, authorId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter author ID"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image (jpg, jpeg, png)
          </label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload image</p>
                <p className="text-xs text-gray-500">JPG, JPEG, PNG</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        {/* Format 1 - PDF */}
        {formData.format === "format1" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              PDF Document
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF URL *
              </label>
              <input
                type="url"
                value={formData.pdfUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pdfUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="https://example.com/document.pdf"
                required
              />
            </div>
          </div>
        )}

        {/* Format 2 - Search Users */}
        {formData.format === "format2" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              User Search
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Users (comma-separated IDs)
                </label>
                <input
                  type="text"
                  value={formData.searchUsers?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      searchUsers: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="user1, user2, user3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detail Page Type *
                </label>
                <select
                  value={formData.detailPageType || "pdf"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detailPageType: e.target.value as DetailPageType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                >
                  <option value="pdf">PDF</option>
                  <option value="external_url">External URL</option>
                </select>
              </div>

              {formData.detailPageType === "pdf" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF URL *
                  </label>
                  <input
                    type="url"
                    value={formData.pdfUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, pdfUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="https://example.com/document.pdf"
                    required
                  />
                </div>
              )}

              {formData.detailPageType === "external_url" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    External URL *
                  </label>
                  <input
                    type="url"
                    value={formData.externalUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, externalUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Format 3 - Video */}
        {formData.format === "format3" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Video Content
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL *
                </label>
                <input
                  type="url"
                  value={formData.videoUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detail Page Type *
                </label>
                <select
                  value={formData.detailPageType || "no_url"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detailPageType: e.target.value as DetailPageType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                >
                  <option value="pdf">PDF</option>
                  <option value="external_url">External URL</option>
                  <option value="no_url">No URL</option>
                </select>
              </div>

              {formData.detailPageType === "pdf" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF URL *
                  </label>
                  <input
                    type="url"
                    value={formData.pdfUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, pdfUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="https://example.com/document.pdf"
                    required
                  />
                </div>
              )}

              {formData.detailPageType === "external_url" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    External URL *
                  </label>
                  <input
                    type="url"
                    value={formData.externalUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, externalUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Publishing Options */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Publishing
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When to Publish *
              </label>
              <select
                value={formData.publishTiming}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publishTiming: e.target.value as PublishTiming,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              >
                <option value="now">Publish Now</option>
                <option value="later">Schedule for Later</option>
              </select>
            </div>

            {formData.publishTiming === "later" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledAt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {topic ? "Update Topic" : "Add Topic"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

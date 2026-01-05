import { useState, useEffect } from "react";
import type {
  Topic,
  CreateTopicDTO,
  ArticleInputType,
} from "../topic.types";
import Modal from "../../../components/common/Modal";

interface AddEditTopicModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTopicDTO) => void;
}

const initialFormData: CreateTopicDTO = {
  articleInputType: "html",
  articleContent: "",
  baseImageUrl: "",
  imageUrlOverride: "",
  titleOverride: "",
};

export default function AddEditTopicModal({
  topic,
  isOpen,
  onClose,
  onSubmit,
}: AddEditTopicModalProps) {
  const [formData, setFormData] = useState<CreateTopicDTO>(initialFormData);

  useEffect(() => {
    if (topic) {
      setFormData({
        articleInputType: topic.articleInputType || "html",
        articleContent: topic.articleContent || "",
        baseImageUrl: topic.baseImageUrl || "",
        imageUrlOverride: topic.imageUrlOverride || "",
        titleOverride: topic.titleOverride || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [topic, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  const handleInputTypeChange = (type: ArticleInputType) => {
    setFormData({
      ...formData,
      articleInputType: type,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={topic ? "Edit Topic" : "Add New Topic"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Input Type Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <label className="block text-xs font-extrabold text-gray-900 mb-3 uppercase tracking-wide">
            Article Input Type *
          </label>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => handleInputTypeChange("html")}
              className={`flex-1 px-3.5 py-2.5 text-sm font-extrabold rounded-xl border transition-all ${
                formData.articleInputType === "html"
                  ? "bg-blue-700 text-white border-blue-700 shadow-md"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Article HTML
            </button>
            <button
              type="button"
              onClick={() => handleInputTypeChange("plain_text")}
              className={`flex-1 px-3.5 py-2.5 text-sm font-extrabold rounded-xl border transition-all ${
                formData.articleInputType === "plain_text"
                  ? "bg-blue-700 text-white border-blue-700 shadow-md"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Plain Text
            </button>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <label className="block text-xs font-extrabold text-gray-900 mb-2 uppercase tracking-wide">
            Article Content *
          </label>
          <textarea
            value={formData.articleContent}
            onChange={(e) =>
              setFormData({ ...formData, articleContent: e.target.value })
            }
            rows={12}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-vertical transition-all leading-relaxed font-mono"
            placeholder={
              formData.articleInputType === "html"
                ? "Paste your article HTML here..."
                : "Paste your plain text article here..."
            }
            required
          />
          <p className="text-xs text-gray-500 mt-1.5 leading-snug">
            {formData.articleInputType === "html"
              ? "Paste the complete HTML content of your article."
              : "Paste the plain text content of your article."}
          </p>
        </div>

        {/* Base Image URL */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <label className="block text-xs font-extrabold text-gray-900 mb-2 uppercase tracking-wide">
            Base URL for Images in Article *
          </label>
          <input
            type="url"
            value={formData.baseImageUrl}
            onChange={(e) =>
              setFormData({ ...formData, baseImageUrl: e.target.value })
            }
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="https://example.com/images/"
            required
          />
          <p className="text-xs text-gray-500 mt-1.5 leading-snug">
            This base URL will be used to resolve image paths in the article content.
          </p>
        </div>

        {/* Optional Fields */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">
            Optional Overrides
          </h3>

          {/* Image URL Override */}
          <div>
            <label className="block text-xs font-extrabold text-gray-900 mb-2 uppercase tracking-wide">
              Image URL Override (Optional)
            </label>
            <input
              type="url"
              value={formData.imageUrlOverride}
              onChange={(e) =>
                setFormData({ ...formData, imageUrlOverride: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="https://example.com/custom-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1.5 leading-snug">
              Override the default article image with a custom URL.
            </p>
          </div>

          {/* Title Override */}
          <div>
            <label className="block text-xs font-extrabold text-gray-900 mb-2 uppercase tracking-wide">
              Title Override (Optional)
            </label>
            <input
              type="text"
              value={formData.titleOverride}
              onChange={(e) =>
                setFormData({ ...formData, titleOverride: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Custom article title"
            />
            <p className="text-xs text-gray-500 mt-1.5 leading-snug">
              Override the default article title with a custom title.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="submit"
            className="flex-1 px-3.5 py-2.5 text-sm font-extrabold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-all shadow-md"
          >
            {topic ? "Update Topic" : "Add Topic"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-extrabold text-white bg-gray-900 rounded-xl hover:bg-gray-950 transition-all shadow-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

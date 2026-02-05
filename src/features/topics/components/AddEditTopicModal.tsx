import { useState, useEffect, useRef } from "react";
import type {
  Topic, CreateTopicDTO, ArticleExtractionResponse,
} from "../topic.types";
import Modal from "../../../components/common/Modal";
import {
  Link, AlertCircle, Loader2, Check, Upload, X,
} from "lucide-react";
import * as topicService from "../../../services/topic.service";
import RichTextEditor from "../../settings/components/RichTextEditor";

interface AddEditTopicModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTopicDTO) => void;
}

type WorkflowMode = "article_input" | "ai_processing" | "ai_success" | "manual";

const initialFormData: CreateTopicDTO = {
  title: "",
  description: "",
  image_url: undefined,
  image_file: undefined,
  source_url: "",
  publishing_time: new Date().toISOString(),
};

export default function AddEditTopicModal({
  topic,
  isOpen,
  onClose,
  onSubmit,
}: AddEditTopicModalProps) {
  // Workflow state
  const [mode, setMode] = useState<WorkflowMode>("article_input");
  const [articleUrl, setArticleUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  // Form data
  const [formData, setFormData] = useState<CreateTopicDTO>(initialFormData);

  // AI extraction state
  const [extractedData, setExtractedData] = useState<ArticleExtractionResponse | null>(null);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // UI states
  const [processingError, setProcessingError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset modal on open/close
  useEffect(() => {
    if (isOpen && !topic) {
      // Reset to initial state for new topic
      setMode("article_input");
      setArticleUrl("");
      setUrlError("");
      setFormData(initialFormData);
      setExtractedData(null);
      setExtractedImages([]);
      setSelectedImageIndex(null);
      setProcessingError("");
      setImagePreview("");
    } else if (isOpen && topic) {
      // Edit mode - go directly to manual mode with pre-filled data
      setMode("manual");

      // Keep description as is - don't auto-fill with AI summary for video topics
      // The AI-generated summary_text should remain separate in transcription data
      setFormData({
        title: topic.title || "",
        description: topic.description || "",
        image_url: topic.image || undefined,
        image_file: undefined,
        source_url: topic.source_url || "",
        publishing_time: topic.publishing_time || new Date().toISOString(),
      });
      setImagePreview(topic.image || "");
    }
  }, [topic, isOpen]);

  // Validate URL
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError("URL is required");
      return false;
    }

    try {
      const urlObj = new URL(url);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        setUrlError("URL must start with http:// or https://");
        return false;
      }
      setUrlError("");
      return true;
    } catch {
      setUrlError("Please enter a valid URL");
      return false;
    }
  };

  // Handle article URL submission
  const handleArticleSubmit = async () => {
    if (!validateUrl(articleUrl)) return;

    setProcessingError("");
    setMode("ai_processing");

    try {
      const result = await topicService.extractArticleFromUrl(articleUrl);

      if (result.success && result.data?.title && result.data?.summary) {
        // Success - AI extraction worked
        setExtractedData(result);
        setExtractedImages(result.data.images || []);
        setFormData({
          title: result.data.title,
          description: result.data.summary,
          image_url: undefined,
          image_file: undefined,
          source_url: articleUrl,
          publishing_time: new Date().toISOString(),
        });
        setMode("ai_success");
      } else {
        // Failed - switch to manual mode
        setProcessingError(
          result.error || "Could not extract article content. Please enter details manually."
        );
        setMode("manual");
      }
    } catch (error: any) {
      setProcessingError(
        error?.message || "An error occurred while processing the article. Please enter details manually."
      );
      setMode("manual");
    }
  };

  // Handle image selection from extracted images
  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    const selectedUrl = extractedImages[index];
    setFormData({ ...formData, image_url: selectedUrl, image_file: undefined });
    setImagePreview(selectedUrl);
  };

  // Handle manual image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image_file: file, image_url: undefined });
      setImagePreview(URL.createObjectURL(file));
      setSelectedImageIndex(null); // Deselect any extracted image
    }
  };

  // Remove uploaded/selected image
  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: undefined, image_file: undefined });
    setImagePreview("");
    setSelectedImageIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Switch to manual mode from article input
  const handleSwitchToManual = () => {
    setMode("manual");
    setArticleUrl("");
    setUrlError("");
  };

  // Handle final form submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.title?.trim()) {
      alert("Title is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.description?.trim()) {
      alert("Description is required");
      setIsSubmitting(false);
      return;
    }

    // Cleanup unselected images if there are extracted images
    if (extractedImages.length > 0) {
      const unselectedImages = extractedImages.filter((_, index) => index !== selectedImageIndex);
      if (unselectedImages.length > 0) {
        await topicService.cleanupUnwantedImages(unselectedImages);
      }
    }

    onSubmit(formData);

    // Clear state without calling cleanup again
    setMode("article_input");
    setArticleUrl("");
    setUrlError("");
    setFormData(initialFormData);
    setExtractedData(null);
    setExtractedImages([]);
    setSelectedImageIndex(null);
    setProcessingError("");
    setIsSubmitting(false);
    setImagePreview("");
  };

  // Close modal
  const handleClose = async () => {
    // Cleanup extracted images if user cancels after extraction
    if (extractedImages.length > 0) {
      await topicService.cleanupUnwantedImages(extractedImages);
    }

    setMode("article_input");
    setArticleUrl("");
    setUrlError("");
    setFormData(initialFormData);
    setExtractedData(null);
    setExtractedImages([]);
    setSelectedImageIndex(null);
    setProcessingError("");
    setIsSubmitting(false);
    setImagePreview("");
    onClose();
  };

  // Retry article extraction
  const handleRetry = () => {
    setMode("article_input");
    setProcessingError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={topic ? "Edit Topic" : "Add New Topic"}
      size="xl"
    >
      <div className="space-y-5">
        {/* Article Input Mode */}
        {mode === "article_input" && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                Paste a publicly accessible medical article URL below. Our AI will automatically extract the title, generate a summary, and find relevant images.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Article URL
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={articleUrl}
                  onChange={(e) => {
                    setArticleUrl(e.target.value);
                    setUrlError("");
                  }}
                  onBlur={() => validateUrl(articleUrl)}
                  className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${urlError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500"
                    }`}
                  placeholder="https://example.com/medical-article"
                />
              </div>
              {urlError && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {urlError}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleArticleSubmit}
                disabled={!articleUrl.trim()}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Extract Article Content
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSwitchToManual}
              className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              Create Topic Manually
            </button>
          </div>
        )}

        {/* AI Processing Mode */}
        {mode === "ai_processing" && (
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Processing Article
              </h3>
              <p className="text-sm text-gray-600">
                Extracting content and generating summary...
              </p>
            </div>
          </div>
        )}

        {/* AI Success Mode - Review Extracted Content */}
        {mode === "ai_success" && extractedData && (
          <form onSubmit={handleFinalSubmit} className="space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Article extracted successfully!
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Review and edit the extracted content below before submitting.
                </p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter topic title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description (~300 words) *
              </label>
              <RichTextEditor
                content={formData.description}
                onChange={(html) =>
                  setFormData({ ...formData, description: html })
                }
                editable={true}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                AI-generated summary. Feel free to edit as needed.
              </p>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Topic Image {extractedImages.length === 0 && "*"}
              </label>

              {extractedImages.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    Select one image from the extracted images:
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {extractedImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        onClick={() => handleImageSelect(index)}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImageIndex === index
                          ? "border-blue-600 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`Extracted ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {selectedImageIndex === index && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 mb-2">
                    No images were found in the article. Please upload an image:
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2 text-sm text-gray-600"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span>Click to upload image</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Source URL Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">Source URL:</p>
              <a
                href={formData.source_url || articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all"
              >
                {formData.source_url || articleUrl}
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || (!formData.image_url && !formData.image_file && !imagePreview)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Create Topic"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Manual Mode */}
        {mode === "manual" && (
          <form onSubmit={handleFinalSubmit} className="space-y-5">
            {processingError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    Automatic extraction failed
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {processingError}
                  </p>
                  {articleUrl && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="text-xs font-semibold text-amber-700 underline mt-2 hover:text-amber-800"
                    >
                      Try again with a different URL
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                Create a topic manually by filling in all the required fields below.
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter topic title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Article Content / Description *
              </label>
              <RichTextEditor
                content={formData.description}
                onChange={(html) =>
                  setFormData({ ...formData, description: html })
                }
                editable={true}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Topic Image (Optional but recommended)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Uploaded preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2 text-sm text-gray-600"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span>Click to upload image</span>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : topic ? "Update Topic" : "Create Topic"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

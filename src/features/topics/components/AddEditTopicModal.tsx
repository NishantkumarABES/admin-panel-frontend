import { useState, useEffect, useRef } from "react";
import type {
  Topic, CreateTopicDTO, ArticleExtractionResponse,
} from "../topic.types";

import {
  Link, AlertCircle, Loader2, Check, Upload, X, Video,
} from "lucide-react";
import * as topicService from "../../../services/topic.service";
import RichTextEditor from "../../settings/components/RichTextEditor";
import { stripHtml } from "../../../utils/stripHtml";

const MAX_DESCRIPTION_CHARS = 500;

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

// Step indicator labels
const STEPS = [
  { key: "article_input", label: "Paste URL" },
  { key: "ai_processing", label: "AI Extraction" },
  { key: "review", label: "Review & Save" },
] as const;

const getStepState = (stepIndex: number, mode: WorkflowMode): "completed" | "active" | "upcoming" => {
  const modeToStep: Record<WorkflowMode, number> = {
    article_input: 0,
    ai_processing: 1,
    ai_success: 2,
    manual: 2,
  };
  const currentStep = modeToStep[mode];
  if (stepIndex < currentStep) return "completed";
  if (stepIndex === currentStep) return "active";
  return "upcoming";
};

// AI processing cycling messages
const AI_MESSAGES = [
  "Fetching article…",
  "Extracting content…",
  "Summarizing with AI…",
];

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
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // URL real-time validation
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const urlValidateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI processing message cycling
  const [aiMessageIndex, setAiMessageIndex] = useState(0);

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
      setHasAttemptedSubmit(false);
      setUrlValid(null);
      setAiMessageIndex(0);
    } else if (isOpen && topic) {
      // Edit mode - go directly to manual mode with pre-filled data
      setMode("manual");

      // For video topics, use summary_text as the description if available
      const description =
        topic.video_url && topic.transcription?.summary_text
          ? topic.transcription.summary_text
          : topic.description || "";

      setFormData({
        title: topic.title || "",
        description,
        image_url: topic.image || undefined,
        image_file: undefined,
        source_url: topic.source_url || "",
        publishing_time: topic.publishing_time || new Date().toISOString(),
      });
      setImagePreview(topic.image || "");
      setHasAttemptedSubmit(false);
    }
  }, [topic, isOpen]);

  // AI message cycling
  useEffect(() => {
    if (mode !== "ai_processing") {
      setAiMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setAiMessageIndex((prev) => (prev + 1) % AI_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [mode]);

  // URL real-time validation (debounced)
  useEffect(() => {
    if (urlValidateTimer.current) clearTimeout(urlValidateTimer.current);
    if (!articleUrl.trim()) {
      setUrlValid(null);
      return;
    }
    urlValidateTimer.current = setTimeout(() => {
      try {
        const urlObj = new URL(articleUrl);
        setUrlValid(["http:", "https:"].includes(urlObj.protocol));
      } catch {
        setUrlValid(false);
      }
    }, 300);
    return () => {
      if (urlValidateTimer.current) clearTimeout(urlValidateTimer.current);
    };
  }, [articleUrl]);

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

  // Get plain text character count from HTML content
  const getPlainTextLength = (html: string): number => {
    return stripHtml(html).length;
  };

  // Character count progress
  const charCount = getPlainTextLength(formData.description || "");
  const charPercent = Math.min((charCount / MAX_DESCRIPTION_CHARS) * 100, 100);
  const charBarColor = charPercent >= 100 ? "#ff7070" : charPercent >= 80 ? "#ffc554" : "#4fcfa5";

  // Handle final form submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.title?.trim()) {
      alert("Title is required");
      setIsSubmitting(false);
      return;
    }

    const plainDescription = stripHtml(formData.description || "");
    if (!plainDescription.trim()) {
      alert("Description is required");
      setIsSubmitting(false);
      return;
    }

    if (plainDescription.length > MAX_DESCRIPTION_CHARS) {
      alert(`Description must be ${MAX_DESCRIPTION_CHARS} characters or less`);
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

    // Send raw HTML to API so formatting is preserved in the database
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
    setHasAttemptedSubmit(false);
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
    setHasAttemptedSubmit(false);
    onClose();
  };

  // Retry article extraction
  const handleRetry = () => {
    setMode("article_input");
    setProcessingError("");
  };

  // Transcription status badge helper for video topic edit mode
  const getTranscriptionBadge = () => {
    if (!topic?.transcription) return null;
    const status = topic.transcription.status;
    const colors: Record<string, { bg: string; color: string }> = {
      completed: { bg: "rgba(79,207,165,0.12)", color: "#059669" },
      transcribing: { bg: "rgba(255,197,84,0.12)", color: "#d97706" },
      preparing: { bg: "rgba(107,150,255,0.12)", color: "#4369d4" },
      failed: { bg: "rgba(255,112,112,0.12)", color: "#dc2626" },
      blocked: { bg: "rgba(156,163,175,0.12)", color: "#6b7280" },
      pending: { bg: "rgba(156,163,175,0.12)", color: "#6b7280" },
    };
    const c = colors[status] || colors.pending;
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md"
        style={{ background: c.bg, color: c.color }}
      >
        {(status === "transcribing" || status === "preparing") && <Loader2 className="w-3 h-3 animate-spin" />}
        {status === "completed" && <Check className="w-3 h-3" />}
        {(status === "failed" || status === "blocked") && <X className="w-3 h-3" />}
        {status}
      </span>
    );
  };

  const hasNoImage = !formData.image_url && !formData.image_file && !imagePreview;

  if (!isOpen) return null;

  // Determine which form id to use for the external submit button
  const activeFormId = mode === "ai_success" ? "topic-ai-success-form" : mode === "manual" ? "topic-manual-form" : undefined;
  const showFooter = mode === "ai_success" || mode === "manual";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-[18px] w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Header */}
          <div
            className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {topic ? "Edit Topic" : "Add New Topic"}
            </h2>
            {/* Close Button - Top Right with Click Animation */}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 active:shadow-inner"
              style={{
                background: "#f8f9fb",
                boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.6)"
              }}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="px-6 py-4">
            <div className="space-y-5">

              {/* Workflow Step Indicator (new topics only) */}
              {!topic && (
                <div className="flex items-center justify-center gap-0 px-4">
                  {STEPS.map((step, idx) => {
                    const state = getStepState(idx, mode);
                    return (
                      <div key={step.key} className="flex items-center">
                        {/* Step pill */}
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                            style={{
                              background: state === "completed" ? "#4fcfa5" : state === "active" ? "#6b96ff" : "#d1d5db",
                              color: "white",
                              boxShadow: state !== "upcoming" ? "2px 2px 4px rgba(0,0,0,0.10)" : "none",
                            }}
                          >
                            {state === "completed" ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span
                            className="text-[11px] font-semibold whitespace-nowrap"
                            style={{
                              color: state === "completed" ? "#059669" : state === "active" ? "#6b96ff" : "#9ca3af",
                            }}
                          >
                            {step.label}
                          </span>
                        </div>
                        {/* Connector line */}
                        {idx < STEPS.length - 1 && (
                          <div
                            className="w-8 sm:w-12 h-[2px] mx-1.5"
                            style={{
                              background: getStepState(idx + 1, mode) !== "upcoming" ? "#4fcfa5" : "#d1d5db",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Video Topic Edit Banner */}
              {topic?.video_url && (
                <div
                  className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(162,133,255,0.08)",
                    boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)",
                  }}
                >
                  <Video className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#a285ff" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: "#7c3aed" }}>Video Topic</span>
                      {getTranscriptionBadge()}
                    </div>
                    <p className="text-xs text-gray-500">
                      Video topics are created by doctors. You can only edit the title and description.
                    </p>
                  </div>
                </div>
              )}

              {/* Article Input Mode */}
              {mode === "article_input" && (
                <div className="space-y-5">
                  {/* Close button */}

                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(107,150,255,0.09)", boxShadow: "inset 1px 1px 3px rgba(107,150,255,0.15), inset -1px -1px 3px rgba(255,255,255,0.5)" }}>
                    <p className="text-sm" style={{ color: "#4369d4" }}>
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
                        className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl outline-none transition-all focus:ring-2 focus:ring-gray-900"
                        style={{ background: "#eff1f5", border: "none", boxShadow: urlError ? "inset 2px 2px 5px rgba(255,112,112,0.2), inset -2px -2px 5px rgba(255,255,255,0.5)" : "inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.6)" }}
                        placeholder="https://example.com/medical-article"
                      />
                      {/* Real-time URL validation indicator */}
                      {articleUrl.trim() && urlValid !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {urlValid ? (
                            <Check className="w-4 h-4" style={{ color: "#4fcfa5" }} />
                          ) : (
                            <X className="w-4 h-4" style={{ color: "#ff7070" }} />
                          )}
                        </div>
                      )}
                    </div>
                    {urlError && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {urlError}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1.5">
                      We'll extract the title, summary, and images automatically.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleArticleSubmit}
                      disabled={!articleUrl.trim()}
                      className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "#1f2937", boxShadow: "4px 4px 8px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.04)" }}
                    >
                      Extract Article Content
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full" style={{ height: "1px", background: "rgba(0,0,0,0.08)" }}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 text-gray-500" style={{ background: "#f0f2f7" }}>or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSwitchToManual}
                    className="clay-btn w-full py-2.5 text-sm font-semibold"
                    style={{ color: "#6b96ff" }}
                  >
                    Create Topic Manually
                  </button>
                </div>
              )}

              {/* AI Processing Mode */}
              {mode === "ai_processing" && (
                <div className="py-12 text-center space-y-4">
                  <div className="flex justify-center">
                    <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#6b96ff" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Processing Article
                    </h3>
                    <p className="text-sm text-gray-600 transition-all">
                      {AI_MESSAGES[aiMessageIndex]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMode("article_input"); setProcessingError(""); }}
                    className="clay-btn px-5 py-2 text-sm font-semibold"
                    title="Cancel extraction"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* AI Success Mode - Review Extracted Content */}
              {mode === "ai_success" && extractedData && (
                <form id="topic-ai-success-form" onSubmit={handleFinalSubmit} className="space-y-5">
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(79,207,165,0.10)", boxShadow: "inset 1px 1px 3px rgba(79,207,165,0.2), inset -1px -1px 3px rgba(255,255,255,0.5)" }}>
                    <Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#059669" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#065f46" }}>Article extracted successfully!</p>
                      <p className="text-xs mt-0.5" style={{ color: "#047857" }}>Review and edit the extracted content below before submitting.</p>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm rounded-xl outline-none transition-all focus:ring-2 focus:ring-gray-900"
                      style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.6)" }}
                      placeholder="Enter topic title"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Description (max {MAX_DESCRIPTION_CHARS} characters) *
                    </label>
                    <RichTextEditor
                      content={formData.description}
                      onChange={(html) =>
                        setFormData({ ...formData, description: html })
                      }
                      editable={true}
                    />
                    {/* Character count + progress bar */}
                    <div className="mt-1.5">
                      <div
                        className="h-1 rounded-full overflow-hidden mb-1.5"
                        style={{ background: "#e5e7eb" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${charPercent}%`, background: charBarColor }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          AI-generated summary. Feel free to edit as needed.
                        </p>
                        <p className={`text-xs font-medium ${charCount > MAX_DESCRIPTION_CHARS ? "text-red-600" : "text-gray-500"}`}>
                          {charCount}/{MAX_DESCRIPTION_CHARS} characters
                        </p>
                      </div>
                    </div>
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
                        <div className="grid grid-cols-2 gap-3">
                          {extractedImages.map((imageUrl, index) => (
                            <div
                              key={index}
                              onClick={() => handleImageSelect(index)}
                              className="relative aspect-video rounded-xl overflow-hidden cursor-pointer transition-all"
                              style={{
                                boxShadow: selectedImageIndex === index
                                  ? "0 0 0 2px #6b96ff, 3px 3px 8px rgba(0,0,0,0.10)"
                                  : "inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)",
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt={`Extracted ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {selectedImageIndex === index && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#4fcfa5" }}>
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImageIndex(null);
                            setFormData({ ...formData, image_url: undefined, image_file: undefined });
                            setImagePreview("");
                          }}
                          className="text-xs font-medium transition-colors hover:underline"
                          style={{ color: "#6b7280" }}
                        >
                          Skip image
                        </button>
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
                            className="w-full px-4 py-8 rounded-xl flex flex-col items-center justify-center gap-2 text-sm text-gray-500 transition-all"
                            style={{
                              background: "#eff1f5",
                              boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)",
                              border: "2px dashed rgba(0,0,0,0.12)",
                            }}
                          >
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span>Click to upload image</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Source URL Display */}
                  <div className="rounded-xl p-3" style={{ background: "#eff1f5", boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.5)" }}>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Source URL</p>
                    <a
                      href={formData.source_url || articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline break-all"
                      style={{ color: "#6b96ff" }}
                    >
                      {formData.source_url || articleUrl}
                    </a>
                  </div>

                  {hasAttemptedSubmit && hasNoImage && (
                    <p className="text-xs text-red-500">An image is required to publish this topic.</p>
                  )}
                </form>
              )}

              {/* Manual Mode */}
              {mode === "manual" && (
                <form id="topic-manual-form" onSubmit={handleFinalSubmit} className="space-y-5">
                  {processingError && (
                    <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,197,84,0.10)", boxShadow: "inset 1px 1px 3px rgba(255,197,84,0.2), inset -1px -1px 3px rgba(255,255,255,0.5)" }}>
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: "#92400e" }}>Automatic extraction failed</p>
                        <p className="text-xs mt-0.5" style={{ color: "#b45309" }}>{processingError}</p>
                        {articleUrl && (
                          <button
                            type="button"
                            onClick={handleRetry}
                            className="text-xs font-semibold underline mt-2"
                            style={{ color: "#d97706" }}
                          >
                            Try again with a different URL
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {!topic?.video_url && (
                    <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(107,150,255,0.09)", boxShadow: "inset 1px 1px 3px rgba(107,150,255,0.15), inset -1px -1px 3px rgba(255,255,255,0.5)" }}>
                      <p className="text-sm" style={{ color: "#4369d4" }}>Create a topic manually by filling in all the required fields below.</p>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm rounded-xl outline-none transition-all focus:ring-2 focus:ring-gray-900"
                      style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.6)" }}
                      placeholder="Enter topic title"
                      required
                    />
                  </div>


                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Article Content / Description (max {MAX_DESCRIPTION_CHARS} characters) *
                    </label>
                    <RichTextEditor
                      content={formData.description}
                      onChange={(html) =>
                        setFormData({ ...formData, description: html })
                      }
                      editable={true}
                    />
                    {/* Character count + progress bar */}
                    <div className="mt-1.5">
                      <div
                        className="h-1 rounded-full overflow-hidden mb-1.5"
                        style={{ background: "#e5e7eb" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${charPercent}%`, background: charBarColor }}
                        />
                      </div>
                      <p className={`text-xs font-medium ${charCount > MAX_DESCRIPTION_CHARS ? "text-red-600" : "text-gray-500"}`}>
                        {charCount}/{MAX_DESCRIPTION_CHARS} characters
                      </p>
                    </div>
                  </div>

                  {/* Image Upload - hidden for video topics */}
                  {!topic?.video_url && (
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
                          className="w-full py-8 rounded-xl flex flex-col items-center justify-center gap-2 text-sm text-gray-500 transition-all"
                          style={{ background: "#eff1f5", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)", border: "2px dashed rgba(0,0,0,0.12)" }}
                        >
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span>Click to upload image</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Source URL (Optional) - hidden for video topics */}
                  {!topic?.video_url && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Source URL (Optional)</label>
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          value={formData.source_url}
                          onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                          readOnly={!!topic}
                          className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl outline-none transition-all focus:ring-2 focus:ring-gray-900"
                          style={{ background: topic ? "#e8eaed" : "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.6)", cursor: topic ? "not-allowed" : "text", color: topic ? "#9ca3af" : undefined }}
                          placeholder="https://example.com/article-source"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Add a reference link if this topic is based on an external article.
                      </p>
                    </div>
                  )}

                  {hasAttemptedSubmit && hasNoImage && !topic?.video_url && (
                    <p className="text-xs text-red-500">An image is required to publish this topic.</p>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Sticky Footer */}
          {showFooter && (
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 sticky bottom-0 bg-white"
              style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
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
                form={activeFormId}
                disabled={isSubmitting || (mode === "ai_success" && hasNoImage)}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#1f2937", boxShadow: "4px 4px 8px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.04)" }}
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>{topic ? "Updating..." : "Creating..."}</span></>
                ) : (
                  <span>{topic ? "Update Topic" : "Create Topic"}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

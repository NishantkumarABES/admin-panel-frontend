import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type {
  CreateTopicDTO, ArticleExtractionResponse,
} from "./topic.types";

import {
  Link, AlertCircle, Loader2, Check, Upload, X, ArrowLeft, Sparkles, Undo2, Baseline, Crop,
} from "lucide-react";
import * as topicService from "../../services/topic.service";
import RichTextEditor from "../settings/components/RichTextEditor";
import ImageEditor, { MIN_OUTPUT_W, MIN_OUTPUT_H } from "./components/ImageEditor";
import { stripHtml } from "../../utils/stripHtml";

const MAX_DESCRIPTION_CHARS = 500;
const MAX_TITLE_CHARS = 150;
const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ALLOWED_IMAGE_LABEL = "PNG, JPG, JPEG or WebP";

type WorkflowMode = "article_input" | "ai_processing" | "ai_success" | "manual";

const initialFormData: CreateTopicDTO = {
  title: "",
  title_color: undefined,
  description: "",
  image_url: undefined,
  image_file: undefined,
  source_url: "",
  publishing_time: new Date().toISOString(),
};

// Preset colors for the topic title
const TITLE_COLORS = [
  "#1f2937", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#6b96ff", "#8b5cf6", "#ec4899",
];

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

// Load a (possibly remote) image URL into a same-origin Blob the editor can crop.
//
// Primary path: ask our own backend to return the bytes. Extracted/topic images
// live on a bucket/CDN that serves them without CORS headers, so a browser-side
// fetch (and any crossOrigin canvas built from the cached preview) is blocked —
// that is exactly the CORS error this previously produced. Routing through our
// API makes the request same-origin, so there is nothing to taint or block.
//
// Fallback path: if the proxy is unavailable, try a direct CORS fetch, then a
// crossOrigin <img> re-encoded via canvas, rejecting when even that cannot
// produce pixels.
const loadImageAsBlob = async (url: string): Promise<Blob> => {
  try {
    const blob = await topicService.fetchImageBlob(url);
    if (blob.size > 0 && blob.type.startsWith("image/")) return blob;
  } catch {
    // Proxy unavailable — fall through to direct fetch / canvas approaches.
  }

  try {
    const res = await fetch(url, { mode: "cors", cache: "reload" });
    if (res.ok) {
      const blob = await res.blob();
      if (blob.size > 0 && blob.type.startsWith("image/")) return blob;
    }
  } catch {
    // Direct fetch blocked — fall through to the canvas approach.
  }

  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed"))),
          "image/png"
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
};

export default function AddEditTopicPage() {
  const navigate = useNavigate();

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
  const [imageError, setImageError] = useState("");
  // Image editor (crop / resize / preview) state. `owned` marks a src whose
  // object URL was created for the editor and must be revoked on close.
  const [editorState, setEditorState] = useState<{ src: string; name: string; type: string; owned: boolean } | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [sourceUrlError, setSourceUrlError] = useState("");

  // AI title refinement state
  const [isRefiningTitle, setIsRefiningTitle] = useState(false);
  const [titleRefineError, setTitleRefineError] = useState("");
  const [titleBeforeRefine, setTitleBeforeRefine] = useState<string | null>(null);

  // Title color picker state
  const [showTitleColorPicker, setShowTitleColorPicker] = useState(false);
  const titleColorRef = useRef<HTMLDivElement>(null);

  // URL real-time validation
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const urlValidateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI processing message cycling
  const [aiMessageIndex, setAiMessageIndex] = useState(0);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close the title color popover when clicking outside of it
  useEffect(() => {
    if (!showTitleColorPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (titleColorRef.current && !titleColorRef.current.contains(e.target as Node)) {
        setShowTitleColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTitleColorPicker]);

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
    setImageError("");
    // Clear any previously chosen upload so the two paths don't conflict
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle manual image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError(`Invalid format. Please upload a ${ALLOWED_IMAGE_LABEL} file.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be ${MAX_IMAGE_SIZE_MB}MB or smaller.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    // Dimension validation: the source must be large enough to crop a 9:16
    // portrait that meets the app's minimum, so the editor never has to upscale.
    const objectUrl = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalWidth < MIN_OUTPUT_W || probe.naturalHeight < MIN_OUTPUT_H) {
        setImageError(
          `Image is too small (${probe.naturalWidth}×${probe.naturalHeight}px). Please use a portrait image of at least ${MIN_OUTPUT_W}×${MIN_OUTPUT_H}px so it stays sharp full-screen in the app.`
        );
        URL.revokeObjectURL(objectUrl);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setImageError("");
      // Open the editor so the admin can crop/reposition before committing the image
      setEditorState({ src: objectUrl, name: file.name, type: file.type, owned: true });
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    probe.onerror = () => {
      setImageError("Could not read this image. Please try a different file.");
      URL.revokeObjectURL(objectUrl);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    probe.src = objectUrl;
  };

  // Save the edited (cropped/resized) image from the editor
  const handleEditorSave = (file: File, previewUrl: string) => {
    if (editorState?.owned) URL.revokeObjectURL(editorState.src);
    setFormData((prev) => ({ ...prev, image_file: file, image_url: undefined }));
    setImagePreview(previewUrl);
    setSelectedImageIndex(null);
    setImageError("");
    setEditorState(null);
  };

  // Close the editor without applying changes
  const handleEditorCancel = () => {
    if (editorState?.owned) URL.revokeObjectURL(editorState.src);
    setEditorState(null);
  };

  // Open the editor for the current image — a freshly uploaded/cropped file or a
  // selected extracted image (remote URL).
  const handleEditCurrentImage = async () => {
    if (!imagePreview) return;
    // A freshly uploaded/cropped file is already a same-origin blob — edit directly.
    if (formData.image_file) {
      setEditorState({
        src: imagePreview,
        name: formData.image_file.name,
        type: formData.image_file.type,
        owned: false,
      });
      return;
    }
    // A selected extracted image is a remote URL — fetch it as a same-origin blob
    // so the editor's canvas can crop it without CORS tainting.
    if (formData.image_url) {
      try {
        setImageError("");
        const blob = await loadImageAsBlob(formData.image_url);
        const objUrl = URL.createObjectURL(blob);
        const name = formData.image_url.split("/").pop()?.split("?")[0] || "topic-image.png";
        setEditorState({ src: objUrl, name, type: blob.type || "image/png", owned: true });
      } catch {
        setImageError("Unable to load this image for editing. Please upload a new image instead.");
      }
    }
  };

  // Remove uploaded/selected image
  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: undefined, image_file: undefined });
    setImagePreview("");
    setImageError("");
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

  // Refine the title with AI (make it more engaging/catchy)
  const handleRefineTitle = async () => {
    const current = formData.title?.trim();
    if (!current || isRefiningTitle) return;
    setTitleRefineError("");
    setIsRefiningTitle(true);
    try {
      const result = await topicService.refineTitleWithAI(current);
      if (result.success && result.data?.refined_title) {
        setTitleBeforeRefine(current);
        setFormData((prev) => ({ ...prev, title: result.data!.refined_title }));
      } else {
        setTitleRefineError(result.error || "Could not refine the title. Please try again.");
      }
    } catch {
      setTitleRefineError("Could not refine the title. Please try again.");
    } finally {
      setIsRefiningTitle(false);
    }
  };

  // Revert to the title the user had before AI refinement
  const handleUndoRefine = () => {
    if (titleBeforeRefine === null) return;
    setFormData((prev) => ({ ...prev, title: titleBeforeRefine }));
    setTitleBeforeRefine(null);
    setTitleRefineError("");
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

    if (!formData.title?.trim()) {
      alert("Title is required");
      setIsSubmitting(false);
      return;
    }
    if (formData.title.length > MAX_TITLE_CHARS) {
      alert(`Title must be ${MAX_TITLE_CHARS} characters or less`);
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
    if (!formData.image_url && !formData.image_file) {
      setIsSubmitting(false);
      return;
    }
    if (!formData.source_url?.trim()) {
      setSourceUrlError("Source URL is required");
      setIsSubmitting(false);
      return;
    }
    try {
      const urlObj = new URL(formData.source_url);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        setSourceUrlError("URL must start with http:// or https://");
        setIsSubmitting(false);
        return;
      }
    } catch {
      setSourceUrlError("Please enter a valid URL");
      setIsSubmitting(false);
      return;
    }

    // Cleanup unselected images
    if (extractedImages.length > 0) {
      const unselectedImages = extractedImages.filter((_, index) => index !== selectedImageIndex);
      if (unselectedImages.length > 0) {
        await topicService.cleanupUnwantedImages(unselectedImages);
      }
    }

    try {
      await topicService.createTopic(formData);
      navigate("/topics");
    } catch (error) {
      console.error("Failed to create topic:", error);
      alert("Failed to create topic. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate back (cleanup if needed)
  const handleGoBack = async () => {
    if (extractedImages.length > 0) {
      await topicService.cleanupUnwantedImages(extractedImages);
    }
    navigate("/topics");
  };

  // Retry article extraction
  const handleRetry = () => {
    setMode("article_input");
    setProcessingError("");
  };

  const hasNoImage = !formData.image_url && !formData.image_file && !imagePreview;
  const activeFormId = mode === "ai_success" ? "topic-ai-success-form" : mode === "manual" ? "topic-manual-form" : undefined;
  const showFooter = mode === "ai_success" || mode === "manual";

  // Title field with an AI "Refine" action — shared by manual & AI-success forms
  const renderTitleField = () => (
    <div>
      <div className="flex items-center justify-between mb-2 gap-3">
        <label className="block text-sm font-semibold text-gray-800">Title *</label>
        <div className="flex items-center gap-2">
          {/* Title color picker */}
          <div className="relative" ref={titleColorRef}>
            <button
              type="button"
              onClick={() => setShowTitleColorPicker((s) => !s)}
              title="Title color"
              className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg transition-all"
              style={{
                color: "#374151",
                background: "#eff1f5",
                boxShadow: "2px 2px 5px rgba(0,0,0,0.06), -1px -1px 3px rgba(255,255,255,0.6)",
              }}
            >
              <Baseline className="w-3.5 h-3.5" />
              <span
                className="block w-3.5 rounded-full"
                style={{ height: "3px", marginTop: "1px", background: formData.title_color || "#1f2937" }}
              />
            </button>
            {showTitleColorPicker && (
              <div
                className="absolute right-0 z-20 mt-2 p-3 rounded-xl"
                style={{
                  background: "#ffffff",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  width: "184px",
                }}
              >
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {TITLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, title_color: color }));
                        setShowTitleColorPicker(false);
                      }}
                      title={color}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                      style={{
                        background: color,
                        border: formData.title_color === color ? "2px solid #1f2937" : "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="color"
                      value={formData.title_color || "#1f2937"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title_color: e.target.value }))}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    Custom
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, title_color: undefined }));
                      setShowTitleColorPicker(false);
                    }}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleRefineTitle}
            disabled={!formData.title?.trim() || isRefiningTitle}
            title="Use AI to make this title more engaging and catchy"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              color: "#6b46d4",
              background: "linear-gradient(135deg, rgba(124,77,255,0.10), rgba(107,150,255,0.10))",
              boxShadow: "2px 2px 5px rgba(0,0,0,0.06), -1px -1px 3px rgba(255,255,255,0.6)",
            }}
          >
            {isRefiningTitle ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Refining…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rewrite with AI</span>
              </>
            )}
          </button>
        </div>
      </div>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => {
          setFormData({ ...formData, title: e.target.value });
          if (titleRefineError) setTitleRefineError("");
          // A manual edit invalidates the "undo to previous AI version" affordance
          if (titleBeforeRefine !== null) setTitleBeforeRefine(null);
        }}
        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
        style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.6)", color: formData.title_color || undefined, fontWeight: formData.title_color ? 600 : undefined }}
        placeholder="Enter topic title"
        required
        maxLength={MAX_TITLE_CHARS}
      />
      {titleRefineError && (
        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {titleRefineError}
        </p>
      )}
      {titleBeforeRefine !== null && !titleRefineError && (
        <div className="flex items-center justify-between mt-1.5 gap-2">
          <p className="text-xs flex items-center gap-1" style={{ color: "#6b46d4" }}>
            <Sparkles className="w-3 h-3" />
            Enhanced with AI. Edit freely or undo.
          </p>
          <button
            type="button"
            onClick={handleUndoRefine}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Undo2 className="w-3 h-3" />
            Undo
          </button>
        </div>
      )}
    </div>
  );

  return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* Breadcrumb / Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="clay-btn flex items-center gap-2 text-sm"
          style={{ padding: "6px 14px", fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-gray-500">Topics</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Add New Topic</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "0", padding: 0 }}>

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <h2 className="text-lg font-semibold text-gray-900">Add New Topic</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="space-y-5">

            {/* Workflow Step Indicator */}
            <div
              className="flex items-center justify-center gap-0 px-6 py-3 mx-auto"
              style={{
                background: "#eff1f5",
                borderRadius: "14px",
                boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.07), inset -2px -2px 5px rgba(255,255,255,0.55)",
                maxWidth: "520px",
                width: "100%",
              }}
            >
              {STEPS.map((step, idx) => {
                const state = getStepState(idx, mode);
                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                        style={{
                          background: state === "completed" ? "#4fcfa5" : state === "active" ? "#6b96ff" : "#d1d5db",
                          color: "white",
                          boxShadow: state !== "upcoming"
                            ? "2px 2px 5px rgba(0,0,0,0.12), -1px -1px 3px rgba(255,255,255,0.5)"
                            : "inset 1px 1px 2px rgba(0,0,0,0.08)",
                        }}
                      >
                        {state === "completed" ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span
                        className="text-xs font-semibold whitespace-nowrap hidden sm:inline"
                        style={{
                          color: state === "completed" ? "#059669" : state === "active" ? "#4369d4" : "#9ca3af",
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className="w-10 sm:w-14 h-[2px] mx-2"
                        style={{
                          borderRadius: "1px",
                          background: getStepState(idx + 1, mode) !== "upcoming"
                            ? "linear-gradient(90deg, #4fcfa5, #6b96ff)"
                            : "#d1d5db",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Article Input Mode */}
            {mode === "article_input" && (
              <div className="space-y-5">
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(107,150,255,0.07)", boxShadow: "inset 1px 1px 3px rgba(107,150,255,0.12), inset -1px -1px 3px rgba(255,255,255,0.5)" }}>
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

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleArticleSubmit}
                    disabled={!articleUrl.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "#1f2937", boxShadow: "4px 4px 8px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.04)" }}
                  >
                    <Loader2 className="w-4 h-4" style={{ display: "none" }} />
                    Extract Article Content
                  </button>
                </div>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full" style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)" }}></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span
                      className="px-4 font-medium text-gray-400"
                      style={{
                        background: "#ffffff",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSwitchToManual}
                  className="w-full py-2.5 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    color: "#6b96ff",
                    background: "#eff1f5",
                    boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)",
                  }}
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
                {renderTitleField()}

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Description (max {MAX_DESCRIPTION_CHARS} characters) *
                  </label>
                  <RichTextEditor
                    content={formData.description}
                    onChange={(html) =>
                      setFormData({ ...formData, description: html })
                    }
                    editable={true}
                    minHeight="150px"
                  />
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
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Topic Image {extractedImages.length === 0 && "*"}
                  </label>

                  {extractedImages.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600">
                        Select one image from the extracted images:
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        {extractedImages.map((imageUrl, index) => (
                          <div
                            key={index}
                            onClick={() => handleImageSelect(index)}
                            className="relative aspect-video rounded-xl overflow-hidden cursor-pointer transition-all"
                            style={{
                              border: selectedImageIndex === index ? "2px solid #6b96ff" : "1px solid #d1d5db",
                              boxShadow: selectedImageIndex === index
                                ? "0 0 0 1px #6b96ff, 3px 3px 8px rgba(0,0,0,0.10)"
                                : "2px 2px 6px rgba(0,0,0,0.06)",
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

                      {/* Crop/edit the selected extracted image (same editor as uploads) */}
                      {selectedImageIndex !== null && !formData.image_file && (
                        <button
                          type="button"
                          onClick={handleEditCurrentImage}
                          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all"
                          style={{
                            color: "#4369d4",
                            background: "rgba(107,150,255,0.10)",
                            boxShadow: "inset 1px 1px 3px rgba(107,150,255,0.15), inset -1px -1px 3px rgba(255,255,255,0.5)",
                          }}
                        >
                          <Crop className="w-4 h-4" />
                          Edit / crop selected image
                        </button>
                      )}

                      {/* Divider */}
                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full" style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)" }}></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span
                            className="px-4 font-medium text-gray-400"
                            style={{ background: "#ffffff", letterSpacing: "0.05em", textTransform: "uppercase" }}
                          >or upload your own</span>
                        </div>
                      </div>

                      {/* Manual upload option */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {formData.image_file && imagePreview ? (
                        <div
                          className="relative mx-auto rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                          style={{ aspectRatio: "4 / 3", maxHeight: 360 }}
                        >
                          {/* 4:3 box + object-cover mirrors how the app cover-crops the topic-card image */}
                          <img
                            src={imagePreview}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold text-white" style={{ background: "rgba(31,41,55,0.8)" }}>
                            Your upload
                          </div>
                          {formData.image_file && (
                            <button
                              type="button"
                              onClick={handleEditCurrentImage}
                              title="Edit image (crop / resize)"
                              className="absolute top-2 right-11 p-1.5 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-colors shadow"
                            >
                              <Crop className="w-4 h-4" />
                            </button>
                          )}
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
                          className="w-full px-4 py-6 rounded-xl flex flex-col items-center justify-center gap-2 text-sm text-gray-500 transition-all hover:text-gray-700"
                          style={{
                            background: "#ffffff",
                            border: "2px dashed #d1d5db",
                            boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.03)",
                          }}
                        >
                          <Upload className="w-7 h-7 text-gray-400" />
                          <span>Upload a custom image instead</span>
                          <span className="text-xs text-gray-400">Max 5MB · JPG, PNG, JPEG or WebP</span>
                        </button>
                      )}
                      {imageError && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {imageError}
                        </p>
                      )}

                      {/* <button
                        type="button"
                        onClick={() => {
                          setSelectedImageIndex(null);
                          setFormData({ ...formData, image_url: undefined, image_file: undefined });
                          setImagePreview("");
                          setImageError("");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-xs font-medium transition-colors hover:underline"
                        style={{ color: "#6b7280" }}
                      >
                        Skip image
                      </button> */}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600 mb-2">
                        No images were found in the article. Please upload an image:
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {imagePreview ? (
                        <div
                          className="relative mx-auto rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                          style={{ aspectRatio: "4 / 3", maxHeight: 360 }}
                        >
                          {/* 4:3 box + object-cover mirrors how the app cover-crops the topic-card image */}
                          <img
                            src={imagePreview}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover"
                          />
                          {formData.image_file && (
                            <button
                              type="button"
                              onClick={handleEditCurrentImage}
                              title="Edit image (crop / resize)"
                              className="absolute top-2 right-11 p-1.5 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-colors shadow"
                            >
                              <Crop className="w-4 h-4" />
                            </button>
                          )}
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
                          className="w-full px-4 py-8 rounded-xl flex flex-col items-center justify-center gap-2 text-sm text-gray-500 transition-all hover:text-gray-700"
                          style={{
                            background: "#ffffff",
                            border: "2px dashed #d1d5db",
                            boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.03)",
                          }}
                        >
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span>Click to upload image</span>
                          <span className="text-xs text-gray-400">Max 5MB · JPG, PNG, JPEG or WebP</span>
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

                <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(107,150,255,0.09)", boxShadow: "inset 1px 1px 3px rgba(107,150,255,0.15), inset -1px -1px 3px rgba(255,255,255,0.5)" }}>
                  <p className="text-sm" style={{ color: "#4369d4" }}>Create a topic manually by filling in all the required fields below.</p>
                </div>

                {/* Title */}
                {renderTitleField()}

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Article Content / Description (max {MAX_DESCRIPTION_CHARS} characters) *
                  </label>
                  <RichTextEditor
                    content={formData.description}
                    onChange={(html) =>
                      setFormData({ ...formData, description: html })
                    }
                    editable={true}
                    minHeight="150px"
                  />
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

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Topic Image *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative mx-auto rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: "4 / 3", maxHeight: 360, boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}>
                      {/* 4:3 box + object-cover mirrors how the app cover-crops the topic-card image */}
                      <img
                        src={imagePreview}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                      {formData.image_file && (
                        <button
                          type="button"
                          onClick={handleEditCurrentImage}
                          title="Edit image (crop / resize)"
                          className="absolute top-2 right-11 p-1.5 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-colors shadow"
                        >
                          <Crop className="w-4 h-4" />
                        </button>
                      )}
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
                      className="w-full py-8 rounded-xl flex flex-col items-center justify-center gap-2 text-sm text-gray-500 transition-all hover:text-gray-700"
                      style={{ background: "#ffffff", border: "2px dashed #d1d5db", boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.03)" }}
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span>Click to upload image</span>
                      <span className="text-xs text-gray-400">Max 5MB · JPG, PNG, JPEG or WebP</span>
                    </button>
                  )}
                  {imageError && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {imageError}
                    </p>
                  )}
                </div>

                {/* Source URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Source URL *</label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.source_url}
                      onChange={(e) => {
                        setFormData({ ...formData, source_url: e.target.value });
                        if (sourceUrlError) setSourceUrlError("");
                      }}
                      className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{ background: "#eff1f5", border: "none", boxShadow: sourceUrlError ? "inset 2px 2px 5px rgba(255,112,112,0.2), inset -2px -2px 5px rgba(255,255,255,0.5)" : "inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.6)" }}
                      placeholder="https://example.com/article-source"
                    />
                  </div>
                  {sourceUrlError && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {sourceUrlError}
                    </p>
                  )}
                </div>

                {hasAttemptedSubmit && hasNoImage && (
                  <p className="text-xs text-red-500">An image is required to publish this topic.</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        {showFooter && (
          <div
            className="flex items-center justify-end gap-3 px-6 py-4"
            style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              background: "#fafbfc",
              borderRadius: "0 0 18px 18px",
            }}
          >
            <button
              type="button"
              onClick={handleGoBack}
              disabled={isSubmitting}
              className="disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
              style={{
                padding: "8px 18px",
                borderRadius: "12px",
                border: "none",
                background: "#eff1f5",
                color: "#6b7280",
                boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form={activeFormId}
              disabled={isSubmitting || hasNoImage}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#1f2937", boxShadow: "4px 4px 8px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.04)" }}
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Creating...</span></>
              ) : (
                <span>Create Topic</span>
              )}
            </button>
          </div>
        )}
      </div>

      {editorState && (
        <ImageEditor
          src={editorState.src}
          fileName={editorState.name}
          fileType={editorState.type}
          onCancel={handleEditorCancel}
          onSave={handleEditorSave}
        />
      )}
    </div>
  );
}

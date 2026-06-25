import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, User, Link, Video, ChevronDown, ChevronUp,
  Play, Download, RefreshCw, FileText, Loader2, AlertCircle, CheckCircle, BookOpen,
  Pencil, CircleCheckBig, CircleX, Copy, Check,
} from "lucide-react";
import type { Topic, CreateTopicDTO, TranscriptionStatus } from "./topic.types";
import * as topicService from "../../services/topic.service";
import AddEditTopicModal from "./components/AddEditTopicModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const claySectionStyle = {
  background: "#f0f2f7",
  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.6)",
  borderRadius: "12px",
  padding: "12px 14px",
};

const insetPanel = {
  background: "#f8f9fb",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

// Detect YouTube/Vimeo URLs
const getEmbedUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let videoId = "";
      if (u.hostname.includes("youtu.be")) {
        videoId = u.pathname.slice(1);
      } else {
        videoId = u.searchParams.get("v") || "";
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const match = u.pathname.match(/\/(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
  } catch { /* ignore */ }
  return null;
};

const isValidVideoUrl = (url: string): boolean => {
  try { new URL(url); return true; } catch { return false; }
};

export default function TopicDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  // UI states
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [isStartingTranscription, setIsStartingTranscription] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isVideoPlayable, setIsVideoPlayable] = useState<boolean | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Modal / dialog states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isTranscriptionWarningOpen, setIsTranscriptionWarningOpen] = useState(false);

  const fetchTopic = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await topicService.getTopicById(id);
      setTopic(response.data);
    } catch (error) {
      console.error("Failed to fetch topic:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  // Validate video URL
  const validateVideoUrl = async (videoUrl: string): Promise<boolean> => {
    try {
      if (!isValidVideoUrl(videoUrl)) { setVideoError("Invalid video URL format"); return false; }
      setVideoError(null);
      return true;
    } catch {
      setVideoError("Failed to validate video");
      return false;
    }
  };

  useEffect(() => {
    if (topic?.video_url) {
      setIsVideoPlayable(null);
      setVideoError(null);
      validateVideoUrl(topic.video_url).then(setIsVideoPlayable);
    } else {
      setIsVideoPlayable(null);
      setVideoError(null);
    }
  }, [topic?.video_url]);

  // Handlers
  const handleEditSubmit = async (data: CreateTopicDTO) => {
    if (!topic) return;
    try {
      await topicService.updateTopic({ ...data, id: topic.id });
      await fetchTopic();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to save topic:", error);
      alert("Failed to save topic. Please try again.");
    }
  };

  const handlePublishClick = () => {
    if (!topic) return;
    if (
      !topic.publish_status &&
      topic.video_url &&
      (!topic.transcription || topic.transcription.status !== "completed")
    ) {
      setIsTranscriptionWarningOpen(true);
      return;
    }
    setIsPublishDialogOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (!topic) return;
    try {
      await topicService.togglePublishStatus(topic.id);
      await fetchTopic();
      setIsPublishDialogOpen(false);
    } catch (error) {
      console.error("Failed to update topic status:", error);
      alert("Failed to update publish status. Please try again.");
    }
  };

  const handleStartTranscription = async () => {
    if (!topic) return;
    if (!topic.video_url) { alert("No video URL available for transcription"); return; }
    if (isVideoPlayable === false || videoError) { alert("Cannot start transcription: Video is not playable or not available"); return; }
    if (isVideoPlayable === null) { alert("Please wait while we validate the video availability"); return; }
    setIsStartingTranscription(true);
    try {
      await topicService.startTranscription(topic.id);
      alert("Transcription started successfully!");
      fetchTopic();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to start transcription");
    } finally {
      setIsStartingTranscription(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!topic) return;
    setIsCheckingStatus(true);
    try {
      await topicService.getTranscriptionStatus(topic.id);
      fetchTopic();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to check status");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleDownloadTranscript = async (format: "text" | "srt") => {
    if (!topic) return;
    try {
      await topicService.downloadTranscript(topic.id, format);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to download transcript");
    }
  };

  const getTranscriptionStatusBadge = (status: TranscriptionStatus) => {
    const map: Record<TranscriptionStatus, { bg: string; color: string }> = {
      pending: { bg: "rgba(255,197,84,0.12)", color: "#d97706" },
      preparing: { bg: "rgba(107,150,255,0.12)", color: "#4369d4" },
      transcribing: { bg: "rgba(255,197,84,0.12)", color: "#d97706" },
      completed: { bg: "rgba(79,207,165,0.12)", color: "#059669" },
      failed: { bg: "rgba(255,112,112,0.12)", color: "#dc2626" },
      blocked: { bg: "rgba(156,163,175,0.12)", color: "#6b7280" },
    };
    return map[status] || { bg: "rgba(156,163,175,0.12)", color: "#6b7280" };
  };

  const getTranscriptionStatusIcon = (status: TranscriptionStatus) => {
    switch (status) {
      case "preparing":
      case "transcribing": return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
      case "completed": return <CheckCircle className="w-3.5 h-3.5" />;
      case "failed":
      case "blocked": return <AlertCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">
        <div className="flex items-center gap-3">
          <div className="w-28 h-8 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="clay-card">
          <div className="flex flex-col md:flex-row gap-6 animate-pulse">
            <div className="w-full md:w-[40%] aspect-video bg-gray-200 rounded-xl" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="w-64 h-6 bg-gray-200 rounded" />
              <div className="w-40 h-4 bg-gray-100 rounded" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="w-16 h-3 bg-gray-200 rounded" />
                    <div className="w-24 h-4 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!topic) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">
        <div className="clay-card text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Topic Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            The topic you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/topics")}
            className="clay-btn inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  const isVideoTopic = !!topic.video_url;
  const hasVideoUrl = topic.video_url ? isValidVideoUrl(topic.video_url) : false;
  const hasTranscription = topic.transcription;
  const transcriptionCompleted = hasTranscription?.status === "completed";
  const embedUrl = topic.video_url ? getEmbedUrl(topic.video_url) : null;

  const isTranscriptionDisabled =
    isStartingTranscription || !topic.video_url || isVideoPlayable === false || isVideoPlayable === null || !!videoError;

  const metadataItems = [
    { label: "Author", value: topic.author_name || "N/A", icon: <User className="w-3.5 h-3.5 text-gray-400" /> },
    { label: "Author Email", value: topic.author_email || "N/A", icon: <User className="w-3.5 h-3.5 text-gray-400" /> },
    { label: "Type", value: isVideoTopic ? "Doctor Video" : "Admin Article", icon: isVideoTopic ? <Video className="w-3.5 h-3.5" style={{ color: "#a285ff" }} /> : <FileText className="w-3.5 h-3.5" style={{ color: "#6b96ff" }} /> },
    { label: "Created", value: new Date(topic.created_at).toLocaleDateString(), icon: <Calendar className="w-3.5 h-3.5 text-gray-400" /> },
    { label: "Updated", value: new Date(topic.updated_at).toLocaleDateString(), icon: <Calendar className="w-3.5 h-3.5 text-gray-400" /> },
    ...(topic.duration_seconds != null ? [{ label: "Duration", value: `${Math.floor(topic.duration_seconds / 60)}:${(topic.duration_seconds % 60).toString().padStart(2, "0")}`, icon: <Video className="w-3.5 h-3.5 text-gray-400" /> }] : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

      {/* Breadcrumb / Back + Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/topics")}
          className="clay-btn flex items-center gap-2 text-sm"
          style={{ padding: "6px 14px", fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-gray-500">Topics</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {topic.title}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {/* Publish / Unpublish */}
          <button
            onClick={handlePublishClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap"
            style={{
              background: topic.publish_status ? "#ff7070" : "#4fcfa5",
              boxShadow: "3px 3px 8px rgba(0,0,0,0.10), -2px -2px 6px rgba(255,255,255,0.06)",
            }}
            title={topic.publish_status ? "Unpublish Topic" : "Publish Topic"}
          >
            {topic.publish_status ? (
              <><CircleX className="w-4 h-4" /> Unpublish</>
            ) : (
              <><CircleCheckBig className="w-4 h-4" /> Publish</>
            )}
          </button>

          {/* Edit */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap"
            style={{
              background: "#1f2937",
              boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
            }}
          >
            <Pencil className="w-4 h-4" />
            Edit Topic
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Two-Column Layout: Media + Metadata */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Left Column: Image/Video */}
          <div className="w-full md:w-[40%] shrink-0">
            {hasVideoUrl && topic.video_url ? (
              <div
                className="w-full aspect-video rounded-xl overflow-hidden bg-black"
                style={{ boxShadow: "4px 4px 12px rgba(0,0,0,0.15), -2px -2px 8px rgba(255,255,255,0.5)" }}
              >
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={topic.title}
                  />
                ) : (
                  <video
                    src={topic.video_url}
                    className="w-full h-full"
                    controls
                    controlsList="nodownload"
                    title={topic.title}
                  />
                )}
              </div>
            ) : topic.image ? (
              <div
                className="w-full aspect-video rounded-xl overflow-hidden flex items-center justify-center"
                style={{ background: "#eff1f5", boxShadow: "4px 4px 12px rgba(0,0,0,0.10), -2px -2px 8px rgba(255,255,255,0.6)" }}
              >
                <img src={topic.image} alt={topic.title} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div
                className="w-full aspect-video rounded-xl flex items-center justify-center"
                style={{
                  background: "#eff1f5",
                  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.6)",
                }}
              >
                <BookOpen className="w-10 h-10" style={{ color: "#c0c4cc" }} />
              </div>
            )}
          </div>

          {/* Right Column: Metadata Grid */}
          <div className="flex-1 min-w-0">
            {/* Title & Status */}
            <div className="mb-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900 leading-tight" style={topic.title_color ? { color: topic.title_color } : undefined}>{topic.title}</h1>
                <span
                  className="px-3 py-1 text-xs font-semibold rounded-full shrink-0"
                  style={
                    topic.publish_status
                      ? { color: "#059669", background: "rgba(79,207,165,0.14)" }
                      : { color: "#6b7280", background: "rgba(156,163,175,0.14)" }
                  }
                >
                  {topic.publish_status ? "Published" : "Unpublished"}
                </span>
              </div>
            </div>

            {/* Metadata Definition Grid */}
            <div className="rounded-xl px-4 py-3" style={insetPanel}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {metadataItems.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {item.icon}
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</span>
                    </div>
                    <div className="text-sm text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={claySectionStyle}>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Description</h4>
          <div
            className={`text-gray-600 leading-relaxed prose prose-sm max-w-none overflow-hidden transition-all ${isExpanded ? "" : "line-clamp-4"}`}
            dangerouslySetInnerHTML={{ __html: topic.description || "" }}
          />
          {(topic.description?.length ?? 0) > 300 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: "#6b96ff" }}
            >
              {isExpanded ? <><span>Show Less</span> <ChevronUp className="w-4 h-4" /></> : <><span>Show More</span> <ChevronDown className="w-4 h-4" /></>}
            </button>
          )}
        </div>

        {/* Source URL */}
        {topic.source_url && (
          <div style={claySectionStyle}>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-gray-400" />
              Source URL
            </h4>
            <div className="flex items-center gap-2">
              <a
                href={topic.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm truncate hover:underline flex-1 min-w-0"
                style={{ color: "#6b96ff" }}
                title={topic.source_url}
              >
                {topic.source_url}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(topic.source_url || "");
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                title="Copy URL"
              >
                {copiedUrl ? (
                  <Check className="w-4 h-4" style={{ color: "#4fcfa5" }} />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transcription Section — separate card for video topics */}
      {topic.video_url && (
        <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3
            className="text-sm font-semibold text-gray-900 pb-2 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <FileText className="w-4 h-4 text-gray-400" />
            Video Transcription
          </h3>

          {!hasTranscription ? (
            <div className="space-y-3">
              {/* Validation state */}
              {isVideoPlayable === null && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,197,84,0.10)", boxShadow: "inset 1px 1px 3px rgba(255,197,84,0.2)" }}>
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  <p className="text-xs text-amber-700">Validating video availability...</p>
                </div>
              )}
              {videoError && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,112,112,0.10)", boxShadow: "inset 1px 1px 3px rgba(255,112,112,0.2)" }}>
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-red-700">Video Validation Failed</p>
                    <p className="text-xs text-red-600 mt-0.5">{videoError}</p>
                  </div>
                </div>
              )}
              {isVideoPlayable === true && !videoError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(79,207,165,0.10)", boxShadow: "inset 1px 1px 3px rgba(79,207,165,0.2)" }}>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs text-emerald-700">Video is available and ready for transcription</p>
                </div>
              )}

              <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(107,150,255,0.08)", boxShadow: "inset 1px 1px 3px rgba(107,150,255,0.15)" }}>
                <p className="text-xs text-blue-800 mb-3">
                  Start transcription to automatically generate a transcript and AI summary of this video.
                </p>
                <button
                  onClick={handleStartTranscription}
                  disabled={isTranscriptionDisabled}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "#6b96ff",
                    boxShadow: isTranscriptionDisabled
                      ? "none"
                      : "3px 3px 8px rgba(0,0,0,0.10), -2px -2px 6px rgba(255,255,255,0.06)",
                  }}
                >
                  {isStartingTranscription ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</>
                  ) : (
                    <><Play className="w-4 h-4" /> Start Transcription</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full"
                  style={getTranscriptionStatusBadge(hasTranscription.status)}
                >
                  {getTranscriptionStatusIcon(hasTranscription.status)}
                  {hasTranscription.status}
                </span>
                {!transcriptionCompleted && (
                  <button
                    onClick={handleCheckStatus}
                    disabled={isCheckingStatus}
                    className="clay-btn flex items-center gap-1.5 disabled:opacity-50"
                    style={{ padding: "5px 12px", fontSize: "12px" }}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? "animate-spin" : ""}`} />
                    Refresh Status
                  </button>
                )}
              </div>

              {/* Error */}
              {hasTranscription.error_message && (
                <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,112,112,0.10)", boxShadow: "inset 1px 1px 3px rgba(255,112,112,0.2)" }}>
                  <p className="text-xs text-red-700"><strong>Error:</strong> {hasTranscription.error_message}</p>
                </div>
              )}

              {/* AI Summary */}
              {hasTranscription.summary_text && (
                <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(79,207,165,0.10)", boxShadow: "inset 1px 1px 3px rgba(79,207,165,0.20)" }}>
                  <h5 className="text-xs font-semibold text-emerald-800 mb-1.5">AI Summary</h5>
                  <p className="text-xs text-emerald-800 leading-relaxed">{hasTranscription.summary_text}</p>
                </div>
              )}

              {/* Transcript Collapsible */}
              {hasTranscription.transcript_text && (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)" }}
                >
                  <button
                    onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                    className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-700 hover:bg-white/40 transition-colors"
                    title="Toggle transcript"
                  >
                    <span>Transcription</span>
                    {isTranscriptExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isTranscriptExpanded && (
                    <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      <div
                        className="max-h-48 overflow-y-auto text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-mono"
                        style={{
                          background: "#eff1f5",
                          boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.6)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                        }}
                      >
                        {hasTranscription.transcript_text}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No transcript yet message */}
              {!hasTranscription.transcript_text && !transcriptionCompleted && (
                <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,197,84,0.08)", boxShadow: "inset 1px 1px 3px rgba(255,197,84,0.15)" }}>
                  <p className="text-xs text-amber-700">Transcription in progress or not yet started.</p>
                </div>
              )}

              {/* Download Buttons */}
              {transcriptionCompleted && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadTranscript("text")}
                    className="clay-btn flex items-center gap-2"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                    title="Download as text"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Text
                  </button>
                  <button
                    onClick={() => handleDownloadTranscript("srt")}
                    className="clay-btn flex items-center gap-2"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                    title="Download as SRT"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download SRT
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <AddEditTopicModal
        topic={topic}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        onConfirm={handleConfirmPublish}
        title={topic.publish_status ? "Unpublish Topic" : "Publish Topic"}
        message={
          topic.publish_status
            ? `Are you sure you want to unpublish "${topic.title}"? This will make it invisible to users.`
            : `Are you sure you want to publish "${topic.title}"? This will make it visible to users.`
        }
        confirmText={topic.publish_status ? "Unpublish" : "Publish"}
        variant={topic.publish_status ? "warning" : "success"}
      />

      <ConfirmDialog
        isOpen={isTranscriptionWarningOpen}
        onClose={() => setIsTranscriptionWarningOpen(false)}
        onConfirm={() => setIsTranscriptionWarningOpen(false)}
        title="Transcription Not Complete"
        message="This video topic cannot be published yet. Please complete the transcription and summarization process first before publishing."
        confirmText="OK"
        variant="warning"
        hideCancelButton={true}
      />
    </div>
  );
}

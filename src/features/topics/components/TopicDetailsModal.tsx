import { useState, useEffect } from "react";
import {
  Calendar, User, Link, Video, ChevronDown, ChevronUp,
  Play, Download, RefreshCw, FileText, Loader2, AlertCircle, CheckCircle, BookOpen,
  Pencil, CircleCheckBig, CircleX, Copy, Check,
} from "lucide-react";
import type { Topic, TranscriptionStatus } from "../topic.types";
import * as topicService from "../../../services/topic.service";

interface TopicDetailsModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onEdit?: (topic: Topic) => void;
  onPublish?: (topic: Topic) => void;
}

const claySectionStyle = {
  background: "#f0f2f7",
  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.6)",
  borderRadius: "12px",
  padding: "12px 14px",
};

// Detect YouTube/Vimeo URLs
const getEmbedUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let videoId = "";
      if (u.hostname.includes("youtu.be")) {
        videoId = u.pathname.slice(1);
      } else {
        videoId = u.searchParams.get("v") || "";
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const match = u.pathname.match(/\/(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
  } catch { /* ignore */ }
  return null;
};

export default function TopicDetailsModal({
  topic,
  isOpen,
  onClose,
  onRefresh,
  onEdit,
  onPublish,
}: TopicDetailsModalProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [isStartingTranscription, setIsStartingTranscription] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isVideoPlayable, setIsVideoPlayable] = useState<boolean | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const isValidVideoUrl = (url: string): boolean => {
    try { new URL(url); return true; } catch { return false; }
  };

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
    if (isOpen && topic?.video_url) {
      setIsVideoPlayable(null);
      setVideoError(null);
      validateVideoUrl(topic.video_url).then(setIsVideoPlayable);
    } else {
      setIsVideoPlayable(null);
      setVideoError(null);
    }
  }, [isOpen, topic?.video_url]);

  if (!isOpen || !topic) return null;

  const isVideoTopic = !!topic.video_url;
  const hasVideoUrl = topic.video_url ? isValidVideoUrl(topic.video_url) : false;
  const hasTranscription = topic.transcription;
  const transcriptionCompleted = hasTranscription?.status === "completed";
  const embedUrl = topic.video_url ? getEmbedUrl(topic.video_url) : null;

  const isTranscriptionDisabled =
    isStartingTranscription || !topic.video_url || isVideoPlayable === false || isVideoPlayable === null || !!videoError;

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

  const handleStartTranscription = async () => {
    if (!topic) return;
    if (!topic.video_url) { alert("No video URL available for transcription"); return; }
    if (isVideoPlayable === false || videoError) { alert("Cannot start transcription: Video is not playable or not available"); return; }
    if (isVideoPlayable === null) { alert("Please wait while we validate the video availability"); return; }
    setIsStartingTranscription(true);
    try {
      await topicService.startTranscription(topic.id);
      alert("Transcription started successfully!");
      onRefresh?.();
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
      onRefresh?.();
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

  // Metadata items
  const metadataItems = [
    { label: "Author", value: topic.author_name || "N/A", icon: <User className="w-3.5 h-3.5 text-gray-400" /> },
    { label: "Author Email", value: topic.author_email || "N/A", icon: <User className="w-3.5 h-3.5 text-gray-400" /> },
    { label: "Status", value: topic.publish_status ? "Published" : "Unpublished", icon: topic.publish_status ? <CheckCircle className="w-3.5 h-3.5" style={{ color: "#4fcfa5" }} /> : <AlertCircle className="w-3.5 h-3.5 text-gray-400" />, isStatus: true },
    { label: "Type", value: isVideoTopic ? "Doctor Video" : "Admin Article", icon: isVideoTopic ? <Video className="w-3.5 h-3.5" style={{ color: "#a285ff" }} /> : <FileText className="w-3.5 h-3.5" style={{ color: "#6b96ff" }} /> },
    { label: "Created", value: new Date(topic.created_at).toLocaleDateString(), icon: <Calendar className="w-3.5 h-3.5 text-gray-400" /> },
    { label: "Updated", value: new Date(topic.updated_at).toLocaleDateString(), icon: <Calendar className="w-3.5 h-3.5 text-gray-400" /> },
    ...(topic.duration_seconds != null ? [{ label: "Duration", value: `${Math.floor(topic.duration_seconds / 60)}:${(topic.duration_seconds % 60).toString().padStart(2, "0")}`, icon: <Video className="w-3.5 h-3.5 text-gray-400" /> }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-[18px]"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-lg font-semibold text-gray-900">Topic Details</h2>
          </div>

          {/* Scrollable Content */}
          <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">

            {/* Two-Column Layout: Media + Metadata */}
            <div className="flex flex-col md:flex-row gap-4">

              {/* Left Column: Image/Video (40%) */}
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
                    className="w-full aspect-video rounded-xl overflow-hidden"
                    style={{ boxShadow: "4px 4px 12px rgba(0,0,0,0.10), -2px -2px 8px rgba(255,255,255,0.6)" }}
                  >
                    <img src={topic.image} alt={topic.title} className="w-full h-full object-cover" />
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

              {/* Right Column: Metadata Grid (60%) */}
              <div className="flex-1 min-w-0">
                {/* Title & Status */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{topic.title}</h3>
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
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {metadataItems.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {item.icon}
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</span>
                      </div>
                      {(item as any).isLink ? (
                        <a
                          href={item.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm break-all hover:underline"
                          style={{ color: "#6b96ff" }}
                        >
                          {item.value.length > 40 ? item.value.substring(0, 40) + "…" : item.value}
                        </a>
                      ) : (item as any).isStatus ? (
                        <span
                          className="inline-flex items-center gap-1 text-sm font-medium"
                          style={{ color: topic.publish_status ? "#059669" : "#6b7280" }}
                        >
                          {item.value}
                        </span>
                      ) : (
                        <div className="text-sm text-gray-900">{item.value}</div>
                      )}
                    </div>
                  ))}
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

            {/* Transcription Section */}
            {topic.video_url && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Video Transcription
                </h4>

                {!hasTranscription ? (
                  <div className="space-y-2">
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
          </div>

          {/* Footer — Action Bar */}
          <div
            className="px-6 py-4 shrink-0 flex items-center gap-3"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            {onEdit && (
              <button
                onClick={() => { onEdit(topic); onClose(); }}
                className="clay-btn flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
                title="Edit Topic"
              >
                <Pencil className="w-4 h-4" />
                Edit Topic
              </button>
            )}
            {onPublish && (
              <button
                onClick={() => { onPublish(topic); onClose(); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
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
            )}
            <button
              onClick={onClose}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
              style={{
                background: "#1f2937",
                boxShadow: "4px 4px 8px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.04)",
              }}
              title="Close modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

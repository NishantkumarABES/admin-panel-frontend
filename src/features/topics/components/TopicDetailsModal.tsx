import { useState, useEffect } from "react";
import {
  X, Calendar, User, Link, Video, ChevronDown, ChevronUp,
  Play, Download, RefreshCw, FileText, Loader2, AlertCircle, CheckCircle
} from "lucide-react";
import type { Topic, TranscriptionStatus } from "../topic.types";
import * as topicService from "../../../services/topic.service";

interface TopicDetailsModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function TopicDetailsModal({
  topic,
  isOpen,
  onClose,
  onRefresh,
}: TopicDetailsModalProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [isStartingTranscription, setIsStartingTranscription] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isVideoPlayable, setIsVideoPlayable] = useState<boolean | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const isValidVideoUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateVideoUrl = async (videoUrl: string): Promise<boolean> => {
    try {
      if (!isValidVideoUrl(videoUrl)) {
        setVideoError("Invalid video URL format");
        return false;
      }

      setVideoError(null);
      return true;
    } catch (error) {
      setVideoError("Failed to validate video");
      return false;
    }
  };

  // Validate video when modal opens or topic changes
  useEffect(() => {
    if (isOpen && topic?.video_url) {
      setIsVideoPlayable(null); // Reset state
      setVideoError(null);

      validateVideoUrl(topic.video_url).then((isValid) => {
        setIsVideoPlayable(isValid);
      });
    } else {
      setIsVideoPlayable(null);
      setVideoError(null);
    }
  }, [isOpen, topic?.video_url]);

  // Early return AFTER all hooks have been called
  if (!isOpen || !topic) return null;

  const getStatusBadge = (publishStatus: boolean) => {
    return publishStatus
      ? "bg-emerald-100 text-emerald-800"
      : "bg-gray-100 text-gray-800";
  };

  const getTranscriptionStatusBadge = (status: TranscriptionStatus) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      transcribing: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      blocked: "bg-gray-100 text-gray-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getTranscriptionStatusIcon = (status: TranscriptionStatus) => {
    switch (status) {
      case "preparing":
      case "transcribing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
      case "blocked":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleStartTranscription = async () => {
    if (!topic) return;

    // Strict validation before starting transcription
    if (!topic.video_url) {
      alert("No video URL available for transcription");
      return;
    }

    if (isVideoPlayable === false || videoError) {
      alert("Cannot start transcription: Video is not playable or not available");
      return;
    }

    if (isVideoPlayable === null) {
      alert("Please wait while we validate the video availability");
      return;
    }

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

  const hasVideoUrl = topic.video_url ? isValidVideoUrl(topic.video_url) : false;
  const hasTranscription = topic.transcription;
  const transcriptionCompleted = hasTranscription?.status === "completed";

  // Determine if transcription button should be disabled
  const isTranscriptionDisabled =
    isStartingTranscription ||
    !topic.video_url ||
    isVideoPlayable === false ||
    isVideoPlayable === null ||
    !!videoError;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Topic Details
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto flex-1">
            <div className="space-y-6">
              {/* Video Player */}
              {hasVideoUrl && topic.video_url && (
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-black">
                  <video
                    src={topic.video_url}
                    className="w-full h-full"
                    controls
                    controlsList="nodownload"
                    title={topic.title}
                  />
                </div>
              )}

              {/* Image (if no video) */}
              {!hasVideoUrl && topic.image && (
                <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={topic.image}
                    alt={topic.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title and Status */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {topic.title}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(topic.publish_status)}`}
                  >
                    {topic.publish_status ? "Published" : "Unpublished"}
                  </span>
                </div>
                <div>
                  <div
                    className={`text-gray-600 leading-relaxed prose prose-sm max-w-none overflow-hidden transition-all ${isExpanded ? "" : "line-clamp-4"
                      }`}
                    dangerouslySetInnerHTML={{ __html: topic.description || "" }}
                  />
                  {(topic.description?.length ?? 0) > 300 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          Show Less <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Show More <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Transcription Section */}
              {topic.video_url && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Video Transcription
                  </h4>

                  {!hasTranscription ? (
                    <div className="space-y-3">
                      {/* Video Validation Status */}
                      {isVideoPlayable === null && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                          <p className="text-sm text-yellow-800">
                            Validating video availability...
                          </p>
                        </div>
                      )}

                      {videoError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Video Validation Failed</p>
                            <p className="text-sm text-red-700 mt-1">{videoError}</p>
                            <p className="text-xs text-red-600 mt-1">
                              Transcription cannot be started for invalid or inaccessible videos.
                            </p>
                          </div>
                        </div>
                      )}

                      {isVideoPlayable === true && !videoError && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-green-800">
                            Video is available and ready for transcription
                          </p>
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 mb-3">
                          Start transcription to automatically generate a transcript and AI summary of this video.
                        </p>
                        <button
                          onClick={handleStartTranscription}
                          disabled={isTranscriptionDisabled}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            isTranscriptionDisabled
                              ? videoError || "Video validation in progress or video is not available"
                              : "Start video transcription"
                          }
                        >
                          {isStartingTranscription ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Start Transcription
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full capitalize flex items-center gap-1.5 ${getTranscriptionStatusBadge(hasTranscription.status)}`}
                          >
                            {getTranscriptionStatusIcon(hasTranscription.status)}
                            {hasTranscription.status}
                          </span>
                        </div>
                        {!transcriptionCompleted && (
                          <button
                            onClick={handleCheckStatus}
                            disabled={isCheckingStatus}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                            Refresh Status
                          </button>
                        )}
                      </div>

                      {/* Error Message */}
                      {hasTranscription.error_message && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-800">
                            <strong>Error:</strong> {hasTranscription.error_message}
                          </p>
                        </div>
                      )}

                      {/* AI Summary */}
                      {hasTranscription.summary_text && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-green-900 mb-2">
                            AI-Generated Summary
                          </h5>
                          <p className="text-sm text-green-800 leading-relaxed">
                            {hasTranscription.summary_text}
                          </p>
                        </div>
                      )}

                      {/* Transcript View */}
                      {hasTranscription.transcript_text && (
                        <div className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                          >
                            <span>View Full Transcript</span>
                            {isTranscriptExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {isTranscriptExpanded && (
                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                              <div className="max-h-64 overflow-y-auto text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {hasTranscription.transcript_text}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Download Buttons */}
                      {transcriptionCompleted && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadTranscript("text")}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download Text
                          </button>
                          <button
                            onClick={() => handleDownloadTranscript("srt")}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download SRT
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Author</div>
                    <div className="font-medium text-gray-900">
                      {topic.author_name || "N/A"}
                    </div>
                    {topic.author_email && (
                      <div className="text-xs text-gray-500">
                        {topic.author_email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Created</div>
                    <div className="font-medium text-gray-900">
                      {new Date(topic.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* URLs */}
              {(topic.source_url || topic.video_url) && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Links
                  </h4>
                  <div className="space-y-3">
                    {topic.source_url && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Link className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 mb-1">
                            Source URL
                          </div>
                          <a
                            href={topic.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline break-all"
                          >
                            {topic.source_url}
                          </a>
                        </div>
                      </div>
                    )}

                    {topic.video_url && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Video className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 mb-1">
                            Video URL
                          </div>
                          <a
                            href={topic.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline break-all"
                          >
                            {topic.video_url}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Publishing Details */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Publishing Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Publishing Time
                    </div>
                    <div className="text-sm text-gray-900">
                      {new Date(topic.publishing_time).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Last Updated
                    </div>
                    <div className="text-sm text-gray-900">
                      {new Date(topic.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

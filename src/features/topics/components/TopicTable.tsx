import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, CircleCheckBig, CircleX, FileText, Video, Check, X as XIcon, Loader2, ExternalLink } from "lucide-react";
import type { Topic } from "../topic.types";
import StatusBadge from "../../../components/common/StatusBadge";
import { stripHtml } from "../../../utils/stripHtml";
import videoPlaceholder from "../../../assets/placeholders/video_placeholder.png";

type TopicTab = "admin" | "doctor";

interface TopicTableProps {
  topics: Topic[];
  onDelete: (topic: Topic) => void;
  onPublish: (topic: Topic) => void;
  onEdit: (topic: Topic) => void;
  currentPage: number;
  pageSize: number;
  activeTab: TopicTab;
}

export default function TopicTable({
  topics, onPublish, onEdit, currentPage, pageSize, activeTab,
}: TopicTableProps) {
  const navigate = useNavigate();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  if (topics.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">No topics found</div>
    );
  }

  const handleImageError = (topicId: string) => {
    setFailedImages((prev) => new Set(prev).add(topicId));
  };

  const getTranscriptionIcon = (status: string | undefined) => {
    if (!status) return null;
    switch (status) {
      case "transcribing":
      case "preparing":
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case "completed":
        return <Check className="w-3 h-3" />;
      case "failed":
      case "blocked":
        return <XIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTranscriptionBadgeStyles = (topic: Topic) => {
    const status = topic.transcription?.status;
    const textClass = !status
      ? "text-gray-600"
      : status === "completed"
        ? "text-emerald-700"
        : status === "failed" || status === "blocked"
          ? "text-red-700"
          : status === "transcribing"
            ? "text-amber-700"
            : "text-blue-700";

    const bg = !status
      ? "rgba(156,163,175,0.12)"
      : status === "completed"
        ? "rgba(79,207,165,0.12)"
        : status === "failed" || status === "blocked"
          ? "rgba(255,112,112,0.12)"
          : status === "transcribing"
            ? "rgba(255,197,84,0.12)"
            : "rgba(107,150,255,0.12)";

    const label = !status
      ? "pending"
      : status === "completed"
        ? "done"
        : status === "failed"
          ? "failed"
          : status === "transcribing"
            ? "transcribing"
            : status === "preparing"
              ? "preparing"
              : status;

    return { textClass, bg, label };
  };

  const handleNavigateToDetail = (topicId: string) => {
    navigate(`/topics/${topicId}`);
  };

  const isAdmin = activeTab === "admin";

  return (
    <div className="overflow-hidden min-w-0">
      <div className="overflow-x-auto min-w-0">
        <table className="w-full table-fixed divide-y divide-gray-100" style={{ minWidth: '800px' }}>
          <thead
            style={{
              background: "#f8f9fb",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <tr>
              <th style={{ width: '4%' }} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                #
              </th>
              <th style={{ width: isAdmin ? '36%' : '30%' }} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Title
              </th>
              {isAdmin ? (
                <>
                  <th style={{ width: '14%' }} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Source
                  </th>
                </>
              ) : (
                <>
                  <th style={{ width: '16%' }} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Author
                  </th>
                  <th style={{ width: '12%' }} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Transcription
                  </th>
                </>
              )}
              <th style={{ width: '10%' }} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th style={{ width: '11%' }} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Created
              </th>
              {isAdmin && (
                <th style={{ width: '11%' }} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Updated
                </th>
              )}
              <th style={{ width: isAdmin ? '10%' : '9%' }} className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topics.map((topic, index) => {
              const isVideoTopic = !!topic.video_url;
              const imageFailed = failedImages.has(topic.id);
              const globalIndex = (currentPage - 1) * pageSize + index + 1;
              return (
                <tr
                  key={topic.id}
                  className="group hover:bg-gray-50/60 transition-all duration-200"
                >
                  {/* Index */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {globalIndex}
                  </td>

                  {/* Title + thumbnail — clickable to navigate to detail */}
                  <td className="px-4 py-4 overflow-hidden">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => handleNavigateToDetail(topic.id)}
                    >
                      {/* Thumbnail */}
                      <div
                        className="relative shrink-0 w-11 h-11 rounded-lg overflow-hidden"
                        style={{
                          boxShadow: "2px 2px 6px rgba(0,0,0,0.10), -2px -2px 6px rgba(255,255,255,0.7)",
                        }}
                      >
                        {imageFailed ? (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{
                              background: "#eff1f5",
                              boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.6)",
                            }}
                          >
                            {isVideoTopic ? (
                              <Video className="w-5 h-5" style={{ color: "#c0c4cc" }} />
                            ) : (
                              <FileText className="w-5 h-5" style={{ color: "#c0c4cc" }} />
                            )}
                          </div>
                        ) : (
                          <>
                            <img
                              src={topic.thumbnail || topic.image || videoPlaceholder}
                              alt={topic.title}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(topic.id)}
                            />
                            {isVideoTopic && (
                              <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ background: "rgba(0,0,0,0.30)" }}
                              >
                                <Video className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 overflow-hidden">
                        <div className="font-medium text-gray-900 truncate text-sm hover:text-blue-600 transition-colors">
                          {topic.title}
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-0.5">
                          {isVideoTopic && topic.transcription?.summary_text
                            ? topic.transcription.summary_text.substring(0, 90) + "…"
                            : stripHtml(topic.description).substring(0, 90) + "…"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Conditional columns based on active tab */}
                  {isAdmin ? (
                    <>

                      {/* Source URL */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {topic.source_url ? (
                          <a
                            href={topic.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
                            style={{ color: "#6b96ff" }}
                            title={topic.source_url}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="truncate max-w-[150px]">
                              {(() => {
                                try { return new URL(topic.source_url).hostname.replace("www.", ""); } catch { return "Link"; }
                              })()}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      {/* Author (Doctor tab) */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{topic.author_name || "—"}</div>
                        <div className="text-xs text-gray-400">{topic.author_email || ""}</div>
                      </td>

                      {/* Transcription Status (Doctor tab — separate column) */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {(() => {
                          const { textClass, bg, label } = getTranscriptionBadgeStyles(topic);
                          return (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${textClass}`}
                              style={{ background: bg }}
                            >
                              {getTranscriptionIcon(topic.transcription?.status)}
                              {label}
                            </span>
                          );
                        })()}
                      </td>
                    </>
                  )}

                  {/* Publish Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={topic.publish_status ? "published" : "unpublished"}
                      size="sm"
                    />
                  </td>

                  {/* Created date */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(topic.created_at).toLocaleDateString()}
                  </td>

                  {/* Updated date */}
                  {isAdmin && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(topic.updated_at).toLocaleDateString()}
                    </td>
                  )}

                  {/* Actions */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleNavigateToDetail(topic.id)}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          title="View Details"
                          style={{ color: "#6b96ff" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(107,150,255,0.08)";
                            e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Edit */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => onEdit(topic)}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          title="Edit Topic"
                          // style={{ color: "#f59e0b" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(245,158,11,0.08)";
                            e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Publish / Unpublish */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => onPublish(topic)}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          title={topic.publish_status ? "Unpublish" : "Publish"}
                          style={{ color: topic.publish_status ? "#ff7070" : "#4fcfa5" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = topic.publish_status
                              ? "rgba(255,112,112,0.08)"
                              : "rgba(79,207,165,0.08)";
                            e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          {topic.publish_status ? (
                            <CircleX className="w-4 h-4" />
                          ) : (
                            <CircleCheckBig className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

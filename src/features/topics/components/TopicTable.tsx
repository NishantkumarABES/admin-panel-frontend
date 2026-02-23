import { useState } from "react";
import { Eye, Pencil, CircleCheckBig, CircleX, FileText, Video, Check, X as XIcon, Loader2 } from "lucide-react";
import type { Topic } from "../topic.types";
import StatusBadge from "../../../components/common/StatusBadge";
import { stripHtml } from "../../../utils/stripHtml";
import videoPlaceholder from "../../../assets/placeholders/video_placeholder.png";

interface TopicTableProps {
  topics: Topic[];
  onView: (topic: Topic) => void;
  onEdit: (topic: Topic) => void;
  onDelete: (topic: Topic) => void;
  onPublish: (topic: Topic) => void;
}

export default function TopicTable({
  topics, onView, onEdit, onPublish, // onDelete unused
}: TopicTableProps) {
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

  return (
    <div className="overflow-hidden min-w-0">
      <div className="overflow-x-auto min-w-0">
        <table className="w-full table-auto divide-y divide-gray-100 min-w-max">
          <thead
            style={{
              background: "#f8f9fb",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-10">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Author
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topics.map((topic, index) => {
              const isVideoTopic = !!topic.video_url;
              const imageFailed = failedImages.has(topic.id);
              return (
                <tr
                  key={topic.id}
                  className="group hover:bg-gray-50/60 transition-all duration-200"
                >
                  {/* Index */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>

                  {/* Title + thumbnail */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
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
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-medium text-gray-900 truncate max-w-72 text-sm">
                            {topic.title}
                          </div>
                          {/* Transcription badge for video topics */}
                          {isVideoTopic && (
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md whitespace-nowrap ${!topic.transcription
                                ? "text-gray-600"
                                : topic.transcription.status === "completed"
                                  ? "text-emerald-700"
                                  : topic.transcription.status === "failed" || topic.transcription.status === "blocked"
                                    ? "text-red-700"
                                    : topic.transcription.status === "transcribing"
                                      ? "text-amber-700"
                                      : "text-blue-700"
                                }`}
                              style={{
                                background: !topic.transcription
                                  ? "rgba(156,163,175,0.12)"
                                  : topic.transcription.status === "completed"
                                    ? "rgba(79,207,165,0.12)"
                                    : topic.transcription.status === "failed" || topic.transcription.status === "blocked"
                                      ? "rgba(255,112,112,0.12)"
                                      : topic.transcription.status === "transcribing"
                                        ? "rgba(255,197,84,0.12)"
                                        : "rgba(107,150,255,0.12)",
                              }}
                            >
                              {getTranscriptionIcon(topic.transcription?.status)}
                              {!topic.transcription
                                ? "pending"
                                : topic.transcription.status === "completed"
                                  ? "done"
                                  : topic.transcription.status === "failed"
                                    ? "failed"
                                    : topic.transcription.status === "transcribing"
                                      ? "transcribing"
                                      : topic.transcription.status === "preparing"
                                        ? "preparing"
                                        : topic.transcription.status}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-72 mt-0.5">
                          {isVideoTopic && topic.transcription?.summary_text
                            ? topic.transcription.summary_text.substring(0, 90) + "…"
                            : stripHtml(topic.description).substring(0, 90) + "…"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {isVideoTopic ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg min-w-[110px] justify-center"
                        style={{
                          color: "#a285ff",
                          background: "rgba(162,133,255,0.10)",
                          boxShadow: "inset 1px 1px 3px rgba(162,133,255,0.15), inset -1px -1px 3px rgba(255,255,255,0.6)",
                        }}
                      >
                        <Video className="w-3 h-3" />
                        Doctor Video
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg min-w-[110px] justify-center"
                        style={{
                          color: "#6b96ff",
                          background: "rgba(107,150,255,0.10)",
                          boxShadow: "inset 1px 1px 3px rgba(107,150,255,0.15), inset -1px -1px 3px rgba(255,255,255,0.6)",
                        }}
                      >
                        <FileText className="w-3 h-3" />
                        Admin Article
                      </span>
                    )}
                  </td>

                  {/* Author */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{topic.author_name || "—"}</div>
                    <div className="text-xs text-gray-400">{topic.author_email || ""}</div>
                  </td>

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

                  {/* Actions */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => onView(topic)}
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
                        {/* <span className="text-[10px] text-gray-400">View</span> */}
                      </div>

                      {/* Edit */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => onEdit(topic)}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          title="Edit Topic"
                          style={{ color: "#6b7280" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                            e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* <span className="text-[10px] text-gray-400">Edit</span> */}
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
                        {/* <span className={`text-[10px] text-gray-400 text-center ${!topic.publish_status ? "ml-3" : ""}`}>
                          {topic.publish_status ? "Unpublish" : "Publish"}
                        </span> */}
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

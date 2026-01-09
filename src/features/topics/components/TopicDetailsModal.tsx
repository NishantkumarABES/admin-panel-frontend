import { X, Calendar, User, Link, Video } from "lucide-react";
import type { Topic } from "../topic.types";

interface TopicDetailsModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TopicDetailsModal({
  topic,
  isOpen,
  onClose,
}: TopicDetailsModalProps) {
  if (!isOpen || !topic) return null;

  const getStatusBadge = (publishStatus: boolean) => {
    return publishStatus
      ? "bg-emerald-100 text-emerald-800"
      : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
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
              {/* Image */}
              {topic.image && (
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
                <p className="text-gray-600 leading-relaxed">
                  {topic.description}
                </p>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
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
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
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
                        <Link className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
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
                        <Video className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
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

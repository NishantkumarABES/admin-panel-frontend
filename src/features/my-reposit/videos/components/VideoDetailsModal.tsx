import { Video, XCircle } from "lucide-react";
import type { Video as VideoType, VideoStatus } from "../videos.types";

interface VideoDetailsModalProps {
    video: VideoType | null;
    isOpen: boolean;
    onClose: () => void;
}

const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black/50"></div>

                <div
                    className="relative inline-block w-full max-w-2xl p-5 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

function getStatusBadge(status: VideoStatus) {
    const styles: Record<VideoStatus, string> = {
        draft: "bg-amber-100 text-amber-800",
        review: "bg-blue-100 text-blue-800",
        published: "bg-emerald-100 text-emerald-800",
        rejected: "bg-red-100 text-red-800",
    };
    const labels: Record<VideoStatus, string> = {
        draft: "Draft",
        review: "In Review",
        published: "Published",
        rejected: "Rejected",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

function formatDuration(seconds: number | null) {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function VideoDetailsModal({ video, isOpen, onClose }: VideoDetailsModalProps) {
    if (!video) return null;

    const InfoCell = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
        <div>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-sm font-medium text-gray-900">{value || "—"}</div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Video Details">
            <div className="space-y-4">
                {/* Header with Video Info */}
                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    {video.thumbnail ? (
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
                            <Video className="w-5 h-5 text-gray-500" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900">
                            {video.title}
                        </h3>
                        <p className="text-sm text-gray-600">{video.Institution || "—"}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                        {getStatusBadge(video.status)}
                        {video.is_deleted && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Deleted
                            </span>
                        )}
                    </div>
                </div>

                {/* Video Player */}
                {video.video_file && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Video Preview
                        </h4>
                        <div className="rounded-lg overflow-hidden bg-black">
                            <video
                                controls
                                className="w-full max-h-[360px]"
                                src={video.video_file}
                                poster={video.thumbnail || undefined}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                )}

                {/* Video Information */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Video Information
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-gray-50 rounded-lg p-3">
                        <InfoCell label="Uploaded By" value={video.uploaded_by} />
                        <InfoCell label="Institution" value={video.Institution} />
                        <InfoCell label="Specialty" value={video.speciality} />
                        <InfoCell label="Duration" value={formatDuration(video.duration_seconds)} />
                        <InfoCell label="Allow Download" value={video.allow_download ? "Yes" : "No"} />
                        <InfoCell label="Created At" value={new Date(video.created_at).toLocaleDateString("en-IN")} />
                    </div>
                </div>

                {/* Statistics */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-base font-bold text-gray-900">{video.view_count}</div>
                            <div className="text-xs text-gray-500">Views</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-base font-bold text-gray-900">{video.download_count}</div>
                            <div className="text-xs text-gray-500">Downloads</div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {video.description && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Description
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{video.description}</p>
                        </div>
                    </div>
                )}

                {/* Rejection Reason */}
                {video.status === "rejected" && video.rejection_reason && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Rejection Reason
                        </h4>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                            <p className="text-sm text-red-700">{video.rejection_reason}</p>
                        </div>
                    </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-400 pt-3 border-t border-gray-200">
                    <p>Created: {new Date(video.created_at).toLocaleString("en-IN")}</p>
                    <p>Video ID: {video.id}</p>
                </div>
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
}

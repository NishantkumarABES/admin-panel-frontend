import { Video } from "lucide-react";
import type { Video as VideoType, VideoStatus } from "../videos.types";

interface VideoDetailsModalProps {
    video: VideoType | null;
    isOpen: boolean;
    onClose: () => void;
}

function getStatusBadge(status: VideoStatus) {
    const styles: Record<VideoStatus, string> = {
        pending: "bg-amber-100 text-amber-800",
        review: "bg-blue-100 text-blue-800",
        published: "bg-emerald-100 text-emerald-800",
        rejected: "bg-red-100 text-red-800",
    };
    const labels: Record<VideoStatus, string> = {
        pending: "Draft",
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
    if (!isOpen || !video) return null;

    const InfoItem = ({
        icon: Icon, label, value,
    }: {
        icon: React.ElementType;
        label: string;
        value: string | number | undefined | null | React.ReactNode;
    }) => {
        if (!value && value !== 0) return null;
        return (
            <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-sm text-gray-900">{value}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-[18px] w-full max-w-2xl max-h-[90vh] flex flex-col"
                    style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sticky Header */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <h2 className="text-lg font-semibold text-gray-900">Video Details</h2>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">
                        {/* Header: thumbnail/icon + video title + status */}
                        <div className="flex items-start justify-between gap-4 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <div className="flex items-center gap-3">
                                {video.thumbnail ? (
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                                        style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}
                                    />
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                                        style={{
                                            background: "#f8f9fb",
                                            boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)"
                                        }}
                                    >
                                        <Video className="w-5 h-5 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
                                    <p className="text-xs text-gray-500">{video.Institution || "—"}</p>
                                </div>
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
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Video Preview</h4>
                                <div
                                    className="rounded-xl overflow-hidden bg-black"
                                    style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}
                                >
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

                        {/* Video Information — Inset Panel */}
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Video Information</h4>
                            <div
                                className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 px-3 rounded-xl"
                                style={{
                                    background: "#f8f9fb",
                                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                }}
                            >
                                <InfoItem icon={Video} label="Uploaded By" value={video.uploaded_by} />
                                <InfoItem icon={Video} label="Institution" value={video.Institution} />
                                <InfoItem icon={Video} label="Specialty" value={video.speciality} />
                                <InfoItem icon={Video} label="Duration" value={formatDuration(video.duration_seconds)} />
                                <InfoItem icon={Video} label="Allow Download" value={video.allow_download ? "Yes" : "No"} />
                                <InfoItem icon={Video} label="Created At" value={new Date(video.created_at).toLocaleDateString("en-IN")} />
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Statistics</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Views", value: video.view_count },
                                    { label: "Downloads", value: video.download_count },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-xl p-3 text-center"
                                        style={{
                                            background: "#f8f9fb",
                                            boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                        }}
                                    >
                                        <div className="text-base font-bold text-gray-900">{stat.value}</div>
                                        <div className="text-xs text-gray-500">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        {video.description && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                                <div
                                    className="rounded-xl p-3"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{video.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Rejection Reason */}
                        {video.status === "rejected" && video.rejection_reason && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Rejection Reason</h4>
                                <div
                                    className="rounded-xl p-3"
                                    style={{
                                        background: "rgba(239, 68, 68, 0.06)",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.5)"
                                    }}
                                >
                                    <p className="text-sm text-red-700">{video.rejection_reason}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky Footer */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div className="text-xs text-gray-500">
                            Created: {new Date(video.created_at).toLocaleString("en-IN")} · Video ID: {video.id}
                        </div>
                        <button
                            onClick={onClose}
                            className="clay-btn"
                            style={{ fontSize: "13px", padding: "6px 16px" }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

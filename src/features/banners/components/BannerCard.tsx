import { Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import type { Banner } from "../banner.types";

interface BannerCardProps {
    banner: Banner;
    onEdit: (banner: Banner) => void;
    onDelete: (banner: Banner) => void;
    onToggleStatus: (banner: Banner) => void;
}

export default function BannerCard({
    banner,
    onEdit,
    onDelete,
    onToggleStatus,
}: BannerCardProps) {
    return (
        <div
            className="clay-card overflow-hidden flex flex-col"
            style={{ padding: 0 }}
        >
            {/* Image Section */}
            <div
                className="relative w-full overflow-hidden"
                style={{
                    aspectRatio: "16 / 9",
                    background: "#f0f1f4",
                }}
            >
                {banner.image ? (
                    <img
                        src={banner.image}
                        alt={banner.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300"
                        style={{ display: "block" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon
                            className="w-10 h-10"
                            style={{ color: "rgba(148, 163, 184, 0.4)" }}
                        />
                    </div>
                )}

                {/* Order Badge */}
                {banner.order !== undefined && (
                    <div
                        className="absolute top-3 left-3 flex items-center justify-center text-xs font-bold text-white"
                        style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.5)",
                            backdropFilter: "blur(4px)",
                        }}
                        title={`Display order: ${banner.order}`}
                    >
                        #{banner.order}
                    </div>
                )}

                {/* Status Badge */}
                {banner.is_active !== undefined && (
                    <button
                        onClick={() => onToggleStatus(banner)}
                        className="absolute top-3 right-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
                        style={
                            banner.is_active
                                ? {
                                    background: "rgba(79, 207, 165, 0.9)",
                                    color: "#ffffff",
                                    border: "none",
                                    backdropFilter: "blur(4px)",
                                }
                                : {
                                    background: "rgba(0,0,0,0.5)",
                                    color: "#ffffff",
                                    border: "none",
                                    backdropFilter: "blur(4px)",
                                }
                        }
                        title={`Click to ${banner.is_active ? "deactivate" : "activate"}`}
                    >
                        {banner.is_active ? "Active" : "Inactive"}
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col">
                <h3
                    className="text-sm font-semibold text-gray-900 truncate"
                    title={banner.title}
                >
                    {banner.title}
                </h3>
                {banner.subtitle && (
                    <p
                        className="text-xs text-gray-500 mt-1 line-clamp-2"
                        title={banner.subtitle}
                    >
                        {banner.subtitle}
                    </p>
                )}



                {/* Actions */}
                <div
                    className="flex items-center justify-end gap-2 mt-auto pt-3"
                    style={{
                        borderTop: "1px solid rgba(0,0,0,0.06)",
                        marginTop: "12px",
                    }}
                >
                    <button
                        onClick={() => onEdit(banner)}
                        className="p-1.5 rounded-lg transition-all duration-200"
                        title="Edit banner"
                        style={{ color: "#6b7280" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                                "rgba(0, 0, 0, 0.04)";
                            e.currentTarget.style.boxShadow =
                                "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(banner)}
                        className="p-1.5 rounded-lg transition-all duration-200"
                        title="Delete banner"
                        style={{ color: "#ff7070" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                                "rgba(255, 112, 112, 0.08)";
                            e.currentTarget.style.boxShadow =
                                "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

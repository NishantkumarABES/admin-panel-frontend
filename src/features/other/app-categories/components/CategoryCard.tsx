import { Edit2, Trash2, Users } from "lucide-react";
import type { AppCategory } from "../app_categories.types";

interface CategoryCardProps {
    category: AppCategory;
    onEdit: (category: AppCategory) => void;
    onDelete: (category: AppCategory) => void;
}

export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
    return (
        <div
            className="clay-card overflow-hidden flex flex-col"
            style={{ padding: 0 }}
        >
            {/* Image Section */}
            <div
                className="relative w-full flex items-center justify-center overflow-hidden"
                style={{
                    height: "140px",
                    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
                }}
            >
                {category.image ? (
                    <img
                        src={category.image}
                        alt={category.label}
                        className="w-24 h-24 object-contain"
                        style={{
                            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                        }}
                    />
                ) : (
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{
                            background: "rgba(99, 102, 241, 0.08)",
                            boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.6)",
                        }}
                    >
                        <span className="text-3xl font-bold" style={{ color: "rgba(99, 102, 241, 0.4)" }}>
                            {category.label.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Doctor Count Badge */}
                <div
                    className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                        background: "rgba(255,255,255,0.85)",
                        color: "#374151",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    <Users className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
                    {category.doctor_count} {category.doctor_count === 1 ? "Doctor" : "Doctors"}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {category.label}
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                    {category.key}
                </p>
            </div>

            {/* Actions */}
            <div
                className="flex items-center justify-end gap-2 px-4 py-3"
                style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
                <button
                    onClick={() => onEdit(category)}
                    className="p-1.5 rounded-lg transition-all duration-200"
                    title="Edit category"
                    style={{ color: "#6b7280" }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.04)";
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
                    onClick={() => onDelete(category)}
                    className="p-1.5 rounded-lg transition-all duration-200"
                    title="Delete category"
                    style={{ color: "#ff7070" }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 112, 112, 0.08)";
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
    );
}

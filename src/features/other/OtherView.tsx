import { useNavigate } from "react-router-dom";
import { Tag, LayoutGrid, ChevronRight } from "lucide-react";

const otherFeatures = [
    {
        key: "so-coupons",
        title: "Manage Second Opinion Coupons",
        description: "Create, edit, and manage discount coupons for second opinion consultations.",
        path: "/other/so-coupons",
        icon: Tag,
        gradient: "linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)",
        iconBg: "rgba(45, 212, 191, 0.10)",
        iconColor: "#0d9488",
    },
    {
        key: "app-categories",
        title: "Manage Appointment Categories",
        description: "View, create, and manage appointment categories to organize doctors by specialization.",
        path: "/other/app-categories",
        icon: LayoutGrid,
        gradient: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
        iconBg: "rgba(99, 102, 241, 0.10)",
        iconColor: "#6366f1",
    },
];

export default function OtherView() {
    const navigate = useNavigate();

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="min-w-0 max-w-full">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">Other</h1>
                <p className="text-sm text-gray-500">
                    Manage miscellaneous features and settings
                </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <button
                            key={feature.key}
                            onClick={() => navigate(feature.path)}
                            className="clay-card text-left transition-all duration-300 ease-out group"
                            style={{
                                padding: 0,
                                cursor: "pointer",
                                border: "none",
                            }}
                        >

                            <div className="p-5">
                                {/* Icon */}
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                                    style={{
                                        background: feature.iconBg,
                                        boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)",
                                    }}
                                >
                                    <Icon className="w-6 h-6" style={{ color: feature.iconColor }} />
                                </div>

                                {/* Title */}
                                <h3 className="text-sm font-semibold text-gray-900 mb-1.5 group-hover:text-gray-700 transition-colors">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                    {feature.description}
                                </p>

                                {/* CTA */}
                                <div className="flex items-center gap-1.5 text-xs font-medium transition-all duration-300 group-hover:gap-2.5"
                                    style={{ color: feature.iconColor }}
                                >
                                    <span>Open</span>
                                    <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

import {
    Stethoscope,
    Users,
    BookOpen,
    Calendar,
    Package,
    FileCheck,
    Megaphone,
    Pill,
    ArrowRight,
    FileText,
    Video,
    Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardMetrics } from "../../../services/dashboard.service";

interface DashboardActivityFeedProps {
    metrics: DashboardMetrics;
    loading: boolean;
}

interface QuickLink {
    label: string;
    path: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    description: string;
}

export default function DashboardActivityFeed({ metrics, loading }: DashboardActivityFeedProps) {
    if (loading) {
        return (
            <div className="clay-card h-full">
                <div className="clay-skeleton" style={{ height: "18px", width: "160px", marginBottom: "16px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3" style={{ padding: "10px 0" }}>
                            <div className="clay-skeleton" style={{ height: "36px", width: "36px", borderRadius: "10px", flexShrink: 0 }} />
                            <div className="flex-1">
                                <div className="clay-skeleton" style={{ height: "14px", width: "60%", marginBottom: "6px" }} />
                                <div className="clay-skeleton" style={{ height: "11px", width: "40%" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const quickLinks: QuickLink[] = [
        {
            label: "Doctors",
            path: "/doctors",
            icon: <Stethoscope className="w-4 h-4" />,
            color: "#6b96ff",
            bg: "rgba(107, 150, 255, 0.08)",
            description: `${metrics.doctors.total.toLocaleString()} registered`,
        },
        {
            label: "Patients",
            path: "/patients",
            icon: <Users className="w-4 h-4" />,
            color: "#a285ff",
            bg: "rgba(162, 133, 255, 0.08)",
            description: `${metrics.patients.total.toLocaleString()} registered`,
        },
        {
            label: "Topics",
            path: "/topics",
            icon: <BookOpen className="w-4 h-4" />,
            color: "#4fcfa5",
            bg: "rgba(79, 207, 165, 0.08)",
            description: `${metrics.topics.total.toLocaleString()} published`,
        },
        {
            label: "Products",
            path: "/products",
            icon: <Package className="w-4 h-4" />,
            color: "#ff9f47",
            bg: "rgba(255, 159, 71, 0.08)",
            description: `${metrics.products.total.toLocaleString()} listed`,
        },
        {
            label: "Orders",
            path: "/orders",
            icon: <FileCheck className="w-4 h-4" />,
            color: "#5bb8ff",
            bg: "rgba(91, 184, 255, 0.08)",
            description: "View all orders",
        },
        {
            label: "Events",
            path: "/events",
            icon: <Calendar className="w-4 h-4" />,
            color: "#c990ff",
            bg: "rgba(201, 144, 255, 0.08)",
            description: "Manage events",
        },
        {
            label: "Advertisements",
            path: "/advertisements",
            icon: <Megaphone className="w-4 h-4" />,
            color: "#ffc554",
            bg: "rgba(255, 197, 84, 0.08)",
            description: "View campaigns",
        },
        {
            label: "IDI",
            path: "/IDI",
            icon: <Pill className="w-4 h-4" />,
            color: "#ff7070",
            bg: "rgba(255, 112, 112, 0.08)",
            description: "Manage drug info",
        },
    ];

    const repositLinks: QuickLink[] = [
        {
            label: "Articles",
            path: "/my-reposit/articles",
            icon: <FileText className="w-4 h-4" />,
            color: "#6b96ff",
            bg: "rgba(107, 150, 255, 0.08)",
            description: "Manage articles",
        },
        {
            label: "Books",
            path: "/my-reposit/books",
            icon: <BookOpen className="w-4 h-4" />,
            color: "#4fcfa5",
            bg: "rgba(79, 207, 165, 0.08)",
            description: "Manage books",
        },
        {
            label: "Videos",
            path: "/my-reposit/videos",
            icon: <Video className="w-4 h-4" />,
            color: "#ff9f47",
            bg: "rgba(255, 159, 71, 0.08)",
            description: "Manage videos",
        },
        {
            label: "Jobs",
            path: "/my-reposit/jobs",
            icon: <Briefcase className="w-4 h-4" />,
            color: "#a285ff",
            bg: "rgba(162, 133, 255, 0.08)",
            description: "Manage job listings",
        },
    ];

    return (
        <div className="clay-card h-full">
            <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                <h2 className="text-base font-semibold text-gray-900">Platform Overview</h2>
                <span className="text-[11px] font-medium" style={{ color: "#9ca3af" }}>
                    Quick navigation
                </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
                {quickLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center gap-3 rounded-xl group"
                        style={{
                            padding: "10px 12px",
                            textDecoration: "none",
                            transition: "all 0.2s ease",
                            background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = link.bg;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <div
                            className="flex items-center justify-center shrink-0"
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                background: link.bg,
                                color: link.color,
                            }}
                        >
                            {link.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{link.label}</div>
                            <div className="text-[11px]" style={{ color: "#9ca3af" }}>
                                {link.description}
                            </div>
                        </div>
                        <ArrowRight
                            className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100"
                            style={{ color: "#9ca3af", transition: "opacity 0.2s ease" }}
                        />
                    </Link>
                ))}
            </div>

            {/* My Reposit Section */}
            <div style={{ marginTop: "8px", paddingTop: "12px", borderTop: "1px solid #f0f1f3" }}>
                <div className="flex items-center gap-2" style={{ marginBottom: "8px", paddingLeft: "12px" }}>
                    <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: "#a285ff" }}>
                        My Reposit
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                    {repositLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="flex items-center gap-3 rounded-xl group"
                            style={{
                                padding: "10px 12px",
                                textDecoration: "none",
                                transition: "all 0.2s ease",
                                background: "transparent",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = link.bg;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                            }}
                        >
                            <div
                                className="flex items-center justify-center shrink-0"
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "10px",
                                    background: link.bg,
                                    color: link.color,
                                }}
                            >
                                {link.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">{link.label}</div>
                                <div className="text-[11px]" style={{ color: "#9ca3af" }}>
                                    {link.description}
                                </div>
                            </div>
                            <ArrowRight
                                className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100"
                                style={{ color: "#9ca3af", transition: "opacity 0.2s ease" }}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

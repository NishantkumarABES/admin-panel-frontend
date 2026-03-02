import { Activity } from "lucide-react";

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

function getFormattedDate(): string {
    return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function DashboardWelcomeHeader() {
    return (
        <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
                <h2
                    className="text-2xl font-bold text-gray-900"
                    style={{ letterSpacing: "-0.02em", marginBottom: "4px" }}
                >
                    {getGreeting()}, Admin 👋
                </h2>
                <p className="text-sm" style={{ color: "#6b7280" }}>
                    {getFormattedDate()} — Here's what's happening with your platform today
                </p>
            </div>
            <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                    background: "rgba(79, 207, 165, 0.1)",
                    border: "1px solid rgba(79, 207, 165, 0.2)",
                }}
            >
                <Activity className="w-3.5 h-3.5" style={{ color: "#4fcfa5" }} />
                <span className="text-xs font-medium" style={{ color: "#3dba8e" }}>
                    System Online
                </span>
            </div>
        </div>
    );
}

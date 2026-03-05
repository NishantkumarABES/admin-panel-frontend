import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, HelpCircle, LogOut, Clock, ExternalLink, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { pageHelpContent } from "../../utils/pageHelpContent";
import HelpModal from "../common/HelpModal";
import { notificationService } from "../../services/notification.service";
import type { Notification } from "../../features/notifications/notification.types";
import toast from "react-hot-toast";

// Simple page info for header display
const pageNames: Record<string, { name: string; description: string }> = {
  "/": { name: "Dashboard", description: "Overview of platform activity and key metrics" },
  "/doctors": { name: "Doctors", description: "Manage doctor profiles and information" },
  "/patients": { name: "Patients", description: "Manage patient records and appointments" },
  "/products": { name: "Products", description: "Manage product listings and inventory" },
  "/coupons": { name: "Coupons", description: "Manage promotional discount codes" },
  "/banners": { name: "Application Banners", description: "Manage promotional banners displayed in the app" },
  "/orders": { name: "Orders", description: "Manage product orders" },
  "/topics": { name: "Topics", description: "Manage educational topics and content" },
  "/events": { name: "Events", description: "Manage upcoming events and schedules" },
  "/advertisements": { name: "Advertisements", description: "Manage promotional advertisements" },
  "/IDI": { name: "IDI: Indian Drug Index", description: "Manage IDI: Clinical Information Management" },
  "/advisory": { name: "Advisory", description: "Manage advisory panel and settings" },
  "/settings": { name: "Settings", description: "Manage application policies and information" },
  "/profile": { name: "Profile", description: "Admin User Profile" },
  "/my-reposit/books": { name: "Books", description: "Manage books and view stats" },
  "/my-reposit/articles": { name: "Articles", description: "Manage articles and view stats" },
  "/my-reposit/jobs": { name: "Jobs", description: "Manage jobs and view stats" },
  "/my-reposit/videos": { name: "Videos", description: "Manage videos and view stats" },
};

interface TopbarProps {
  isSidebarCollapsed: boolean;
  onMobileMenuToggle?: () => void;
}

export default function Topbar({ isSidebarCollapsed, onMobileMenuToggle }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Notification state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const currentPage = pageNames[location.pathname]?.name || "Admin Panel";
  const currentDescription = pageNames[location.pathname]?.description || "";
  const currentHelpContent = pageHelpContent[location.pathname] || pageHelpContent["/"];

  // Fetch notification summary on mount
  useEffect(() => {
    fetchNotificationSummary();
    // Poll every 60 seconds for new notifications
    const interval = setInterval(fetchNotificationSummary, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotificationSummary = async () => {
    try {
      const response = await notificationService.getSummary();
      setUnreadCount(response.unread_count);
      // Only show unread notifications in dropdown
      setNotifications(response.latest.filter((n) => !n.is_read).slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleNotificationClick = async () => {
    setIsNotificationOpen(!isNotificationOpen);

    // If opening and there are unread notifications, mark all as read
    if (!isNotificationOpen && unreadCount > 0) {
      setIsLoadingNotifications(true);
      try {
        await notificationService.markAllAsRead();
        setUnreadCount(0);
        // Update local notifications to show as read
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        toast.success("All notifications marked as read");
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      } finally {
        setIsLoadingNotifications(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      <header
        className={`fixed pt-2 pb-2 top-0 right-0 flex items-center justify-between z-20 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? "left-20" : "left-68"
          }`}
        style={{
          height: "66px",
          paddingLeft: "20px",
          paddingRight: "20px",
          background: "#ffffff",
          borderBottom: "none",
          boxShadow:
            "0 4px 12px rgba(0, 0, 0, 0.04), 0 -2px 8px rgba(255, 255, 255, 0.6)",
        }}
      >
        {/* Left - Mobile Menu + Page Info */}
        <div className="flex items-center gap-2" style={{ marginLeft: "4px" }}>
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="topbar-icon-btn"
              style={{
                borderRadius: "16px",
                border: "none",
                background: "#f7f8fa",
                boxShadow:
                  "4px 4px 8px rgba(0, 0, 0, 0.06), -4px -4px 8px rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Menu className="w-5 h-5" style={{ color: "#6b7280" }} />
            </button>
          )}
          <div>
            <h2 className="text-base font-semibold text-gray-900" style={{ lineHeight: 1.2 }}>{currentPage}</h2>
            <p className="text-xs" style={{ color: "#6b7280", lineHeight: 1.2 }}>{currentDescription}</p>
          </div>
        </div>

        {/* Right - Notifications, Help and Logout */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={handleNotificationClick}
              title="Notifications"
              className="relative topbar-icon-btn"
              style={{
                padding: "8px",
                borderRadius: "16px",
                border: "none",
                background: "#f7f8fa",
                boxShadow:
                  "4px 4px 8px rgba(0, 0, 0, 0.06), -4px -4px 8px rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "4px 4px 8px rgba(0, 0, 0, 0.06), -4px -4px 8px rgba(255, 255, 255, 0.6)";
              }}
            >
              <Bell className="w-5 h-5" style={{ color: "#6b7280" }} />
              {unreadCount > 0 && (
                <span
                  className="absolute flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    top: "-2px",
                    right: "-2px",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 4px",
                    borderRadius: "9999px",
                    background: "#ff7070",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div
                className="absolute right-0 top-12 w-80 overflow-hidden z-50"
                style={{
                  background: "#f7f8fa",
                  borderRadius: "20px",
                  border: "none",
                  boxShadow:
                    "8px 8px 20px rgba(0, 0, 0, 0.12), -8px -8px 20px rgba(255, 255, 255, 0.8)",
                }}
              >
                {/* Header */}
                <div className="clay-inset" style={{ borderRadius: "16px 16px 0 0", margin: "0", padding: "12px 16px" }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {isLoadingNotifications && (
                      <div className="animate-spin rounded-full h-4 w-4" style={{ borderBottom: "2px solid #6b96ff" }}></div>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div style={{ padding: "32px 16px", textAlign: "center" }}>
                      <Bell className="w-10 h-10 mx-auto" style={{ color: "#c8cdd4", marginBottom: "8px" }} />
                      <p className="text-sm" style={{ color: "#9ca3af" }}>No new notifications</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          style={{
                            padding: "12px 16px",
                            transition: "transform 0.2s ease",
                            cursor: "default",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(2px)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; }}
                        >
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {notification.title}
                          </h4>
                          <p className="text-sm line-clamp-2" style={{ color: "#6b7280", marginTop: "2px" }}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1" style={{ marginTop: "6px", fontSize: "12px", color: "#9ca3af" }}>
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(notification.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="clay-inset" style={{ borderRadius: "0 0 16px 16px", margin: "0", padding: "12px 16px" }}>
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium"
                    style={{
                      color: "#6b96ff",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#4f46e5"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#6b96ff"; }}
                  >
                    <span>View All Notifications</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            title="Help"
            className="topbar-icon-btn"
            style={{
              padding: "10px",
              borderRadius: "16px",
              border: "none",
              background: "#f7f8fa",
              boxShadow:
                "4px 4px 8px rgba(0, 0, 0, 0.06), -4px -4px 8px rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "4px 4px 8px rgba(0, 0, 0, 0.06), -4px -4px 8px rgba(255, 255, 255, 0.6)";
            }}
          >
            <HelpCircle className="w-5 h-5" style={{ color: "#6b7280" }} />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="topbar-icon-btn"
            style={{
              padding: "10px",
              borderRadius: "16px",
              border: "none",
              background: "#f7f8fa",
              boxShadow:
                "4px 4px 8px rgba(0, 0, 0, 0.06), -4px -4px 8px rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease",
              color: "#6b7280",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.7)";
              e.currentTarget.style.color = "#ff7070";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "4px 4px 8px rgba(0, 0, 0, 0.06), -4px -4px 8px rgba(255, 255, 255, 0.6)";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        content={currentHelpContent}
      />
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, HelpCircle, LogOut, Clock, ExternalLink } from "lucide-react";
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
};

interface TopbarProps {
  isSidebarCollapsed: boolean;
}

export default function Topbar({ isSidebarCollapsed }: TopbarProps) {
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
      <header className={`fixed top-0 right-0 h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-20 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? "left-20" : "left-68"
        }`}>
        {/* Left - Current Page/Tab */}
        <div className="ml-2">
          <h2 className="text-xl font-semibold text-gray-900">{currentPage}</h2>
          <p className="text-sm text-gray-600">{currentDescription}</p>
        </div>

        {/* Right - Notifications, Help and Logout */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={handleNotificationClick}
              title="Notifications"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {isLoadingNotifications && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(notification.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
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
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
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

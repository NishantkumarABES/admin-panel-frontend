import { useLocation, useNavigate } from "react-router-dom";
import { Bell, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const pageNames: Record<string, { name: string; description: string }> = {
  "/": { name: "Dashboard", description: "Overview of platform activity and key metrics" },
  "/doctors": { name: "Doctors", description: "Manage doctor profiles and information" },
  "/patients": { name: "Patients", description: "Manage patient records and appointments" },
  "/products": { name: "Products", description: "Manage product listings and inventory" },
  "/orders": { name: "Orders", description: "Manage product orders" },
  "/topics": { name: "Topics", description: "Manage educational topics and content" },
  "/events": { name: "Events", description: "Manage upcoming events and schedules" },
  "/advertisements": { name: "Advertisements", description: "Manage promotional advertisements" },
  "/cims": {name: "CIMS", description: "Manage CIMS: Clinical Information Management"},
  "/advisory" : {name: "Advisory", description: "Manage advisory panel and settings" },
  "/settings": { name: "Settings", description: "Manage application policies and information" },
  "/profile": { name: "Profile", description: "Admin User Profile" }
};

interface TopbarProps {
  isSidebarCollapsed: boolean;
}

export default function Topbar({ isSidebarCollapsed }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentPage = pageNames[location.pathname].name || "Admin Panel";
  const currentDescription = pageNames[location.pathname].description || "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={`fixed top-0 right-0 h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-20 transition-all duration-500 ease-in-out ${
      isSidebarCollapsed ? "left-20" : "left-64"
    }`}>
      {/* Left - Current Page/Tab */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{currentPage}</h2>
        <p className="text-sm text-gray-600">{currentDescription}</p>
      </div>

      {/* Right - Notifications, Help and Logout */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          title="Notifications"
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Help */}
        <button
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
  );
}

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Stethoscope, Users, Package, BookOpen, Calendar, Settings, FileCheck, 
  ChevronLeft, ChevronRight, User, LogOut
} from "lucide-react";
import logo from "../../assets/logo.svg";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Doctors", path: "/doctors", icon: Stethoscope },
  { label: "Patients", path: "/patients", icon: Users },
  { label: "Products", path: "/products", icon: Package },
  { label: "Topics", path: "/topics", icon: BookOpen },
  { label: "Events", path: "/events", icon: Calendar },
  { label: "Audit Logs", path: "/audit", icon: FileCheck },
  { label: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}



export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-gray-900 text-white h-screen flex flex-col transition-all duration-500 ease-in-out fixed left-0 top-0 z-30`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-gray-900 border border-gray-700 rounded-full p-1.5 hover:bg-gray-800 transition-all duration-300 ease-in-out z-10"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-300" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-300" />
        )}
      </button>

      {/* Logo */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-800">
        {isCollapsed ? (
          <img
            src={logo}
            alt="Clinic Topics Logo"
            className="w-10 h-10 transition-all duration-500 ease-in-out"
          />
        ) : (
          <div className="flex items-center gap-3 transition-all duration-500 ease-in-out">
            <img
              src={logo}
              alt="Clinic Topics Logo"
              className="w-8 h-8 flex-shrink-0"
            />
            <h1 className="text-sm font-bold !text-white whitespace-nowrap">
              Clinic Topics
            </h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            title={isCollapsed ? label : ""}
            className={({ isActive }) =>
              `flex items-center ${
                isCollapsed ? "justify-center" : "gap-3"
              } px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out
              ${
                isActive
                  ? "bg-gray-800 !text-white"
                  : "text-gray-200 hover:bg-gray-800 !text-white"
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="transition-opacity duration-300 ease-in-out">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Admin User Section */}
      <div className="border-t border-gray-800">
        <div className={`p-4 flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-9 h-9 rounded-full bg-white text-gray-900 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5" />
          </div>

          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0 transition-opacity duration-300 ease-in-out">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg hover:bg-gray-800 transition-all duration-300 ease-in-out flex-shrink-0"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

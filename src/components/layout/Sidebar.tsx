import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Stethoscope, Users, Package, BookOpen, Calendar, Settings, FileCheck,
  ChevronLeft, ChevronRight, User, LogOut, Megaphone, Pill, Lightbulb,
  Library, FileText, Video, Briefcase, ChevronDown
} from "lucide-react";
import logo from "../../assets/logo.svg";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Doctors", path: "/doctors", icon: Stethoscope },
  { label: "Patients", path: "/patients", icon: Users },
  { label: "Products", path: "/products", icon: Package },
  { label: "Orders", path: "/orders", icon: FileCheck },
  { label: "Topics", path: "/topics", icon: BookOpen },
  { label: "Events", path: "/events", icon: Calendar },
  { label: "Advertisements", path: "/advertisements", icon: Megaphone },
  { label: "IDI", path: "/IDI", icon: Pill },
  { label: "Advisory", path: "/advisory", icon: Lightbulb },
  { label: "Settings", path: "/settings", icon: Settings },
];

const myRepositItems = [
  { label: "Books", path: "/my-reposit/books", icon: BookOpen },
  { label: "Events", path: "/my-reposit/events", icon: Calendar },
  { label: "Articles", path: "/my-reposit/articles", icon: FileText },
  { label: "Videos", path: "/my-reposit/videos", icon: Video },
  { label: "Jobs", path: "/my-reposit/jobs", icon: Briefcase },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRepositOpen, setIsRepositOpen] = useState(
    location.pathname.startsWith("/my-reposit")
  );
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-64"
        } bg-gray-900 text-white h-full flex flex-col transition-all duration-500 ease-in-out fixed left-0 top-0 z-30`}
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
              className="w-8 h-8 shrink-0"
            />
            <p className="text-[28px] font-bold text-white! whitespace-nowrap">
              Clinic Topics
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            title={isCollapsed ? label : ""}
            className={({ isActive }) =>
              `flex items-center ${isCollapsed ? "justify-center" : "gap-3"
              } px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-300 ease-in-out
              ${isActive
                ? "bg-gray-800 text-white!"
                : "text-white! hover:bg-gray-800 "
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="transition-opacity duration-300 ease-in-out">{label}</span>}
          </NavLink>
        ))}

        {/* My Reposit Section */}
        <div className="pt-4 mt-4 border-t border-gray-800">
          <button
            onClick={() => {
              if (isCollapsed) {
                setIsCollapsed(false);
                setIsRepositOpen(true);
              } else {
                setIsRepositOpen(!isRepositOpen);
              }
            }}
            title={isCollapsed ? "My Reposit" : ""}
            className={`flex items-center w-full ${isCollapsed ? "justify-center" : "gap-3"
              } px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-300 ease-in-out
              ${location.pathname.startsWith("/my-reposit")
                ? "bg-gray-800 text-white!"
                : "text-white! hover:bg-gray-800"
              }`}
          >
            <Library className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left transition-opacity duration-300 ease-in-out">My Reposit</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isRepositOpen ? "rotate-180" : ""}`} />
              </>
            )}
          </button>

          {!isCollapsed && isRepositOpen && (
            <div className="mt-1 space-y-1 pl-4">
              {myRepositItems.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out
                    ${isActive
                      ? "bg-gray-800 text-white!"
                      : "text-white! hover:bg-gray-800"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="transition-opacity duration-300 ease-in-out">{label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Admin User Section */}
      <div className="border-t border-gray-800">
        <div className={`p-4 flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <button
            onClick={() => navigate("/profile")}
            className="w-9 h-9 rounded-full bg-white text-gray-900 flex items-center justify-center shrink-0 hover:bg-gray-100 transition-colors cursor-pointer"
            title={isCollapsed ? "Admin Profile" : ""}
          >
            <User className="w-5 h-5" />
          </button>

          {!isCollapsed && (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="flex-1 min-w-0 transition-opacity duration-300 ease-in-out text-left hover:opacity-80 cursor-pointer"
              >
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
              </button>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg hover:bg-gray-800 transition-all duration-300 ease-in-out shrink-0"
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

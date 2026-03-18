import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Stethoscope, Users, Package, BookOpen, Calendar, Settings, FileCheck,
  ChevronLeft, ChevronRight, User, LogOut, Megaphone, Pill, Lightbulb,
  Library, FileText, Video, Briefcase, Tag, Image, RotateCcw
} from "lucide-react";
import logo from "../../assets/logo.svg";

// ─── Standalone item (always visible, no group) ───────
const dashboardItem = { label: "Dashboard", path: "/", icon: LayoutDashboard };

// ─── Collapsible groups ───────────────────────────────
const navGroups = [
  {
    key: "user-management",
    label: "User Management",
    items: [
      { label: "Doctors", path: "/doctors", icon: Stethoscope },
      { label: "Patients", path: "/patients", icon: Users },
    ],
  },
  {
    key: "commerce",
    label: "Commerce",
    items: [
      { label: "Products", path: "/products", icon: Package },
      { label: "Orders", path: "/orders", icon: FileCheck },
      { label: "Refunds", path: "/refunds", icon: RotateCcw },
    ],
    subGroups: [
      {
        label: "Marketing",
        items: [
          { label: "Coupons", path: "/coupons", icon: Tag },
          { label: "App Banners", path: "/banners", icon: Image },
        ],
      },
    ],
  },
  {
    key: "content",
    label: "Content",
    items: [
      { label: "Topics", path: "/topics", icon: BookOpen },
      { label: "Events", path: "/events", icon: Calendar },
      { label: "Advertisements", path: "/advertisements", icon: Megaphone },
      { label: "IDI", path: "/IDI", icon: Pill },
    ],
  },
  {
    key: "system",
    label: "System",
    items: [
      { label: "Settings", path: "/settings", icon: Settings },
      { label: "Advisory", path: "/advisory", icon: Lightbulb },
    ],
  },
];

const myRepositItems = [
  { label: "Books", path: "/my-reposit/books", icon: BookOpen },
  { label: "Articles", path: "/my-reposit/articles", icon: FileText },
  { label: "Videos", path: "/my-reposit/videos", icon: Video },
  { label: "Jobs", path: "/my-reposit/jobs", icon: Briefcase },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobile?: boolean;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobile = false }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();




  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper to render a single nav link
  const renderNavLink = (
    item: { label: string; path: string; icon: React.ElementType },
    size: "normal" | "small" = "normal"
  ) => {
    const Icon = item.icon;
    const isSmall = size === "small";
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === "/"}
        title={isCollapsed ? item.label : ""}
        className={({ isActive }) =>
          `sidebar-nav-item flex items-center ${isCollapsed ? "justify-center" : "gap-3"
          } ${isSmall ? "px-2.5 py-1" : "px-2.5 py-1.5"} rounded-lg ${isSmall ? "text-[12px]" : "text-[13px]"
          } font-medium transition-all duration-200 ease-out
          ${isActive ? "sidebar-nav-active" : "sidebar-nav-inactive"}`
        }
      >
        <Icon className={`${isSmall ? "w-4 h-4" : "w-[18px] h-[18px]"} shrink-0`} />
        {!isCollapsed && (
          <span className="transition-opacity duration-300 ease-in-out">{item.label}</span>
        )}
      </NavLink>
    );
  };

  // Check if any route in a group is active (for highlighting the group header)
  const isGroupActive = (group: typeof navGroups[number]) => {
    const mainActive = group.items.some((item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/"));
    const subActive = group.subGroups?.some((sg) =>
      sg.items.some((item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/"))
    ) ?? false;
    return mainActive || subActive;
  };

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-68"
        } h-full flex flex-col transition-all duration-500 ease-in-out ${isMobile ? "" : "fixed left-0 top-0 z-30"}`}
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        boxShadow: "4px 0 16px rgba(0, 0, 0, 0.12)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-3 relative"
        style={{
          height: "66px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          justifyContent: isCollapsed ? "center" : "flex-start",
        }}
      >
        {isCollapsed ? (
          <img
            src={logo}
            alt="Clinic Topics Logo"
            className="w-8 h-8 transition-all duration-500 ease-in-out"
            style={{ filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))" }}
          />
        ) : (
          <div className="flex items-center gap-2 transition-all duration-500 ease-in-out">
            <img
              src={logo}
              alt="Clinic Topics Logo"
              className="w-8 h-8 shrink-0"
              style={{ filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))" }}
            />
            <p
              className="text-[30px] font-bold whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #e2e8f0, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              Clinic Topics
            </p>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute rounded-full p-1.5 transition-all duration-300 ease-in-out z-10 cursor-pointer border-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            right: "-14px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)",
          }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto sidebar-scrollbar">
        {/* Dashboard — standalone, always visible */}
        {renderNavLink(dashboardItem)}
        <div
          className="pt-1"
        >
          {/* Nav Groups — always expanded */}
          {navGroups.map((group) => {
            const hasActiveItem = isGroupActive(group);

            return (
              <div key={group.key} className="mb-1">
                {/* Group Label */}
                {!isCollapsed && (
                  <div
                    className="flex items-center w-full px-2.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em]"
                    style={{
                      color: hasActiveItem
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(148, 163, 184, 0.6)",
                    }}
                  >
                    <span>{group.label}</span>
                  </div>
                )}
                {isCollapsed && (
                  <div
                    className="flex justify-center px-2.5 py-1.5"
                    title={group.label}
                  >
                    <div
                      className="w-5 h-0.5 rounded-full"
                      style={{
                        background: hasActiveItem
                          ? "rgba(99, 102, 241, 0.6)"
                          : "rgba(148, 163, 184, 0.2)",
                      }}
                    />
                  </div>
                )}

                {/* Group Items — always visible */}
                <div className={`space-y-0.5 ${!isCollapsed ? "mt-0.5 ml-1" : ""}`}>
                  {group.items.map((item) => renderNavLink(item))}
                </div>

                {/* Sub Groups */}
                {group.subGroups?.map((subGroup) => {
                  const hasSubActive = subGroup.items.some(
                    (item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/")
                  );
                  return (
                    <div key={subGroup.label} className={`${!isCollapsed ? "mt-1" : "mt-0.5"}`}>
                      {!isCollapsed && (
                        <div
                          className="flex items-center w-full px-2.5 py-1 ml-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
                          style={{
                            color: hasSubActive
                              ? "rgba(107, 213, 177, 0.8)"
                              : "rgba(148, 163, 184, 0.4)",
                          }}
                        >
                          <span>{subGroup.label}</span>
                        </div>
                      )}
                      <div className={`space-y-0.5 ${!isCollapsed ? "ml-2" : ""}`}>
                        {subGroup.items.map((item) => renderNavLink(item, "small"))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ─── My Reposit — Doctor Only ─────────────────── */}
        <div
          className="mt-2 pt-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          {/* Section Label */}
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-3 mb-1.5">
              <Stethoscope
                className="w-3 h-3"
                style={{ color: "rgba(107, 213, 177, 0.8)" }}
              />
              <p
                className="text-[10px] font-semibold tracking-[0.15em] uppercase"
                style={{ color: "rgba(107, 213, 177, 0.7)" }}
              >
                Doctor Features
              </p>
            </div>
          )}

          {isCollapsed && (
            <div
              className="mx-3 mb-2"
              style={{ borderTop: "1px solid rgba(107, 213, 177, 0.15)" }}
            />
          )}

          {/* My Reposit Header */}
          <div
            className={`sidebar-nav-item flex items-center w-full ${isCollapsed ? "justify-center" : "gap-3"
              } px-2.5 py-1.5 rounded-lg text-[13px] font-medium
              ${location.pathname.startsWith("/my-reposit")
                ? "sidebar-nav-active"
                : "sidebar-nav-inactive"
              }`}
          >
            <Library className="w-[18px] h-[18px] shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left transition-opacity duration-300 ease-in-out">
                  My Reposit
                </span>
                <span
                  className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full shrink-0"
                  style={{
                    background: "rgba(107, 213, 177, 0.15)",
                    color: "#6bd5b1",
                    border: "none",
                    boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.1), inset -1px -1px 3px rgba(255, 255, 255, 0.05)",
                  }}
                >
                  Doctors
                </span>
              </>
            )}
          </div>

          {/* My Reposit Items — always visible */}
          {!isCollapsed && (
            <div
              className="mt-1 ml-3 pl-3 space-y-0.5"
              style={{ borderLeft: "2px solid rgba(107, 213, 177, 0.15)" }}
            >
              {myRepositItems.map((item) => renderNavLink(item, "small"))}
            </div>
          )}
        </div>
      </nav>

      {/* Admin User Section */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(0,0,0,0.12)",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className={`p-4 flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? "justify-center" : "gap-3"
            }`}
        >
          <button
            onClick={() => navigate("/profile")}
            className="shrink-0 cursor-pointer border-0 p-0"
            title={isCollapsed ? "Admin Profile" : ""}
            style={{ background: "transparent" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.3)",
              }}
            >
              <User className="w-[18px] h-[18px] text-white" />
            </div>
          </button>

          {!isCollapsed && (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="flex-1 min-w-0 transition-opacity duration-300 ease-in-out text-left cursor-pointer border-0 p-0"
                style={{ background: "transparent" }}
              >
                <p className="text-sm font-semibold truncate" style={{ color: "#e2e8f0" }}>
                  Admin User
                </p>
                <p className="text-xs truncate" style={{ color: "rgba(148, 163, 184, 0.7)" }}>
                  Administrator
                </p>
              </button>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg transition-all duration-200 ease-out shrink-0 cursor-pointer border-0"
                style={{
                  background: "transparent",
                  color: "rgba(148, 163, 184, 0.6)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.color = "#f87171";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(148, 163, 184, 0.6)";
                }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

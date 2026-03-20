import { useState, useEffect, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile sidebar on route change (via escape key as proxy)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="flex min-h-screen overflow-hidden" style={{ background: "linear-gradient(145deg, #eef2f7, #e6ebf3)" }}>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          className={`sidebar-backdrop ${isMobileSidebarOpen ? "active" : ""}`}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 ${isMobile ? `sidebar-mobile-drawer ${isMobileSidebarOpen ? "open" : ""}` : ""}`}>
        <Sidebar
          isCollapsed={isMobile ? false : isSidebarCollapsed}
          setIsCollapsed={isMobile ? () => setIsMobileSidebarOpen(false) : setIsSidebarCollapsed}
          isMobile={isMobile}
        />
      </div>

      {/* Main Area */}
      <div className={`flex-1 mt-2 flex flex-col transition-all duration-500 ease-in-out min-w-0 ${isMobile ? "ml-0" : (isSidebarCollapsed ? "ml-20" : "ml-68")
        }`}>
        <Topbar
          isSidebarCollapsed={isMobile ? true : isSidebarCollapsed}
          onMobileMenuToggle={isMobile ? () => setIsMobileSidebarOpen(!isMobileSidebarOpen) : undefined}
        />

        {/* Page Content */}
        <main className="main-content-area flex-1 p-5 overflow-y-auto overflow-x-hidden min-w-0 mt-14 flex flex-col">
          <div className="max-w-full min-w-0 flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

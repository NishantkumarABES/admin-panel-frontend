import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>
      {/* Main Area */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out min-w-0 ${isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}>
        <Topbar isSidebarCollapsed={isSidebarCollapsed} />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden min-w-0 mt-20">
          <div className="max-w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

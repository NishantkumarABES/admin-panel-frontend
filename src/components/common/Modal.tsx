import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-[18px] w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col ${className}`}
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {/* <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-all duration-200"
              style={{
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                e.currentTarget.style.boxShadow =
                  "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <X className="w-5 h-5" />
            </button> */}
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

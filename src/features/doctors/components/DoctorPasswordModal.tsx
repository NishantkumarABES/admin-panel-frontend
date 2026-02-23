import { useState } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import Modal from "../../../components/common/Modal";

interface DoctorPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  email: string;
  password: string;
}

export default function DoctorPasswordModal({
  isOpen,
  onClose,
  doctorName,
  email,
  password,
}: DoctorPasswordModalProps) {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy password:", error);
    }
  };

  const handleClose = () => {
    setCopied(false);
    setShowPassword(true);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Doctor Account Created" size="md">
      <div className="space-y-4">
        <div className="clay-inset" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
          <p className="text-sm text-emerald-800">
            Doctor account has been successfully created for <span className="font-semibold">{doctorName}</span>.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div
              className="px-3 py-2 rounded-xl text-sm text-gray-900"
              style={{
                background: "#eff1f5",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
              }}
            >
              {email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temporary Password
            </label>
            <div className="flex gap-2">
              <div
                className="flex-1 px-3 py-2 rounded-xl text-sm font-mono text-gray-900 flex items-center justify-between"
                style={{
                  background: "#eff1f5",
                  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
                }}
              >
                <span className="flex-1 break-all">
                  {showPassword ? password : "••••••••••••"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                }}
                title="Copy password"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="clay-inset" style={{ background: "rgba(255, 197, 84, 0.08)" }}>
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Important:</span> Please share this password securely with the doctor.
            They should change it after their first login. This password will not be shown again.
          </p>
        </div>

        <div className="flex justify-end pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
            style={{
              background: "#1f2937",
              boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

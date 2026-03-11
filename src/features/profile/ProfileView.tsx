import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  User, Lock, LogOut, Eye, EyeOff, CheckCircle2, Bell, X,
  Shield, BadgeCheck, Clock, ChevronRight, Sparkles, Camera, Loader2,
} from "lucide-react";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import AllNotificationsModal from "../notifications/AllNotificationsModal";
import Modal from "../../components/common/Modal";

export default function ProfileView() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({ ...passwordData, [field]: value });

    if (field === "newPassword") {
      setPasswordStrength({
        hasMinLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const validatePassword = () => {
    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return false;
    }
    if (!passwordData.newPassword) {
      toast.error("Please enter a new password");
      return false;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!Object.values(passwordStrength).every((v) => v)) {
      toast.error("Password does not meet all requirements");
      return false;
    }
    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsLoading(true);

    try {
      const res = await api.post("/auth/change-password/", {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      // API may return 200 with { success: false, detail: "..." }
      if (res.data?.success === false) {
        toast.error(res.data.detail || "Failed to change password");
        return;
      }

      setPasswordSuccess(true);
      setTimeout(() => {
        handleClosePasswordModal();
      }, 2000);
    } catch (error: any) {
      if (error.response?.data?.old_password) {
        toast.error("Current password is incorrect");
      } else {
        toast.error(error.response?.data?.detail || "Failed to change password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePasswordModal = () => {
    setIsChangingPassword(false);
    setPasswordSuccess(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordStrength({
      hasMinLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("profile_photo", file);

      const res = await api.patch("/profiles/admin/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = res.data?.profile_photo || URL.createObjectURL(file);
      updateUser({ profile_image: imageUrl });
      toast.success("Profile image updated!");
    } catch (error: any) {
      console.error("Error uploading profile image:", error);
      toast.error(error?.response?.data?.detail || "Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isPasswordValid = Object.values(passwordStrength).every((v) => v) &&
    passwordData.newPassword === passwordData.confirmPassword &&
    passwordData.currentPassword.length > 0;

  // Strength meter
  const strengthCount = Object.values(passwordStrength).filter(Boolean).length;
  const strengthPercent = (strengthCount / 5) * 100;
  const strengthColor = strengthCount <= 1 ? "#ff7070" : strengthCount <= 2 ? "#ff9f47" : strengthCount <= 3 ? "#ffc554" : strengthCount <= 4 ? "#4fcfa5" : "#059669";
  const strengthLabel = strengthCount <= 1 ? "Weak" : strengthCount <= 2 ? "Fair" : strengthCount <= 3 ? "Good" : strengthCount <= 4 ? "Strong" : "Excellent";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="min-w-0 max-w-full">

      {/* ─── Two-Column Layout ─── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ═══ LEFT: Profile Card ═══ */}
        <div className="flex-1 profile-animate-in profile-animate-delay-1">
          <div className="clay-card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Animated Gradient Banner */}
            <div
              className="profile-gradient-banner"
              style={{
                height: "120px",
                borderRadius: "18px 18px 0 0",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative floating dots */}
              <div style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
                <div style={{ position: "absolute", width: "80px", height: "80px", borderRadius: "50%", background: "white", top: "-20px", right: "10%", filter: "blur(20px)" }} />
                <div style={{ position: "absolute", width: "60px", height: "60px", borderRadius: "50%", background: "white", bottom: "-10px", left: "15%", filter: "blur(16px)" }} />
                <div style={{ position: "absolute", width: "40px", height: "40px", borderRadius: "50%", background: "white", top: "20px", left: "50%", filter: "blur(12px)" }} />
              </div>
            </div>

            <div style={{ padding: "0 28px 28px 28px" }}>
              {/* Avatar + Info */}
              <div className="flex items-start gap-5" style={{ marginTop: "-44px" }}>
                {/* Avatar with hover glow */}
                <div className="profile-avatar-wrapper" style={{ flexShrink: 0 }}>
                  <div className="profile-avatar-glow" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                  <div
                    className="clay-circle group cursor-pointer"
                    style={{
                      width: "88px",
                      height: "88px",
                      background: "#ffffff",
                      boxShadow: "6px 6px 14px rgba(0, 0, 0, 0.09), -6px -6px 14px rgba(255, 255, 255, 0.75)",
                      border: "3px solid #ffffff",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                  >
                    {user?.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                        style={{ borderRadius: "50%" }}
                      />
                    ) : (
                      <User className="w-11 h-11 text-gray-400" />
                    )}
                    {/* Camera overlay on hover */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{
                        background: "rgba(0, 0, 0, 0.4)",
                        borderRadius: "50%",
                      }}
                    >
                      {isUploadingImage ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5 text-white" />
                      )}
                    </div>

                  </div>
                </div>

                {/* User info */}
                <div style={{ marginTop: "52px", flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">{user?.full_name}</h1>
                    {user?.onboarding_complete && (
                      <BadgeCheck className="w-5 h-5 shrink-0" style={{ color: "#6b96ff" }} />
                    )}
                  </div>
                  <p className="text-sm mt-1 truncate" style={{ color: "#6b7280" }}>{user?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="clay-badge" style={{ color: "#6b96ff", background: "rgba(107, 150, 255, 0.08)" }}>
                      {user?.role || "Admin"}
                    </span>
                    <span className="clay-badge" style={{ color: "#4fcfa5", background: "rgba(79, 207, 165, 0.08)" }}>
                      Active
                    </span>
                    {user?.onboarding_complete && (
                      <span className="clay-badge" style={{ color: "#a285ff", background: "rgba(162, 133, 255, 0.08)" }}>
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <StatCard
                  icon={<Shield className="w-4 h-4" />}
                  iconColor="#6b96ff"
                  iconBg="rgba(107, 150, 255, 0.08)"
                  label="Role"
                  value={user?.role || "Admin"}
                />
                <StatCard
                  icon={<Sparkles className="w-4 h-4" />}
                  iconColor="#4fcfa5"
                  iconBg="rgba(79, 207, 165, 0.08)"
                  label="Status"
                  value={user?.state === "active" ? "Active" : user?.state || "Active"}
                />
                <StatCard
                  icon={<BadgeCheck className="w-4 h-4" />}
                  iconColor="#a285ff"
                  iconBg="rgba(162, 133, 255, 0.08)"
                  label="Email"
                  value={user?.onboarding_complete ? "Verified" : "Pending"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Quick Actions ═══ */}
        <div className="w-full lg:w-80 shrink-0 profile-animate-in profile-animate-delay-2">
          <div className="clay-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

            <div className="space-y-3">
              {/* Notifications */}
              <button
                onClick={() => setIsNotificationsModalOpen(true)}
                className="w-full clay-inset profile-action-row flex items-center gap-3"
                style={{ padding: "14px 16px", border: "none", background: "#eff1f5", textAlign: "left" }}
              >
                <div className="clay-circle" style={{ background: "rgba(107, 150, 255, 0.08)", width: "36px", height: "36px", flexShrink: 0 }}>
                  <Bell className="w-4 h-4" style={{ color: "#6b96ff" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Notifications</p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>View notification history</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </button>

              {/* Change Password */}
              <button
                onClick={() => setIsChangingPassword(true)}
                className="w-full clay-inset profile-action-row flex items-center gap-3"
                style={{ padding: "14px 16px", border: "none", background: "#eff1f5", textAlign: "left" }}
              >
                <div className="clay-circle" style={{ background: "rgba(162, 133, 255, 0.08)", width: "36px", height: "36px", flexShrink: 0 }}>
                  <Lock className="w-4 h-4" style={{ color: "#a285ff" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Change Password</p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>Update your credentials</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full clay-inset profile-action-row flex items-center gap-3"
                style={{ padding: "14px 16px", border: "none", background: "rgba(255, 112, 112, 0.04)", textAlign: "left" }}
              >
                <div className="clay-circle" style={{ background: "rgba(255, 112, 112, 0.08)", width: "36px", height: "36px", flexShrink: 0 }}>
                  <LogOut className="w-4 h-4" style={{ color: "#ff7070" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "#ff7070" }}>Logout</p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>End your current session</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
            </div>

            {/* Account info footer */}
            <div
              className="mt-5 flex items-center gap-2 pt-4"
              style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
              <Clock className="w-3.5 h-3.5" style={{ color: "#9ca3af" }} />
              <span className="text-xs" style={{ color: "#9ca3af" }}>
                Session active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Change Password Modal ─── */}
      <Modal isOpen={isChangingPassword} onClose={handleClosePasswordModal} title="Change Password">
        <div className="flex flex-col h-full">
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClosePasswordModal}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 z-10 active:scale-95 active:shadow-inner"
            style={{
              background: "#f8f9fb",
              boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.6)"
            }}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {passwordSuccess ? (
            /* ── Success State ── */
            <div className="flex flex-col items-center justify-center py-12 profile-success-anim">
              <div
                className="clay-circle"
                style={{
                  width: "72px",
                  height: "72px",
                  background: "rgba(79, 207, 165, 0.08)",
                  marginBottom: "16px",
                }}
              >
                <CheckCircle2 className="w-9 h-9" style={{ color: "#4fcfa5" }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Password Updated!</h3>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                Your password has been changed successfully.
              </p>
              <p className="text-xs mt-3" style={{ color: "#9ca3af" }}>This dialog will close automatically…</p>
            </div>
          ) : (
            /* ── Password Form ── */
            <form onSubmit={handleResetPassword} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar" style={{
                maxHeight: 'calc(80vh - 140px)',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 transparent'
              }}>
                {/* Current Password */}
                <div
                  className="rounded-xl px-5 py-4"
                  style={{
                    background: "#f8f9fb",
                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    Current Password
                  </h3>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      placeholder="Enter current password"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div
                  className="rounded-xl px-5 py-4"
                  style={{
                    background: "#f8f9fb",
                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    New Password
                  </h3>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      placeholder="Enter new password"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Strength Meter */}
                  {passwordData.newPassword && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-600">Password strength</span>
                        <span className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
                      </div>
                      <div className="profile-strength-bar">
                        <div
                          className="profile-strength-fill"
                          style={{
                            width: `${strengthPercent}%`,
                            background: strengthColor,
                          }}
                        />
                      </div>

                      {/* Requirements checklist */}
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        <PasswordRequirement met={passwordStrength.hasMinLength} text="8+ characters" />
                        <PasswordRequirement met={passwordStrength.hasUpperCase} text="Uppercase" />
                        <PasswordRequirement met={passwordStrength.hasLowerCase} text="Lowercase" />
                        <PasswordRequirement met={passwordStrength.hasNumber} text="Number" />
                        <PasswordRequirement met={passwordStrength.hasSpecialChar} text="Special char" />
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                        placeholder="Confirm new password"
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-sm mt-2" style={{ color: "#ff7070" }}>Passwords do not match</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit footer */}
              <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
                borderTop: "1px solid rgba(0,0,0,0.06)",
                marginLeft: "-2px",
                marginRight: "-2px",
                paddingLeft: "2px",
                paddingRight: "2px"
              }}>
                <button
                  type="submit"
                  disabled={!isPasswordValid || isLoading}
                  className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: "#1f2937",
                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating…</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* All Notifications Modal */}
      <AllNotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="clay-inset text-center" style={{ padding: "14px 10px" }}>
      <div
        className="clay-circle mx-auto"
        style={{ width: "32px", height: "32px", background: iconBg, color: iconColor, marginBottom: "8px" }}
      >
        {icon}
      </div>
      <p className="text-xs" style={{ color: "#9ca3af" }}>{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <CheckCircle2
        className={`w-3.5 h-3.5 transition-colors ${met ? "text-green-600" : "text-gray-300"}`}
      />
      <span className={`text-xs transition-colors ${met ? "text-green-700" : "text-gray-500"}`}>
        {text}
      </span>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User, Lock, LogOut, Eye, EyeOff, CheckCircle2, Bell } from "lucide-react";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import AllNotificationsModal from "../notifications/AllNotificationsModal";

export default function ProfileView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

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

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/change-password/", {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
      setPasswordStrength({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isPasswordValid = Object.values(passwordStrength).every((v) => v) &&
    passwordData.newPassword === passwordData.confirmPassword &&
    passwordData.currentPassword.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-2">
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-linear-to-r from-blue-900 to-blue-800 h-32"></div>
            <div className="px-8 pb-8">
              <div className="flex items-start gap-6 -mt-16">
                <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-600" />
                </div>
                <div className="mt-16 flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">{user?.full_name}</h1>
                  <p className="text-lg text-gray-600 mt-1">{user?.email}</p>
                  <div className="flex gap-3 mt-4">
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium">Role: {user?.role || "Admin"}</p>
                    </div>
                    <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                      <p className="text-sm font-medium">Status: Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">View All Notifications</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    View your notification history and manage preferences
                  </p>
                </div>
                <button
                  onClick={() => setIsNotificationsModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  View Notifications
                </button>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-semibold text-gray-900">Security</h2>
            </div>

            {!isChangingPassword ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Change your password to keep your account secure
                      </p>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicators */}
                  {passwordData.newPassword && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Password requirements:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <PasswordRequirement
                          met={passwordStrength.hasMinLength}
                          text="At least 8 characters"
                        />
                        <PasswordRequirement
                          met={passwordStrength.hasUpperCase}
                          text="One uppercase letter"
                        />
                        <PasswordRequirement
                          met={passwordStrength.hasLowerCase}
                          text="One lowercase letter"
                        />
                        <PasswordRequirement met={passwordStrength.hasNumber} text="One number" />
                        <PasswordRequirement
                          met={passwordStrength.hasSpecialChar}
                          text="One special character"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-sm text-red-600 mt-2">Passwords do not match</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={!isPasswordValid || isLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Logout Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <LogOut className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-semibold text-gray-900">Session</h2>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Logout</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sign out of your account and end your current session
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Notifications Modal */}
      <AllNotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />
    </div>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        className={`w-4 h-4 ${met ? "text-green-600" : "text-gray-300"}`}
      />
      <span className={`text-sm ${met ? "text-green-700" : "text-gray-500"}`}>
        {text}
      </span>
    </div>
  );
}

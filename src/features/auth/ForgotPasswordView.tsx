import { api } from "../../services/api";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, KeyRound, ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import logo from "../../assets/logo.svg";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordView() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // ── Step 1: Request OTP ──────────────────────────────
    const handleSendOtp = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await api.post("auth/admin/forgot-password/request/", { email });
            setSuccess("A verification code has been sent to your email.");
            setStep("otp");
        } catch (err: any) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to send verification code. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 2: Verify OTP ──────────────────────────────
    const handleVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            await api.post("auth/admin/forgot-password/verify/", { email, otp });
            setSuccess("Code verified! Set your new password.");
            setStep("reset");
        } catch (err: any) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Invalid or expired code. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 3: Reset Password ──────────────────────────
    const handleResetPassword = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setIsLoading(true);

        try {
            await api.post("/auth/admin/forgot-password/reset/", {
                email,
                new_password: newPassword,
            });
            setIsComplete(true);
            setSuccess("Your password has been reset successfully!");
        } catch (err: any) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to reset password. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step indicator ──────────────────────────────────
    const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
        { key: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
        { key: "otp", label: "Verify", icon: <ShieldCheck className="w-4 h-4" /> },
        { key: "reset", label: "Reset", icon: <KeyRound className="w-4 h-4" /> },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === step);

    // ── Render ──────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-lg mb-4">
                        <img src={logo} alt="Clinic Topics Logo" className="w-12 h-12 shrink-0" />
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-900">Reset Password</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === "email" && "Enter your email to receive a verification code"}
                        {step === "otp" && "Enter the verification code sent to your email"}
                        {step === "reset" && "Choose a new password for your account"}
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2">
                    {steps.map((s, idx) => (
                        <div key={s.key} className="flex items-center gap-2">
                            <div
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${idx < currentStepIndex
                                    ? "bg-green-100 text-green-700"
                                    : idx === currentStepIndex
                                        ? "bg-gray-900 text-white"
                                        : "bg-gray-100 text-gray-400"
                                    }`}
                            >
                                {idx < currentStepIndex ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                    s.icon
                                )}
                                {s.label}
                            </div>
                            {idx < steps.length - 1 && (
                                <div
                                    className={`w-6 h-px ${idx < currentStepIndex ? "bg-green-300" : "bg-gray-200"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    {/* Success state after password reset */}
                    {isComplete ? (
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full">
                                <CheckCircle2 className="w-7 h-7 text-green-600" />
                            </div>
                            <p className="text-sm text-green-700">{success}</p>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md text-sm font-medium !text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Messages */}
                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}
                            {success && !error && (
                                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                                    {success}
                                </div>
                            )}

                            {/* ─── Step 1: Email ─── */}
                            {step === "email" && (
                                <form onSubmit={handleSendOtp} className="space-y-6">
                                    <div>
                                        <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-900 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            required
                                            maxLength={254}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                                            placeholder="admin@example.com"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4" />
                                                Send Verification Code
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* ─── Step 2: OTP ─── */}
                            {step === "otp" && (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div>
                                        <label htmlFor="otp" className="block text-sm font-medium text-gray-900 mb-2">
                                            Verification Code
                                        </label>
                                        <input
                                            id="otp"
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors text-center tracking-[0.3em] text-lg font-mono"
                                            placeholder="000000"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">
                                            Enter the 6-digit code sent to <span className="font-medium">{email}</span>
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading || otp.length < 4}
                                        className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-4 h-4" />
                                                Verify Code
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setError("");
                                            setSuccess("");
                                            setOtp("");
                                            setStep("email");
                                        }}
                                        className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        Didn't receive a code? Go back
                                    </button>
                                </form>
                            )}

                            {/* ─── Step 3: Reset Password ─── */}
                            {step === "reset" && (
                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    {/* New Password */}
                                    <div>
                                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-900 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="new-password"
                                                type={showNewPassword ? "text" : "password"}
                                                required
                                                minLength={8}
                                                maxLength={128}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                                            >
                                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-900 mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="confirm-password"
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                minLength={8}
                                                maxLength={128}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Resetting...
                                            </>
                                        ) : (
                                            <>
                                                <KeyRound className="w-4 h-4" />
                                                Reset Password
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>

                {/* Back to login link */}
                {!isComplete && (
                    <div className="text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </Link>
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-gray-500">
                    Clinic Topics Admin Panel &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}

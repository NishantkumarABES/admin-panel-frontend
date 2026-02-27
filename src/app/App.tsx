import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import AppRoutes from "./routes";
import LoginView from "../features/auth/LoginView";
import ForgotPasswordView from "../features/auth/ForgotPasswordView";
import { AuthProvider, useAuth } from "../context/AuthContext";

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for auth initialization to complete
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <AppRoutes />
    </AdminLayout>
  );
}

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for auth initialization to complete
  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <LoginView />;
}

function ForgotPasswordRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <ForgotPasswordView />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

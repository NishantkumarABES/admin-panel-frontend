import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import AppRoutes from "./routes";
import LoginView from "../features/auth/LoginView";
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

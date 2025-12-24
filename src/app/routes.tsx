import { Routes, Route } from "react-router-dom";
// src\app\routes.tsx
// src\features\dashboard\DashboardView.tsx
import DashboardView from "../features/dashboard/DashboardView";
import DoctorsView from "../features/doctors/DoctorsView";
import PatientsView from "../features/patients/PatientsView";
import ProductsView from "../features/products/ProductsView";
import TopicsView from "../features/topics/TopicsView";
import EventsView from "../features/events/EventsView";
import AuditLogsView from "../features/audit/AuditLogsView";
import SettingsView from "../features/settings/SettingsView";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardView />} />
      <Route path="/doctors" element={<DoctorsView />} />
      <Route path="/patients" element={<PatientsView />} />
      <Route path="/products" element={<ProductsView />} />
      <Route path="/topics" element={<TopicsView />} />
      <Route path="/events" element={<EventsView />} />
      <Route path="/audit" element={<AuditLogsView />} />
      <Route path="/settings" element={<SettingsView />} />
    </Routes>
  );
}

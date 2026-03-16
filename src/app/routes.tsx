import { Routes, Route } from "react-router-dom";
// src\app\routes.tsx
// src\features\dashboard\DashboardView.tsx
import DashboardView from "../features/dashboard/DashboardView";
import DoctorsView from "../features/doctors/DoctorsView";
import PatientsView from "../features/patients/PatientsView";
import ProductsView from "../features/products/ProductsView";
import ProductDetailView from "../features/products/ProductDetailView";
import CouponView from "../features/coupon/CouponView";
import BannersView from "../features/banners/BannersView";
import TopicsView from "../features/topics/TopicsView";
import EventsView from "../features/events/EventsView";
import OrdersView from "../features/orders/OrdersView";
import RefundsView from "../features/orders/RefundsView";
import SettingsView from "../features/settings/SettingsView";
import AdvertisementsView from "../features/Advertisements/AdvertisementsView";
import IDIView from "../features/IDI/IDIView";
import AdvisoryView from "../features/Advisory/AdvisoryView";
import ProfileView from "../features/profile/ProfileView";
import BooksView from "../features/my-reposit/books/BooksView";
import ArticlesView from "../features/my-reposit/articles/ArticlesView";
import VideosView from "../features/my-reposit/videos/VideosView";
import JobsView from "../features/my-reposit/jobs/JobsView";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardView />} />
      <Route path="/doctors" element={<DoctorsView />} />
      <Route path="/patients" element={<PatientsView />} />
      <Route path="/products/:id" element={<ProductDetailView />} />
      <Route path="/products" element={<ProductsView />} />
      <Route path="/coupons" element={<CouponView />} />
      <Route path="/banners" element={<BannersView />} />
      <Route path="/orders" element={<OrdersView />} />
      <Route path="/refunds" element={<RefundsView />} />
      <Route path="/topics" element={<TopicsView />} />
      <Route path="/events" element={<EventsView />} />
      <Route path="/advertisements" element={<AdvertisementsView />} />
      <Route path="/IDI" element={<IDIView />} />
      <Route path="/advisory" element={<AdvisoryView />} />
      <Route path="/settings" element={<SettingsView />} />
      <Route path="/profile" element={<ProfileView />} />
      <Route path="/my-reposit/books" element={<BooksView />} />
      <Route path="/my-reposit/articles" element={<ArticlesView />} />
      <Route path="/my-reposit/videos" element={<VideosView />} />
      <Route path="/my-reposit/jobs" element={<JobsView />} />
    </Routes>
  );
}

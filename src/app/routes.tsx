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
import TopicDetailView from "../features/topics/TopicDetailView";
import AddEditTopicPage from "../features/topics/AddEditTopicPage";
import EventsView from "../features/events/EventsView";
import OrdersView from "../features/orders/OrdersView";
import OrderDetailView from "../features/orders/OrderDetailView";
import RefundsView from "../features/orders/RefundsView";
import RefundDetailView from "../features/orders/RefundDetailView";
import SettingsView from "../features/settings/SettingsView";
import AdvertisementsView from "../features/Advertisements/AdvertisementsView";
import IDIView from "../features/IDI/IDIView";
import AdvisoryView from "../features/Advisory/AdvisoryView";
import ProfileView from "../features/profile/ProfileView";
import BooksView from "../features/my-reposit/books/BooksView";
import ArticlesView from "../features/my-reposit/articles/ArticlesView";
import VideosView from "../features/my-reposit/videos/VideosView";
import JobsView from "../features/my-reposit/jobs/JobsView";
import JobDetailView from "../features/my-reposit/jobs/JobDetailView";
import OtherView from "../features/other/OtherView";
import SoCouponView from "../features/other/so-coupon/SoCouponView";
import AppCategoriesView from "../features/other/app-categories/AppCategoriesView";

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
      <Route path="/orders/:id" element={<OrderDetailView />} />
      <Route path="/orders" element={<OrdersView />} />
      <Route path="/refunds/:id" element={<RefundDetailView />} />
      <Route path="/refunds" element={<RefundsView />} />
      <Route path="/topics/new" element={<AddEditTopicPage />} />
      <Route path="/topics/:id" element={<TopicDetailView />} />
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
      <Route path="/my-reposit/jobs/:id" element={<JobDetailView />} />
      <Route path="/my-reposit/jobs" element={<JobsView />} />
      <Route path="/other" element={<OtherView />} />
      <Route path="/other/so-coupons" element={<SoCouponView />} />
      <Route path="/other/app-categories" element={<AppCategoriesView />} />
    </Routes>
  );
}

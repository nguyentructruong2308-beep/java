import React, { useEffect } from "react"; // Đã thêm useEffect
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import useAuth from "./hooks/useAuth";
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ClientLayout from "./components/layout/ClientLayout";

// Import thư viện hiệu ứng AOS (Animate On Scroll)
import AOS from "aos";
import "aos/dist/aos.css";

// Thêm 2 dòng import cho Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 🧱 Client pages
import HomePage from "./pages/client/HomePage";
import ProductDetailPage from "./pages/client/ProductDetailPage";
import CartPageClient from "./pages/client/CartPage";
import CheckoutPage from "./pages/client/CheckoutPage";
import ClientLoginPage from "./pages/client/LoginPage";
import RegisterPage from "./pages/client/RegisterPage";
import OrderSuccessPage from './pages/client/OrderSuccessPage';
import ProductsByCategoryPage from './pages/client/ProductsByCategoryPage';
import ProfilePage from "./pages/client/ProfilePage";
import SearchResultsPage from "./pages/client/SearchResultPage";
import PaymentResultPage from "./pages/client/PaymentResultPage.jsx";
import WishlistPage from "./pages/client/WishlistPage.jsx";
import ForgotPasswordPage from "./pages/client/ForgotPasswordPage";
import ResetPasswordPage from "./pages/client/ResetPasswordPage";
import MenuPage from "./pages/client/MenuPage";
import AboutPage from "./pages/client/AboutPage";
import ContactPage from "./pages/client/ContactPage";
import BlogPage from "./pages/client/BlogPage";
import BlogDetailPage from "./pages/client/BlogDetailPage";
import FloatingChatWidget from "./components/FloatingChatWidget";
import VoucherPage from "./pages/client/VoucherPage";

// 🧱 Admin pages
import Dashboard from "./pages/admin/Dashboard";
import ProductPage from "./pages/admin/ProductPage";
import CategoryPage from "./pages/admin/CategoryPage";
import OrderPage from "./pages/admin/OrderPage";
import UserPage from "./pages/admin/UserPage";
import CartPageAdmin from "./pages/admin/CartPage";
import AdminLoginPage from "./pages/admin/LoginPage";
import RefundPage from "./pages/admin/RefundPage";
import PromotionBannerPage from "./pages/admin/PromotionBannerPage";
import ToppingPage from "./pages/admin/ToppingPage";
import StatisticsPage from "./pages/admin/StatisticsPage";
import DiscountPage from "./pages/admin/DiscountPage";
import BlogManagementPage from "./pages/admin/BlogManagementPage";
import ContactManagementPage from "./pages/admin/ContactManagementPage";
import ReviewPage from "./pages/admin/ReviewPage";
import InventoryPage from "./pages/admin/InventoryPage";
import DealPage from "./pages/admin/DealPage";



function PrivateRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdminAuthenticated } = useAuth();

  if (adminOnly) {
    if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;
    return children;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  // --- KÍCH HOẠT HIỆU ỨNG AOS ---
  useEffect(() => {
    AOS.init({
      offset: 100,        // Khoảng cách từ dưới lên trước khi hiện (px)
      duration: 800,      // Thời gian chạy hiệu ứng (ms)
      easing: 'ease-in-out', // Kiểu chuyển động mượt mà
      once: false,        // false = lướt lên xuống đều chạy lại hiệu ứng
    });

    // Refresh lại hiệu ứng khi route thay đổi (để tránh lỗi layout)
    AOS.refresh();
  }, []);

  return (
    <AuthProvider>
      {/* Cấu trúc Layout cho Toastify */}
      <>
        <Routes>
          {/* 🧍‍♂️ Client routes */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<HomePage />} /> {/* Sử dụng index route */}
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPageClient />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
            <Route path="category/:categoryId" element={<ProductsByCategoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="payment-result" element={<PaymentResultPage />} />
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:id" element={<BlogDetailPage />} />
            <Route path="vouchers" element={<VoucherPage />} />
          </Route>
          <Route path="/login" element={<ClientLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* 🧑‍💼 Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute adminOnly>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="users" element={<UserPage />} />
            <Route path="carts" element={<CartPageAdmin />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="refunds" element={<RefundPage />} />
            <Route path="banners" element={<PromotionBannerPage />} />
            <Route path="toppings" element={<ToppingPage />} />
            <Route path="discounts" element={<DiscountPage />} />
            <Route path="blogs" element={<BlogManagementPage />} />
            <Route path="contacts" element={<ContactManagementPage />} />
            <Route path="reviews" element={<ReviewPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="deals" element={<DealPage />} />
          </Route>



          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Component ToastContainer để hiển thị thông báo */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          limit={3}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        {/* AI Chat Widget */}
        <FloatingChatWidget />
      </>
    </AuthProvider>
  );
}
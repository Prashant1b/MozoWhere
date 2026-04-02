import { Routes, Route, useLocation } from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import Home from "./Components/Home";
import MozowhereResponsiveHeader from "./Components/Header/MozowhereResponsiveHeader";
import Footer from "./Components/Footer";

// Lazy-loaded pages (only loaded when user navigates to them)
const CustomizeListingPage = lazy(() => import("./Pages/CustomizeListingPage"));
const CustomizeAccessoriesPage = lazy(() => import("./Pages/CustomizeAccessoriesPage"));
const CustomizerPage = lazy(() => import("./Pages/CustomizerPage"));
const BulkOrder = lazy(() => import("./Pages/Bulkorderpage"));
const TrendingCategoriesPage = lazy(() => import("./Pages/TrendingPage"));
const NotFound = lazy(() => import("./Pages/PagenotFound"));
const Login = lazy(() => import("./Pages/Login"));
const Signup = lazy(() => import("./Pages/SignupPage"));
const Profile = lazy(() => import("./Pages/Profile"));
const CartPage = lazy(() => import("./Pages/CartPage"));
const CheckoutPage = lazy(() => import("./Pages/CheckoutPage"));
const ShopNowSections = lazy(() => import("./Pages/ShopNowSections"));
const ProductDetailMobile = lazy(() => import("./Pages/ProductDetailMobile"));
const MyOrdersPage = lazy(() => import("./Pages/MyOrdersPage"));
const TrackOrdersPage = lazy(() => import("./Pages/TrackOrdersPage"));
const WishlistPage = lazy(() => import("./Pages/WishlistPage"));
const AccessoriesItemsPage = lazy(() => import("./Pages/AccessoriesItemsPage"));
const ContactPage = lazy(() => import("./Pages/ContactPage"));
const FAQPage = lazy(() => import("./Pages/FAQPage"));
const ReturnsPage = lazy(() => import("./Pages/ReturnsPage"));
const PrivacyPage = lazy(() => import("./Pages/PrivacyPage"));
const TermsPage = lazy(() => import("./Pages/TermsPage"));
const OffersPage = lazy(() => import("./Pages/OffersPage"));
const FanbookPage = lazy(() => import("./Pages/FanbookPage"));
const StoresPage = lazy(() => import("./Pages/StoresPage"));

// Admin pages (lazy - only admins need these)
const AdminRoute = lazy(() => import("./routes/AdminRoute"));
const AdminLayout = lazy(() => import("./Pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./Pages/admin/AdminDashboard"));
const AdminOrdersPage = lazy(() => import("./Pages/admin/AdminOrdersPage"));
const AdminProductsPage = lazy(() => import("./Pages/admin/AdminProductsPage"));
const AdminCategoriesPage = lazy(() => import("./Pages/admin/AdminCategoriesPage"));
const AdminCustomizeTemplatesPage = lazy(() => import("./Pages/admin/AdminCustomizeTemplatesPage"));

const AdminVariantsPage = lazy(() => import("./Pages/admin/AdminVariantsPage"));
const AdminCouponsPage = lazy(() => import("./Pages/admin/AdminCouponsPage"));
const AdminBulkOrdersPage = lazy(() => import("./Pages/admin/AdminBulkOrdersPage"));
const AdminServicesPage = lazy(() => import("./Pages/admin/AdminServicesPage"));
const AdminUsersPage = lazy(() => import("./Pages/admin/AdminUsersPage"));
const AdminDeliveryChargesPage = lazy(() => import("./Pages/admin/AdminDeliveryChargesPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
    </div>
  );
}

export default function App() {
  const [shopIn, setShopIn] = useState("Men");
  const { pathname } = useLocation();

  const hideHeaderOn = new Set(["/login", "/signup"]);
  const isAdmin = pathname.startsWith("/admin");
  const showHeader = !hideHeaderOn.has(pathname) && !isAdmin;
  const hideFooter = hideHeaderOn.has(pathname) || isAdmin;

  return (
    <>
      {showHeader && (
        <MozowhereResponsiveHeader
          mobileShopIn={shopIn}
          setMobileShopIn={setShopIn}
        />
      )}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home gender={shopIn} />} />
          <Route path="/custom-tshirts" element={<CustomizeListingPage />} />
          <Route path="/custom-accessories" element={<CustomizeAccessoriesPage />} />
          <Route path="/bulk-order" element={<BulkOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/track" element={<TrackOrdersPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/customizer" element={<CustomizerPage />} />
          <Route path="/customizer/:slug" element={<CustomizerPage />} />
          <Route path="/trending" element={<TrendingCategoriesPage />} />
          <Route path="/shop" element={<ShopNowSections selectedGender={shopIn} />} />
          <Route path="/accessories" element={<AccessoriesItemsPage />} />
          <Route path="/product/:slug" element={<ProductDetailMobile />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/fanbook" element={<FanbookPage />} />
          <Route path="/stores" element={<StoresPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="customize-templates" element={<AdminCustomizeTemplatesPage />} />

              <Route path="variants" element={<AdminVariantsPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="bulk-orders" element={<AdminBulkOrdersPage />} />
              <Route path="delivery-charges" element={<AdminDeliveryChargesPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {!hideFooter && <Footer />}
    </>
  );
}

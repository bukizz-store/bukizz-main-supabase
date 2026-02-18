import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./views/pages/HomePage";
import SchoolViewPage from "./views/pages/SchoolViewPage";
import CartPage from "./views/pages/CartPage";
import CheckoutPage from "./views/pages/CheckoutPage";
// import OrderSuccessPage from "./views/pages/OrderSuccessPage"; // Replaced
import OrderConfirmationPage from "./views/pages/OrderConfirmationPage";
import OrdersPage from "./views/pages/OrdersPage";
import ProductViewPage from "./views/pages/ProductViewPage";
import CategoryProductsPage from "./views/pages/CategoryProductsPage";
import ResetPasswordPage from "./views/pages/ResetPasswordPage";
import CategoryPage from "./views/pages/CategoryPage";
import VerifyEmailPage from "./views/pages/VerifyEmailPage";
import ProfilePage from "./views/pages/ProfilePage";
import MyCityPage from "./views/pages/MyCityPage";

import ContactUsPage from "./views/pages/ContactUsPage";
import PaymentPolicyPage from "./views/pages/PaymentPolicyPage";
import ShippingPolicyPage from "./views/pages/ShippingPolicyPage";
import CancellationRefundPage from "./views/pages/CancellationRefundPage";
import TermsOfUsePage from "./views/pages/TermsOfUsePage";
import PrivacyPolicyPage from "./views/pages/PrivacyPolicyPage";
import Navbar from "./components/Common/Navbar";
import SchoolScreen from "./views/pages/SchoolScreen";
import Footer from "./components/Common/Footer";
import NotificationContainer from "./components/Common/NotificationContainer";
import ScrollToTop from "./components/Common/ScrollToTop";
import useAuthStore from "./store/authStore";

import CitySelectionPopup from "./components/Common/CitySelectionPopup";

import useUIStore from "./store/uiStore";
import { supabase } from "./store/supabaseClient";

// Main App Component
function App() {
  const { initialize, loading, isHydrated } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const { isCityPopupOpen, openCityPopup, closeCityPopup } = useUIStore();

  // Check for mobile app mode
  const [isMobileApp, setIsMobileApp] = useState(false);
  const { handleGoogleCallback } = useAuthStore();

  useEffect(() => {
    // Listen for auth state changes from Supabase
    // This handles the redirect flow more reliably than manually checking the hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase Auth Event:", event);

      if (event === 'SIGNED_IN' && session) {
        // Check if we already have a user in our store to avoid unnecessary re-loading loops
        // triggered by Supabase's auto-refresh on window focus (visibility change)
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          console.log("User already authenticated in store, skipping backend sync on SIGNED_IN event.");
          return;
        }

        console.log("User signed in via Supabase, triggering backend sync...");
        // Check if this is a Google login callback (usually has provider_token or just by context of being a redirect)
        // For simplicity and robustness, we always ensure backend verification on SIGNED_IN if we don't have a backend token
        await handleGoogleCallback(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleGoogleCallback]);


  useEffect(() => {
    // Check localStorage or URL params for mobile app indicator
    const checkMobileApp = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const isApp = localStorage.getItem("isMobileApp") === "true" ||
        searchParams.has("mode") && searchParams.get("mode") === "webview";

      // Check for city param
      const cityParam = searchParams.get("city");
      if (cityParam) {
        localStorage.setItem("selectedCity", cityParam);
      } else {
        // Check if city is selected in local storage
        const storedCity = localStorage.getItem("selectedCity");
        if (!storedCity) {
          // Default to Kanpur automatically
          localStorage.setItem("selectedCity", "kanpur");
          // openCityPopup(); // Removed popup trigger
        }
      }

      if (isApp) {
        setIsMobileApp(true);
        // Persist to localStorage if it came from URL
        if (searchParams.get("mode") === "webview") {
          localStorage.setItem("isMobileApp", "true");
        }
      }
    };

    checkMobileApp();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize authentication system on app startup
        await initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error("App initialization failed:", error);
        setIsInitialized(true); // Still allow app to load
      }
    };

    initializeApp();
  }, [initialize]);

  // Show loading spinner while waiting for hydration and authentication check
  if (!isHydrated || !isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F3F8FF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isHydrated ? "Loading..." : "Authenticating..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className={`flex flex-col min-h-screen bg-[#F3F8FF] ${isMobileApp ? "mobile-app-view" : ""}`}>
        {/* City Selection Popup */}
        {isCityPopupOpen && <CitySelectionPopup onClose={closeCityPopup} />}

        {/* Notification Container for error/success popups */}
        <NotificationContainer />

        {!isMobileApp && (
          <div className="flex justify-center bg-[#F3F8FF] pt-0 md:pt-6">
            <Navbar />
          </div>
        )}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/school" element={<SchoolViewPage />} />
          <Route path="/school/:id" element={<SchoolScreen />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/my-city" element={<MyCityPage />} />
          <Route path="/order-success/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/product" element={<ProductViewPage />} />
          <Route path="/product/:id" element={<ProductViewPage />} />
          <Route path="/products" element={<CategoryProductsPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/category" element={<CategoryPage />} />


          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/payment-policy" element={<PaymentPolicyPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/cancellation-refund" element={<CancellationRefundPage />} />
          <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        </Routes>

        {!isMobileApp && (
          <div className="relative mt-auto flex-col flex w-full">
            {/* Footer Background Image - Absolute at bottom */}
            <div className="absolute bottom-0 left-0 w-full z-0">
              <img
                src="/footer_back.svg"
                alt="Background"
                className="w-full h-screen md:h-auto object-cover object-bottom"
              />
            </div>

            {/* Footer Content - Relative to stack on top */}
            <div className="relative z-10 w-full">
              <Footer />
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;

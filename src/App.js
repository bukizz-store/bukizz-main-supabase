import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import SchoolViewPage from "./pages/SchoolViewPage";
import CartPage from "./pages/navigationRoute/CartPage";
import CheckoutPage from "./pages/navigationRoute/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import ProductViewPage from "./pages/ProductViewPage";
import AdminProductPage from "./pages/AdminProductPage";
import AdminProductEditPage from "./pages/AdminProductEditPage";
import ProductListPage from "./pages/ProductListPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import ProfilePage from "./pages/navigationRoute/ProfilePage";
import MyCityPage from "./pages/navigationRoute/MyCityPage";
import Navbar from "./components/Navbar";
import SchoolScreen from "./pages/SchoolScreen";
import Footer from "./components/Footer";
import NotificationContainer from "./components/NotificationContainer";
import useAuthStore from "./store/authStore";

function App() {
  const { initialize, loading, isHydrated } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

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
      {/* Notification Container for error/success popups */}
      <NotificationContainer />

      <div className="flex justify-center bg-[#F3F8FF]">
        <Navbar />
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/school" element={<SchoolViewPage />} />
        <Route path="/school/:id" element={<SchoolScreen />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/my-city" element={<MyCityPage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
        <Route path="/product" element={<ProductViewPage />} />
        <Route path="/product/:id" element={<ProductViewPage />} />
        <Route path="/products" element={<CategoryProductsPage />} />
        <Route path="/admin/products" element={<AdminProductPage />} />
        <Route path="/admin/products/list" element={<ProductListPage />} />
        <Route
          path="/admin/products/edit/:id"
          element={<AdminProductEditPage />}
        />
      </Routes>
      <div className="relative mt-auto flex-col flex">
        <img
          src="/footer_back.svg"
          alt="App Promotion"
          className="w-full h-auto"
        />
        <div className="absolute inset-0 flex items-end">
          <Footer />
        </div>
        <p className="bg-white text-center">
          © 2025 Bukizz. All rights reserved.
        </p>
      </div>
    </Router>
  );
}

export default App;

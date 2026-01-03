import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";
import AuthModal from "../Auth/AuthModal";
import CitySelector from "../Common/CitySelector";

const Navbar = () => {
  const { user, isModalOpen, setModalOpen, logout } = useAuthStore();
  const { cart, loadCart } = useCartStore();
  const navigate = useNavigate();

  // Load cart on component mount
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only load once on mount

  const handleProfileClick = () => {
    if (!user) {
      setModalOpen(true);
    } else {
      navigate("/profile");
    }
  };

  const handleCartClick = () => {
    navigate("/checkout");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  // Extract first name from user object - supports both 'name' and 'full_name' properties
  const firstName = user
    ? (user.name || user.full_name || "User").split(" ")[0]
    : "";

  return (
    <>
      <div className="h-16 bg-white shadow-md flex items-center justify-between px-4 md:px-8 m-4 md:m-12 w-auto md:w-full rounded-2xl md:rounded-full">
        <button onClick={handleLogoClick} className="flex-shrink-0 hover:opacity-80">
          <img src="/Logo.svg" alt="Bukizz Logo" className="h-8 md:h-12 w-auto" />
        </button>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button onClick={() => navigate("/profile?tab=city")}>
            <img src="/image 54.png" alt="Menu" className="h-8 md:h-12 " />
          </button>
          <button>
            <img src="/image 55.png" alt="Search" className="h-8 md:h-12" />
          </button>

          <button className="text-gray-700 hover:text-blue-600 items-center flex flex-col">
            <img
              src="/notification_svg.svg"
              alt="Notification"
              className="h-6 w-6"
            />
            <p className="hidden md:block">Notification</p>
          </button>
          <button
            onClick={handleCartClick}
            className="text-gray-700 hover:text-blue-600 items-center flex flex-col relative"
          >
            <div className="relative">
              <img src="/cart_svg.svg" alt="Cart" className="h-6 w-6" />
              {cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.totalItems > 99 ? "99+" : cart.totalItems}
                </span>
              )}
            </div>
            <p className="hidden md:block">Cart</p>
          </button>
          {user ? (
            <button
              onClick={handleProfileClick}
              className="text-gray-700 hover:text-blue-600 flex flex-col items-center space-y-1"
            >
              <img src="/profile_svg.svg" alt="Profile" className="h-6 w-6" />
              <span className="text-xs font-medium whitespace-nowrap hidden md:block">
                {firstName}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2 font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="hidden md:block">Login</span>
            </button>
          )}
        </div>
      </div>
      <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Navbar;

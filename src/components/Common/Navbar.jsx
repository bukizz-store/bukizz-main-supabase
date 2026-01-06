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
      <div className="h-14 bg-white shadow-md flex items-center justify-between px-4 md:px-8 mx-0 mt-0 md:mb-3 md:mx-12 w-full md:w-full rounded-none md:rounded-full">
        {/* Left Side: Menu + Logo */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Menu Button - Visible on Mobile */}
          <button onClick={() => navigate("/profile?tab=city")} className="md:hidden">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-black"
            >
              <path
                d="M4 12H20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 6H20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 18H20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button onClick={handleLogoClick} className="flex-shrink-0 hover:opacity-80">
            <img src="/Logo.svg" alt="Bukizz Logo" className="h-12 w-auto" />
          </button>
        </div>

        {/* Right Side: Login/Profile + Cart */}
        <div className="flex items-center space-x-3 md:space-x-4">

          {/* Desktop only items */}
          <button onClick={() => navigate("/profile?tab=city")} className="hidden md:block">
            <img src="/image 54.png" alt="Menu" className="h-8 md:h-12 " />
          </button>
          <button className="hidden md:block">
            <img src="/image 55.png" alt="Search" className="h-8 md:h-12" />
          </button>

          <button className="text-gray-700 hover:text-blue-600 items-center flex flex-col hidden md:flex">
            <img
              src="/notification_svg.svg"
              alt="Notification"
              className="h-6 w-6"
            />
            <p>Notification</p>
          </button>

          {/* Login/Profile */}
          {user ? (
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-2 px-3 py-1.5 md:px-6 md:py-3 border border-gray-400 rounded-lg md:rounded-2xl bg-white hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm md:text-base font-medium text-gray-500">
                {firstName}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="bg-[#39A7FF] text-white px-4 py-2 md:px-6 md:py-3 rounded-md md:rounded-md hover:bg-blue-600 focus:outline-none transition-colors flex items-center gap-2 font-medium"
            >
              <svg
                className="w-5 h-5 hidden md:block"
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
              {/* Mobile Login Icon */}
              <svg
                className="w-5 h-5 md:hidden"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="">Login</span>
            </button>
          )}

          {/* Cart */}
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
            <p className="text-[10px] md:text-base font-semibold">Cart</p>
          </button>
        </div>
      </div>
      <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Navbar;

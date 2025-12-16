import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";
import AuthModal from "../Auth/AuthModal";
import CitySelector from "../Common/CitySelector";

const Navbar = () => {
  const { user, isModalOpen, setModalOpen, logout } = useAuthStore();
  const { cart, loadCart } = useCartStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Load cart on component mount
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only load once on mount

  const handleProfileClick = () => {
    if (!user) {
      setModalOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const handleOptionClick = (option) => {
    setDropdownOpen(false);
    switch (option) {
      case "Profile":
        navigate("/profile");
        break;
      case "Orders":
        navigate("/profile?tab=orders");
        break;
      case "My City":
        navigate("/profile?tab=city");
        break;
      case "Notification":
        navigate("/notifications");
        break;
      default:
        break;
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
      <div className="h-16 bg-white shadow-md flex items-center justify-between px-8 m-12 w-full rounded-full">
        <button onClick={handleLogoClick} className="flex-shrink-0 hover:opacity-80">
          <img src="/Logo.svg" alt="Bukizz Logo" className="h-12 w-auto" />
        </button>
        <div className="flex items-center space-x-4">
          <button>
            <img src="/image 54.png" alt="Menu" className="h-12 " />
          </button>
          <button>
            <img src="/image 55.png" alt="Search" className="h-12" />
          </button>
          
          <button className="text-gray-700 hover:text-blue-600 items-center flex flex-col">
            <img
              src="/notification_svg.svg"
              alt="Notification"
              className="h-6 w-6"
            />
            <p>Notification</p>
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
            <p>Cart</p>
          </button>
          <div
            className="relative group"
            onMouseEnter={() => user && setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              onClick={handleProfileClick}
              className="text-gray-700 hover:text-blue-600 flex flex-col items-center space-y-1"
            >
              <img src="/profile_svg.svg" alt="Profile" className="h-6 w-6" />
              <span className="text-xs font-medium whitespace-nowrap">
                {user ? firstName : "Profile"}
              </span>
            </button>
            {user && dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleOptionClick("Profile")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => handleOptionClick("Orders")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => handleOptionClick("My City")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                  >
                    My City
                  </button>
                  <button
                    onClick={() => handleOptionClick("Notification")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                  >
                    Notification
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Navbar;

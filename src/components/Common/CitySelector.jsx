import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CitySelector = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the selected city from localStorage
    const city = localStorage.getItem("selectedCity");
    setSelectedCity(city);

    // Listen for storage changes (when city is selected in another part of the app)
    const handleStorageChange = () => {
      const updatedCity = localStorage.getItem("selectedCity");
      setSelectedCity(updatedCity);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Get city display name
  const getCityName = () => {
    if (selectedCity === "kanpur") return "Kanpur";
    if (selectedCity === "gurgaon") return "Gurgaon";
    return "Select City";
  };

  return (
    <button
      onClick={() => navigate("/profile?tab=city")}
      className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 border-[1.5px] border-black rounded-[1rem] hover:bg-gray-50 transition-colors bg-white whitespace-nowrap h-[46px] md:h-auto"
    >
      {/* Mobile Icon: Large Red Pin */}
      <div className="flex-shrink-0">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#FE0000" />
          <circle cx="12" cy="9" r="2.5" fill="white" />
        </svg>
      </div>

      <div className="flex flex-col items-start justify-center leading-none">
        <span className="text-[11px] md:text-sm text-gray-900 font-medium">City</span>
        <span className="text-base md:text-md font-bold text-gray-900 -mt-1">{getCityName()}</span>
      </div>
    </button>
  );
};

export default CitySelector;

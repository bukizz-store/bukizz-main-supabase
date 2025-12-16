import React, { useEffect, useState } from "react";

const CitySelector = () => {
  const [selectedCity, setSelectedCity] = useState(null);

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
    <button className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors">
      <img src="/map_svg.svg" alt="Location" className="h-10 w-10 text-red-600 filter brightness-0 saturate-200 hue-rotate-0" style={{ filter: 'invert(65%) sepia(100%) saturate(1000%) hue-rotate(360deg)' }} />
    <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-800">City</span>
        <span className="text-sm font-bold text-gray-800">{getCityName()}</span>
    </div>
    </button>
  );
};

export default CitySelector;

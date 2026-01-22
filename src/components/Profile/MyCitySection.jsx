import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MyCitySection = () => {
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem("selectedCity");
  });
  const navigate = useNavigate();

  const cities = [
    {
      id: "kanpur",
      name: "Kanpur",
      image: "/city/kanpur.jpg",
    },
    {
      id: "gurugram",
      name: "Gurugram",
      image: "/city/gurugram.jpg",
    },
  ];

  const handleSelectCity = () => {
    if (selectedCity) {
      localStorage.setItem("selectedCity", selectedCity);
      // Dispatch custom event to update other components
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    }
  };

  return (
    <div id="my-city-section" className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
      {/* Title */}
      <h2 className="text-2xl font-bold text-center text-blue-500 mb-2">
        Select Your City To Get Your
      </h2>
      <p className="text-2xl font-bold text-center text-blue-500 mb-6">
        Essentials Delivered
      </p>

      {/* City cards grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {cities.map((city) => (
          <div
            key={city.id}
            onClick={() => setSelectedCity(city.id)}
            className={`relative rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 ${selectedCity === city.id ? "ring-3 ring-blue-500 shadow-lg" : "shadow-md hover:shadow-lg"
              }`}
          >
            {/* City image */}
            <img
              src={city.image}
              alt={city.name}
              className={`w-full h-64 object-cover transition-all duration-300 ${selectedCity === city.id ? "" : "grayscale"
                }`}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            {/* City name */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-lg font-bold text-white text-center">{city.name}</h3>
            </div>
            {/* Selection checkbox */}
            {selectedCity === city.id && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Select button */}
      <button
        onClick={handleSelectCity}
        disabled={!selectedCity}
        className={`w-full px-6 py-3 rounded-full text-white font-bold text-lg transition-all duration-300 ${selectedCity
          ? "bg-blue-500 hover:bg-blue-600 cursor-pointer shadow-lg hover:shadow-xl"
          : "bg-gray-400 cursor-not-allowed opacity-60"
          }`}
      >
        Select Your City
      </button>
    </div>
  );
};

export default MyCitySection;

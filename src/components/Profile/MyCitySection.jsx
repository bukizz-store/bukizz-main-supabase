import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCityStore from "../../store/cityStore";

const MyCitySection = () => {
  const setCityInStore = useCityStore((state) => state.setSelectedCity);
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem("selectedCity");
  });
  const navigate = useNavigate();

  const cities = [
    {
      id: "kanpur",
      name: "Kanpur",
      image: "/city/kanpur.jpg",
      isComingSoon: false,
    },
    {
      id: "gurugram",
      name: "Gurugram",
      image: "/city/gurugram.jpg",
      isComingSoon: false,
    },
    {
      id: "noida",
      name: "Noida",
      image: "/city/noida.jpg",
      isComingSoon: true,
    },
  ];

  const handleSelectCity = () => {
    if (selectedCity) {
      setCityInStore(selectedCity);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {cities.map((city) => (
          <div
            key={city.id}
            onClick={() => {
              if (!city.isComingSoon) {
                setSelectedCity(city.id);
              }
            }}
            className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
              city.isComingSoon
                ? "cursor-not-allowed opacity-90 ring-1 ring-gray-200"
                : `cursor-pointer transform ${
                    selectedCity === city.id ? "ring-3 ring-blue-500 shadow-lg" : "shadow-md hover:shadow-lg"
                  }`
            }`}
          >
            {/* City image */}
            <img
              src={city.image}
              alt={city.name}
              className={`w-full h-48 md:h-64 object-cover transition-all duration-300 ${
                city.isComingSoon ? "grayscale-[20%]" : selectedCity === city.id ? "" : "grayscale"
              }`}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

            {/* Coming Soon badge */}
            {city.isComingSoon && (
              <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow">
                Coming Soon
              </div>
            )}

            {/* City name */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
              <h3 className="text-lg font-bold text-white">{city.name}</h3>
              {city.isComingSoon && (
                <span className="text-xs font-semibold text-amber-300 block">
                  Launching Soon
                </span>
              )}
            </div>
            {/* Selection checkbox */}
            {!city.isComingSoon && selectedCity === city.id && (
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

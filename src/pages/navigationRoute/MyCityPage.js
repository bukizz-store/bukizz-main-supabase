import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const MyCityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedCity, setSelectedCity] = useState(null);

  const cities = [
    {
      id: "kanpur",
      name: "Kanpur",
      image: "/city/kanpur.jpg",
    },
    {
      id: "gurgaon",
      name: "Gurgaon",
      image: "/city/gurugram.jpg",
    },
  ];

  const handleSelectCity = () => {
    if (selectedCity) {
      // You can store the selected city in a store or localStorage
      localStorage.setItem("selectedCity", selectedCity);
      // Navigate back or to home
      navigate("/");
    }
  };

  const handleBackToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with back button */}
      <div className="bg-white shadow-sm p-4">
        <button
          onClick={handleBackToProfile}
          className="text-blue-500 font-semibold hover:text-blue-700"
        >
          ← Back to Profile
        </button>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* User greeting */}
        <div className="mb-12 flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-600 text-lg">Hello</p>
            <p className="text-blue-500 text-2xl font-bold">
              {user?.name || user?.full_name || "User"}
            </p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-4">
          Select Your City To Get Your
        </h1>
        <p className="text-4xl font-bold text-center text-blue-500 mb-12">
          Essentials Delivered
        </p>

        {/* City cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {cities.map((city) => (
            <div
              key={city.id}
              onClick={() => setSelectedCity(city.id)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                selectedCity === city.id ? "ring-4 ring-blue-500 shadow-xl" : "shadow-lg hover:shadow-xl"
              }`}
            >
              {/* City image */}
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-64 object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              {/* City name */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-3xl font-bold text-white">{city.name}</h2>
              </div>
              {/* Selection checkbox */}
              {selectedCity === city.id && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="flex justify-center">
          <button
            onClick={handleSelectCity}
            disabled={!selectedCity}
            className={`px-12 py-4 rounded-full text-white font-bold text-xl transition-all duration-300 ${
              selectedCity
                ? "bg-blue-500 hover:bg-blue-600 cursor-pointer shadow-lg hover:shadow-xl"
                : "bg-gray-400 cursor-not-allowed opacity-60"
            }`}
          >
            Select Your City
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyCityPage;

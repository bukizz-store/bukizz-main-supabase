import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { schoolRoutes } from "../../store/apiRoutesStore";



const School = ({ searchResults, isSearchActive, searchTerm }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [schoolsByCity, setSchoolsByCity] = useState([]);
  const [allSchools, setAllSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State to track current city for auto-refresh
  const [currentCity, setCurrentCity] = useState(() => localStorage.getItem("selectedCity"));

  // Listen for storage changes to auto-refresh schools when city changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentCity(localStorage.getItem("selectedCity"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Fetch schools by city when component mounts or on home page
  useEffect(() => {
    const fetchSchoolsByCity = async () => {
      // Only fetch on homepage and not during search
      if (isSearchActive || location.pathname !== "/") {
        return;
      }

      try {
        setLoading(true);
        let selectedCity = localStorage.getItem("selectedCity");

        // Default to Kanpur if no city is selected
        if (!selectedCity) {
          selectedCity = "kanpur";
        }

        // Map city id to city name for API
        const cityNameMap = {
          gurgaon: "Gurgaon",
          kanpur: "Kanpur",
        };

        const cityName = cityNameMap[selectedCity] || selectedCity;

        // Fetch schools by city
        const response = await fetch(schoolRoutes.byCity(cityName));

        if (!response.ok) {
          throw new Error(`Failed to fetch schools: ${response.statusText}`);
        }

        const data = await response.json();
        const schoolsList = data.data?.schools || data.schools || data.data || data || [];
        const schools = schoolsList.map((school) => ({
          id: school.id,
          name: school.name,
          img:
            school.image ||
            school.img ||
            "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
          location: school.city || school.address?.line1 || "Location not specified",
        }));

        // Show first 10 schools on homepage
        setSchoolsByCity(schools.slice(0, 10));
        setError(null);
      } catch (err) {
        console.error("Error fetching schools by city:", err);
        setSchoolsByCity([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolsByCity();
  }, [location.pathname, isSearchActive, currentCity]);

  // Fetch schools by city when on /school page (same logic as home page now)
  useEffect(() => {
    const fetchAllSchools = async () => {
      // Only fetch on school page and when not searching
      if (location.pathname !== "/school" || isSearchActive) {
        return;
      }

      try {
        setLoading(true);

        let selectedCity = localStorage.getItem("selectedCity");

        // Default to Kanpur if no city is selected
        if (!selectedCity) {
          selectedCity = "kanpur";
        }

        // Map city id to city name for API
        const cityNameMap = {
          gurgaon: "Gurgaon",
          kanpur: "Kanpur",
        };

        const cityName = cityNameMap[selectedCity] || selectedCity;

        // Fetch schools by city even on /school route
        const response = await fetch(schoolRoutes.byCity(cityName));

        if (!response.ok) {
          throw new Error(`Failed to fetch schools: ${response.statusText}`);
        }

        const data = await response.json();
        const schoolsList = data.data?.schools || data.schools || data.data || data || [];

        const schools = schoolsList.map((school) => ({
          id: school.id,
          name: school.name,
          img:
            school.image ||
            school.img ||
            "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
          location: school.city || school.address?.line1 || "Location not specified",
        }));

        setAllSchools(schools);
        setError(null);
      } catch (err) {
        console.error("Error fetching all schools:", err);
        setAllSchools([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSchools();
  }, [location.pathname, isSearchActive, currentCity]);

  let displayData = [];
  let showingSearchResults = false;

  // Determine which schools to display
  if (isSearchActive && searchResults !== null) {
    // Show search results
    showingSearchResults = true;
    displayData = searchResults.map((school) => ({
      name: school.name,
      img:
        school.image ||
        school.img ||
        "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
      location: school.city || school.location || "Location not specified",
      id: school.id || school.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    }));
  } else if (location.pathname === "/school") {
    displayData = allSchools; // Show fetched schools on /school route
  } else {
    displayData = schoolsByCity; // Show city schools on home page
  }

  const handleSchoolClick = (school) => {
    // Navigate to individual school page
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get("category");
    if (category) {
      navigate(`/school/${school.id}?category=${category}`);
    } else {
      navigate(`/school/${school.id}`);
    }
  };

  return (
    <div className="my-6 md:my-2">
      {/* Search results header */}
      {showingSearchResults && (
        <div className="mx-4 md:mx-12 mb-4">
          {searchResults.length > 0 ? (
            <p className="text-gray-700 text-lg">
              Found{" "}
              <span className="font-bold text-blue-600">
                {searchResults.length}
              </span>{" "}
              school{searchResults.length !== 1 ? "s" : ""}
              {searchTerm && (
                <span>
                  {" "}
                  matching "<span className="font-semibold">{searchTerm}</span>"
                </span>
              )}
            </p>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg mb-2">
                No schools found{" "}
                {searchTerm && (
                  <span>
                    for "<span className="font-semibold">{searchTerm}</span>"
                  </span>
                )}
              </p>
              <p className="text-gray-400 text-sm">
                Try searching with a different term or check the spelling
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && !showingSearchResults && (
        <div className="mx-4 md:mx-12 text-center py-8">
          <p className="text-gray-500 text-lg">Loading schools...</p>
        </div>
      )}

      {/* Schools grid */}
      {displayData.length > 0 && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4 mx-0 md:mx-12">
          {displayData.map((school, idx) => (
            <div
              key={school.id || idx}
              className="flex flex-col items-center justify-center rounded-lg"
            >
              <div
                className="relative w-full bg-white rounded-2xl shadow-lg hover:scale-105 transition-transform hover:cursor-pointer"
                onClick={() => handleSchoolClick(school)}
              >
                <img
                  src={school.img}
                  alt={school.name}
                  className="w-full md:h-[200px] h-[150px] object-cover rounded-2xl"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/90 to-transparent"></div>
                <p className="absolute bottom-6 left-2 right-2 text-white text-md truncate">
                  {school.name}
                </p>
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <img src="/map_svg.svg" alt="location" className="w-4 h-4" />
                  <p className="text-white text-xs">{school.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && displayData.length === 0 && !showingSearchResults && location.pathname === "/school" && (
        <div className="mx-4 md:mx-12 text-center py-8">
          <p className="text-gray-500 text-lg">No schools available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default School;

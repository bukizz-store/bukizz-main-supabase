import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { schoolRoutes } from "../../store/apiRoutesStore";
import useCityStore from "../../store/cityStore";

const School = ({ searchResults, isSearchActive, searchTerm }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use centralized city store
  const selectedCity = useCityStore((state) => state.selectedCity);

  // Fetch schools whenever city or route changes
  useEffect(() => {
    const fetchSchools = async () => {
      // Don't fetch if search is active (it provides its own results)
      if (isSearchActive) return;

      try {
        setLoading(true);

        // Map city id to display name if needed, or use as is
        const cityNameMap = {
          gurgaon: "Gurugram",
          kanpur: "Kanpur",
        };
        const cityName = cityNameMap[selectedCity] || selectedCity;

        // Determine limit and explicit sorting
        const isHomePage = location.pathname === "/";
        const limit = isHomePage ? 10 : 100; // Limit on home page, more on view all
        
        // Build URL with explicit sorting parameters for the database
        const url = `${schoolRoutes.byCity(cityName)}?sortBy=sort_order&sortOrder=asc&limit=${limit}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch schools: ${response.statusText}`);
        }

        const data = await response.json();
        const schoolsList = data.data?.schools || data.schools || data.data || data || [];
        
        const formattedSchools = schoolsList.map((school) => ({
          id: school.id,
          name: school.name,
          img:
            school.image ||
            school.img ||
            "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
          location: school.address?.line2 || school.address?.line1 || school.city || "Location not specified",
          sortOrder: school.sortOrder || 999
        }));

        setSchools(formattedSchools);
        setError(null);
      } catch (err) {
        console.error("Error fetching schools:", err);
        setSchools([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [selectedCity, location.pathname, isSearchActive]);

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
      location: school.address.line2 || "Location not specified",
      id: school.id || school.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    }));
  } else {
    displayData = schools; 
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
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1">
                  <img src="/map_svg.svg" alt="location" className="w-4 h-4 shrink-0" />
                  <p className="text-white text-xs truncate">{school.location}</p>
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

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { schoolRoutes } from "../../store/apiRoutesStore";

const defaultSchools = [
  {
    id: "marwannah-public-school",
    name: "Marwannah Public School",
    img: "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
    location: "Sector 14",
  },
  {
    id: "wisdom-world-school",
    name: "Wisdom World School",
    img: "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
    location: "Sector 17",
  },
  {
    id: "kps-school",
    name: "KPS School",
    img: "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
    location: "Sector 10",
  },
  {
    id: "cr-model-public-school",
    name: "C.R. Model Public School",
    img: "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
    location: "Sector 7",
  },
  {
    id: "the-heritage-school",
    name: "The Heritage School",
    img: "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
    location: "Sector 29",
  },
  {
    id: "the-shri-ram-school",
    name: "The Shri Ram School",
    img: "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
    location: "Sector 45",
  },
  {
    id: "shalom-hills-international-school",
    name: "Shalom Hills International School",
    img: "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
    location: "Sector 51",
  },
  {
    id: "gd-goenka-public-school",
    name: "GD Goenka Public School",
    img: "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
    location: "Sector 48",
  },
  {
    id: "ryan-international-school",
    name: "Ryan International School",
    img: "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
    location: "Sector 40",
  },
  {
    id: "delhi-public-school",
    name: "Delhi Public School",
    img: "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
    location: "Sector 45",
  },
];

const School = ({ searchResults, isSearchActive, searchTerm }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [schoolData, setSchoolData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

        // Default to Gurgaon if no city is selected
        if (!selectedCity) {
          selectedCity = "gurgaon";
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
            school.img ||
            "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
          location: school.city || school.address?.line1 || "Location not specified",
        }));

        // Show first 10 schools on homepage
        setSchoolData(schools.slice(0, 10));
        setError(null);
      } catch (err) {
        console.error("Error fetching schools by city:", err);
        // Fallback to default schools on error
        setSchoolData(defaultSchools.slice(0, 10));
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolsByCity();
  }, [location.pathname, isSearchActive]);

  let displayData = schoolData;
  let showingSearchResults = false;

  // Determine which schools to display
  if (isSearchActive && searchResults !== null) {
    // Show search results
    showingSearchResults = true;
    displayData = searchResults.map((school) => ({
      name: school.name,
      img:
        school.img ||
        "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
      location: school.city || school.location || "Location not specified",
      id: school.id || school.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    }));
  } else if (location.pathname === "/school") {
    displayData = defaultSchools; // Show all schools on /school route
  }

  const handleSchoolClick = (school) => {
    // Navigate to individual school page
    navigate(`/school/${school.id}`);
  };

  return (
    <div className="my-6">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-4 px-4 mx-4 md:mx-12">
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
                  className="w-full h-[200px] object-cover rounded-2xl"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/70 to-transparent"></div>
                <p className="absolute bottom-6 left-2 text-white text-lg font-semibold">
                  {school.name}
                </p>
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <img src="/map_svg.svg" alt="location" className="w-4 h-4" />
                  <p className="text-white text-sm">{school.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default School;

import React, { useState, useEffect } from "react";
import Card1 from "../components/Card1";
import Category from "../components/Category";
import DealsSection from "../components/DealsSection";
import School from "../components/School";
import SearchBar from "../components/SearchBar";
import Stationary from "../components/Stationary";
import PromoCard from "../components/PromoCard";

// HomePage.js
function HomePage() {
  const [searchResults, setSearchResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    // Get selected city from localStorage
    const city = localStorage.getItem("selectedCity");
    if (city) {
      // Map city id to display name
      const cityNameMap = {
        gurgaon: "Gurugram",
        kanpur: "Kanpur",
      };
      setSelectedCity(cityNameMap[city] || city);
    } else {
      setSelectedCity("Gurugram"); // Default city
    }

    // Listen for changes in localStorage
    const handleStorageChange = () => {
      const city = localStorage.getItem("selectedCity");
      if (city) {
        const cityNameMap = {
          gurgaon: "Gurugram",
          kanpur: "Kanpur",
        };
        setSelectedCity(cityNameMap[city] || city);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsSearchActive(results !== null);
  };

  const handleSearchTermChange = (term) => {
    setSearchTerm(term);
    // If search term is cleared, reset search state
    if (term.trim() === "") {
      setSearchResults(null);
      setIsSearchActive(false);
    } else {
      setIsSearchActive(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F8FF] flex flex-col relative">
      <SearchBar
        onSearchResults={handleSearchResults}
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
      />
      <Card1 />
      <Category />

      <div className="mx-12 my-4 mb-10 max-w flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7E30E1] to-[#39A7FF] text-transparent bg-clip-text">
          Pick Your School in {selectedCity}
        </h1>
        <p className="font-nunito font-semibold text-green">
          Fresh Look , New Term - Grab Your Uniform Today
        </p>
      </div>

      <div>
        {/* a link for all schools */}
        <div className="flex justify-end items-center mx-12 mb-4">
          {/* <h2 className="text-3xl font-bold">Schools in Gurugram</h2> */}
          <a href="/school" className="text-blue-600 hover:underline">
            View All Schools &rarr;
          </a>
        </div>
      </div>

      <School
        searchResults={searchResults}
        isSearchActive={isSearchActive}
        searchTerm={searchTerm}
      />

      {/* Only show other sections when not actively searching */}
      {!isSearchActive && (
        <>
          <h1 className=" mx-12 text-4xl font-bold my-8">School Essentials</h1>
          <Stationary />
          <DealsSection />
          <PromoCard />
        </>
      )}
    </div>
  );
}
export default HomePage;

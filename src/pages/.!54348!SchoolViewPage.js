import React, { useState } from "react";
import DealsSection from "../components/DealsSection";
import PromoCard from "../components/PromoCard";
import School from "../components/School";
import SearchBar from "../components/SearchBar";
import Stationary from "../components/Stationary";

// SchoolViewPage.js
function SchoolViewPage() {
  const [searchResults, setSearchResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

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

      <div className="mx-12 my-4 mb-10 max-w flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7E30E1] to-[#39A7FF] text-transparent bg-clip-text">
          {isSearchActive
            ? searchResults && searchResults.length > 0
              ? `Search Results - Pick Your School`
              : `Search Results`
            : `Pick Your School in Gurugram`}
        </h1>
        <p className="font-nunito font-semibold text-green">
          {isSearchActive
            ? `Find the perfect school for your needs`
            : `Fresh Look , New Term - Grab Your Uniform Today`}
        </p>
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
export default SchoolViewPage;

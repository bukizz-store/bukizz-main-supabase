import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import DealsSection from "../../components/Sections/DealsSection";
import PromoCard from "../../components/Cards/PromoCard";
import School from "../../components/Sections/School";
import SearchBar from "../../components/Common/SearchBar";
import Stationary from "../../components/Sections/Stationary";
import ProductSearchResults from "../../components/Sections/ProductSearchResults";

// SchoolViewPage.js
function SchoolViewPage() {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || "");
  const [isSearchActive, setIsSearchActive] = useState(!!location.state?.searchTerm);

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

  // Helper to safely get schools and products from search results
  const schools = Array.isArray(searchResults)
    ? searchResults
    : searchResults?.schools || [];

  const products = !Array.isArray(searchResults)
    ? searchResults?.products || []
    : [];

  const hasResults = schools.length > 0 || products.length > 0;

  return (
    <div className=" bg-[#F3F8FF] flex flex-col relative">
      <SearchBar
        onSearchResults={handleSearchResults}
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
      />

      <div className="mx-12 my-4 mb-10 max-w flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7E30E1] to-[#39A7FF] text-transparent bg-clip-text">
          {isSearchActive
            ? hasResults
              ? `Search Results`
              : `No Results Found`
            : `Pick Your School in Gurugram`}
        </h1>
        <p className="font-nunito font-semibold text-green">
          {isSearchActive
            ? `Find the perfect school or product for your needs`
            : `Fresh Look , New Term - Grab Your Uniform Today`}
        </p>
      </div>

      <School
        searchResults={schools}
        isSearchActive={isSearchActive}
        searchTerm={searchTerm}
      />

      {isSearchActive && products.length > 0 && (
        <>
          <div className="mx-12 my-4">
            <h2 className="text-2xl font-bold text-gray-800">Products</h2>
          </div>
          <ProductSearchResults
            products={products}
            searchTerm={searchTerm}
          />
        </>
      )}
    </div>
  );
}
export default SchoolViewPage;

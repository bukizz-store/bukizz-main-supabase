import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useUserProfileStore from "../store/userProfileStore";
import CitySelector from "./CitySelector";

const SearchBar = ({ onSearchResults, searchTerm, onSearchTermChange }) => {
  const navigate = useNavigate();
  const { searchSchools, loading } = useUserProfileStore();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef(null);
  const lastSearchTermRef = useRef("");

  const handleSearch = useCallback(
    async (searchValue) => {
      // Avoid duplicate searches
      if (lastSearchTermRef.current === searchValue) {
        return;
      }

      // If search term is too short, clear results immediately without API call
      if (!searchValue || searchValue.trim().length < 2) {
        lastSearchTermRef.current = "";
        if (onSearchResults) {
          onSearchResults(null);
        }
        return;
      }

      const trimmedSearch = searchValue.trim();
      lastSearchTermRef.current = trimmedSearch;

      try {
        setIsSearching(true);

        // Navigate to school view page if not already there
        if (window.location.pathname !== "/school") {
          navigate("/school");
        }

        // Perform search
        const results = await searchSchools({
          search: trimmedSearch,
          limit: 50, // Get more results for search
        });

        // Only update results if this is still the current search
        if (lastSearchTermRef.current === trimmedSearch && onSearchResults) {
          onSearchResults(results.schools || []);
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (lastSearchTermRef.current === trimmedSearch && onSearchResults) {
          onSearchResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    },
    [searchSchools, navigate, onSearchResults]
  );

  // Debounced search effect
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If search term is empty, clear results immediately
    if (localSearchTerm.trim().length === 0) {
      lastSearchTermRef.current = "";
      if (onSearchResults) {
        onSearchResults(null);
      }
      setIsSearching(false);
      return;
    }

    // If search term is too short, don't start searching yet
    if (localSearchTerm.trim().length < 2) {
      setIsSearching(false);
      return;
    }

    // Set searching state to show loading indicator
    setIsSearching(true);

    // Set up debounced search
    debounceTimerRef.current = setTimeout(() => {
      handleSearch(localSearchTerm);
    }, 500); // Increased to 500ms for better UX

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localSearchTerm, handleSearch, onSearchResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);

    // If parent component provides onSearchTermChange, use it
    if (onSearchTermChange) {
      onSearchTermChange(value);
    }
  };

  const handleSearchButtonClick = () => {
    if (localSearchTerm.trim().length >= 1) {
      // Clear debounce timer and search immediately
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      handleSearch(localSearchTerm);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchButtonClick();
    }
  };

  // Show loading state when either the store is loading or we're in debounce state
  const showLoading =
    loading || (isSearching && localSearchTerm.trim().length >= 2);

  return (
    <div className="mx-12 my-2 mb-9 max-w">
      <div className="flex space-x-4 ">
        <button className="px-4 py-4 rounded-lg shadow-md bg-gradient-to-r from-[#39A7FF] to-[#525CEB] text-white hover:opacity-90 w-[120px]">
          Shop
        </button>
        <CitySelector />
        <div className="flex-grow relative">
          <img
            src="/search_svg.svg"
            alt="Search"
            className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 z-10"
          />
          <input
            type="text"
            placeholder="Enter School name (e.g., DAV School)"
            className="w-full px-16 py-4 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            value={localSearchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          {showLoading && (
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 z-10">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        <button
          className="px-4 py-4 rounded-lg shadow-md bg-gradient-to-r from-[#39A7FF] to-[#525CEB] text-white hover:opacity-90 disabled:opacity-50 transition-all duration-200"
          onClick={handleSearchButtonClick}
          disabled={showLoading || localSearchTerm.trim().length < 1}
        >
          {showLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;

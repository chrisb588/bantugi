"use client";

import SearchBar from "@/components/search/search-bar";
import { useState } from "react";
import SearchResultsList from "@/components/search/search-results-list";
import { FilterButton } from "@/components/ui/filter-button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { sampleResults } from "@/test"; // TODO: Remove if API is fully integrated
import Report from "@/interfaces/report";
import { useFetchPins } from "@/hooks/useFetchPins";
import { MobileNavbar } from "@/components/generic/mobile-navbar";
import dynamic from 'next/dynamic';

// Dynamically import MapContents with ssr: false
const MapContents = dynamic(() => import('@/components/map/map').then(mod => mod.MapContents), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center"><p>Loading map...</p></div>
});

export default function HomePage() {
  const [isSearchScreenVisible, setIsSearchScreenVisible] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Report[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const { pins, isLoading: isLoadingPins, error: fetchPinsError } = useFetchPins();

  const openSearchScreen = () => setIsSearchScreenVisible(true);
  const closeSearchScreen = () => {
    if (isSearchScreenVisible) {
      setIsSearchScreenVisible(false);
    }
  };

  const handleSearch = async (query: string) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }

    setIsLoadingSearch(true);
    try {
      // TODO: Implement API call here
      // const results = await searchReports(trimmedQuery); 
      console.log("Search query:", trimmedQuery); // Log query
      // For now, using sampleResults. Replace with actual API call.
      const filteredResults = sampleResults.filter(report => 
        report.title.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
        report.description?.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
      setSearchResults(filteredResults); 
    } catch (error) {
      console.error('Failed to search reports:', error);
      setSearchResults([]);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleFilterClick = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const closeFilterDropdown = () => {
    setIsFilterDropdownOpen(false);
  };

  return (
      <div className="relative flex flex-col h-screen">
        {/* Map Layer - Background, interactive */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <MapContents 
            pins={pins} 
            isLoadingPins={isLoadingPins} 
            fetchPinsError={fetchPinsError}
            className="h-full w-full"
          />
        </div>

        {/* UI Layer - Overlays map */}
        <div className="relative z-10 flex flex-col flex-1 min-h-0 pointer-events-none">
          {/* --- Mobile View Container --- */}
          <div className="md:hidden flex flex-col flex-1 min-h-0 pointer-events-none">
            {/* Mobile Header (Sticky) */}
            <div className="sticky top-0 left-0 right-0 bg-background/80 backdrop-blur-sm py-4 flex flex-col items-start space-y-2 z-20 pointer-events-none px-4">
              <div className="w-full pointer-events-auto" onClick={openSearchScreen} onFocus={openSearchScreen}>
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>

            {/* Content Area (Search Results or Main Content for Mobile) - This will be scrollable if needed */}
            <div className={`flex-1 overflow-y-auto z-20 px-4 ${isSearchScreenVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
              {isSearchScreenVisible && (
                <SearchResultsList 
                  title="Search Results" 
                  onClose={closeSearchScreen}
                  results={searchResults}
                  isLoading={isLoadingSearch} 
                />
              )}
            </div>

            {/* Filter Button - positioned above mobile navbar */}
            <div className="sticky bottom-20 left-0 right-0 z-30 pointer-events-none">
              <div className="flex justify-start pl-4">
                <FilterButton 
                  onClick={handleFilterClick}
                  className="pointer-events-auto"
                />
              </div>
            </div>

            {/* Mobile Navbar (Sticky at the bottom of the mobile view container) */}
            <div className="sticky bottom-0 left-0 right-0 z-20 pointer-events-auto">
              <MobileNavbar />
            </div>
          </div>

          {/* --- Desktop View Container --- */}
          <div className="hidden md:flex flex-col flex-1 min-h-0 pointer-events-none">
            {/* Desktop Header */}
            <div className="sticky top-0 left-0 right-0 bg-background/80 backdrop-blur-sm py-4 px-6 z-20 pointer-events-none">
              <div className="flex items-center justify-between">
                <div className="w-full max-w-md pointer-events-auto">
                  <SearchBar onSearch={handleSearch} />
                </div>
                <FilterButton 
                  onClick={handleFilterClick}
                  className="pointer-events-auto ml-4"
                />
              </div>
            </div>

            {/* Desktop Search Results Area */}
            <div className="flex-1 overflow-y-auto z-20 px-6 pointer-events-none">
              {searchResults.length > 0 && (
                <div className="pointer-events-auto">
                  <SearchResultsList 
                    title="Search Results" 
                    onClose={() => setSearchResults([])}
                    results={searchResults}
                    isLoading={isLoadingSearch} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Screen Overlay (Mobile) */}
        {isSearchScreenVisible && (
          <div className="fixed inset-0 z-40 bg-background flex flex-col md:hidden px-4 pt-4 pointer-events-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Search</h2>
              <button 
                onClick={closeSearchScreen}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <SearchResultsList 
                title="Search Results" 
                onClose={closeSearchScreen}
                results={searchResults}
                isLoading={isLoadingSearch} 
              />
            </div>
          </div>
        )}

        {/* Filter Dropdown */}
        <FilterDropdown 
          isOpen={isFilterDropdownOpen} 
          onClose={closeFilterDropdown} 
        />
      </div>
  );
}
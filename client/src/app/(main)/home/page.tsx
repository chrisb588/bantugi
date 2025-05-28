"use client";

import SearchBar from "@/components/search/search-bar";
import { useState, useEffect } from "react";
import SearchResultsList from "@/components/search/search-results-list";
import { MobileNavbar } from "@/components/generic/mobile-navbar";
import { FilterButton } from "@/components/ui/filter-button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { sampleResults } from "@/test";
import { useReportMarkers } from "@/hooks/use-report-markers";
import { Report } from "@/interfaces/report";
import { useVisibleReports } from "@/hooks/use-visible-reports";

export default function HomePage() {
  const [isSearchScreenVisible, setIsSearchScreenVisible] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const visibleReports = useVisibleReports();

  useReportMarkers(visibleReports);

  const openSearchScreen = () => setIsSearchScreenVisible(true);
  const closeSearchScreen = () => {
    if (isSearchScreenVisible) {
      setIsSearchScreenVisible(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call here
      // const results = await searchReports(query);
      
      // temporary
      setSearchResults(sampleResults);
    } catch (error) {
      console.error('Failed to search reports:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterClick = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const closeFilterDropdown = () => {
    setIsFilterDropdownOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* --- Mobile View Container --- */}
      <div className="md:hidden flex flex-col flex-1 min-h-0 px-4">
        {/* Mobile Header (Sticky) */}
        <div className="sticky top-0 left-0 right-0 z-20 py-4 flex flex-col items-start space-y-2 pointer-events-auto">
          <div className="w-full" onClick={openSearchScreen} onFocus={openSearchScreen}>
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Content Area (Search Results or Main Content for Mobile) - This will be scrollable if needed */}
        <div className={`flex-1 overflow-y-auto z-20 ${isSearchScreenVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {isSearchScreenVisible && (
            <SearchResultsList 
              title="Search Results" 
              onClose={closeSearchScreen}
              results={searchResults}
              isLoading={isLoading} 
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
        <div className="sticky bottom-0 left-0 right-0 z-20">
          <MobileNavbar />
        </div>
      </div>

      {/* Filter Dropdown */}
      <FilterDropdown 
        isOpen={isFilterDropdownOpen} 
        onClose={closeFilterDropdown} 
      />
    </div>
  );
}
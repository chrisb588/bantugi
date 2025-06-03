"use client";

import SearchBar from "@/components/search/search-bar";
import { useState, useCallback } from "react";
import SearchResultsList from "@/components/search/search-results-list";
import { debounce } from "lodash";
import { FilterButton } from "@/components/ui/filter-button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import Report from "@/interfaces/report";
import { useFetchPins } from "@/hooks/useFetchPins";
import { MobileNavbar } from "@/components/generic/mobile-navbar";
import { ReportForm } from "@/components/report/report-form/report-form";
import { CreateReportOverlay } from "@/components/report/create-report-overlay";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/user-context";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Dynamically import MapContents with ssr: false
const MapContents = dynamic(() => import('@/components/map/map').then(mod => mod.MapContents), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center"><p>Loading map...</p></div>
});

export default function HomePage() {
  const [isSearchScreenVisible, setIsSearchScreenVisible] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isCreateReportVisible, setIsCreateReportVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<Report[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const { pins, isLoading: isLoadingPins, error: fetchPinsError } = useFetchPins();
  const { state: { user } } = useUserContext();
  const router = useRouter();

  const openSearchScreen = () => setIsSearchScreenVisible(true);
  const closeSearchScreen = () => {
    if (isSearchScreenVisible) {
      setIsSearchScreenVisible(false);
    }
  };

  // Separate the actual search API call from the debounced handler
  const performSearch = async (query: string) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }

    setIsLoadingSearch(true);
    try {
      console.log("Search query:", trimmedQuery);
      
      // Call the search API
      const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`);
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }
      
      const results: Report[] = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search reports:', error);
      setSearchResults([]);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // Debounced search function - waits 500ms after user stops typing
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      performSearch(query);
    }, 500),
    []
  );

  const handleSearch = (query: string) => {
    // If query is empty, clear results immediately without debouncing
    if (!query.trim()) {
      setSearchResults([]);
      setIsLoadingSearch(false);
      return;
    }
    
    // Set loading state immediately for better UX
    setIsLoadingSearch(true);
    
    // Call the debounced search
    debouncedSearch(query);
  };

  const handleFilterClick = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const closeFilterDropdown = () => {
    setIsFilterDropdownOpen(false);
  };

  const openCreateReport = () => {
    if (!user) {
      // Redirect to login for guest users
      router.push('/login');
      return;
    }
    setIsCreateReportVisible(true);
  };

  const closeCreateReport = () => {
    setIsCreateReportVisible(false);
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
            <div className="sticky top-0 left-0 right-0 py-4 z-20 pointer-events-none px-4">
              <div className="flex items-center justify-center gap-3 w-full">
                <div className="flex-1 pointer-events-auto" onClick={openSearchScreen} onFocus={openSearchScreen}>
                  <SearchBar onSearch={handleSearch} />
                </div>
                <FilterButton 
                  onClick={handleFilterClick}
                  className="pointer-events-auto flex-shrink-0"
                />
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

            {/* Mobile Navbar is handled by the main layout, no need to render it here */}
          </div>

          {/* --- Desktop View Container --- */}
          <div className="hidden md:flex flex-col flex-1 min-h-0 pointer-events-none">
            {/* Desktop Header */}
            <div className="sticky top-0 left-0 right-0 py-4 px-6 z-20 pointer-events-none">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-4 pointer-events-auto">
                  <SearchBar onSearch={handleSearch} />
                  <FilterButton 
                    onClick={handleFilterClick}
                  />
                </div>
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

            {/* Floating Create Report Button for Desktop */}
            <div className="fixed bottom-6 right-6 z-30 pointer-events-auto">
              <Button
                onClick={openCreateReport}
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-6 w-6" />
                <span className="sr-only">Create Report</span>
              </Button>
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

        {/* Create Report Overlay */}
        {isCreateReportVisible && <CreateReportOverlay onClose={closeCreateReport} />}
      </div>
  );
}
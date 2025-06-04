"use client";

import SearchBar from "@/components/search/search-bar";
import { useState, useCallback, useEffect, Suspense, useRef } from "react";
import SearchResultsList from "@/components/search/search-results-list";
import { debounce } from "lodash";
import { FilterButton } from "@/components/ui/filter-button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import Report from "@/interfaces/report";
import { useFetchPins } from "@/hooks/useFetchPins";
import { ReportCard } from "@/components/report/report-card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';
import { useMapContext } from "@/context/map-context";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ReportItem from "@/components/report/report-item";

// Dynamically import MapContents with ssr: false
const MapContents = dynamic(() => import('@/components/map/map').then(mod => mod.MapContents), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center"><p>Loading map...</p></div>
});

function HomePageContent() {
  const [isSearchScreenVisible, setIsSearchScreenVisible] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Report[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // State for ReportCard overlay
  const [selectedReportIdForCard, setSelectedReportIdForCard] = useState<string | null>(null);
  const [reportForCard, setReportForCard] = useState<Report | null>(null);
  const [isReportCardVisible, setIsReportCardVisible] = useState(false);
  const [isLoadingReportForCard, setIsLoadingReportForCard] = useState(false);

  const { pins, isLoading: isLoadingPins, error: fetchPinsError } = useFetchPins();
  const searchParams = useSearchParams();
  const { mapInstanceRef } = useMapContext();
  
  // Create refs for both mobile and desktop search bars
  const mobileSearchBarRef = useRef<HTMLDivElement>(null);
  const desktopSearchBarRef = useRef<HTMLDivElement>(null);

  // Handle URL parameters for automatic navigation and report display
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zoom = searchParams.get('zoom');
    const reportId = searchParams.get('reportId');

    if (lat && lng && mapInstanceRef.current) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const zoomLevel = zoom ? parseInt(zoom) : 18;

      if (!isNaN(latitude) && !isNaN(longitude)) {
        mapInstanceRef.current.flyTo([latitude, longitude], zoomLevel);

        if (reportId) {
          setSelectedReportIdForCard(reportId);
          setReportForCard(null);
          setIsLoadingReportForCard(true);
          setIsReportCardVisible(true);
        }

        const url = new URL(window.location.href);
        url.searchParams.delete('lat');
        url.searchParams.delete('lng');
        url.searchParams.delete('zoom');
        url.searchParams.delete('reportId');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams, mapInstanceRef]);

  const closeSearchScreen = () => {
    if (isSearchScreenVisible) {
      setIsSearchScreenVisible(false);
    }
  };

  const performSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    setSearchQuery(query);

    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }

    setIsLoadingSearch(true);
    try {
      console.log("Search query:", trimmedQuery);
      
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
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => performSearch(query), 500),
    [performSearch]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsLoadingSearch(false);
      // Don't automatically close search screen when query is empty
      return;
    }
    
    if (!isSearchScreenVisible) {
      setIsSearchScreenVisible(true);
    }
    
    setIsLoadingSearch(true);
    debouncedSearch(query);
  };

  const handleFilterClick = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  // TODO: Implement filters to search
  const handleFilterSearchClick = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  }

  const closeFilterDropdown = () => {
    setIsFilterDropdownOpen(false);
  };

  const handlePinClick = useCallback((reportId: string) => {
    setSelectedReportIdForCard(reportId);
    setReportForCard(null);
    setIsLoadingReportForCard(true);
    setIsReportCardVisible(true);
  }, []);

  useEffect(() => {
    if (!selectedReportIdForCard) {
      return;
    }

    const fetchReportDetails = async () => {
      try {
        const response = await fetch(`/api/reports/${selectedReportIdForCard}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch report: ${response.status}`);
        }
        const data: Report = await response.json();
        if (!data || !data.id) {
          throw new Error("Fetched report data is invalid or missing ID.");
        }
        setReportForCard(data);
      } catch (error) {
        console.error("Error fetching report details for card:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        toast.error(`Error loading report: ${errorMessage}`);
        setReportForCard(null);
        setIsReportCardVisible(false);
      } finally {
        setIsLoadingReportForCard(false);
      }
    };

    fetchReportDetails();
  }, [selectedReportIdForCard]);

  const closeReportCard = useCallback(() => {
    setIsReportCardVisible(false);
    setSelectedReportIdForCard(null);
    setReportForCard(null);
  }, []);

  const handleViewOnMapFromCard = useCallback(() => {
    if (reportForCard?.location?.coordinates && mapInstanceRef.current) {
      const { lat, lng } = reportForCard.location.coordinates;
      mapInstanceRef.current.flyTo([lat, lng], 18);
    }
    closeReportCard();
  }, [reportForCard, mapInstanceRef, closeReportCard]);

  const handleSearchResultClick = useCallback((report: Report) => {
    setIsSearchScreenVisible(false);
    
    if (report.location?.coordinates && mapInstanceRef.current) {
      const { lat, lng } = report.location.coordinates;
      mapInstanceRef.current.flyTo([lat, lng], 18);
    }
    
    setSelectedReportIdForCard(report.id);
    setReportForCard(report);
    setIsLoadingReportForCard(false);
    setIsReportCardVisible(true);
  }, [mapInstanceRef]);

  // Handler to close desktop search results (only for desktop)
  const handleCloseDesktopSearch = () => {
    setSearchResults([]);
    setIsLoadingSearch(false);
    setSearchQuery(""); // Clear the search query as well
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
            onPinClick={handlePinClick}
          />
        </div>

        {/* UI Layer - Overlays map */}
        <div className="relative z-10 flex flex-col flex-1 min-h-0 pointer-events-none">
          {/* --- Mobile View Container --- */}
          <div className="md:hidden flex flex-col flex-1 min-h-0 pointer-events-none">
            {/* Mobile Header (Sticky) */}
            <div className="sticky top-0 left-0 right-0 py-4 z-20 pointer-events-none px-4">
              <div className="flex items-center justify-center gap-3 w-full">
                <div 
                  ref={mobileSearchBarRef}
                  className="flex-1 pointer-events-auto" 
                  onClick={() => setIsSearchScreenVisible(true)}
                >
                  <SearchBar 
                    onSearch={handleSearch} 
                    value={searchQuery}
                  />
                </div>
                <FilterButton 
                  onClick={handleFilterClick}
                  className="pointer-events-auto flex-shrink-0"
                />
              </div>
            </div>

            {/* Content Area (Search Results or Main Content for Mobile) */}
            <div className={`flex-1 overflow-y-auto z-20 px-4 ${isSearchScreenVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
              {isSearchScreenVisible && (
                <SearchResultsList 
                  title="Search Results" 
                  onClose={closeSearchScreen}
                  results={searchResults}
                  isLoading={isLoadingSearch}
                  onReportClick={handleSearchResultClick}
                  ignoreClickRef={mobileSearchBarRef}
                />
              )}
            </div>
          </div>

          {/* --- Desktop View Container --- */}
          <div className="hidden md:flex flex-col flex-1 min-h-0 pointer-events-none">
            {/* Desktop Header */}
            <div className="sticky top-0 left-0 right-0 py-4 px-6 z-20 pointer-events-none">
              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-2 pointer-events-auto max-w-md w-full">
                  <div className="flex items-center gap-3 w-full">
                    <div ref={desktopSearchBarRef} className="flex-1">
                      <SearchBar onSearch={handleSearch} value={searchQuery} />
                    </div>
                    <FilterButton 
                      onClick={handleFilterClick}
                      className="flex-shrink-0"
                    />
                  </div>
                  
                  {/* Desktop Search Results positioned directly below search bar */}
                  {(searchResults.length > 0 || isLoadingSearch) && (
                    <div className="w-full">
                      <SearchResultsList 
                        title="Search Results" 
                        onClose={handleCloseDesktopSearch}
                        results={searchResults}
                        isLoading={isLoadingSearch}
                        onReportClick={handleSearchResultClick}
                        ignoreClickRef={desktopSearchBarRef}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Screen Overlay (Mobile) */}
        {isSearchScreenVisible && (
          <div className="fixed inset-0 z-40 bg-background flex flex-col md:hidden px-8 pt-4 pointer-events-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-primary font-bold">Search Results</h2>
              <button 
                onClick={closeSearchScreen}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 flex gap-2">
              <SearchBar 
                onSearch={handleSearch} 
                value={searchQuery}
                onFocus={() => {
                  if (!isSearchScreenVisible) {
                    setIsSearchScreenVisible(true);
                  }
                }}
              />
              <FilterButton 
                onClick={handleFilterSearchClick}
                className="pointer-events-auto flex-shrink-0"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              <ScrollArea className="flex-1 min-h-0">
                <Separator className="bg-border/50" />
                {isLoadingSearch ? (
                  <div className="flex items-center justify-center h-32 md:h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {searchResults.map((result) => (
                      <ReportItem
                        key={result.id}
                        report={result}
                        onReportClick={handleSearchResultClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 md:h-24 text-muted-foreground">
                    <p className="md:text-sm">No results found</p>
                  </div>
                )}
              </ScrollArea> 
            </div>
          </div>
        )}

        {/* Filter Dropdown */}
        <FilterDropdown 
          isOpen={isFilterDropdownOpen} 
          onClose={closeFilterDropdown} 
        />

        {/* Report Card Overlay */}
        {isReportCardVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 pointer-events-auto">
            {isLoadingReportForCard && (
              <div className="bg-background p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p>Loading report...</p>
                </div>
              </div>
            )}
            {!isLoadingReportForCard && reportForCard && (
              <ReportCard
                report={reportForCard}
                onBack={closeReportCard}
                onViewMap={handleViewOnMapFromCard}
              />
            )}
            {!isLoadingReportForCard && !reportForCard && (
              <div className="bg-background p-6 rounded-lg shadow-lg text-destructive">
                <p>Could not load report details.</p>
                <Button onClick={closeReportCard} variant="outline" className="mt-2">Close</Button>
              </div>
            )}
          </div>
        )}
      </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-gray-200 flex items-center justify-center"><p>Loading...</p></div>}>
      <HomePageContent />
    </Suspense>
  );
}
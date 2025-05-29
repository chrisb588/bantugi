"use client";

import SearchBar from "@/components/search/search-bar";
import { useState, useEffect, Suspense } from "react";
import SearchResultsList from "@/components/search/search-results-list";
import { MobileNavbar } from "@/components/generic/mobile-navbar";
import { FilterButton } from "@/components/ui/filter-button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { sampleResults } from "@/test";
import { useReportMarkers } from "@/hooks/use-report-markers";
import Report from "@/interfaces/report";
import dynamic from 'next/dynamic';
import { useMapContext } from '@/context/map-context';
import { Marker } from "leaflet";
import { FilterOptions } from "@/components/ui/filter-dropdown";

const ReportMarkers = dynamic(
  () => import('@/components/map/report-markers'),
  { 
    ssr: false,
    loading: () => null
  }
);

export default function HomePage() {
  const [isSearchScreenVisible, setIsSearchScreenVisible] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportMarkers, setReportMarkers] = useState<Report[]>(sampleResults);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    urgency: "All",
    category: "All",
    status: "All"
  });

  // FIXME: Get rid of windows is not defined error
  // useReportMarkers(sampleResults);
  const { mapInstanceRef } = useMapContext();

  const filterReports = (reports: Report[], filters: FilterOptions) => {
    return reports.filter(report => {
      const matchesUrgency = filters.urgency === "All" || report.urgency === filters.urgency;
      const matchesCategory = filters.category === "All" || report.category === filters.category;
      const matchesStatus = filters.status === "All" || report.status === filters.status;
      
      return matchesUrgency && matchesCategory && matchesStatus;
    });
  };

  // Effect to apply filters when they change
  useEffect(() => {
    // TODO: Replace with actual API call when implemented
    // const fetchFilteredReports = async () => {
    //   const response = await fetch('/api/reports', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(activeFilters)
    //   });
    //   const data = await response.json();
    //   setReportMarkers(data);
    // };
    console.log(activeFilters);

    // For now, filter the sample data
    const filteredReports = filterReports(sampleResults, activeFilters);
    setReportMarkers(filteredReports);
  }, [activeFilters]);

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapInstanceRef.current) return;

    const markers: Marker[] = [];

    const initMarkers = async () => {
      const L = (await import('leaflet')).default;

      sampleResults.forEach((report) => {
        const { coordinates } = report.location || {};
        if (coordinates && mapInstanceRef.current) {
          const marker = L.marker([coordinates.lat, coordinates.lng], {
            draggable: false, // Make sure markers aren't draggable
            title: report.title // Show title on hover
          });

          // Add popup with report details
          marker.bindPopup(`
            <div class="text-sm">
              <h3 class="font-bold">${report.title}</h3>
              <p>${report.category}</p>
              <p class="text-xs text-gray-500">${report.status}</p>
            </div>
          `);

          marker.addTo(mapInstanceRef.current);
          markers.push(marker);
        }
      });
    };

    initMarkers();

    // Cleanup function to remove markers when component unmounts
    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [sampleResults, mapInstanceRef]);

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
      {/* <Suspense fallback={null}>
        {reportMarkers.length > 0 && (
          <ReportMarkers reports={reportMarkers} />
        )}
      </Suspense> */}
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
        onApplyFilters={handleApplyFilters}
        initialFilters={activeFilters}
      />
    </div>
  );
}
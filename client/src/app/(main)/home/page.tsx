"use client";

import SearchBar from "@/components/generic/search-bar";
import { useState } from "react";
import SearchResults from "@/components/generic/search-results";
import { MobileNavbar } from "@/components/generic/mobile-navbar";

export default function HomePage() {
  const [isSearchScreenVisible, setIsSearchScreenVisible] = useState(false);

  const openSearchScreen = () => setIsSearchScreenVisible(true);
  const closeSearchScreen = () => {
    if (isSearchScreenVisible) {
      setIsSearchScreenVisible(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* --- Mobile View Container --- */}
      <div className="md:hidden flex flex-col flex-1 min-h-0">
        {/* Mobile Header (Sticky) */}
        <div className="sticky top-0 left-0 right-0 z-20 p-4 flex flex-col items-start space-y-2">
          <div className="w-full" onClick={openSearchScreen} onFocus={openSearchScreen}>
            <SearchBar />
          </div>
        </div>

        {/* Content Area (Search Results or Main Content for Mobile) - This will be scrollable if needed */}
        <div className="flex-1 overflow-y-auto px-4">
          {isSearchScreenVisible && (
            <div className="pb-30">
              <SearchResults onClose={closeSearchScreen} />
            </div>
          )}
        </div>

        {/* Mobile Navbar (Sticky at the bottom of the mobile view container) */}
        <div className="sticky bottom-0 left-0 right-0 z-20">
          <MobileNavbar />
        </div>
      </div>
    </div>
  );
}
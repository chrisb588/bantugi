'use client';

import React, { useEffect, useState } from 'react';
import { useMapEvents, Marker, Popup, MapContainer, TileLayer, useMap as useLeafletMap } from 'react-leaflet';
import { createPortal } from 'react-dom';
import { useMapContext } from '@/context/map-context';
import type LType from 'leaflet'; // Assuming LType is your alias for Leaflet types
import { ReportCard } from '@/components/report/report-card'; // CORRECTED IMPORT
import type Report from '@/interfaces/report';
import { useDrawPins } from '@/hooks/useDrawPins';
import type Pin from '@/interfaces/pin'; // ADD: For prop types

function MapController({ centerOnUser = true }) {
  const map = useLeafletMap(); // This gets the map instance from the parent <MapContainer>
  useEffect(() => {
    if (centerOnUser && map) { // Added map null check for robustness
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo(
            [position.coords.latitude, position.coords.longitude],
            map.getZoom() || 15
          );
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [centerOnUser, map]);
  return null;
}

function LocationMarker({ showUserLocation = true }: { showUserLocation?: boolean }) {
  const [position, setPosition] = useState<LType.LatLng | null>(null);
  const { L } = useMapContext(); // Get L from the main MapProvider

  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      // Explicitly fly to the location with a desired zoom level (e.g., 16)
      map.flyTo(e.latlng, 11, { // Optional: animate the flyTo for a smoother transition
        animate: true, // Optional: enable animation
      }); 
    },
    locationerror(e) {
      console.error("Location error:", e.message);
      // You could add a user notification here if desired
    }
  });

  useEffect(() => {
    if (showUserLocation && map) {
      // Call locate without setView: true. Let the locationfound handler manage flying.
      map.locate({ maxZoom: 11, watch: false, enableHighAccuracy: true }); 
    } else if (!showUserLocation && map && (map as any).stopLocate) { // Check if map can stopLocate
      (map as any).stopLocate();
      setPosition(null); // Clear the marker position
    }
  }, [map, showUserLocation]);

  // Only render the marker if L is available, position is set, and showUserLocation is true
  if (!L || position === null || !showUserLocation) {
    return null;
  }

  const userIcon = new L.Icon.Default();

  return (
    <Marker position={position} icon={userIcon}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

interface MapFeaturesLoaderProps {
  pinsToDraw: Pin[];
  isLoadingInitialPins: boolean;
  fetchInitialPinsError: Error | null;
}

function MapFeaturesLoader({ pinsToDraw, isLoadingInitialPins, fetchInitialPinsError }: MapFeaturesLoaderProps) {
  const reactLeafletMapInstance = useLeafletMap();
  const { setMapInstance, mapInstanceRef: contextMapRef, L, isMapReady } = useMapContext();
  // State for the selected report and loading state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  // isLoading state for report details, useFetchPins has its own isLoading for pins
  const [isReportDetailsLoading, setIsReportDetailsLoading] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);

  useEffect(() => {
    if (!L) {
      console.log("MapFeaturesLoader: L module not yet available. Skipping setMapInstance.");
      return;
    }
    if (reactLeafletMapInstance && contextMapRef.current !== reactLeafletMapInstance) {
      console.log("MapFeaturesLoader: Setting map instance in context", reactLeafletMapInstance);
      setMapInstance(reactLeafletMapInstance);
    } else if (reactLeafletMapInstance && contextMapRef.current === reactLeafletMapInstance) {
      console.log("MapFeaturesLoader: Map instance already set to the same instance.");
    } else if (!reactLeafletMapInstance && contextMapRef.current !== null) {
      // If L is loaded, but reactLeafletMapInstance is now null (e.g., MapContainer unmounted),
      // and context still thinks there's a map, clear it.
      console.log("MapFeaturesLoader: reactLeafletMapInstance is null, clearing from context.");
      setMapInstance(null);
    } else if (!reactLeafletMapInstance && contextMapRef.current === null) {
      console.log("MapFeaturesLoader: reactLeafletMapInstance is null, and context map is already null.");
    }

    // REMOVE OR COMMENT OUT THE ORIGINAL CLEANUP LOGIC THAT UNCONDITIONALLY SETS MAP TO NULL
    // return () => {
    //   // Only clear the instance if this specific MapFeaturesLoader instance set it
    //   // AND if the reactLeafletMapInstance is still the one in context.
    //   // This was causing isMapReady to flicker in StrictMode.
    //   if (contextMapRef.current === reactLeafletMapInstance && reactLeafletMapInstance !== null) {
    //     console.log("MapFeaturesLoader: Clearing map instance in context on unmount for instance:", reactLeafletMapInstance);
    //     // setMapInstance(null); // Problematic line
    //   }
    // };
  }, [reactLeafletMapInstance, setMapInstance, contextMapRef, L]);

  // Function to fetch report details
  const fetchReportDetails = async (reportId: string) => {
    setIsReportDetailsLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.status}`);
      }
      const data = await response.json();
      setSelectedReport(data);
      setShowReportCard(true);
    } catch (error) {
      console.error("Error fetching report details:", error);
      // Optionally, show a toast or error message to the user
    } finally {
      setIsReportDetailsLoading(false);
    }
  };


  // Close the report card
  const handleCloseReportCard = () => {
    setShowReportCard(false);
    setSelectedReport(null);
  };

  // Function to center the map on the report's location
  const handleViewMap = () => {
    if (selectedReport?.location?.coordinates && contextMapRef.current) {
      const { lat, lng } = selectedReport.location.coordinates;
      contextMapRef.current.flyTo([lat, lng], 18);
    }
    setShowReportCard(false);
  };

  // Define your marker click handler
  const handleMarkerClick = (reportId: string) => {
    console.log("Marker clicked:", reportId);
    // All pins are now from the API, so directly fetch details.
    fetchReportDetails(reportId);
  };

  // Use pins from props
  useDrawPins(pinsToDraw, handleMarkerClick);

  // Optional: Display loading state for pins or error messages using props
  if (isLoadingInitialPins) {
    // You could return a loading indicator for the map or pins here
    // console.log("Loading pins...");
  }

  if (fetchInitialPinsError) {
    // You could display an error message on the map
    console.error("Error fetching pins for map:", fetchInitialPinsError.message);
    // Consider showing a toast notification for this error
  }

  // Create portal for the ReportCard to ensure it appears above the map
  return (
    <>
      {showReportCard && selectedReport && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <ReportCard 
            report={selectedReport} 
            onBack={handleCloseReportCard}
            onViewMap={handleViewMap}
          />
        </div>,
        document.body
      )}
      {/* Use isReportDetailsLoading for the specific loading state of the report card */}
      {isReportDetailsLoading && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p>Loading report...</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Define new props interface for MapContents that includes pin data
interface ExtendedMapProps {
  pins: Pin[];
  isLoadingPins: boolean;
  fetchPinsError: Error | null;
  className?: string;
  centerOnUser?: boolean;
  center?: [number, number];
  zoom?: number;
}

// Export MapContents which will be used in the homepage
export function MapContents({
  className,
  centerOnUser = true,
  center = [10.3157, 123.8854], // Default to Cebu City, Philippines
  zoom = 13,
  pins,
  isLoadingPins,
  fetchPinsError,
}: ExtendedMapProps) {
  const { L, isMapReady } = useMapContext(); // isMapReady can still be used for other conditional logic if needed

  // Ensure component only renders on the client and L is loaded.
  // MapContainer and its children will handle the rest.
  // MapFeaturesLoader will set the map instance, which then updates isMapReady in the context.
  if (typeof window === 'undefined' || !L) {
    return (
      <div className={className || "h-full w-full bg-gray-200 flex items-center justify-center"}>
        <p>Loading map essentials...</p>
      </div>
    );
  }

  // Log when MapContents is actually trying to render MapContainer
  console.log("MapContents: L is loaded. Rendering MapContainer. isMapReady currently:", isMapReady);

  return (
    <MapContainer
      className={className || "h-full w-full z-0"} // Ensure z-index is managed for layering
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      attributionControl={false} // Optional: disable default attribution for a cleaner UI
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* MapController handles initial centering, e.g., on user location */}
      <MapController centerOnUser={centerOnUser} />
      {/* LocationMarker shows the user's current location if permitted */}
      <LocationMarker showUserLocation={true} />
      {/* MapFeaturesLoader handles drawing pins and displaying report cards */}
      <MapFeaturesLoader
        pinsToDraw={pins}
        isLoadingInitialPins={isLoadingPins} // Prop name matches MapFeaturesLoaderProps
        fetchInitialPinsError={fetchPinsError}   // Prop name matches MapFeaturesLoaderProps
      />
    </MapContainer>
  );
}

// Ensure MapController and LocationMarker are defined as before
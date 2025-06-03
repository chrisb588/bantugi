'use client';

import React, { useEffect, useState } from 'react';
import { useMapEvents, Marker, Popup, MapContainer, TileLayer, useMap as useLeafletMap } from 'react-leaflet';
import { useMapContext } from '@/context/map-context';
import type LType from 'leaflet'; 
import type Report from '@/interfaces/report'; // Keep for type reference if any, though not directly used now
import { useDrawPins } from '@/hooks/useDrawPins';
import type Pin from '@/interfaces/pin'; 

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
  onPinClick?: (reportId: string) => void; // Add onPinClick prop
}

function MapFeaturesLoader({ pinsToDraw, isLoadingInitialPins, fetchInitialPinsError, onPinClick }: MapFeaturesLoaderProps) {
  const reactLeafletMapInstance = useLeafletMap();
  const { setMapInstance, mapInstanceRef: contextMapRef, L, isMapReady } = useMapContext();

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

  // Define your marker click handler
  const handleMarkerClick = (reportId: string) => {
    console.log("Marker clicked in MapFeaturesLoader:", reportId);
    if (onPinClick) {
      onPinClick(reportId); // Call the passed-in handler
    }
  };

  // Use pins from props, pass the modified handleMarkerClick
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

  // Remove createPortal logic for ReportCard and its loading indicator
  return null; // This component now only handles drawing pins via useDrawPins
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
  onPinClick?: (reportId: string) => void; // Add onPinClick to MapContents props
}

// Export MapContents which will be used in the homepage
export function MapContents({
  className,
  centerOnUser = false,
  center = [10.3157, 123.8854], // Default to Cebu City, Philippines
  zoom = 13,
  pins,
  isLoadingPins,
  fetchPinsError,
  onPinClick, // Destructure onPinClick
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
        isLoadingInitialPins={isLoadingPins} 
        fetchInitialPinsError={fetchPinsError}   
        onPinClick={onPinClick} // Pass onPinClick to MapFeaturesLoader
      />
    </MapContainer>
  );
}

// Ensure MapController and LocationMarker are defined as before
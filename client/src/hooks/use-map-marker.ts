import { useCallback } from 'react'; // Removed useEffect, useState
import { useMapContext } from "@/context/map-context";
import type { LatLngExpression, Marker as LeafletMarkerType, LatLng, Icon as LeafletIcon, DivIcon as LeafletDivIcon } from 'leaflet'; // Import types

export function useMapMarker() {
  // Destructure L, isMapReady directly from useMapContext
  const { mapInstanceRef, markerRef, centerOnLocation, L, isMapReady } = useMapContext();

  // No local LModule state or useEffect to import Leaflet here.
  // L from useMapContext is the single source of truth for the Leaflet module.

  const initializeMarker = useCallback((position: LatLngExpression, options?: { icon?: LeafletIcon | LeafletDivIcon, popupContent?: string | HTMLElement, draggable?: boolean }) => {
    // Use isMapReady from context, which confirms L is loaded AND map instance is set
    if (!isMapReady || !L || !mapInstanceRef.current) {
      console.warn('useMapMarker: initializeMarker returning early. Conditions not met.', { 
        isMapReady, 
        hasL: !!L, 
        hasMapInstance: !!mapInstanceRef.current 
      });
      return null;
    }
    // console.log("useMapMarker: Initializing marker at", position);
    
    // Ensure mapInstanceRef.current exists for getZoom
    if (centerOnLocation && mapInstanceRef.current) { 
        centerOnLocation(position, mapInstanceRef.current.getZoom());
    } else if (mapInstanceRef.current) { // Fallback if centerOnLocation is not available (should not happen with context)
        mapInstanceRef.current.setView(position, mapInstanceRef.current.getZoom());
    }

    if (markerRef.current) {
        markerRef.current.remove();
    }

    // Use L from context
    const marker = L.marker(position, {
        draggable: options?.draggable ?? true, // Default to true if not specified
        icon: options?.icon // Use provided icon, or Leaflet default if undefined
    });

    if (options?.popupContent) {
      marker.bindPopup(options.popupContent);
    }

    // Assign to the markerRef from context
    (markerRef as React.RefObject<LeafletMarkerType | null>).current = marker.addTo(mapInstanceRef.current);
    return markerRef.current;
  }, [mapInstanceRef, L, centerOnLocation, markerRef, isMapReady]); // Added isMapReady to dependencies

  const addMarker = useCallback((position: LatLngExpression, options?: { icon?: LeafletIcon | LeafletDivIcon, popupContent?: string | HTMLElement, draggable?: boolean }) => {
    const currentMap = mapInstanceRef.current; // Capture current map instance
    
    // Use isMapReady from context
    if (!isMapReady || !L || !currentMap) {
      console.warn('useMapMarker: addMarker returning early. Conditions not met.', { 
        isMapReady, 
        hasL: !!L, 
        hasMapInstance: !!currentMap 
      });
      return null;
    }
    // console.log("useMapMarker: Adding marker at", position);

    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Use L from context
    const marker = L.marker(position, {
        draggable: options?.draggable ?? true,
        icon: options?.icon
    });

    if (options?.popupContent) {
      marker.bindPopup(options.popupContent);
    }
    
    try {
      // Assign to the markerRef from context and add to the captured currentMap
      (markerRef as React.RefObject<LeafletMarkerType | null>).current = marker.addTo(currentMap);
      return markerRef.current;
    } catch (e) {
        console.error("Error during marker.addTo(currentMap) in useMapMarker (addMarker):", e);
        // Log additional state for debugging if needed
        return null;
    }
  }, [mapInstanceRef, L, markerRef, isMapReady]); // Added isMapReady to dependencies, removed centerOnLocation as it's not used in addMarker

  const removeMarker = useCallback(() => {
    if (markerRef.current) {
      // console.log("useMapMarker: Removing marker");
      markerRef.current.remove();
      (markerRef as React.RefObject<LeafletMarkerType | null>).current = null; // Explicitly set to null
    }
  }, [markerRef]);

  const getMarkerPosition = useCallback((): LatLng | undefined => {
    return markerRef.current?.getLatLng();
  }, [markerRef]);

  return {
    L, // Expose L from context
    isLoaded: isMapReady, // Expose overall readiness state
    initializeMarker,
    addMarker,
    removeMarker,
    getMarkerPosition,
  };
}
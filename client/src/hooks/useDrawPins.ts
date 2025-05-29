import { useEffect, useRef, useCallback } from 'react';
import { useMapContext } from '@/context/map-context';
import type Pin from '@/interfaces/pin';
import type { Marker as LeafletMarker, Icon as LeafletIconType } from 'leaflet';

// Helper to create a marker icon based on urgency
const createUrgencyPinIcon = (L: typeof import('leaflet'), urgency: "Low" | "Medium" | "High"): LeafletIconType => {
  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 26" width="24" height="26">
      <defs>
        <filter id="ellipse-shadow-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>
      <!-- Shadow Ellipse -->
      <ellipse cx="12" cy="21.5" rx="6" ry="2" fill="black" fill-opacity="0.4" filter="url(#ellipse-shadow-blur)"/>
      
      <!-- Pin Path -->
      <path d="M12 22C12 22 5 14.25 5 9C5 5.13 8.13 2 12 2C15.87 2 19 5.13 19 9C19 14.25 12 22 12 22Z" fill="${
      urgency === 'High' ? '#930157' : // Dark Red/Purple for High
      urgency === 'Medium' ? '#B8180D' : // Red for Medium
      '#EA9F41' // Orange for Low
    }"/>
      <!-- Center Circle -->
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  `.trim();
  // Ensure this runs only client-side for window.btoa
  const iconUrl = typeof window !== 'undefined' ? `data:image/svg+xml;base64,${window.btoa(iconSvg)}` : '';

  return L.icon({
    iconUrl,
    iconSize: [52, 56], // Adjusted for new viewBox aspect ratio
    iconAnchor: [26, 47], // Adjusted for new viewBox and iconSize (pin tip at svg y=22)
    popupAnchor: [0, -43], // Adjusted relative to new iconAnchor
  });
};

export function useDrawPins(
  pins: Pin[],
  onMarkerClick?: (reportId: string) => void
) {
  const { mapInstanceRef, isMapReady, L } = useMapContext();
  const markersRef = useRef<LeafletMarker[]>([]);
  const onMarkerClickRef = useRef(onMarkerClick); // Store callback in ref to avoid dependency issues

  // Update ref when callback changes
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  console.log('[useDrawPins] Hook called/re-rendered. Received pins count:', pins ? pins.length : 'null/undefined', 'isMapReady:', isMapReady, 'L:', !!L, 'mapInstance:', !!mapInstanceRef.current);

  useEffect(() => {
    console.log(`[useDrawPins] useEffect triggered. isMapReady: ${isMapReady}, L: ${!!L}, mapInstance: ${!!mapInstanceRef.current}, pins count: ${pins ? pins.length : 'null/undefined'}`);
    if (!isMapReady || !L || !mapInstanceRef.current) {
      console.log("[useDrawPins] useEffect: Prerequisites (map, L) not met. Clearing markers and returning.");
      markersRef.current.forEach(marker => {
        if (onMarkerClick) marker.off('click'); // Attempt to remove listeners
      });
      markersRef.current = [];
      return;
    }
    const map = mapInstanceRef.current;

    console.log("[useDrawPins] useEffect: Clearing existing markers.");
    markersRef.current.forEach(marker => {
      if (onMarkerClickRef.current) {
        marker.off('click'); // Remove previous click listeners to prevent memory leaks
      }
      marker.remove();
    });
    markersRef.current = [];

    if (!pins || pins.length === 0) {
      console.log("[useDrawPins] useEffect: No pins to draw. Returning.");
      return;
    }

    console.log("[useDrawPins] useEffect: Drawing new pins. Count:", pins.length);
    const newMarkers: LeafletMarker[] = [];
    pins.forEach((pin) => {
      if (typeof pin.lat !== 'number' || typeof pin.lng !== 'number' || !pin.report_id) {
        console.warn("[useDrawPins] Invalid pin data, skipping:", pin);
        return;
      }

      // Use the new function to create an icon based on urgency
      const markerIcon = createUrgencyPinIcon(L, pin.urgency);
      
      const marker = L.marker([pin.lat, pin.lng], {
        icon: markerIcon,
      });

      if (onMarkerClickRef.current) {
        marker.on('click', () => {
          onMarkerClickRef.current!(pin.report_id); // Pass report_id as per existing usage
        });
      }

      marker.addTo(map);
      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;
    console.log("[useDrawPins] useEffect: Finished drawing pins. Stored markers count:", markersRef.current.length);

    return () => {
      console.log("[useDrawPins] useEffect cleanup: Removing markers. Count:", markersRef.current.length);
      markersRef.current.forEach(marker => {
        if (onMarkerClickRef.current) {
          marker.off('click'); // Clean up click listeners
        }
        // Ensure map and L are available for marker removal, though usually they are
        if (map && L) {
            try {
                marker.remove();
            } catch(e) {
                // console.warn("[useDrawPins CLEANUP] Error removing marker:", e);
            }
        }
      });
      markersRef.current = [];
      console.log("[useDrawPins] useEffect cleanup: Finished removing markers.");
    };
  }, [pins, isMapReady, mapInstanceRef, L]); // Removed onMarkerClick from dependencies to prevent infinite loops
}
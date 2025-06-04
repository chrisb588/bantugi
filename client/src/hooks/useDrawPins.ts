import { useEffect, useRef } from 'react';
import { useMapContext } from '@/context/map-context';
import type Pin from '@/interfaces/pin';
import type { Marker as LeafletMarker, Icon as LeafletIconType } from 'leaflet';

// Helper to create a default marker icon.
const createDefaultPinIcon = (L: typeof import('leaflet')): LeafletIconType => {
  return new L.Icon.Default() as LeafletIconType;
};

export function useDrawPins(
  pins: Pin[],
  onMarkerClick?: (reportId: string) => void
) {
  const { mapInstanceRef, isMapReady, L } = useMapContext();
  const markersRef = useRef<LeafletMarker[]>([]);

  useEffect(() => {
    if (!isMapReady || !L || !mapInstanceRef.current) {
      // If map is not ready, ensure any markers in ref are cleared (though they shouldn't be on map)
      markersRef.current.forEach(marker => {
        if (onMarkerClick) marker.off('click'); // Attempt to remove listeners
      });
      markersRef.current = [];
      return;
    }
    const map = mapInstanceRef.current;

    // Clear existing markers from the map and the ref
    markersRef.current.forEach(marker => {
      if (onMarkerClick) {
        marker.off('click'); // Remove previous click listeners to prevent memory leaks
      }
      marker.remove();
    });
    markersRef.current = [];

    if (!pins || pins.length === 0) {
      return; // No pins to draw
    }

    const newMarkers: LeafletMarker[] = [];
    pins.forEach((pin) => {
      if (typeof pin.lat !== 'number' || typeof pin.lng !== 'number' || !pin.report_id) {
        console.warn("[useDrawPins] Invalid pin data, skipping:", pin);
        return;
      }

      const markerIcon = createDefaultPinIcon(L);
      
      const marker = L.marker([pin.lat, pin.lng], {
        icon: markerIcon,
      });

      if (onMarkerClick) {
        marker.on('click', () => {
          onMarkerClick(pin.report_id); // Pass report_id as per existing usage
        });
      }

      marker.addTo(map);
      newMarkers.push(marker);
    });

    markersRef.current = newMarkers; // Store new markers

    // Cleanup function for when the component unmounts or dependencies change
    return () => {
      markersRef.current.forEach(marker => {
        if (onMarkerClick) {
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
    };
  }, [pins, isMapReady, mapInstanceRef, L, onMarkerClick]);
}
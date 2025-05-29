'use client';

import { useEffect, useRef } from 'react';
import type { Marker as LeafletMarker, Icon as LeafletIconType } from 'leaflet';
import { useMapContext } from '@/context/map-context';
import type Report from '@/interfaces/report';
import type Pin from '@/interfaces/pin';

// Create marker icon based on urgency
const createReportMarkerIcon = (L: typeof import('leaflet'), urgency: string = 'Low'): LeafletIconType => {
  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${
      urgency === 'High' ? '#930157' :
      urgency === 'Medium' ? '#B8180D' :
      '#EA9F41'
    }" width="24" height="24">
      <circle cx="12" cy="12" r="8"/>
    </svg>
  `.trim();
  const iconUrl = typeof window !== 'undefined' ? `data:image/svg+xml;base64,${window.btoa(iconSvg)}` : '';

  return L.icon({
    iconUrl,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Updated to accept pins instead of reports and a callback for marker clicks
export function useReportMarkers(
  pins: Pin[], 
  onMarkerClick: (reportId: string) => void
) {
  const { mapInstanceRef, isMapReady, L } = useMapContext();
  const markersRef = useRef<LeafletMarker[]>([]);

  useEffect(() => {
    // Guard: Ensure L is loaded from context and map is ready
    if (!L || !isMapReady) {
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          try {
            marker.remove();
          } catch (e) {
            // Silent cleanup error
          }
        });
        markersRef.current = [];
      }
      return;
    }

    const map = mapInstanceRef.current;
    if (!map) {
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
      }
      return;
    }

    // Clear existing markers before adding new ones
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (!pins || pins.length === 0) {
      return;
    }

    pins.forEach((pin) => {
      try {
        if (typeof pin.lat !== 'number' || typeof pin.lng !== 'number') {
          return;
        }

        // Create a basic marker (no urgency info from Pin)
        const markerIcon = createReportMarkerIcon(L);
        
        const marker = L.marker([pin.lat, pin.lng], {
          icon: markerIcon,
        });

        // Instead of binding a popup, add a click handler
        marker.on('click', () => {
          onMarkerClick(pin.report_id);
        });

        marker.addTo(map);
        markersRef.current.push(marker);
      } catch (error) {
        console.error("[useReportMarkers] Error creating marker for pin:", pin.report_id, error);
      }
    });

    return () => {
      const currentMapInstance = mapInstanceRef.current;
      if (L && currentMapInstance && markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          try {
            // Remove event listeners
            marker.off('click');
            marker.remove();
          } catch (e) {
            // Silent cleanup error
          }
        });
        markersRef.current = [];
      }
    };
  }, [pins, L, isMapReady, mapInstanceRef, onMarkerClick]);
}
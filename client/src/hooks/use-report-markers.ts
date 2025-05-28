'use client';

import { useEffect, useRef, useState } from 'react';
import type { Marker as LeafletMarker, Icon } from 'leaflet'; // Import types only
import { useMapContext } from '@/context/map-context';
import type  Report from '@/interfaces/report';

// creates a Leaflet icon based on urgency level
const createReportMarkerIcon = (L: typeof import('leaflet'), urgency: string): Icon => {
  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${
      urgency === 'High' ? '#930157' : 
      urgency === 'Medium' ? '#B8180D' : 
      '#EA9F41'
    }" width="24" height="24">
      <circle cx="12" cy="12" r="8"/>
    </svg>
  `.trim();
  // Ensure window.btoa is only called client-side
  const iconUrl = `data:image/svg+xml;base64,${window.btoa(iconSvg)}`;

  return L.icon({
    iconUrl,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export function useReportMarkers(reports: Report[]) {
  const { mapInstanceRef, isMapReady } = useMapContext(); // Use isMapReady
  const markersRef = useRef<LeafletMarker[]>([]);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet on the client side
    import('leaflet')
      .then(leafletModule => {
        // Ensure you're accessing the default export correctly if necessary
        // For 'leaflet', it's usually the module itself or module.default
        setL(leafletModule.default || leafletModule); 
      })
      .catch(err => console.error("Failed to load Leaflet:", err));
  }, []); // Run once on mount to load Leaflet

  useEffect(() => {
    // Guard against running on server or if Leaflet/Map not ready
    if (typeof window === 'undefined' || !L || !isMapReady) {
      return;
    }

    const map = mapInstanceRef.current;
    if (!map) { // Additional check for map instance
        console.warn("useReportMarkers: Map instance not available yet.");
        return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (!reports || reports.length === 0) {
      return; // No reports to display
    }

    console.log(`[useReportMarkers] Processing ${reports.length} reports. L and map are ready.`);

    reports.forEach((report) => {
      try { // Add try-catch for robustness during marker creation
        if (!report?.location?.coordinates || typeof report.location.coordinates.lat !== 'number' || typeof report.location.coordinates.lng !== 'number') {
          console.warn("[useReportMarkers] Skipping report due to invalid location/coordinates:", report.title || 'Untitled Report');
          return;
        }

        const { coordinates } = report.location;
        const markerIcon = createReportMarkerIcon(L, report.urgency);
        
        const marker = L.marker([coordinates.lat, coordinates.lng], {
          icon: markerIcon,
        });

        marker.bindPopup(`
          <div class="text-sm">
            <h3 class="font-bold">${report.title || 'Untitled Report'}</h3>
            <p>${report.category || 'No Category'}</p>
            <p class="text-xs text-gray-500">${report.status || 'No Status'}</p>
          </div>
        `);

        marker.addTo(map);
        markersRef.current.push(marker);
      } catch (error) {
        console.error("[useReportMarkers] Error creating marker for report:", report.title || 'Untitled Report', error);
      }
    });

    // Cleanup function
    return () => {
      if (map && markersRef.current.length > 0) { // Check map to avoid errors if map unmounts first
        console.log("[useReportMarkers] Cleaning up markers.");
        markersRef.current.forEach(marker => {
          try {
            marker.remove();
          } catch (e) {
            console.warn("[useReportMarkers] Error removing marker during cleanup:", e);
          }
        });
        markersRef.current = [];
      }
    };
  }, [reports, L, isMapReady, mapInstanceRef]); // Depend on isMapReady and the mapInstanceRef object

}
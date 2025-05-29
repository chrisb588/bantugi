'use client';

import { useEffect } from 'react';
import type { Marker } from 'leaflet';
import { useMapContext } from '@/context/map-context';
import type Report from '@/interfaces/report';

export function useReportMarkers(reports: Report[]) {
  const { mapInstanceRef } = useMapContext();
  
  useEffect(() => {
    if (typeof window === 'undefined' || !mapInstanceRef.current) return;

    const markers: Marker[] = [];

    const initMarkers = async () => {
      const L = (await import('leaflet')).default;

      const createMarkerIcon = (urgency: string) => {
        const iconUrl = `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${
            urgency === 'High' ? '#930157' : 
            urgency === 'Medium' ? '#B8180D' : 
            '#EA9F41'
          }" width="24" height="24">
            <circle cx="12" cy="12" r="8"/>
          </svg>
        `)}`;

        return L.icon({
          iconUrl,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        });
      };

      reports.forEach((report) => {
        const { coordinates } = report.location || {};
        if (coordinates && mapInstanceRef.current) {
          const marker = L.marker([coordinates.lat, coordinates.lng], {
            icon: createMarkerIcon(report.urgency),
          });

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

    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [reports, mapInstanceRef]);
}
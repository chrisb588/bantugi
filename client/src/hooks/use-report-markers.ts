'use client';

import { useEffect } from 'react';
import type { Marker } from 'leaflet';
import { useMapContext } from '@/context/map-context';
import type Report from '@/interfaces/report';

// Extend Window interface for our custom navigation function
declare global {
  interface Window {
    reportNavigation: (reportId: number) => void;
  }
}

export function useReportMarkers(reports: Report[]) {
  const { mapInstanceRef, mapReady } = useMapContext();
  
  useEffect(() => {
    if (typeof window === 'undefined' || !mapReady || !mapInstanceRef.current) return;

    const markers: Marker[] = [];

    const initMarkers = async () => {
      const L = (await import('leaflet')).default;

      const createMarkerIcon = (urgency: string) => {
        const color = urgency === 'High' ? '#930157' : 
                     urgency === 'Medium' ? '#B8180D' : 
                     '#EA9F41'; // Low urgency

        const iconUrl = `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" fill="${color}">
            <path d="M12.5,0C5.596,0,0,5.596,0,12.5c0,4.5,2.5,8.4,6.2,10.4l6.3,15.6l6.3-15.6c3.7-2,6.2-5.9,6.2-10.4C25,5.596,19.404,0,12.5,0z"/>
            <circle cx="12.5" cy="12.5" r="6" fill="white"/>
          </svg>
        `)}`;

        const shadowUrl = `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41" fill="none">
            <ellipse cx="12.5" cy="38" rx="10" ry="3" fill="#000000" opacity="0.3"/>
          </svg>
        `)}`;

        return L.icon({
          iconUrl,
          shadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
          shadowAnchor: [10, 38]
        });
      };

      // Add navigation function to window object for popup access
      if (typeof window !== 'undefined') {
        window.reportNavigation = (reportId: number) => {
          window.location.href = `/report/${reportId}`;
        };
      }

      reports.forEach((report) => {
        const { coordinates } = report.location || {};
        if (coordinates && mapInstanceRef.current) {
          const marker = L.marker([coordinates.lat, coordinates.lng], {
            icon: createMarkerIcon(report.urgency),
            draggable: false,
            title: report.title
          });

          // Create popup content as a unified card
          const popupContent = `
            <div style="
              background-color: rgba(245, 243, 233, 0.95); 
              color: #240502; 
              border-radius: 0.75rem; 
              padding: 1rem; 
              min-width: 200px; 
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border: 1px solid #B8180D;
              font-family: var(--font-satoshi), sans-serif;
              backdrop-filter: blur(4px);
            ">
              <h3 style="
                font-weight: bold; 
                font-size: 1rem; 
                margin-bottom: 0.5rem; 
                color: #240502;
                line-height: 1.25;
              ">${report.title}</h3>
              
              <p style="
                color: #240502; 
                margin-bottom: 0.25rem; 
                font-size: 0.875rem;
              ">${report.category}</p>
              
              <p style="
                color: #240502; 
                opacity: 0.7; 
                font-size: 0.75rem; 
                margin-bottom: 1rem;
              ">${report.status}</p>
              
              <div style="text-align: center;">
                <button 
                  onclick="window.reportNavigation(${report.id})" 
                  style="
                    background-color: #B8180D; 
                    color: #F5F3E9; 
                    font-size: 0.875rem; 
                    font-weight: 500;
                    padding: 0.5rem 1rem; 
                    border-radius: 0.375rem; 
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                  "
                  onmouseover="this.style.backgroundColor='#EA9F41'"
                  onmouseout="this.style.backgroundColor='#B8180D'"
                >
                  View Report
                </button>
              </div>
            </div>
          `;

          // Create popup with custom options to remove default styling
          const popup = L.popup({
            closeButton: false,
            autoClose: true,
            closeOnEscapeKey: true,
            className: 'custom-popup'
          }).setContent(popupContent);

          marker.bindPopup(popup);
          marker.addTo(mapInstanceRef.current);
          markers.push(marker);
        }
      });

      // Add custom CSS to remove default popup styling
      if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = `
          .custom-popup .leaflet-popup-content-wrapper {
            background: transparent !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .custom-popup .leaflet-popup-tip {
            display: none !important;
          }
          .custom-popup .leaflet-popup-content {
            margin: 0 !important;
            padding: 0 !important;
          }
        `;
        document.head.appendChild(style);
      }
    };

    initMarkers();

    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [reports, mapReady, mapInstanceRef]);
}
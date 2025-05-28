'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap as useLeafletMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { Report } from '@/interfaces/report';

async function fetchLocations(centerLat: number, centerLng: number, maxDistanceMeters: number = 5000) {
  console.log(`Attempting to fetch locations for center: [${centerLat}, ${centerLng}], distance: ${maxDistanceMeters}m`);
  try {
    const response = await fetch(`/api/location?center_lat=${centerLat}&center_lng=${centerLng}&max_distance_meters=${maxDistanceMeters}`);
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json(); // Try to parse error as JSON
      } catch (e) {
        errorData = await response.text(); // Fallback to text
      }
      console.error(`Error fetching locations: ${response.status} ${response.statusText}`, errorData);
      throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("fetchLocations caught an error:", error);
    // If it's a TypeError: Failed to fetch, it's a true network level error or CORS.
    // Otherwise, it might be an error from the !response.ok block or response.json() parsing.
    return [];
  }
}

// Fix Leaflet icon issue in Next.js
const icon = L.icon({
  iconUrl: '/marker/marker-icon.png',
  iconRetinaUrl: '/marker/marker-icon-2x.png',
  shadowUrl: '/marker/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  centerOnUser?: boolean; // New prop to control if map should center on user
}

// This component handles map center updates
function MapController({ centerOnUser = true }) {
  const map = useLeafletMap();
  
  useEffect(() => {
    if (centerOnUser) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo(
            [position.coords.latitude, position.coords.longitude],
            map.getZoom()
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

// This component handles user location marker
function LocationMarker({ showUserLocation = true }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (showUserLocation) {
      map.locate({ setView: false });
    }
  }, [map, showUserLocation]);

  return position === null ? null : (
    <Marker position={position} icon={icon}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default function Map({
  center = [10.32256745, 123.898804407153], 
  zoom = 17,
  className = '',
  centerOnUser = false,
}: MapProps) {
  const router = useRouter();
  // The 'reports' state will now hold an array of { latitude: number, longitude: number }
  const [reports, setReports] = useState<{ latitude: number; longitude: number; }[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: center[0], lng: center[1] });

  useEffect(() => { 
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const handleMarkerClick = (reportId: string) => {
    router.push(`/reports/${reportId}`);
  };

  function MapEventHandler() {
    const map = useMapEvents({
      moveend: () => {
        const center = map.getCenter();
        setMapCenter({ lat: center.lat, lng: center.lng });
        
        // Fetch reports when map moves
        const fetchReportsOnMapMove = async () => {
          console.log('Map move ended, preparing to fetch locations.');
          try {
            const nearbyCoords = await fetchLocations(center.lat, center.lng, 5000);
            // Ensure nearbyCoords is an array before setting state
            if (Array.isArray(nearbyCoords)) {
              setReports(nearbyCoords);
            } else {
              console.error("fetchLocations did not return an array:", nearbyCoords);
              setReports([]); // Set to empty array on error or unexpected format
            }
          } catch (error) {
            console.error('Error fetching nearby reports:', error);
            setReports([]); // Set to empty array on error
          }
        };
        
        fetchReportsOnMapMove();
      },
    });
    return null;
  }

  return (
    <div 
      className={`w-full h-screen ${className}`} 
      style={{ position: 'relative', zIndex: 0 }}
    >
      <MapContainer 
        center={[center[0], center[1]]}
        zoom={zoom}
        style={{ height: '100vh', width: '100%', zIndex: 1 }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker showUserLocation={true} />
        <MapController centerOnUser={centerOnUser} />
        <MapEventHandler />
        
        {/* Render clickable report markers */}
        {reports.map((coords, index) => ( // Changed 'report' to 'coords' and added 'index'
          <Marker 
            key={index} // Using index as key since 'id' is not available. Consider a more stable key if possible.
            position={[coords.latitude, coords.longitude]} // Directly use latitude and longitude
            icon={icon}
            eventHandlers={{
              click: () => console.log(`Coordinates: ${coords.latitude}, ${coords.longitude}`),
            }}
          >
            <Popup>
              <div>
                <p>Coordinates:</p>
                <p>Lat: {coords.latitude}</p>
                <p>Lng: {coords.longitude}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export function useMap() {
  return dynamic(
    () => import('@/components/map/map'),
    { 
      ssr: false,
      loading: () => <div className="w-full h-screen flex items-center justify-center bg-background">Loading map...</div>
    }
  );
}
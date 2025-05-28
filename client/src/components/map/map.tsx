'use client';

import React, { useEffect, useState } from 'react';
import type LType from 'leaflet';
import { MapContainer, TileLayer, Popup, useMapEvents, useMap as useLeafletMap, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useVisibleReports } from '@/hooks/use-visible-reports';
import { useReportMarkers } from '@/hooks/use-report-markers';
import { useMapContext } from '@/context/map-context'; // No MapProvider import here for the default export

interface MapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  centerOnUser?: boolean;
}

function MapController({ centerOnUser = true }) {
  const map = useLeafletMap();
  useEffect(() => {
    if (centerOnUser) {
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

function LocationMarker({ 
  showUserLocation = true, 
  userLocationIconInstance 
}: { 
  showUserLocation?: boolean; 
  userLocationIconInstance: LType.Icon | LType.Icon.Default | null;
}) {
  const [position, setPosition] = useState<LType.LatLng | null>(null);
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

  if (position === null || !userLocationIconInstance) {
    return null;
  }

  return (
    <Marker position={position} icon={userLocationIconInstance}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

function MapFeaturesLoader() {
  const map = useLeafletMap();
  const { setMapInstance, mapInstanceRef } = useMapContext(); // Consumes context

  useEffect(() => {
    // Add a log to see when this runs and what 'map' is
    console.log("MapFeaturesLoader: map from useLeafletMap:", map);
    if (map && mapInstanceRef.current !== map) {
      console.log("MapFeaturesLoader: Setting map instance in context.");
      setMapInstance(map);
    }
  }, [map, setMapInstance, mapInstanceRef]);

  const visibleReports = useVisibleReports();
  useReportMarkers(visibleReports);

  return null;
}

// This is the component that will be dynamically imported.
// It no longer renders MapProvider.
export default function MapContents({ // Consider renaming if 'Map' is confusing
  center = [10.32256745, 123.898804407153],
  zoom = 17,
  className = '',
  centerOnUser = false,
}: MapProps) {
  const [L, setL] = useState<typeof LType | null>(null);
  const [userLocationIcon, setUserLocationIcon] = useState<LType.Icon | LType.Icon.Default | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    import('leaflet').then(leafletModule => {
      const leaflet = leafletModule.default || leafletModule;
      setL(leaflet);

      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: '/marker/marker-icon-2x.png',
        iconUrl: '/marker/marker-icon.png',
        shadowUrl: '/marker/marker-shadow.png',
      });
      
      setUserLocationIcon(leaflet.icon({
        iconUrl: '/marker/marker-icon.png',
        iconRetinaUrl: '/marker/marker-icon-2x.png',
        shadowUrl: '/marker/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }));

    }).catch(err => console.error("Failed to load Leaflet in MapContents", err));
  }, []);

  if (!isClient || !L || !userLocationIcon) {
    return (
      <div className={`w-full h-screen flex items-center justify-center bg-background ${className}`}>
        Loading map contents...
      </div>
    );
  }

  return (
    // No MapProvider here
    <div
      className={`w-full h-screen ${className}`}
      style={{ position: 'relative', zIndex: 0 }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100vh', width: '100%', zIndex: 1 }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker showUserLocation={true} userLocationIconInstance={userLocationIcon} />
        <MapController centerOnUser={centerOnUser} />
        <MapFeaturesLoader /> {/* This will use the context from MapProvider in CreateReportPage */}
      </MapContainer>
    </div>
  );
}
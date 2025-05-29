'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';
import type { Map, Marker, LatLngExpression, LatLngBounds, LatLng } from 'leaflet';

interface MapContextType {
  mapInstanceRef: React.RefObject<Map | null>;
  markerRef: React.RefObject<Marker | null>;
  updateMapView: (center: LatLngExpression, zoom: number) => void;
  centerOnLocation: (location: LatLngExpression) => void;
  getBounds: () => LatLngBounds | null;
  getReportsWithinRadius: (center: LatLng, radiusKm: number) => Promise<void>;
}

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const mapInstanceRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  const updateMapView = (center: LatLngExpression, zoom: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  };

  const centerOnLocation = (location: LatLngExpression) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(location, 18);
    }
  };

  const getBounds = () => {
    return mapInstanceRef.current?.getBounds() || null;
  };

  const getReportsWithinRadius = async (center: LatLng, radiusKm: number) => {
    if (!mapInstanceRef.current) return;

    // TODO: Implement API call here
    // Example API endpoint structure:
    // GET /api/reports?lat=${center.lat}&lng=${center.lng}&radius=${radiusKm}
    
    try {
      // const response = await fetch(`/api/reports?lat=${center.lat}&lng=${center.lng}&radius=${radiusKm}`);
      // const data = await response.json();
      // return data;
    } catch (error) {
      console.error('Failed to fetch reports within radius:', error);
    }
  };

  return (
    <MapContext.Provider value={{ 
      mapInstanceRef, 
      markerRef, 
      updateMapView,
      centerOnLocation,
      getBounds,
      getReportsWithinRadius
    }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
}
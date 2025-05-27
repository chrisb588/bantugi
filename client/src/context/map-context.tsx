import React, { createContext, useContext, useRef, ReactNode } from 'react';
import L from 'leaflet';
import { LatLngExpression } from 'leaflet';

interface MapContextType {
  mapInstanceRef: React.RefObject<L.Map | null>;
  markerRef: React.RefObject<L.Marker | null>;
  updateMapView: (center: LatLngExpression, zoom: number) => void;
  centerOnLocation: (location: LatLngExpression) => void;
  getBounds: () => L.LatLngBounds | null;
}

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const updateMapView = (center: LatLngExpression, zoom: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  };

  const centerOnLocation = (location: LatLngExpression) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(location, 18); // Zoom level 18 for detailed view
    }
  };

  const getBounds = () => {
    return mapInstanceRef.current?.getBounds() || null;
  };

  return (
    <MapContext.Provider value={{ 
      mapInstanceRef, 
      markerRef, 
      updateMapView,
      centerOnLocation,
      getBounds
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
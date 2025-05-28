import React, { createContext, useContext, useRef, ReactNode, useCallback, RefObject, useState, useMemo } from 'react'; // Changed MutableRefObject to RefObject
import L, { LatLngExpression, LatLngBounds } from 'leaflet';

interface MapContextType {
  mapInstanceRef: RefObject<L.Map | null>; // Changed to RefObject
  setMapInstance: (map: L.Map | null) => void;
  markerRef: RefObject<L.Marker | null>; // Changed to RefObject
  updateMapView: (center: LatLngExpression, zoom: number) => void;
  centerOnLocation: (location: LatLngExpression, zoom?: number) => void;
  getBounds: () => LatLngBounds | null;
  isMapReady: boolean;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const setMapInstance = useCallback((map: L.Map | null) => {
    console.log("MapContext: setMapInstance called with map:", !!map);
    (mapInstanceRef as React.RefObject<L.Map | null>).current = map; // Type assertion for assignment
    setIsMapReady(!!map);
  }, []);

  const updateMapView = useCallback((center: LatLngExpression, zoom: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, []);

  const centerOnLocation = useCallback((location: LatLngExpression, zoom?: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(location, zoom || mapInstanceRef.current.getZoom());
    }
  }, []);

  const getBounds = useCallback((): LatLngBounds | null => {
    return mapInstanceRef.current?.getBounds() || null;
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    mapInstanceRef,
    setMapInstance,
    markerRef,
    updateMapView,
    centerOnLocation,
    getBounds,
    isMapReady,
  }), [setMapInstance, updateMapView, centerOnLocation, getBounds, isMapReady]);

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext(): MapContextType {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
}
import React, { createContext, useContext, useRef, ReactNode, useCallback, RefObject, useState, useEffect } from 'react';
// Import types from leaflet, but not L itself at the top level for the provider
import type { Map as LeafletMap, Marker as LeafletMarker, LatLngExpression, LatLngBounds } from 'leaflet';

interface MapContextType {
  mapInstanceRef: RefObject<LeafletMap | null>;
  setMapInstance: (map: LeafletMap | null) => void;
  markerRef: RefObject<LeafletMarker | null>;
  updateMapView: (center: LatLngExpression, zoom: number) => void;
  centerOnLocation: (location: LatLngExpression, zoom?: number) => void;
  getBounds: () => LatLngBounds | null;
  L: typeof import('leaflet') | null; // <<< ADDED: To provide the Leaflet module instance
  isMapReady: boolean;
  resetMapInstance: () => void; // Add recovery function
  mapResetKey: number; // Add reset key for forcing MapContainer remount
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  
  const [L, setL] = useState<typeof import('leaflet') | null>(null); // <<< ADDED: State for Leaflet module
  const [isLModuleLoaded, setIsLModuleLoaded] = useState(false);
  const [isMapInstanceSet, setIsMapInstanceSet] = useState(false);
  const [mapResetKey, setMapResetKey] = useState(0); // Add reset key to force MapContainer remount

  useEffect(() => {
    // Dynamically import Leaflet
    import('leaflet').then(leaflet => {
      const LModule = leaflet.default || leaflet; // Handle CJS/ESM interop
      setL(LModule);
      setIsLModuleLoaded(true);

      // --- Default Icon Configuration ---
      delete (LModule.Icon.Default.prototype as any)._getIconUrl;
      LModule.Icon.Default.mergeOptions({
        iconRetinaUrl: '/marker/marker-icon-2x.png',
        iconUrl: '/marker/marker-icon.png',
        shadowUrl: '/marker/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });
      // --- End of Default Icon Configuration ---
      console.log("MapProvider: Leaflet (L) loaded and icons configured.");
    }).catch(err => console.error("MapProvider: Failed to load Leaflet", err));
  }, []);

  const setMapInstance = useCallback((map: LeafletMap | null) => {
    console.log("MapContext: setMapInstance called with map:", !!map);
    mapInstanceRef.current = map; 
    setIsMapInstanceSet(!!map);
  }, []);
  
  const isMapReady = isLModuleLoaded && isMapInstanceSet;

  useEffect(() => {
    // Simplified log for isMapReady changes
    console.log(`MapProvider: isMapReady is now ${isMapReady}. (L: ${isLModuleLoaded}, MapInstance: ${isMapInstanceSet})`);
  }, [isMapReady, isLModuleLoaded, isMapInstanceSet]);

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

  // Add recovery function to reset map instance when it becomes broken
  const resetMapInstance = useCallback(() => {
    console.log("MapContext: resetMapInstance called - resetting map state");
    console.log("MapContext: Before reset - mapInstanceRef.current:", !!mapInstanceRef.current, "isMapInstanceSet:", isMapInstanceSet);
    mapInstanceRef.current = null;
    setIsMapInstanceSet(false);
    setMapResetKey(prev => prev + 1); // Increment key to force MapContainer remount
    console.log("MapContext: After reset - mapInstanceRef.current:", !!mapInstanceRef.current, "isMapInstanceSet will become:", false, "mapResetKey incremented");
  }, [isMapInstanceSet]);

  // Restore useMemo
  const contextValue = React.useMemo(() => ({
    mapInstanceRef,
    setMapInstance,
    markerRef,
    updateMapView,
    centerOnLocation,
    getBounds,
    L, 
    isMapReady,
    resetMapInstance,
    mapResetKey,
  }), [L, setMapInstance, updateMapView, centerOnLocation, getBounds, isMapReady, resetMapInstance, mapResetKey, /* mapInstanceRef is stable, markerRef is stable */]);


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
import { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { useMapContext } from "@/context/map-context";
import type { LatLngExpression, Marker as LeafletMarker, LatLng } from 'leaflet'; // Import types

export function useMapMarker() {
  const { mapInstanceRef, markerRef, centerOnLocation } = useMapContext();
  const [LModule, setLModule] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    import('leaflet').then(leafletModule => {
      setLModule(leafletModule.default || leafletModule); // Handle CJS/ESM interop
      console.log("Leaflet (L) loaded in useMapMarker:", !!(leafletModule.default || leafletModule));
    }).catch(err => console.error("Failed to load Leaflet in useMapMarker", err));
  }, []);

  const initializeMarker = useCallback((position: LatLngExpression) => {
    if (!mapInstanceRef.current || !LModule) {
      console.log('useMapMarker: initializeMarker returning early. MapInstance:', !!mapInstanceRef.current, 'LModule loaded:', !!LModule);
      return null;
    }
    console.log("useMapMarker: Initializing marker at", position);
    centerOnLocation(position, mapInstanceRef.current.getZoom()); // Center map
    if (markerRef.current) {
        markerRef.current.remove();
    }
    markerRef.current = LModule.marker(position, { draggable: true })
      .addTo(mapInstanceRef.current);
    return markerRef.current;
  }, [mapInstanceRef, LModule, centerOnLocation, markerRef]);

  const addMarker = useCallback((position: LatLngExpression) => {
    if (!mapInstanceRef.current || !LModule) {
      console.log('useMapMarker: addMarker returning early. MapInstance:', !!mapInstanceRef.current, 'LModule loaded:', !!LModule);
      return null;
    }
    console.log("useMapMarker: Adding marker at", position);
    if (markerRef.current) {
      markerRef.current.remove();
    }
    centerOnLocation(position, mapInstanceRef.current.getZoom()); // Center map
    markerRef.current = LModule.marker(position, { draggable: true })
      .addTo(mapInstanceRef.current);
    return markerRef.current;
  }, [mapInstanceRef, LModule, centerOnLocation, markerRef]);

  const removeMarker = useCallback(() => {
    if (markerRef.current) {
      console.log("useMapMarker: Removing marker");
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [markerRef]);

  const getMarkerPosition = useCallback((): LatLng | undefined => {
    return markerRef.current?.getLatLng();
  }, [markerRef]);

  return {
    L: LModule, // Expose L
    initializeMarker,
    addMarker,
    removeMarker,
    getMarkerPosition,
  };
}
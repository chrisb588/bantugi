import { useMapContext } from "@/context/map-context";
import L from "leaflet";

export function useMapMarker() {
  const { mapInstanceRef, markerRef, centerOnLocation } = useMapContext();

  const initializeMarker = (position: L.LatLngExpression) => {
    if (!mapInstanceRef.current) return;

    // Center map on the initial position
    centerOnLocation(position);

    // Create initial marker
    markerRef.current = L.marker(position, { draggable: true })
      .addTo(mapInstanceRef.current);

    return markerRef.current;
  };

  const addMarker = (position: L.LatLngExpression) => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker if any
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create new marker
    markerRef.current = L.marker(position, { draggable: true })
      .addTo(mapInstanceRef.current);

    return markerRef.current;
  };

  const removeMarker = () => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  const getMarkerPosition = () => {
    return markerRef.current?.getLatLng();
  };

  return {
    initializeMarker,
    addMarker,
    removeMarker,
    getMarkerPosition,
  };
}
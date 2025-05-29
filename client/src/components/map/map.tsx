import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import { useMapContext } from '@/context/map-context';

interface MapProps {
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
}

export default function Map({
  center = [10.32256745, 123.898804407153],
  zoom = 17,
  className = '',
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { mapInstanceRef, setMapReady } = useMapContext();

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 36,
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.zoomControl.remove();

      // Set map as ready after initialization
      setMapReady(true);

      return () => {
        if (mapInstanceRef.current) {
          setMapReady(false);
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, [center, zoom, mapInstanceRef, setMapReady]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom, mapInstanceRef]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-screen ${className}`} 
      style={{ position: 'relative', zIndex: 0 }}
    />
  );
}
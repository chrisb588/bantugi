import { useState, useEffect } from 'react';
import { useMapContext } from '@/context/map-context';
import type Report from '@/interfaces/report';
import type { LatLngBounds } from 'leaflet';
import { sampleResults } from '@/test';

export function useVisibleReports() {
  const [visibleReports, setVisibleReports] = useState<Report[]>([]);
  const { mapInstanceRef } = useMapContext();

  const fetchReportsInBounds = (bounds: LatLngBounds) => {
    // Placeholder: Filter sample results based on bounds
    const reportsInBounds = sampleResults.filter(report => {
      if (!report.location?.coordinates) return false;
      
      const { lat, lng } = report.location.coordinates;
      return bounds.contains([lat, lng]);
    });

    setVisibleReports(reportsInBounds);
  };

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Initial fetch based on current bounds
    const initialBounds = mapInstanceRef.current.getBounds();
    fetchReportsInBounds(initialBounds);

    // Listen for map movements
    const handleMoveEnd = () => {
      if (!mapInstanceRef.current) return;
      const newBounds = mapInstanceRef.current.getBounds();
      fetchReportsInBounds(newBounds);
    };

    mapInstanceRef.current.on('moveend', handleMoveEnd);

    return () => {
      mapInstanceRef.current?.off('moveend', handleMoveEnd);
    };
  }, [mapInstanceRef.current]);

  return visibleReports;
}
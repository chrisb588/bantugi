import { useState, useEffect, useCallback } from 'react';
import { useMapContext } from '@/context/map-context';
import type Report from '@/interfaces/report';
import type { LatLngBounds } from 'leaflet';
import { fetchLocations } from '@/lib/supabase/location';

export function useVisibleReports() {
  const [visibleReports, setVisibleReports] = useState<Report[]>([]);
  const { mapInstanceRef } = useMapContext();

  // IMPORTANT: This function needs to fetch full Report objects, not just coordinates.
  // For now, it uses sampleResults.
  const fetchReportsInBounds = useCallback(async (bounds: LatLngBounds | null) => {
    if (!bounds) return;

    const reportsInBounds = await fetchLocations(bounds.getSouthWest().lat, bounds.getSouthWest().lng, bounds.getNorthEast().lat, bounds.getNorthEast().lng);
    setVisibleReports(reportsInBounds);

  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const initialBounds = map.getBounds();
    fetchReportsInBounds(initialBounds);

    const handleMoveEnd = () => {
      const newBounds = map.getBounds();
      fetchReportsInBounds(newBounds);
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [mapInstanceRef.current, fetchReportsInBounds]); // Depend on the actual map instance

  return visibleReports;
}
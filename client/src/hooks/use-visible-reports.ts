import { useState, useEffect } from 'react';
import { useMapContext } from '@/context/map-context';
import type Report from '@/interfaces/report';
import { sampleResults } from '@/test';

export function useVisibleReports() {
  const [visibleReports, setVisibleReports] = useState<Report[]>([]);
  const { mapInstanceRef } = useMapContext();

  useEffect(() => {
    if (typeof window === 'undefined' || !mapInstanceRef.current) return;

    const updateVisibleReports = () => {
      const bounds = mapInstanceRef.current?.getBounds();
      if (!bounds) return;

      // Filter reports within bounds
      const reportsInBounds = sampleResults.filter(report => {
        if (!report.location?.coordinates) return false;
        const { lat, lng } = report.location.coordinates;
        return bounds.contains([lat, lng]);
      });

      setVisibleReports(reportsInBounds);
    };

    // Initial update
    updateVisibleReports();

    // Update on map movement
    mapInstanceRef.current.on('moveend', updateVisibleReports);

    return () => {
      mapInstanceRef.current?.off('moveend', updateVisibleReports);
    };
  }, []);

  return visibleReports;
}
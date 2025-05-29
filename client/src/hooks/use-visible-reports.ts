import { useState, useEffect, useCallback, useRef } from 'react';
import { useMapContext } from '@/context/map-context';
import type Report from '@/interfaces/report';
import type { LatLngBounds } from 'leaflet';
import { useRouter, usePathname } from 'next/navigation';
import Pin from '@/interfaces/pin'; // Assuming Pin is the type for your markers
// NEW: Helper function to call your API route
async function fetchReportsFromApi(
  swLat: number,
  swLng: number,
  neLat: number,
  neLng: number,
  signal?: AbortSignal // Keep the signal for aborting
): Promise<Pin[]> {
  // Construct the query parameters
  const params = new URLSearchParams({
    sw_lat: swLat.toString(),
    sw_lng: swLng.toString(),
    ne_lat: neLat.toString(),
    ne_lng: neLng.toString(),
  });

  console.log(`[useVisibleReports] Fetching from API: /api/location?${params.toString()}`);

  // Use the standard fetch API
  const response = await fetch(`/api/location?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    signal, // Pass the abort signal to the fetch call
  });

  // Check if the request was successful
  if (!response.ok) {
    // Try to parse error details if available
    let errorMessage = `API request failed with status ${response.status}`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
        // If parsing fails, use the original status message
    }
    // If fetch was aborted, it will throw an 'AbortError',
    // which will be caught below. Here we throw for other errors.
    throw new Error(errorMessage);
  }

  // Parse the JSON response and return it
  return await response.json();
}


// Updated Hook
export function useVisibleReports() {
  const [visibleReports, setVisibleReports] = useState<Pin[]>([]);
  const { mapInstanceRef, isMapReady } = useMapContext();
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Add this navigation effect to abort requests when routes change
  useEffect(() => {
    // When pathname changes, abort any in-flight requests
    return () => {
      if (abortControllerRef.current) {
        console.log("[useVisibleReports] Navigation detected, aborting requests");
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [pathname]); // This dependency triggers the cleanup on route changes

  // Use beforeunload to abort requests when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Abort any in-flight requests when navigating away
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    
    // This catches both internal Next.js route changes and full page navigations
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // For Next.js route changes (optional, if you're using Next.js router events)
    // This requires importing the router: import { useRouter } from 'next/router';
    // const router = useRouter();
    // router.events.on('routeChangeStart', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // if using router events: router.events.off('routeChangeStart', handleBeforeUnload);
    };
  }, []);

  const fetchReportsInBounds = useCallback(async (bounds: LatLngBounds | null) => {
    if (!bounds) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const reportsInBounds = await fetchReportsFromApi(
        bounds.getSouthWest().lat,
        bounds.getSouthWest().lng,
        bounds.getNorthEast().lat,
        bounds.getNorthEast().lng,
        signal
      );

      if (!signal.aborted) {
        setVisibleReports(reportsInBounds);
      }
    } catch (error: any) {
      // Broader detection of abort-related errors
      if (
        signal.aborted || 
        error.name === 'AbortError' || 
        (error.message && (
          error.message.includes('aborted') || 
          error.message.includes('NetworkError') ||  // Add this to catch browser aborts
          error.message.includes('network')  // Sometimes the error message varies
        ))
      ) {
        // This is an expected abort, either from our AbortController or from navigation
        console.log('[useVisibleReports] Request terminated (aborted, navigation, or network interruption)');
      } else {
        // Only log truly unexpected errors
        console.error('[useVisibleReports] Error fetching reports via API:', error);
      }
    } finally {
        if (abortControllerRef.current?.signal === signal) {
             abortControllerRef.current = null;
        }
    }
  }, []);


  useEffect(() => {
    // console.log(`[useVisibleReports effect] Running. isMapReady: ${isMapReady}`);
    if (!isMapReady) {
      return;
    }
    const mapFromHookStart = mapInstanceRef.current; // Capture instance at effect run time
    if (!mapFromHookStart) {
      // console.log("[useVisibleReports effect] No map instance from context.");
      return;
    }

    // console.log("[useVisibleReports effect] Initializing fetch and moveend listener.");
    const initialBounds = mapFromHookStart.getBounds();
    fetchReportsInBounds(initialBounds);

    const handleMoveEnd = () => {
      const currentMap = mapInstanceRef.current; // Get latest instance for moveend
      if (currentMap) {
        const newBounds = currentMap.getBounds();
        fetchReportsInBounds(newBounds);
      }
    };

    mapFromHookStart.on('moveend', handleMoveEnd);

    return () => {
      // console.log('[useVisibleReports CLEANUP] Starting.');
      // Use the map instance from the ref *at the time of cleanup*
      const mapAtCleanup = mapInstanceRef.current;
      if (mapAtCleanup && typeof mapAtCleanup.off === 'function') {
        // console.log('[useVisibleReports CLEANUP] Removing moveend listener.');
        mapAtCleanup.off('moveend', handleMoveEnd);
      } else {
        // console.warn('[useVisibleReports CLEANUP] Map instance not available or no .off method during cleanup.');
      }

      if (abortControllerRef.current) {
        // console.log('[useVisibleReports CLEANUP] Aborting ongoing fetch.');
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // console.log('[useVisibleReports CLEANUP] Finished.');
    };
  }, [isMapReady, mapInstanceRef, fetchReportsInBounds]);

  return visibleReports;
}
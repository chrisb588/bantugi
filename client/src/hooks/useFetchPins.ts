import { useState, useEffect, useCallback, useRef } from 'react';
import { useMapContext } from '@/context/map-context';
import type Pin from '@/interfaces/pin';
import type { LatLngBounds, Map as LeafletMap } from 'leaflet'; // Added LeafletMap type
import { usePathname } from 'next/navigation';

// Helper function to fetch pins from the API (remains the same)
async function fetchPinsDataFromApi(bounds: LatLngBounds, signal?: AbortSignal): Promise<Pin[]> {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const params = new URLSearchParams({
    sw_lat: sw.lat.toString(),
    sw_lng: sw.lng.toString(),
    ne_lat: ne.lat.toString(),
    ne_lng: ne.lng.toString(),
  });

  const response = await fetch(`/api/location?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // If parsing error message fails, use the original status message
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export function useFetchPins() {
  const { mapInstanceRef, isMapReady, L } = useMapContext();
  const [pins, setPins] = useState<Pin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pathname = usePathname();

  // Effect to abort ongoing fetch if the component using this hook unmounts
  // This is primarily triggered by route changes via `pathname`.
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        // console.log("[useFetchPins] Unmount cleanup: Aborting fetch.");
        abortControllerRef.current.abort();
        abortControllerRef.current = null; // Clear the ref immediately on unmount
      }
    };
  }, [pathname]); // Only depends on pathname for unmount behavior of the hook instance

  const fetchPinsInBounds = useCallback(async (currentMap: LeafletMap) => {
    if (!L) {
      // console.warn("[useFetchPins] Leaflet (L) not ready.");
      return;
    }
    const bounds = currentMap.getBounds();
    if (!bounds) {
      // console.warn("[useFetchPins] Map bounds not available.");
      return;
    }

    // If there's an existing controller (from a previous call that might still be running), abort it.
    if (abortControllerRef.current) {
      // console.log("[useFetchPins] New fetch requested: Aborting previous fetch.");
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for the new fetch request.
    const controller = new AbortController();
    abortControllerRef.current = controller; // Store this controller as the current one
    const signal = controller.signal;

    setIsLoading(true);
    setError(null);

    try {
      // console.log("[useFetchPins] Fetching pins for bounds:", bounds);
      const fetchedPins = await fetchPinsDataFromApi(bounds, signal);
      // Only update state if the request was not aborted.
      if (!signal.aborted) {
        setPins(fetchedPins);
      } else {
        // console.log("[useFetchPins] Fetch was aborted before setting pins.");
      }
    } catch (err: any) {
      // If the signal for THIS request was aborted (by us), don't treat it as an error.
      if (!signal.aborted) {
        console.error("[useFetchPins] Error fetching pins:", err.message, err);
        setError(err);
      } else {
        // console.log("[useFetchPins] Fetch aborted as intended, error caught:", err.message);
      }
    } finally {
      // Only modify state if this controller is still the "current" one.
      // This prevents an older, aborted request's finally block from interfering
      // with a newer request or unmounted component state.
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null; // This request is done (completed or aborted by itself), clear its controller.
      }
      // If abortControllerRef.current is not 'controller', it means either:
      // 1. A newer fetch has started and replaced it in the ref.
      // 2. The component unmounted, and the unmount cleanup set abortControllerRef.current to null.
      // In either case, this specific (older or unmounted) fetch should not alter global loading state.
    }
  }, [L]); // Depends on L. mapInstanceRef is accessed via currentMap.

  // Effect to fetch pins on map ready and on map move/zoom
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !L) {
      return;
    }
    const map = mapInstanceRef.current;

    fetchPinsInBounds(map); // Initial fetch

    const handleMoveEnd = () => {
      fetchPinsInBounds(map);
    };

    map.on('moveend', handleMoveEnd);

    // Cleanup for this effect (removes event listener)
    return () => {
      map.off('moveend', handleMoveEnd);
      // The active AbortController (if any) is handled by:
      // 1. The start of fetchPinsInBounds (if a new fetch begins due to moveend).
      // 2. The main unmount cleanup (useEffect with pathname dependency) if the component is removed.
    };
  }, [isMapReady, mapInstanceRef, L, fetchPinsInBounds]);

  return { pins, isLoading, error };
}
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMapContext } from '@/context/map-context';
import type Pin from '@/interfaces/pin';
import type { LatLngBounds, Map as LeafletMap } from 'leaflet';
import { usePathname } from 'next/navigation';

// Client-side in-memory cache with enhanced structure
const pinsCache = new Map<string, { data: Pin[], timestamp: number, bounds: LatLngBounds }>();
// Increase cache expiry time for better cross-view performance
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes (increased for better cross-view caching)
const DEBOUNCE_DELAY_MS = 150; // 150ms

// Function to clear all pins cache entries
export function clearAllPinsCache(): void {
  console.log('[useFetchPins] Clearing all pins cache entries');
  pinsCache.clear();
}

// Generate cache key for client-side cache
function generateClientCacheKey(bounds: LatLngBounds): string {
  // Round to 3 decimal places (about 111 meters precision at the equator)
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const precision = 3;
  return `map:bounds:${sw.lat.toFixed(precision)}:${sw.lng.toFixed(precision)}:${ne.lat.toFixed(precision)}:${ne.lng.toFixed(precision)}`;
}

// Helper function to check if bounds are similar enough to use cached data
function areBoundsSimilar(boundsA: LatLngBounds, boundsB: LatLngBounds, tolerancePercent = 30): boolean {
  const swA = boundsA.getSouthWest();
  const neA = boundsA.getNorthEast();
  const swB = boundsB.getSouthWest();
  const neB = boundsB.getNorthEast();
  
  // Calculate area of each bounds
  const areaA = (neA.lat - swA.lat) * (neA.lng - swA.lng);
  const areaB = (neB.lat - swB.lat) * (neB.lng - swB.lng);
  
  // Calculate overlap area
  const overlapSW = {
    lat: Math.max(swA.lat, swB.lat),
    lng: Math.max(swA.lng, swB.lng)
  };
  const overlapNE = {
    lat: Math.min(neA.lat, neB.lat),
    lng: Math.min(neA.lng, neB.lng)
  };
  
  // If there's no overlap, bounds are not similar
  if (overlapSW.lat > overlapNE.lat || overlapSW.lng > overlapNE.lng) {
    return false;
  }
  
  // Calculate overlap area
  const overlapArea = (overlapNE.lat - overlapSW.lat) * (overlapNE.lng - overlapSW.lng);
  
  // Calculate overlap percentage relative to both areas
  const overlapPercentA = (overlapArea / areaA) * 100;
  const overlapPercentB = (overlapArea / areaB) * 100;
  
  // Bounds are similar if the overlap is significant for both areas
  return overlapPercentA >= (100 - tolerancePercent) && 
         overlapPercentB >= (100 - tolerancePercent);
}

// Enhanced function to find the best cached data for given bounds
function findBestCachedData(targetBounds: LatLngBounds, L: any): Pin[] | null {
  const now = Date.now();
  let bestMatch: { data: Pin[], overlap: number } | null = null;
  
  // Check all cache entries for potential matches
  for (const [key, entry] of pinsCache.entries()) {
    // Skip expired cache entries
    if (now - entry.timestamp >= CACHE_EXPIRY_MS) {
      pinsCache.delete(key);
      continue;
    }
    
    // Calculate overlap with cached bounds
    if (entry.bounds) {
      const swA = targetBounds.getSouthWest();
      const neA = targetBounds.getNorthEast();
      const swB = entry.bounds.getSouthWest();
      const neB = entry.bounds.getNorthEast();
      
      // Calculate overlap area
      const overlapSW = {
        lat: Math.max(swA.lat, swB.lat),
        lng: Math.max(swA.lng, swB.lng)
      };
      const overlapNE = {
        lat: Math.min(neA.lat, neB.lat),
        lng: Math.min(neA.lng, neB.lng)
      };
      
      // Check if there's overlap
      if (overlapSW.lat < overlapNE.lat && overlapSW.lng < overlapNE.lng) {
        const overlapArea = (overlapNE.lat - overlapSW.lat) * (overlapNE.lng - overlapSW.lng);
        const targetArea = (neA.lat - swA.lat) * (neA.lng - swA.lng);
        const overlapPercentage = (overlapArea / targetArea) * 100;
        
        // If we have significant overlap (>= 60%), consider this a good match
        if (overlapPercentage >= 60) {
          if (!bestMatch || overlapPercentage > bestMatch.overlap) {
            bestMatch = { data: entry.data, overlap: overlapPercentage };
          }
        }
      }
    }
  }
  
  if (bestMatch) {
    console.log(`[useFetchPins] Found cached data with ${bestMatch.overlap.toFixed(1)}% overlap`);
    return bestMatch.data;
  }
  
  return null;
}

// Helper function to fetch pins from the API (remains the same)
async function fetchPinsDataFromApi(bounds: LatLngBounds, signal?: AbortSignal, skipCache = false): Promise<Pin[]> {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const params = new URLSearchParams({
    sw_lat: sw.lat.toString(),
    sw_lng: sw.lng.toString(),
    ne_lat: ne.lat.toString(),
    ne_lng: ne.lng.toString(),
  });
  
  // Add skip_cache parameter if needed
  if (skipCache) {
    params.append('skip_cache', 'true');
  }
  
  // CRITICAL LOG: Confirm this function is entered and fetch is attempted
  console.log('[useFetchPins] fetchPinsDataFromApi: ATTEMPTING FETCH from URL:', `/api/location?${params.toString()}`);
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
  
  // Check if response was served from cache
  const cacheStatus = response.headers.get('X-Cache');
  console.log(`[useFetchPins] fetchPinsDataFromApi: Server cache status: ${cacheStatus || 'Not available'}`);
  
  console.log('[useFetchPins] fetchPinsDataFromApi: Raw response OK, parsing JSON.');
  const data = await response.json();
  console.log('[useFetchPins] fetchPinsDataFromApi: Parsed data:', data);
  return data;
}

export function useFetchPins() {
  const { mapInstanceRef, isMapReady, L, resetMapInstance, mapResetKey } = useMapContext();
  // ADD THIS LOG to see if the hook re-renders when isMapReady changes:
  console.log(`[useFetchPins] HOOK BODY EXECUTING. isMapReady: ${isMapReady}, mapInstanceRef.current: ${!!mapInstanceRef.current}, L: ${!!L}`);

  const [pins, setPins] = useState<Pin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pathname = usePathname();
  // const initialFetchDoneRef = useRef(false); // REPLACED
  const initialLoadSetupDoneRef = useRef(false); // To prevent re-running setup logic within map.whenReady
  const initialFetchTriggeredRef = useRef(false); // To ensure the initial fetch action runs only once
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if we're in recovery mode to force initial fetch after reset
  const isRecoveringRef = useRef(false);

  // ADDED: useEffect to watch isMapReady specifically
  useEffect(() => {
    console.log(`[useFetchPins] isMapReady WATCHER effect: isMapReady is now ${isMapReady}. L is ${!!L}. Map instance is ${!!mapInstanceRef.current}. mapResetKey: ${mapResetKey}`);
  }, [isMapReady, L, mapInstanceRef, mapResetKey]); // Watch all relevant context values

  // Reset refs when map is reset to allow fresh initialization
  useEffect(() => {
    console.log(`[useFetchPins] Reset detection effect triggered - isMapReady: ${isMapReady}, isRecoveringRef.current: ${isRecoveringRef.current}`);
    if (!isMapReady) {
      // Map has been reset, clear initialization refs to allow re-setup
      initialLoadSetupDoneRef.current = false;
      initialFetchTriggeredRef.current = false;
      isRecoveringRef.current = true; // Mark as recovering
      console.log("[useFetchPins] Map reset detected, clearing initialization refs and marking as recovering");
    } else if (isRecoveringRef.current && isMapReady) {
      // Map has recovered, reset the recovery flag
      isRecoveringRef.current = false;
      console.log("[useFetchPins] Map recovery completed, reset recovery flag");
    }
  }, [isMapReady]);

  // Effect to abort ongoing fetch if the component using this hook unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log("[useFetchPins] Unmount cleanup: Aborting fetch.");
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (debounceTimeoutRef.current) { // ADDED: Clear debounce timer on unmount
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [pathname]);

  const fetchPinsInBounds = useCallback(async (currentMap: LeafletMap, isInitialLoadAttempt: boolean = false) => {
    // CRITICAL LOG: Confirm this function is entered
    console.log(`[useFetchPins] fetchPinsInBounds: ENTERED. isInitialLoadAttempt: ${isInitialLoadAttempt}, L ready: ${!!L}, Map valid: ${!!currentMap}`);
    if (!L) {
      console.warn("[useFetchPins] fetchPinsInBounds: Leaflet (L) not ready. Bailing.");
      return;
    }
    // CRITICAL LOG: Check if currentMap is valid
    if (!currentMap || typeof currentMap.getBounds !== 'function') {
      console.warn("[useFetchPins] fetchPinsInBounds: currentMap is invalid or not a Leaflet map instance. Bailing.");
      return;
    }

    // ADDED: Check if map container exists and is properly initialized
    let container;
    try {
      container = currentMap.getContainer();
      if (!container) {
        console.warn("[useFetchPins] fetchPinsInBounds: Map container not available. Bailing.");
        return;
      }
    } catch (error) {
      console.warn("[useFetchPins] fetchPinsInBounds: Error getting map container:", error);
      return;
    }

    // ADDED: Check if container is still connected to DOM
    if (!container.parentNode || !document.contains(container)) {
      console.warn("[useFetchPins] fetchPinsInBounds: Map container is detached from DOM. Triggering reset.");
      isRecoveringRef.current = true;
      if (resetMapInstance) {
        resetMapInstance();
      }
      return;
    }

    // ADDED: Check if map has valid size
    let size;
    try {
      size = currentMap.getSize();
      if (!size || size.x === 0 || size.y === 0) {
        console.warn("[useFetchPins] fetchPinsInBounds: Map has invalid size. Bailing.");
        return;
      }
    } catch (error) {
      console.warn("[useFetchPins] fetchPinsInBounds: Error getting map size:", error);
      return;
    }

    let bounds;
    try {
      bounds = currentMap.getBounds();
    } catch (error) {
      console.warn("[useFetchPins] fetchPinsInBounds: Error getting bounds:", error);
      
      // Check if this is the "t is undefined" or similar DOM element error
      if (error instanceof Error && (
        error.message.includes('t is undefined') || 
        error.message.includes('Cannot read properties of undefined') ||
        error.message.includes('undefined') ||
        error.stack?.includes('_getMapPanePos') ||
        error.stack?.includes('getPixelBounds')
      )) {
        console.warn("[useFetchPins] fetchPinsInBounds: Detected map DOM element error. Triggering map reset.");
        // Mark as recovering and trigger map reset to allow re-initialization
        isRecoveringRef.current = true;
        if (resetMapInstance) {
          resetMapInstance();
        }
      }
      return;
    }
    
    if (!bounds) {
      console.warn("[useFetchPins] fetchPinsInBounds: Map bounds not available. Bailing.");
      return;
    }

    // ADDED: Check for zero-area bounds
    if (bounds.getSouthWest().equals(bounds.getNorthEast())) {
      console.warn("[useFetchPins] fetchPinsInBounds: Map returned zero-area bounds. Bailing for this attempt. Bounds:", bounds);
      return;
    }
    
    // NEW: Enhanced client-side cache check
    const cacheKey = generateClientCacheKey(bounds);
    const cachedEntry = pinsCache.get(cacheKey);
    const now = Date.now();
    
    // If we have a valid exact cache entry, use it
    if (cachedEntry && (now - cachedEntry.timestamp < CACHE_EXPIRY_MS)) {
      console.log("[useFetchPins] fetchPinsInBounds: Client cache HIT (exact match). Using cached pins. Count:", cachedEntry.data.length);
      setPins(cachedEntry.data);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    // If no exact match, try to find overlapping cached data
    const bestCachedData = findBestCachedData(bounds, L);
    if (bestCachedData) {
      console.log("[useFetchPins] fetchPinsInBounds: Using overlapping cached data. Count:", bestCachedData.length);
      setPins(bestCachedData);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (abortControllerRef.current) {
      console.log("[useFetchPins] fetchPinsInBounds: New fetch requested: Aborting previous fetch.");
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    console.log("[useFetchPins] fetchPinsInBounds: Setting isLoading to true. Fetching for bounds:", bounds);
    setIsLoading(true);
    setError(null);

    try {
      // Force skip cache on initial load and recovery to ensure fresh data
      const skipCache = isInitialLoadAttempt || isRecoveringRef.current;
      const fetchedPins = await fetchPinsDataFromApi(bounds, signal, skipCache);
      
      if (!signal.aborted) {
        // Update state with fetched pins
        setPins(fetchedPins);
        console.log("[useFetchPins] fetchPinsInBounds: Successfully fetched and set pins. Count:", fetchedPins ? fetchedPins.length : 'undefined/null');
        
        // Update client-side cache with bounds
        pinsCache.set(cacheKey, {
          data: fetchedPins,
          timestamp: Date.now(),
          bounds: bounds
        });
        
        // Cleanup old cache entries
        const cacheCleanupTime = Date.now() - CACHE_EXPIRY_MS;
        for (const [key, entry] of pinsCache.entries()) {
          if (entry.timestamp < cacheCleanupTime) {
            pinsCache.delete(key);
          }
        }
        
        setError(null);
      } else {
        console.log("[useFetchPins] fetchPinsInBounds: Fetch was aborted before setting pins.");
      }
    } catch (err: any) {
      if (signal.aborted || abortControllerRef.current === null) {
        console.log(`[useFetchPins] fetchPinsInBounds: Fetch aborted as expected (signal.aborted: ${signal.aborted}, abortControllerRef.current is null: ${abortControllerRef.current === null}). Error name: ${err.name}, Message: ${err.message}`);
      } else {
        console.error("[useFetchPins] fetchPinsInBounds: True error fetching pins:", err);
        setError(err);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        console.log("[useFetchPins] fetchPinsInBounds: finally block - controller is current. Setting isLoading to false.");
        setIsLoading(false);
      } else {
        console.log("[useFetchPins] fetchPinsInBounds: finally block - controller is NOT current or unmounted. Not changing isLoading.");
      }
    }
  }, [L, resetMapInstance]); // Stable reference with L and resetMapInstance dependencies

  // Special effect to trigger immediate fetch after recovery
  useEffect(() => {
    console.log(`[useFetchPins] Recovery effect triggered - isMapReady: ${isMapReady}, mapInstance: ${!!mapInstanceRef.current}, L: ${!!L}, isRecovering: ${isRecoveringRef.current}`);
    if (isMapReady && mapInstanceRef.current && L && isRecoveringRef.current) {
      console.log("[useFetchPins] Recovery mode: Map is ready after reset, triggering immediate fetch");
      const map = mapInstanceRef.current;
      
      // Trigger immediate fetch after recovery
      setTimeout(() => {
        if (map && mapInstanceRef.current === map) {
          console.log("[useFetchPins] Recovery mode: Executing recovery fetch");
          fetchPinsInBounds(map, true);
          isRecoveringRef.current = false;
        } else {
          console.log("[useFetchPins] Recovery mode: Map instance changed, skipping recovery fetch");
        }
      }, 100); // Small delay to ensure map is fully ready
    }
  }, [isMapReady, mapInstanceRef, L, fetchPinsInBounds]);

  // MODIFIED: Effect to fetch pins on map ready, map 'load' (for initial), and map 'moveend'
  useEffect(() => {
    console.log(`[useFetchPins] Main effect: ENTRY. isMapReady: ${isMapReady}, mapInstance: ${!!mapInstanceRef.current}, L: ${!!L}, initialLoadSetupDone: ${initialLoadSetupDoneRef.current}, initialFetchTriggered: ${initialFetchTriggeredRef.current}, mapResetKey: ${mapResetKey}`);
    if (!isMapReady || !mapInstanceRef.current || !L) {
      console.log("[useFetchPins] Main effect: Prerequisites NOT MET. Returning.");
      return;
    }

    const map = mapInstanceRef.current;

    // ADDED: Additional safety check for map readiness
    try {
      const container = map.getContainer();
      if (!container) {
        console.log("[useFetchPins] Main effect: Map container not available. Returning.");
        return;
      }
      
      // Check if container is still connected to DOM
      if (!container.parentNode || !document.contains(container)) {
        console.log("[useFetchPins] Main effect: Map container is detached from DOM. Triggering reset.");
        isRecoveringRef.current = true;
        if (resetMapInstance) {
          resetMapInstance();
        }
        return;
      }
      
      const size = map.getSize();
      if (!size || size.x === 0 || size.y === 0) {
        console.log("[useFetchPins] Main effect: Map has invalid size. Returning.");
        return;
      }
    } catch (error) {
      console.log("[useFetchPins] Main effect: Error checking map state:", error);
      // If we can't even check the map state, it's likely broken - trigger reset
      if (error instanceof Error && (
        error.message.includes('t is undefined') ||
        error.message.includes('Cannot read properties of undefined') ||
        error.stack?.includes('_getMapPanePos')
      )) {
        console.log("[useFetchPins] Main effect: Detected map DOM error, triggering reset");
        isRecoveringRef.current = true;
        if (resetMapInstance) {
          resetMapInstance();
        }
      }
      return;
    }

    // CRITICAL LOG: Confirm prerequisites are met
    console.log("[useFetchPins] Main effect: Prerequisites MET. Proceeding with map interaction setup.");

    const handleInitialMapLoad = () => {
      // CRITICAL LOG: Confirm this handler is called
      console.log(`[useFetchPins] handleInitialMapLoad: CALLED. initialFetchTriggeredRef.current: ${initialFetchTriggeredRef.current}`);
      if (initialFetchTriggeredRef.current) {
        console.log("[useFetchPins] handleInitialMapLoad: Initial fetch already triggered. Removing listener and returning.");
        map.off('load', handleInitialMapLoad); // Ensure listener is removed
        return;
      }
      console.log("[useFetchPins] handleInitialMapLoad: Setting initialFetchTriggeredRef to true AND CALLING fetchPinsInBounds.");
      initialFetchTriggeredRef.current = true; // Mark that the initial fetch has been triggered
      
      fetchPinsInBounds(map, true); // Pass true for isInitialLoadAttempt
      map.off('load', handleInitialMapLoad); // Self-removing listener after it has run
    };

    const handleMoveEnd = () => {
      console.log("[useFetchPins] map.on('moveend'): Triggered.");
      
      // Get current map bounds
      try {
        const bounds = map.getBounds();
        if (!bounds) {
          console.warn("[useFetchPins] handleMoveEnd: Could not get map bounds");
          return;
        }
        
        // Check if we have valid bounds with area
        if (bounds.getSouthWest().equals(bounds.getNorthEast())) {
          console.warn("[useFetchPins] handleMoveEnd: Zero-area bounds, skipping fetch");
          return;
        }
        
        // Clear any existing timeout
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        // Set a new timeout
        debounceTimeoutRef.current = setTimeout(() => {
          console.log("[useFetchPins] debouncedFetch: Calling fetchPinsInBounds after debounce.");
          fetchPinsInBounds(map);
        }, DEBOUNCE_DELAY_MS);
      } catch (error) {
        console.error("[useFetchPins] handleMoveEnd: Error getting map bounds", error);
      }
    };

    map.whenReady(() => {
      // CRITICAL LOG: Confirm map.whenReady callback is executed
      console.log(`[useFetchPins] map.whenReady(): CALLED. initialLoadSetupDoneRef.current: ${initialLoadSetupDoneRef.current}`);
      if (!initialLoadSetupDoneRef.current) {
        console.log("[useFetchPins] map.whenReady(): Initial load setup NOT YET DONE. Proceeding with setup.");

        if (!initialFetchTriggeredRef.current) {
          console.log("[useFetchPins] map.whenReady(): Attaching 'load' listener (initialFetchTriggeredRef is false).");
          map.on('load', handleInitialMapLoad);
        } else {
          console.log("[useFetchPins] map.whenReady(): NOT attaching 'load' listener (initialFetchTriggeredRef is true).");
        }
        
        if (map.getContainer() && map.getSize().x > 0 && map.getSize().y > 0) {
          console.log("[useFetchPins] map.whenReady(): Map appears to be already loaded. Scheduling FALLBACK for handleInitialMapLoad.");
          setTimeout(() => {
            // CRITICAL LOG: Confirm fallback timeout callback is executed
            console.log(`[useFetchPins] map.whenReady() -> setTimeout FALLBACK: CALLED. initialFetchTriggeredRef.current: ${initialFetchTriggeredRef.current}`);
            if (!initialFetchTriggeredRef.current) {
              console.log("[useFetchPins] map.whenReady() -> setTimeout FALLBACK: Initial fetch not yet triggered. Calling handleInitialMapLoad.");
              handleInitialMapLoad();
            } else {
              console.log("[useFetchPins] map.whenReady() -> setTimeout FALLBACK: Initial fetch was already triggered. Fallback NOT calling handleInitialMapLoad.");
            }
          }, 100); 
        } else {
           console.log("[useFetchPins] map.whenReady(): Map does NOT appear to be loaded (no container/zero size). Fallback NOT scheduled via this path.");
        }
        
        initialLoadSetupDoneRef.current = true; 
        console.log("[useFetchPins] map.whenReady(): Set initialLoadSetupDoneRef to true.");
      } else {
        console.log("[useFetchPins] map.whenReady(): Initial load setup WAS ALREADY DONE. Not re-running setup.");
      }
    });

    map.on('moveend', handleMoveEnd);
    console.log("[useFetchPins] Main effect: Attached 'moveend' listener.");

    return () => {
      console.log("[useFetchPins] Main effect: Cleanup. Removing listeners.");
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (map && (map as any)._leaflet_id) {
        try {
          // handleInitialMapLoad removes itself, but good to be thorough if it might not have run.
          map.off('load', handleInitialMapLoad); 
          map.off('moveend', handleMoveEnd);
        } catch (e) {
          console.warn("[useFetchPins] Error during listener cleanup:", e);
        }
      }
      // Reset refs related to initial load if the map instance changes or context invalidates,
      // allowing re-initialization if needed. This depends on when this effect cleans up and re-runs.
      // For now, they are not reset here, assuming they are for the lifetime of the hook instance
      // unless the map context fully resets.
    };
  }, [isMapReady, mapInstanceRef, L, fetchPinsInBounds, resetMapInstance, mapResetKey]);

  // Clean up expired cache entries
  useEffect(() => {
    const now = Date.now();
    const cacheCleanupTime = now - CACHE_EXPIRY_MS;
    
    for (const [key, entry] of pinsCache.entries()) {
      if (entry.timestamp < cacheCleanupTime) {
        pinsCache.delete(key);
      }
    }
  }, [pins]);

  // Add an event listener for cache invalidation
  useEffect(() => {
    const handleClearCache = () => {
      console.log("[useFetchPins] Received clear-map-pins-cache event, clearing cache");
      clearAllPinsCache();
      
      // If map is ready, trigger a refresh
      if (isMapReady && mapInstanceRef.current) {
        console.log("[useFetchPins] Map is ready, triggering refresh after cache clear");
        
        // Small delay to allow other operations to complete
        setTimeout(() => {
          if (mapInstanceRef.current) {
            fetchPinsInBounds(mapInstanceRef.current, true); // Force skip cache
          }
        }, 50);
      }
    };

    // Add event listener
    if (typeof window !== 'undefined') {
      window.addEventListener('clear-map-pins-cache', handleClearCache);
    }

    // Clean up
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('clear-map-pins-cache', handleClearCache);
      }
    };
  }, [isMapReady, mapInstanceRef, fetchPinsInBounds]);

  console.log('[useFetchPins] Hook rendering. isLoading:', isLoading, 'Pins count:', pins.length, 'Error:', error);
  return { pins, isLoading, error };
}
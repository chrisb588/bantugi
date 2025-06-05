import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserContext } from '@/context/user-context';
import { useAuthContext } from '@/context/auth-context';
import Report from '@/interfaces/report';

// Client-side in-memory cache
const reportsCache = new Map<string, { data: Report[], timestamp: number }>();
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface UseUserReportsReturn {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  reportCount: number;
}

export function useUserReports(): UseUserReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { state: { user } } = useUserContext();
  const { state: authState } = useAuthContext();

  // Cache key based on user ID
  const cacheKey = user?.id ? `user-reports-${user.id}` : '';
  const initialFetchRef = useRef(false);

  const fetchReports = useCallback(async (skipCache = false) => {
    if (!user || !authState.initialAuthCheckComplete) {
      return;
    }

    // Check client-side cache first
    if (!skipCache && cacheKey) {
      const cachedEntry = reportsCache.get(cacheKey);
      const now = Date.now();
      
      if (cachedEntry && (now - cachedEntry.timestamp < CACHE_EXPIRY_MS)) {
        console.log('[useUserReports] Using client-side cached reports');
        setReports(cachedEntry.data);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useUserReports] Fetching user created reports...');
      
      // Add skipCache parameter to the URL if needed
      const url = skipCache 
        ? '/api/user/created-reports?skipCache=true'
        : '/api/user/created-reports';
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch reports: ${response.status}`);
      }

      // Check if response was served from cache
      const cacheStatus = response.headers.get('X-Cache');
      console.log(`[useUserReports] Server cache status: ${cacheStatus || 'Not available'}`);

      const data: Report[] = await response.json();
      
      console.log(`[useUserReports] Successfully fetched ${data.length} reports`);
      setReports(data);
      
      // Update client-side cache
      if (cacheKey) {
        reportsCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }
      
    } catch (err: any) {
      console.error('[useUserReports] Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, authState.initialAuthCheckComplete, cacheKey]);

  // Fetch reports when user is available and auth check is complete
  useEffect(() => {
    if (authState.initialAuthCheckComplete) {
      if (user) {
        // Only fetch if we haven't already fetched for this user
        if (!initialFetchRef.current || !reportsCache.has(cacheKey)) {
          fetchReports();
          initialFetchRef.current = true;
        }
      } else {
        // Clear reports if no user
        setReports([]);
        setError(null);
      }
    }
  }, [user, authState.initialAuthCheckComplete, fetchReports, cacheKey]);

  // Clean up expired cache entries
  useEffect(() => {
    const now = Date.now();
    const cacheCleanupTime = now - CACHE_EXPIRY_MS;
    
    for (const [key, entry] of reportsCache.entries()) {
      if (entry.timestamp < cacheCleanupTime) {
        reportsCache.delete(key);
      }
    }
  }, [reports]);

  // Listen for new report creation events to refresh the cache
  useEffect(() => {
    const handleNewReportCreated = (event: CustomEvent) => {
      console.log('[useUserReports] New report created event received, refreshing reports');
      
      // Invalidate client-side cache for current user
      if (cacheKey) {
        reportsCache.delete(cacheKey);
      }
      
      // Refetch reports to include the new one
      if (user && authState.initialAuthCheckComplete) {
        fetchReports(true); // Skip cache to get fresh data
      }
    };

    // Add event listener
    if (typeof window !== 'undefined') {
      window.addEventListener('new-report-created', handleNewReportCreated as EventListener);
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('new-report-created', handleNewReportCreated as EventListener);
      }
    };
  }, [user, authState.initialAuthCheckComplete, fetchReports, cacheKey]);

  const refetch = useCallback(() => {
    // Skip both client and server cache on manual refetch
    fetchReports(true);
  }, [fetchReports]);

  return {
    reports,
    isLoading,
    error,
    refetch,
    reportCount: reports.length,
  };
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserContext } from '@/context/user-context';
import { useAuthContext } from '@/context/auth-context';
import Report from '@/interfaces/report';

// Client-side in-memory cache
const reportsCache = new Map<string, { data: Report[], timestamp: number, pagination: any }>();
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Function to invalidate all saved reports cache entries for a specific user
export function invalidateSavedReportsCache(userId?: string): void {
  if (!userId) return;
  
  // Delete all cache entries for this user's saved reports
  for (const [key, _] of reportsCache.entries()) {
    if (key.includes(`user-saved-reports-${userId}`)) {
      console.log(`[invalidateSavedReportsCache] Invalidating cache key: ${key}`);
      reportsCache.delete(key);
    }
  }
}

// Function to invalidate all saved reports cache entries
export function invalidateAllSavedReportsCache(): void {
  console.log(`[invalidateAllSavedReportsCache] Invalidating all saved reports cache entries`);
  
  // Delete all cache entries for saved reports
  for (const [key, _] of reportsCache.entries()) {
    if (key.includes('user-saved-reports-')) {
      reportsCache.delete(key);
    }
  }
}

interface UseSavedReportsReturn {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  reportCount: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useSavedReports(page = 1, limit = 10): UseSavedReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { state: { user } } = useUserContext();
  const { state: authState } = useAuthContext();

  // Cache key based on user ID and pagination
  const cacheKey = user?.id ? `user-saved-reports-${user.id}-page${page}-limit${limit}` : '';
  const initialFetchRef = useRef(false);

  const fetchReports = useCallback(async (skipCache = false) => {
    if (!user || !authState.initialAuthCheckComplete) {
      return;
    }

    console.log(`[useSavedReports] Fetching saved reports for user ${user.id}, page ${page}, limit ${limit}, skipCache: ${skipCache}`);

    // Check client-side cache first
    if (!skipCache && cacheKey) {
      const cachedEntry = reportsCache.get(cacheKey);
      const now = Date.now();
      
      if (cachedEntry && (now - cachedEntry.timestamp < CACHE_EXPIRY_MS)) {
        console.log(`[useSavedReports] Using client-side cached reports for key: ${cacheKey}`);
        setReports(cachedEntry.data);
        setPagination(cachedEntry.pagination);
        return;
      } else if (cachedEntry) {
        console.log(`[useSavedReports] Cache expired for key: ${cacheKey}`);
      } else {
        console.log(`[useSavedReports] No cache entry found for key: ${cacheKey}`);
      }
    } else if (skipCache) {
      console.log(`[useSavedReports] Skipping client-side cache as requested`);
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useSavedReports] Fetching user saved reports...');
      
      // Add pagination and skipCache parameters to the URL
      const url = new URL('/api/user/saved-reports', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', limit.toString());
      
      if (skipCache) {
        url.searchParams.set('skipCache', 'true');
      }
        
      const response = await fetch(url.toString(), {
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
        throw new Error(errorData.error || `Failed to fetch saved reports: ${response.status}`);
      }

      // Check if response was served from cache
      const cacheStatus = response.headers.get('X-Cache');
      console.log(`[useSavedReports] Server cache status: ${cacheStatus || 'Not available'}`);

      const data = await response.json();
      
      console.log(`[useSavedReports] Successfully fetched ${data.reports?.length || 0} saved reports`);
      setReports(data.reports || []);
      setPagination(data.pagination || null);
      
      // Update client-side cache
      if (cacheKey) {
        reportsCache.set(cacheKey, {
          data: data.reports || [],
          pagination: data.pagination || null,
          timestamp: Date.now()
        });
      }
      
    } catch (err: any) {
      console.error('[useSavedReports] Error fetching saved reports:', err);
      setError(err.message || 'Failed to fetch saved reports');
      setReports([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, authState.initialAuthCheckComplete, cacheKey, page, limit]);

  // Fetch reports when user is available and auth check is complete
  useEffect(() => {
    if (authState.initialAuthCheckComplete) {
      if (user) {
        // Only fetch if we haven't already fetched for this user and pagination combination
        if (!initialFetchRef.current || !reportsCache.has(cacheKey)) {
          fetchReports();
          initialFetchRef.current = true;
        }
      } else {
        // Clear reports if no user
        setReports([]);
        setPagination(null);
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

  const refetch = useCallback(() => {
    // Skip both client and server cache on manual refetch
    console.log('[useSavedReports] Explicitly refetching saved reports and skipping cache');
    
    // Invalidate client-side cache for this user
    if (user?.id) {
      invalidateSavedReportsCache(user.id);
    }
    
    fetchReports(true);
  }, [fetchReports, user]);

  return {
    reports,
    isLoading,
    error,
    refetch,
    reportCount: reports.length,
    pagination
  };
}

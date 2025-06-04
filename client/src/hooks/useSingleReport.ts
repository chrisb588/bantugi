import { useState, useEffect, useCallback } from 'react';
import Report from '@/interfaces/report';

// Client-side in-memory cache for individual reports
const singleReportCache = new Map<string, { data: Report, timestamp: number }>();
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface UseSingleReportReturn {
  report: Report | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSingleReport(reportId: string): UseSingleReportReturn {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (skipCache = false) => {
    if (!reportId) {
      setError('Report ID is required');
      return;
    }

    // Check client-side cache first
    if (!skipCache) {
      const cachedEntry = singleReportCache.get(reportId);
      const now = Date.now();
      
      if (cachedEntry && (now - cachedEntry.timestamp < CACHE_EXPIRY_MS)) {
        console.log(`[useSingleReport] Using client-side cached report: ${reportId}`);
        setReport(cachedEntry.data);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[useSingleReport] Fetching report: ${reportId}`);
      
      // Add skipCache parameter to the URL if needed
      const url = skipCache 
        ? `/api/reports/${reportId}?skipCache=true`
        : `/api/reports/${reportId}`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Report not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch report: ${response.status}`);
      }

      // Check if response was served from cache
      const cacheStatus = response.headers.get('X-Cache');
      console.log(`[useSingleReport] Server cache status: ${cacheStatus || 'Not available'}`);

      const data: Report = await response.json();
      
      console.log(`[useSingleReport] Successfully fetched report: ${reportId}`);
      setReport(data);
      
      // Update client-side cache
      singleReportCache.set(reportId, {
        data,
        timestamp: Date.now()
      });
      
    } catch (err: any) {
      console.error(`[useSingleReport] Error fetching report ${reportId}:`, err);
      setError(err.message || 'Failed to fetch report');
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  // Fetch report when the hook is first used or reportId changes
  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId, fetchReport]);

  // Clean up expired cache entries
  useEffect(() => {
    const now = Date.now();
    const cacheCleanupTime = now - CACHE_EXPIRY_MS;
    
    for (const [key, entry] of singleReportCache.entries()) {
      if (entry.timestamp < cacheCleanupTime) {
        singleReportCache.delete(key);
      }
    }
  }, [report]);

  const refetch = useCallback(async () => {
    // Skip both client and server cache on manual refetch
    await fetchReport(true);
  }, [fetchReport]);

  return {
    report,
    isLoading,
    error,
    refetch,
  };
}

// Function to update a report in the cache (useful after adding comments)
export function updateCachedReport(reportId: string, updater: (report: Report) => Report): void {
  const cachedEntry = singleReportCache.get(reportId);
  
  if (cachedEntry) {
    const updatedReport = updater(cachedEntry.data);
    singleReportCache.set(reportId, {
      data: updatedReport,
      timestamp: Date.now() // Reset timestamp on update
    });
  }
}

// Function to invalidate a report in the cache
export function invalidateReportCache(reportId: string): void {
  singleReportCache.delete(reportId);
}

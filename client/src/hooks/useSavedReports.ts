'use client';

import { useState, useEffect } from 'react';
import { useUserContext } from '@/context/user-context';
import { useAuthContext } from '@/context/auth-context';
import Report from '@/interfaces/report';

interface UseSavedReportsReturn {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  reportCount: number;
}

export function useSavedReports(): UseSavedReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { state: { user } } = useUserContext();
  const { state: authState } = useAuthContext();

  const fetchReports = async () => {
    if (!user || !authState.initialAuthCheckComplete) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useSavedReports] Fetching user saved reports...');
      
      const response = await fetch('/api/user/saved-reports', {
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

      const data = await response.json();
      
      console.log(`[useSavedReports] Successfully fetched ${data.reports?.length || 0} saved reports`);
      setReports(data.reports || []);
      
    } catch (err: any) {
      console.error('[useSavedReports] Error fetching saved reports:', err);
      setError(err.message || 'Failed to fetch saved reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reports when user is available and auth check is complete
  useEffect(() => {
    if (authState.initialAuthCheckComplete) {
      if (user) {
        fetchReports();
      } else {
        // Clear reports if no user
        setReports([]);
        setError(null);
      }
    }
  }, [user, authState.initialAuthCheckComplete]);

  const refetch = () => {
    fetchReports();
  };

  return {
    reports,
    isLoading,
    error,
    refetch,
    reportCount: reports.length,
  };
}

import { useState, useEffect } from 'react';
import { useUserContext } from '@/context/user-context';
import { useAuthContext } from '@/context/auth-context';
import Report from '@/interfaces/report';

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

  const fetchReports = async () => {
    if (!user || !authState.initialAuthCheckComplete) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useUserReports] Fetching user created reports...');
      
      const response = await fetch('/api/user/created-reports', {
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

      const data: Report[] = await response.json();
      
      console.log(`[useUserReports] Successfully fetched ${data.length} reports`);
      setReports(data);
      
    } catch (err: any) {
      console.error('[useUserReports] Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports');
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

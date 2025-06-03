import { useState, useEffect, useCallback } from 'react';

interface UseIsReportSavedResponse {
  isSaved: boolean;
  savedAt: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useIsReportSaved(reportId: string): UseIsReportSavedResponse {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!reportId) {
      setIsLoading(false);
      setError("Report ID is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/saved`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setIsSaved(data.isSaved);
      setSavedAt(data.savedAt || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch saved status');
      setIsSaved(false);
      setSavedAt(null);
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { isSaved, savedAt, isLoading, error, refetch: fetchData };
}

export default useIsReportSaved;

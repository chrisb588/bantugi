'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ReportItem from '@/components/report/report-item';
import { useUserContext } from '@/context/user-context';
import Report from '@/interfaces/report';
import { sampleResults } from '@/test'; // Using sample data for now

interface SavedReportsOverlayProps {
  onClose: () => void;
}

export function SavedReportsOverlay({ onClose }: SavedReportsOverlayProps) {
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state: { user } } = useUserContext();

  useEffect(() => {
    const fetchSavedReports = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // TODO: Replace with actual API call for saved reports
        // For now, using sample data to simulate saved reports
        setTimeout(() => {
          setSavedReports(sampleResults.slice(0, 3)); // Show first 3 as "saved"
          setIsLoading(false);
        }, 1000);
        
        /* Future implementation:
        const response = await fetch('/api/user/saved-reports', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch saved reports');
        }

        const data: Report[] = await response.json();
        setSavedReports(data);
        */
      } catch (err: any) {
        console.error('Error fetching saved reports:', err);
        setError(err.message || 'Failed to fetch saved reports');
        setSavedReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedReports();
  }, [user]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-6">
    </div>
  );
}

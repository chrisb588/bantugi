'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ReportForm } from "@/components/report/report-form/report-form";
import AuthGuard from "@/components/auth/auth-guard";
import Report from '@/interfaces/report';
import { toast } from 'sonner';

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reportId = params.id as string;

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        setError('Report ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching report for editing:', reportId);
        
        const response = await fetch(`/api/reports/${reportId}`, {
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
          if (response.status === 401) {
            throw new Error('Authentication required');
          }
          if (response.status === 403) {
            throw new Error('You are not authorized to edit this report');
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch report: ${response.status}`);
        }

        const reportData: Report = await response.json();
        console.log('Fetched report data for editing:', reportData);
        
        setReport(reportData);
        setError(null);
        
      } catch (err: any) {
        console.error('Error fetching report for editing:', err);
        setError(err.message || 'Failed to fetch report');
        toast.error(err.message || 'Failed to load report for editing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleClose = () => {
    // Navigate back to the report view using the existing reports structure
    router.push(`/reports/${reportId}`);
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading report...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !report) {
    return (
      <AuthGuard>
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-destructive text-lg">Error loading report</p>
            <p className="text-muted-foreground">{error}</p>
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
        <ReportForm 
          report={report} 
          onClose={handleClose}
        />
      </div>
    </AuthGuard>
  );
}

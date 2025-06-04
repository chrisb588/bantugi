'use client';

import { X } from 'lucide-react';
// Remove unused imports
// import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { Separator } from '@/components/ui/separator';
import ReportItem from '@/components/report/report-item';
// Remove unused import
// import { useUserContext } from '@/context/user-context';
import Report from '@/interfaces/report';
import { useSavedReports } from '@/hooks/useSavedReports';

interface SavedReportsOverlayProps {
  onClose: () => void;
}

export function SavedReportsOverlay({ onClose }: SavedReportsOverlayProps) {
  // Remove unused variable 
  // const { state: { user } } = useUserContext();
  const { reports: savedReports, isLoading, error, refetch } = useSavedReports();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-6 pinter-events-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Overlay Content */}
      <Card className="relative w-full max-w-lg h-[85vh] min-h-[400px] max-h-[800px]  dark:bg-gray-900 shadow-xl flex flex-col">
        {/* Header with close button */}
        <CardHeader className="flex flex-row items-center justify-between text-left z-10 border-b flex-shrink-0">
          <CardTitle className="text-2xl">Saved Reports</CardTitle>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close saved reports"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <ScrollArea className="flex-1 min-h-0">
          <CardContent className="py-4">
            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading your saved reports...</p>
              </div>
            )}
            
            {/* Error state */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-destructive mb-2">Error loading saved reports</p>
                <p className="text-muted-foreground text-sm">{error}</p>
                <button
                  onClick={refetch}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* Empty state */}
            {!isLoading && !error && savedReports.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">You haven't saved any reports yet.</p>
              </div>
            )}
            
            {/* Reports list */}
            {!isLoading && savedReports.length > 0 && (
              <div className="space-y-3">
                {savedReports.map((report: Report, index: number) => (
                  <ReportItem
                    key={report.id || index}
                    report={report}
                    deletable={false} // Can't delete saved reports from this view
                    editable={false} // Can't edit saved reports
                    isSaved={true} // Indicate this is a saved report
                  />
                ))}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
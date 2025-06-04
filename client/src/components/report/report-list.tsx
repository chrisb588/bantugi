import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import ReportItem from "@/components/report/report-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleResults } from '@/test';
import { useUserContext } from "@/context/user-context";
import { useUserReports } from "@/hooks/useUserReports";
import { useSavedReports } from "@/hooks/useSavedReports";
import Report from "@/interfaces/report";

interface ReportListProps {
  title: string;
  className?: string;
  isMyReportsView?: boolean; // when used for my reports page
  isSavedReportsView?: boolean; // when used for saved reports page
}

const ReportList: React.FC<ReportListProps> = ({ 
  title, 
  className, 
  isMyReportsView = false,
  isSavedReportsView = false,
  ...props 
}) => {
  const [reports, setReports] = useState<Report[] | null>(null);
  const { state: { user } } = useUserContext();
  
  // Use the new hook for My Reports view
  const { 
    reports: userReports, 
    isLoading: isLoadingUserReports, 
    error: userReportsError,
    refetch: refetchUserReports
  } = useUserReports();

  // Use the hook for Saved Reports view
  const { 
    reports: savedReports, 
    isLoading: isLoadingSavedReports, 
    error: savedReportsError,
    refetch: refetchSavedReports
  } = useSavedReports();

  const handleReportDelete = () => {
    // Refresh the reports list after successful deletion
    if (isMyReportsView) {
      refetchUserReports();
    }
  };

  const handleSaveToggle = (reportId: string, isSaved: boolean) => {
    console.log(`Report ${reportId} ${isSaved ? 'saved' : 'unsaved'}`);
    
    // Refresh both types of reports when save status changes
    refetchSavedReports();
    
    // If in the my reports view, refetch that as well to update any UI indicators
    if (isMyReportsView) {
      refetchUserReports();
    }
    
    // If we're in the saved reports view and a report was unsaved,
    // we should make sure it's removed from the current view immediately
    if (isSavedReportsView && !isSaved) {
      // Remove the unsaved report from the local state
      setReports((currentReports) => 
        currentReports ? currentReports.filter(report => report.id !== reportId) : null
      );
    }
  };

  // Handle different report sources based on view type
  useEffect(() => {
    if (isMyReportsView && user) {
      // Use reports from the hook for My Reports view
      setReports(userReports);
    } else if (!isMyReportsView && !isSavedReportsView) {
      // Use sample data for other views (temporary)
      setReports(sampleResults);
    } else if (isSavedReportsView && user) {
      // Use saved reports from the hook
      setReports(savedReports);
    } else {
      // No user or unsupported view
      setReports([]);
    }
  }, [isMyReportsView, isSavedReportsView, user, userReports, savedReports]);

  if (isMyReportsView && !user) {
    return (
      <div className={cn("w-full max-w-lg flex flex-col gap-4 -mt-15", className)} {...props}>
        <Card className="h-[85vh] min-h-[400px] max-h-[800px]">
          <CardHeader className="text-left">
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">Please log in to view your reports.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSavedReportsView && !user) {
    return (
      <div className={cn("w-full max-w-lg flex flex-col gap-4 -mt-15", className)} {...props}>
        <Card className="h-[85vh] min-h-[400px] max-h-[800px]">
          <CardHeader className="text-left">
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">Please log in to view your saved reports.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-lg flex flex-col gap-4 -mt-15", className)} {...props}>
      <Card className="h-[85vh] min-h-[400px] max-h-[800px] flex flex-col"> {/* Set fixed height here */}
        <CardHeader className="text-left bg-background z-10 flex-shrink-0">
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <div className="px-6 flex-shrink-0">
          <Separator />
        </div>
        <ScrollArea className="flex-1 min-h-0"> {/* Make ScrollArea fill remaining space */}
          <CardContent className="flex flex-col items-center py-4">
            {/* Loading state for My Reports */}
            {isMyReportsView && isLoadingUserReports && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading your reports...</p>
              </div>
            )}

            {/* Loading state for Saved Reports */}
            {isSavedReportsView && isLoadingSavedReports && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading saved reports...</p>
              </div>
            )}
            
            {/* Error state for My Reports */}
            {isMyReportsView && userReportsError && (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-destructive mb-2">Error loading reports</p>
                <p className="text-muted-foreground text-sm">{userReportsError}</p>
              </div>
            )}

            {/* Error state for Saved Reports */}
            {isSavedReportsView && savedReportsError && (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-destructive mb-2">Error loading saved reports</p>
                <p className="text-muted-foreground text-sm">{savedReportsError}</p>
              </div>
            )}
            
            {/* Empty state */}
            {reports && reports.length === 0 && !isLoadingUserReports && !isLoadingSavedReports && !userReportsError && !savedReportsError && (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">
                  {isMyReportsView ? "You haven't created any reports yet." : 
                   isSavedReportsView ? "You haven't saved any reports yet." : 
                   "No reports found."}
                </p>
              </div>
            )}
            
            {/* Reports list */}
            {reports && reports.length > 0 && !isLoadingUserReports && !isLoadingSavedReports && (
              reports.map((result, index) => (
                <ReportItem
                  key={result.id || index}
                  report={result}
                  deletable={isMyReportsView} // only allow deletion of own reports in my reports page
                  editable={isMyReportsView} // only allow editing of own reports in my reports page
                  isSaved={isSavedReportsView} // indicate if this is a saved report
                  showSaveButton={true} // show save button in all views
                  onDelete={isMyReportsView ? handleReportDelete : undefined}
                  onSaveToggle={handleSaveToggle}
                />
              ))
            )}
          </CardContent>
        </ScrollArea> 
      </Card>
    </div>
  );
};

export default ReportList; 
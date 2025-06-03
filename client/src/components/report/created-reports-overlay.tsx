'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReportItem from "@/components/report/report-item";
import { ReportForm } from "@/components/report/report-form/report-form";
import { useUserReports } from '@/hooks/useUserReports';
import { useUserContext } from '@/context/user-context';
import Report from '@/interfaces/report';
import { cn } from '@/lib/utils';

interface CreatedReportsOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CreatedReportsOverlay({ isVisible, onClose }: CreatedReportsOverlayProps) {
  const { state: { user } } = useUserContext();
  const { reports, isLoading, error, refetch } = useUserReports();
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  const handleReportDelete = (reportId: string) => {
    refetch();
  };

  const handleReportUpdate = (reportId: string, updatedReport: Report) => {
    refetch();
    setEditingReport(null);
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
  };

  const handleCloseEdit = () => {
    setEditingReport(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col">
        <Card className={cn(
          "flex flex-col h-full max-h-[90vh] overflow-hidden transition-opacity duration-300",
          editingReport ? "opacity-30 pointer-events-none" : "opacity-100 pointer-events-auto"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-3 flex-shrink-0 border-b">
            <CardTitle className="text-xl">My Reports</CardTitle>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          
          <ScrollArea className="flex-1 min-h-0">
            <CardContent className="p-4">
              {/* Auth check */}
              {!user && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">Please log in to view your reports.</p>
                </div>
              )}

              {/* Loading state */}
              {user && isLoading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading your reports...</p>
                </div>
              )}

              {/* Error state */}
              {user && error && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-destructive mb-2">Error loading reports</p>
                  <p className="text-muted-foreground text-sm mb-4">{error}</p>
                  <button 
                    onClick={refetch}
                    className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Empty state */}
              {user && !isLoading && !error && reports.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">You haven't created any reports yet.</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Tap the + button to create your first report!
                  </p>
                </div>
              )}

              {/* Reports list */}
              {user && !isLoading && !error && reports.length > 0 && (
                <div className="space-y-3 pb-4">
                  {reports.map((report, index) => (
                    <ReportItem
                      key={report.id || index}
                      report={report}
                      deletable
                      editable
                      onDelete={handleReportDelete}
                      onUpdate={handleReportUpdate}
                      onEdit={handleEditReport}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Edit overlay */}
        {editingReport && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg max-h-[90vh] overflow-hidden">
              <ReportForm
                report={editingReport}
                onClose={handleCloseEdit}
                onSuccess={() => {
                  refetch();
                  setEditingReport(null);
                }}
                className="max-h-[90vh]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

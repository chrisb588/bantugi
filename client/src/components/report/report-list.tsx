import React, { useState, useEffect } from 'react';

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import ReportItem from "@/components/report/report-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleResults } from '@/test';
import { useUserContext } from "@/context/user-context";
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

  // temporary
  useEffect(() => {
    setReports(sampleResults);
  }, []);
  
  const { state: { user } } = useUserContext();

  if (isMyReportsView && !user) {
    // TODO: api call to fetch reports made by the user (backend)
  } else if (isSavedReportsView && !user) {
    // TODO: api call to fetch reports saved by the user (backend)
  }

  return (
    <div className={cn("w-full max-w-lg flex flex-col gap-4 -mt-15", className)} {...props}>
      <Card className="h-[85vh] min-h-[400px] max-h-[800px]"> {/* Set fixed height here */}
        <ScrollArea className="h-full"> {/* Make ScrollArea full height of card */}
          <CardHeader className="text-left sticky top-0 bg-background z-10">
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <div className="px-6">
            <Separator />
          </div>
          <CardContent className="flex flex-col items-center py-4">
            {reports && (reports.map((result, index) => (
              <ReportItem
                key={index}
                report={result}
                deletable={isMyReportsView} // only allow deletion of own reports in my reports page
                editable={isMyReportsView} // only allow editing of own reports in my reports page
                isSaved={isSavedReportsView} // indicate if this is a saved report
              />
            )))}
          </CardContent>
        </ScrollArea> 
      </Card>
    </div>
  );
};

export default ReportList; 
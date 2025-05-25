import React from 'react';

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import ReportItem from "@/components/report/report-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleResults } from '@/test'; // Assuming you have a sample data file

interface ReportListProps {
  title: string;
  className?: string;
  isMyReportsView?: boolean; // when used for my reports page
}

const ReportList: React.FC<ReportListProps> = ({ 
  title, 
  className, 
  isMyReportsView = false,
  ...props 
}) => {
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
            {sampleResults.map((result, index) => (
              <ReportItem
                key={index}
                report={result}
                deletable={isMyReportsView} // only allow deletion of own reports in my reports page
                editable={isMyReportsView} // only allow editing of own reports in my reports page
              />
            ))}
          </CardContent>
        </ScrollArea> 
      </Card>
    </div>
  );
};

export default ReportList; 
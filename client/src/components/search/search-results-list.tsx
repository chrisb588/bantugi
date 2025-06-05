import React, { useEffect, useState, useRef } from 'react';

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import ReportItem from "@/components/report/report-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Report from '@/interfaces/report';
import { sampleResults } from '@/test';

interface SearchResultsListProps {
  title: string;
  className?: string;
  onClose: () => void; 
  results?: Report[];
  isLoading?: boolean;
  onReportClick?: (report: Report) => void;
  ignoreClickRef?: React.RefObject<HTMLElement | null>;
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({ 
  title, 
  className, 
  onClose: parentOnClose, 
  results = [],
  isLoading = false,
  onReportClick,
  ignoreClickRef,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div ref={resultsContainerRef} className={cn(
      "w-full max-w-lg flex flex-col gap-4", 
      "transition-all duration-300 ease-out",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8",
      className
    )} {...props}>
        <ScrollArea className="flex-1 min-h-0">
          <Separator className="bg-border/50" />
          {isLoading ? (
            <div className="flex items-center justify-center h-32 md:h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : results.length > 0 ? (
            <div className="mt-4 space-y-2">
              {results.map((result) => (
                <ReportItem
                  key={result.id}
                  report={result}
                  onReportClick={onReportClick}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 md:h-24 text-muted-foreground">
              <p className="md:text-sm">No results found</p>
            </div>
          )}
        </ScrollArea> 
    </div>
  );
};

export default SearchResultsList; 
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
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({ 
  title, 
  className, 
  onClose: parentOnClose, 
  results = [],
  isLoading = false,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    function handleClickOutside(event: MouseEvent) {
      if (resultsContainerRef.current && !resultsContainerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    if (!parentOnClose) return;
    
    setIsVisible(false);
    setTimeout(() => {
      parentOnClose();
    }, 300);
  };

  // temporary
  results = sampleResults;

  return (
    <div ref={resultsContainerRef} className={cn(
      "w-full max-w-lg flex flex-col gap-4", 
      "transition-all duration-300 ease-out",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8",
      className
    )} {...props}>
      <Card className="h-[80vh] min-h-[400px] max-h-[800px]">
        <ScrollArea className="h-full">
          <CardHeader className="text-left sticky top-0 bg-background z-10">
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <div className="px-6">
            <Separator />
          </div>
          <CardContent className="flex flex-col items-center py-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <ReportItem
                  key={result.id}
                  report={result}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p>No results found</p>
              </div>
            )}
          </CardContent>
        </ScrollArea> 
      </Card>
    </div>
  );
};

export default SearchResultsList; 
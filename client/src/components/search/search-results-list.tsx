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

  return (
    <div ref={resultsContainerRef} className={cn(
      "w-full max-w-lg flex flex-col gap-4", 
      "transition-all duration-300 ease-out",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8",
      className
    )} {...props}>
      <Card className="h-[80vh] md:h-auto md:max-h-[400px] min-h-[400px] md:min-h-[200px] max-h-[800px] bg-transparent border-none shadow-none">
        <ScrollArea className="h-full">
          <CardHeader className="text-left sticky top-0 bg-background/80 backdrop-blur-sm z-10 rounded-t-lg">
            <CardTitle className="text-2xl md:text-xl">{title}</CardTitle>
          </CardHeader>
          <div className="px-6 md:px-4">
            <Separator className="bg-border/50" />
          </div>
          <CardContent className="flex flex-col items-center py-4 md:py-3 bg-background/60 backdrop-blur-sm rounded-b-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 md:h-24">
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
              <div className="flex flex-col items-center justify-center h-32 md:h-24 text-muted-foreground">
                <p className="md:text-sm">No results found</p>
              </div>
            )}
          </CardContent>
        </ScrollArea> 
      </Card>
    </div>
  );
};

export default SearchResultsList; 
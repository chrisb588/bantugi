import React, { useEffect, useState, useRef } from 'react';

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import ReportItem from "@/components/report/report-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Report from '@/interfaces/report';

interface SearchResultsListProps {
  title: string;
  className?: string;
  onClose: () => void; 
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({ 
  title, 
  className, 
  onClose: parentOnClose, 
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

  const sampleResults: Report[] = [
    {
      id: 1,
      title: 'MAJOR FLOODING DOWNTOWN',
      category: 'Flood Alert',
      urgency: "High" as const,
      status: "Unresolved",
      location: {
        address: {
          id: 1,
          barangay: 'Main St & Central Ave',
          city: 'Cebu City',
          province: 'Cebu',
        },
        coordinates: { lat: 10, lng: 123 }
      },
      description: 'Severe flooding reported, roads impassable. Avoid area. Emergency services dispatched.',
      createdAt: new Date('2023-10-01T08:00:00Z'),
    },
    {
      id: 2,
      title: 'Power Maintenance Scheduled',
      category: 'Utility Work',
      urgency: "Medium" as const,
      status: "Unresolved",
      location: {
        address: {
          id: 1,
          barangay: 'Banilad Area',
          city: 'Mandaue City',
          province: 'Cebu',
        },
        coordinates: { lat: 10, lng: 123 }
      },
      description: 'Power outage expected from 1 PM to 5 PM today for urgent maintenance work. Please prepare accordingly.',
      createdAt: new Date('2023-10-01T08:00:00Z'),
    },
    {
      id: 3,
      title: 'Landslide Warning: Mountain View',
      category: 'Geohazard',
      urgency: "High" as const,
      status: "Unresolved",
      location: {
        address: {
          id: 1,
          barangay: 'Busay Hills',
          city: 'Cebu City',
          province: 'Cebu',
        },
        coordinates: { lat: 10, lng: 123 }
      },
      description: 'Risk of landslides due to heavy rains. Residents advised to evacuate to safer ground immediately.',
      createdAt: new Date('2023-10-01T08:00:00Z'),
    },
    {
      id: 4,
      title: 'Road Closure: Mango Avenue',
      category: 'Traffic',
      urgency: "Low" as const,
      status: "Unresolved",
      location: {
        address: {
          id: 1,
          barangay: 'Mango Avenue',
          city: 'Cebu City',
          province: 'Cebu',
        },
        coordinates: { lat: 10, lng: 123 }
      },
      description: 'Street festival today, Mango Avenue closed to traffic until 10 PM. Plan alternate routes to avoid congestion.',
      createdAt: new Date('2023-10-01T08:00:00Z'),
    }
  ];

  return (
    <div 
      ref={resultsContainerRef}
      className={cn(
        "w-full max-w-lg flex flex-col gap-4", 
        "transition-all duration-300 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8",
        className
      )} {...props}
    >
      <Card className="h-[80vh] min-h-[400px] max-h-[800px]">
        <ScrollArea className="h-full">
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
              />
            ))}
          </CardContent>
        </ScrollArea> 
      </Card>
    </div>
  );
};

export default SearchResultsList; 
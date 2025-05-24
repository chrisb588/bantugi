import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, CircleAlert } from 'lucide-react';

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import ReportItem from "@/components/report/report-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const sampleResults = [
    {
      icon: <AlertTriangle size={18} className="text-primary" />,
      iconColorClass: 'bg-red-100',
      title: 'MAJOR FLOODING DOWNTOWN',
      location: 'Main St & Central Ave, Cebu City',
      description: 'Severe flooding reported, roads impassable. Avoid area. Emergency services dispatched.',
      category: 'Flood Alert'
    },
    {
      icon: <CircleAlert size={18} className="text-accent" />,
      iconColorClass: 'bg-orange-100',
      title: 'Power Maintenance Scheduled',
      location: 'Banilad Area, Mandaue City',
      description: 'Power outage expected from 1 PM to 5 PM today for urgent maintenance work. Please prepare accordingly.',
      category: 'Utility Work'
    },
    {
      icon: <AlertTriangle size={18} className="text-primary" />,
      iconColorClass: 'bg-red-100',
      title: 'Landslide Warning: Mountain View',
      location: 'Busay Hills, Cebu Transcentral Hwy',
      description: 'Risk of landslides due to heavy rains. Residents advised to evacuate to safer ground immediately.',
      category: 'Geohazard'
    },
    {
      icon: <CircleAlert size={18} className="text-accent" />,
      iconColorClass: 'bg-orange-100',
      title: 'Road Closure: Mango Avenue',
      location: 'Mango Avenue (near Fuente Osmeña)',
      description: 'Street festival today, Mango Avenue closed to traffic until 10 PM. Plan alternate routes to avoid congestion.',
      category: 'Traffic'
    },
    {
      icon: <AlertTriangle size={18} className="text-primary" />,
      iconColorClass: 'bg-red-100',
      title: 'Landslide Warning: Mountain View',
      location: 'Busay Hills, Cebu Transcentral Hwy',
      description: 'Risk of landslides due to heavy rains. Residents advised to evacuate to safer ground immediately.',
      category: 'Geohazard'
    },
    {
      icon: <CircleAlert size={18} className="text-accent" />,
      iconColorClass: 'bg-orange-100',
      title: 'Road Closure: Mango Avenue',
      location: 'Mango Avenue (near Fuente Osmeña)',
      description: 'Street festival today, Mango Avenue closed to traffic until 10 PM. Plan alternate routes to avoid congestion.',
      category: 'Traffic'
    },
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
      <Card className="h-[80vh] min-h-[400px] max-h-[800px]"> {/* Set fixed height here */}
        <ScrollArea className="h-full"> {/* Make ScrollArea full height of card */}
          <CardContent className="flex flex-col items-center py-4">
            {sampleResults.map((result, index) => (
              <ReportItem
                key={index}
                icon={result.icon}
                iconColorClass={result.iconColorClass}
                title={result.title}
                location={result.location}
                description={result.description}
                category={result.category}
              />
            ))}
          </CardContent>
        </ScrollArea> 
      </Card>
    </div>
  );

  // return (
  //   <div
  //     ref={resultsContainerRef}
  //     className={cn(
  //       "flex flex-col rounded-xl shadow-lg overflow-hidden",
  //       "transition-all duration-300 ease-out",
  //       isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
  //     )}
  //     style={{ background: '#FAF9F5' }} // Lighter than bg-background
  //   >
  //     {/* Sticky Header */}
  //     <div className="sticky top-0 backdrop-blur-md z-10 px-6 pt-6 pb-2 flex items-center justify-between"
  //          style={{ background: 'rgba(250, 249, 245, 0.95)' }}> {/* Lighter with transparency */}
  //       <h2 className="font-bold text-xl text-primary">{title}</h2>
  //     </div>
  //     <div className="px-8 -mt-1">
  //       <Separator className="bg-accent h-[2px]" />
  //     </div>

  //     <ScrollArea className="flex-1 min-h-0 pt-2">
  //       {sampleResults.map((result, index) => (
  //         <ReportItem
  //           key={index}
  //           icon={result.icon}
  //           iconColorClass={result.iconColorClass}
  //           title={result.title}
  //           location={result.location}
  //           description={result.description}
  //           category={result.category}
  //         />
  //       ))}
  //     </ScrollArea>
  //   </div>
  // );
};

export default SearchResultsList; 
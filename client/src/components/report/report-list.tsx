import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, CircleAlert } from 'lucide-react';

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import ReportItem from "@/components/report/report-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const sampleResults = [
    {
      title: 'MAJOR FLOODING DOWNTOWN',
      urgency: "high",
      location: 'Main St & Central Ave, Cebu City',
      description: 'Severe flooding reported, roads impassable. Avoid area. Emergency services dispatched.',
      category: 'Flood Alert'
    },
    {
      title: 'Power Maintenance Scheduled',
      urgency: "medium",
      location: 'Banilad Area, Mandaue City',
      description: 'Power outage expected from 1 PM to 5 PM today for urgent maintenance work. Please prepare accordingly.',
      category: 'Utility Work'
    },
    {
      title: 'Landslide Warning: Mountain View',
      urgency: "high",
      location: 'Busay Hills, Cebu Transcentral Hwy',
      description: 'Risk of landslides due to heavy rains. Residents advised to evacuate to safer ground immediately.',
      category: 'Geohazard'
    },
    {
      title: 'Road Closure: Mango Avenue',
      urgency: "low",
      location: 'Mango Avenue (near Fuente Osmeña)',
      description: 'Street festival today, Mango Avenue closed to traffic until 10 PM. Plan alternate routes to avoid congestion.',
      category: 'Traffic'
    },
    {
      title: 'Landslide Warning: Mountain View',
      urgency: "high",
      location: 'Busay Hills, Cebu Transcentral Hwy',
      description: 'Risk of landslides due to heavy rains. Residents advised to evacuate to safer ground immediately.',
      category: 'Geohazard'
    },
    {
      title: 'Road Closure: Mango Avenue',
      urgency: "medium",
      location: 'Mango Avenue (near Fuente Osmeña)',
      description: 'Street festival today, Mango Avenue closed to traffic until 10 PM. Plan alternate routes to avoid congestion.',
      category: 'Traffic'
    },
  ];

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
                icon={result.icon}
                iconColorClass={result.iconColorClass}
                title={result.title}
                location={result.location}
                description={result.description}
                category={result.category}
                deletable={isMyReportsView} // only allow deletion of own reports in my reports page
              />
            ))}
          </CardContent>
        </ScrollArea> 
      </Card>
    </div>
  );
};

export default ReportList; 
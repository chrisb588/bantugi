'use client';

import { ReportForm } from "@/components/report/report-form/report-form";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils"; // Import cn utility

interface CreateReportOverlayProps {
  onClose: () => void;
}

export function CreateReportOverlay({ onClose }: CreateReportOverlayProps) {
  const [isChoosingLocation, setIsChoosingLocation] = useState(false);

  return (
    <div className={cn(
      "fixed inset-0 z-[60] flex items-center justify-center p-6 md:p-10",
      isChoosingLocation ? "pointer-events-none" : "pointer-events-auto"
    )}>
      {/* Transparent backdrop that allows map clicks when choosing location */}
      {isChoosingLocation && (
        <div className="absolute inset-0 bg-transparent pointer-events-none" />
      )}
      
      <ReportForm 
        onClose={onClose} 
        onLocationModeChange={setIsChoosingLocation}
        // ReportForm's card becomes pointer-events-none when choosingLocation is true.
        // Its confirm/cancel buttons are fixed positioned with z-index and pointer-events-auto,
        // allowing them to be interactive even when this overlay container is pointer-events-none.
      />
    </div>
  );
}

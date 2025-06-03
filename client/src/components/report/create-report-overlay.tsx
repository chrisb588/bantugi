'use client';

import { ReportForm } from "@/components/report/report-form/report-form";
import { useState, useEffect } from "react";

interface CreateReportOverlayProps {
  onClose: () => void;
}

export function CreateReportOverlay({ onClose }: CreateReportOverlayProps) {
  const [isChoosingLocation, setIsChoosingLocation] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 md:p-10">
      {/* Transparent backdrop that allows map clicks when choosing location */}
      {isChoosingLocation && (
        <div className="absolute inset-0 bg-transparent" />
      )}
      
      <ReportForm 
        onClose={onClose} 
        onLocationModeChange={setIsChoosingLocation}
      />
    </div>
  );
}

'use client';

import { useRouter } from "next/navigation";

import { ReportCard } from "@/components/report/report-card";
import { sampleReport } from "@/test";

export default function ReportViewPage() {
  const router = useRouter();
  
  const report = sampleReport;
  
  // TODO: Hides report card and show location marker on map
  // TODO: Also include a button to go back to viewing the card
  const handleViewMap = () => {
    console.log("View in map clicked");
  };

  // use me to return to the previous page (search results, saved reports, my reports)
  const navigateBack = () => {
    router.back();
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden pointer-events-auto">
      <ReportCard report={report} onViewMap={handleViewMap} onBack={navigateBack} />  
    </div>
  );
} 
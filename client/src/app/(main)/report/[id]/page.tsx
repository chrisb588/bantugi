'use client';

import { useRouter, useParams } from "next/navigation";

import { ReportCard } from "@/components/report/report-card";
import { sampleResults } from "@/test";

export default function ReportViewPage() {
  const router = useRouter();
  const params = useParams();
  
  // Get the report ID from the URL parameters
  const reportId = parseInt(params.id as string);
  
  // Find the report with the matching ID from sampleResults
  const report = sampleResults.find(r => r.id === reportId) || sampleResults[0];

  // use me to return to the previous page (search results, saved reports, my reports)
  const navigateBack = () => {
    router.back();
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
      <ReportCard report={report} onBack={navigateBack} />  
    </div>
  );
} 
'use client';

import { useRouter } from "next/navigation";

import { ReportCard } from "@/components/report/report-card";
import { sampleReport } from "@/test";

export default function ReportViewPage() {
  const router = useRouter();
  
  const report = sampleReport;

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
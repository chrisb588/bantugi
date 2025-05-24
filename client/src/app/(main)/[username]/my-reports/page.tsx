'use client';

import React from "react";
import ReportList from "@/components/report/report-list";

export default function MyReportsPage() {
  return (
    <div>
      {/* Content Area (Search Results or Main Content for Mobile) - This will be scrollable if needed */}
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden pointer-events-auto">
            <ReportList title="My Reports" isMyReportsView={true} />
        </div>
    </div>
  );
} 
'use client';

import React from "react";
import ReportList from "@/components/report/report-list";

export default function MyReportsPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden pointer-events-auto">
      <ReportList title="Saved Reports" isSavedReportsView={true} />
    </div>
  );
} 
'use client';

import React from "react";
import ReportList from "@/components/report/report-list";
import AuthGuard from "@/components/auth/auth-guard";

export default function SavedReportsPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden pointer-events-auto">
        <ReportList title="Saved Reports" isSavedReportsView={true} />
      </div>
    </AuthGuard>
  );
} 
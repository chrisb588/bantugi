'use client';

import { ReportForm } from "@/components/report/report-form/report-form";
import AuthGuard from "@/components/auth/auth-guard";
import React from 'react';

export default function CreateReportPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
        <ReportForm />
      </div>
    </AuthGuard>
  );
}

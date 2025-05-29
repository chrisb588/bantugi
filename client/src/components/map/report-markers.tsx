'use client';

import { useEffect } from 'react';
import type Report from '@/interfaces/report';
import { useReportMarkers } from '@/hooks/use-report-markers';

interface ReportMarkersProps {
  reports: Report[];
}

export default function ReportMarkers({ reports }: ReportMarkersProps) {
  useReportMarkers(reports);
  return null;
}
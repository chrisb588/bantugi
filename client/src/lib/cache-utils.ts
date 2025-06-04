'use client';

// This file contains utility functions to clear client-side caches

import { invalidateAllSavedReportsCache } from '@/hooks/useSavedReports';
import { invalidateReportCache } from '@/hooks/useSingleReport';

// Function to clear all relevant caches when a user saves/unsaves a report
export function clearSavedReportCaches(reportId: string): void {
  console.log(`[clearSavedReportCaches] Clearing caches for report: ${reportId}`);
  
  // Clear saved reports cache
  invalidateAllSavedReportsCache();
  
  // Clear the specific report cache
  if (reportId) {
    invalidateReportCache(reportId);
  }
}

// Function to handle map pins cache invalidation
export function clearMapPinsCache(): void {
  console.log(`[clearMapPinsCache] Clearing all map pins caches`);
  
  // Reset the pinsCache from useFetchPins
  // This requires accessing the module scope variable, so we use the global window object
  if (typeof window !== 'undefined') {
    // Signal to clear the cache - will be picked up by useFetchPins
    window.dispatchEvent(new CustomEvent('clear-map-pins-cache'));
  }
}

// Function to notify that a new report has been created
export function notifyNewReportCreated(reportId: string): void {
  console.log(`[notifyNewReportCreated] Broadcasting event for new report: ${reportId}`);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('new-report-created', { 
      detail: { reportId } 
    }));
    
    // Also clear map pins cache when a new report is created
    clearMapPinsCache();
  }
}

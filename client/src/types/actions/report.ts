import Report from '@/interfaces/report';

export type ReportAction =
  | { type: 'FETCH_REPORTS_REQUEST' }
  | { type: 'FETCH_REPORTS_SUCCESS'; payload: Report[] }
  | { type: 'FETCH_REPORTS_FAILURE'; payload: string }
  | { type: 'CREATE_REPORT_REQUEST' }
  | { type: 'CREATE_REPORT_SUCCESS'; payload: Report }
  | { type: 'CREATE_REPORT_FAILURE'; payload: string }
  | { type: 'UPDATE_REPORT_REQUEST' }
  | { type: 'UPDATE_REPORT_SUCCESS'; payload: Report }
  | { type: 'UPDATE_REPORT_FAILURE'; payload: string }
  | { type: 'DELETE_REPORT_REQUEST' }
  | { type: 'DELETE_REPORT_SUCCESS'; payload: number }
  | { type: 'DELETE_REPORT_FAILURE'; payload: string };
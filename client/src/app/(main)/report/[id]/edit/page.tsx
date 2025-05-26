import { ReportForm } from "@/components/report/report-form/report-form"
import { sampleReport } from "@/test"

export default function CreateReportPage() {
  const report = sampleReport;
  
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden pointer-events-auto">
      <ReportForm report={report} />
    </div>
  )
}

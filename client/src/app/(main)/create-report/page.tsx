import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image";

import { CreateReportForm } from "@/components/report/create-report-form/create-report-form"

export default function CreateReportPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden pointer-events-auto">
      <CreateReportForm />
    </div>
  )
}

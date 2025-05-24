import { getReport } from "@/lib/supabase/supabaseService";
import ReportViewPage from "./ReportClient";

interface Props {
    params: { id: string}
}

// works by url so something like /reports/1 or /reports/2345
export default async function ReportClient({params}: Props) {
    var report = await getReport(params.id)
    // Needs loading component or Not available component
    return <ReportViewPage reportz={report} />
}
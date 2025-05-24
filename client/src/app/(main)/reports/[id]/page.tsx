import ReportViewPage from "./report-view";

export default async function ReportPage({ params }: { params: { id: string } }) {
  var args = await params
  return <ReportViewPage id={args.id} />;
}

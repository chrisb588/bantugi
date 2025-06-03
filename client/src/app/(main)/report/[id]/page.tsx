interface ReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  
  return (
    <div>
      <h1>Report {id}</h1>
      <p>Report details will be displayed here.</p>
    </div>
  );
}
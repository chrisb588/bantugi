interface EditReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditReportPage({ params }: EditReportPageProps) {
  const { id } = await params;
  
  return (
    <div>
      <h1>Edit Report {id}</h1>
      <p>Report editing form will be displayed here.</p>
    </div>
  );
}
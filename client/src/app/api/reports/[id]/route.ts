// app/api/reports/[id]/route.ts
import { NextRequest } from 'next/server';
import { getReport, updateReport, deleteReport } from '@/lib/supabase/reports';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const report = await getReport(id);

  if (!report) {
    return new Response(JSON.stringify({ error: "Report not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(report), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// DELETE: Delete a report by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const deleted = await deleteReport(id);

  if (!deleted) {
    return new Response(JSON.stringify({ error: "Report not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "Report deleted successfully" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
// app/api/reports/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getReport, deleteReport } from '@/lib/supabase/reports';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || id === "undefined") {
    console.error('[API GET /api/reports/[id]] Error: Report ID is missing or undefined.');
    return NextResponse.json({ error: "Report ID is missing or undefined in the path" }, { status: 400 });
  }

  try {
    console.log(`[API GET /api/reports/${id}] Attempting to fetch report for ID: ${id}`);
    const response = NextResponse.next();
    const supabase = createServerClient(req, response);
    const reportData = await getReport(supabase,id);

    if (!reportData) {
      console.warn(`[API GET /api/reports/${id}] Report not found for ID: ${id}.`);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    console.log(`[API GET /api/reports/${id}] Report found for ID: ${id}.`);
    return NextResponse.json(reportData, { status: 200 });

  } catch (error) {
    console.error(`[API GET /api/reports/${id}] Internal server error for ID: ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred";
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || id === "undefined") {
    return NextResponse.json({ error: "Report ID is missing" }, { status: 400 });
  }

  // Assuming deleteReport is defined in '@/lib/supabase/reports'
  // const success = await deleteReport(id);
  // if (!success) {
  //   return NextResponse.json({ error: "Failed to delete report or report not found" }, { status: 404 });
  // }
  // return NextResponse.json({ message: "Report deleted successfully" }, { status: 200 });
  return NextResponse.json({ message: "DELETE not fully implemented in example" }, { status: 501 });
}
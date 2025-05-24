// app/api/reports/[id]/route.ts
import { NextRequest } from 'next/server';
import { getReport } from '@/lib/supabase/supabaseService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const report = await getReport(params.id);

  if (!report) {
    return new Response(JSON.stringify({ error: "Report not found" }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify(report), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
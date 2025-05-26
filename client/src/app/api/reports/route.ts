// src/app/api/reports/route.ts
import { NextRequest } from 'next/server';
import { createReport } from '@/lib/supabase/reports';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const report = await createReport(body);

  if (!report) {
    return new Response(JSON.stringify({ error: "Failed to create report" }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(report), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createReport } from '@/lib/supabase/reports';
import { createServerClient } from '@/lib/supabase/server';
export async function POST(req: NextRequest) {

  const response = NextResponse.next(); // allows setting cookies

  const supabase = createServerClient(req, response);
  const body = await req.json();
  const report = await createReport(supabase, body);

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

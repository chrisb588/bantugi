// src/app/api/reports/[id]/saved/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    // Check authentication
    const userId = await getAuthenticatedUserID(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const reportId = params.id;
    
    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    console.log(`[API/reports/[id]/saved] Checking if report ${reportId} is saved by user: ${userId}`);

    // Check if the report is saved by this user
    const { data: savedReport, error } = await supabase
      .from('saved_reports')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('report_id', reportId)
      .maybeSingle();

    if (error) {
      console.error('[API/reports/[id]/saved] Error checking saved status:', error);
      return NextResponse.json(
        { error: "Failed to check saved status" },
        { status: 500 }
      );
    }

    const isSaved = !!savedReport;
    
    console.log(`[API/reports/[id]/saved] Report ${reportId} saved status: ${isSaved}`);
    
    const jsonResponse = NextResponse.json({
      isSaved,
      savedAt: savedReport?.created_at || null
    });
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: any) {
    console.error("[API/reports/[id]/saved] Internal server error:", error.message, error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

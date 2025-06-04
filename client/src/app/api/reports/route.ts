// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createReport } from '@/lib/supabase/reports';
import { createServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';
import { generateUserReportsCacheKey, invalidateCache } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const response = new NextResponse(); // Create response for cookie handling
    const supabase = createServerClient(req, response);
    
    // Check authentication
    const userId = await getAuthenticatedUserID(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`[API/reports] Creating report for user: ${userId}`);
    
    const body = await req.json();
    const report = await createReport(supabase, body);

    if (!report || 'error' in report) {
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 }
      );
    }

    console.log('[API/reports] Successfully created report:', report.id);
    
    // Invalidate the user's created reports cache
    await invalidateCache(generateUserReportsCacheKey(userId));
    
    // Invalidate all map bounds caches to ensure the new pin shows up on the map
    await invalidateCache('map:bounds:*');
    
    const jsonResponse = NextResponse.json(report, { status: 201 });
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: unknown) {
    console.error("[API/reports] Internal server error in POST handler:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 }
    );
  }
}

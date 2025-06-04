// src/app/api/reports/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';
import { 
  generateUserSavedReportsCacheKey, 
  generateReportCacheKey,
  invalidateCache 
} from '@/lib/redis';

export async function POST(req: NextRequest) {
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

    console.log(`[API/reports/save] Saving report for user: ${userId}`);
    
    const { reportId } = await req.json();
    
    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Check if the report exists
    const { data: reportExists, error: reportError } = await supabase
      .from('reports')
      .select('id')
      .eq('id', reportId)
      .single();

    if (reportError || !reportExists) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Check if the report is already saved by this user
    const { data: existingSave, error: checkError } = await supabase
      .from('saved_reports')
      .select('id')
      .eq('user_id', userId)
      .eq('report_id', reportId)
      .maybeSingle();

    if (checkError) {
      console.error('[API/reports/save] Error checking existing save:', checkError);
      return NextResponse.json(
        { error: "Failed to check if report is already saved" },
        { status: 500 }
      );
    }

    if (existingSave) {
      return NextResponse.json(
        { error: "Report is already saved" },
        { status: 409 }
      );
    }

    // Save the report
    const { data: savedReport, error: saveError } = await supabase
      .from('saved_reports')
      .insert({
        user_id: userId,
        report_id: reportId
      })
      .select('id, created_at')
      .single();

    if (saveError) {
      console.error('[API/reports/save] Error saving report:', saveError);
      return NextResponse.json(
        { error: "Failed to save report" },
        { status: 500 }
      );
    }

    console.log('[API/reports/save] Successfully saved report:', reportId);
    
    // Invalidate the saved reports cache for this user
    // We need to invalidate all possible pagination combinations by using a pattern
    const cachePattern = `${generateUserSavedReportsCacheKey(userId)}:*`;
    console.log(`[API/reports/save] Invalidating saved reports cache with pattern: ${cachePattern}`);
    await invalidateCache(cachePattern);
    
    const jsonResponse = NextResponse.json(
      { 
        message: "Report saved successfully", 
        savedReport: {
          id: savedReport.id,
          reportId,
          createdAt: savedReport.created_at
        }
      }, 
      { status: 201 }
    );
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: unknown) {
    console.error("[API/reports/save] Internal server error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    console.log(`[API/reports/save] Unsaving report for user: ${userId}`);
    
    const { reportId } = await req.json();
    
    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Check if the report is saved by this user
    const { data: existingSave, error: checkError } = await supabase
      .from('saved_reports')
      .select('id')
      .eq('user_id', userId)
      .eq('report_id', reportId)
      .maybeSingle();

    if (checkError) {
      console.error('[API/reports/save] Error checking existing save:', checkError);
      return NextResponse.json(
        { error: "Failed to check if report is saved" },
        { status: 500 }
      );
    }

    if (!existingSave) {
      return NextResponse.json(
        { error: "Report is not saved" },
        { status: 404 }
      );
    }

    // Remove the saved report
    const { error: deleteError } = await supabase
      .from('saved_reports')
      .delete()
      .eq('user_id', userId)
      .eq('report_id', reportId);

    if (deleteError) {
      console.error('[API/reports/save] Error unsaving report:', deleteError);
      return NextResponse.json(
        { error: "Failed to unsave report" },
        { status: 500 }
      );
    }

    console.log('[API/reports/save] Successfully unsaved report:', reportId);
    
    // Invalidate the saved reports cache for this user
    // We need to invalidate all possible pagination combinations by using a pattern
    const cachePattern = `${generateUserSavedReportsCacheKey(userId)}:*`;
    console.log(`[API/reports/save] Invalidating saved reports cache with pattern: ${cachePattern}`);
    await invalidateCache(cachePattern);
    
    const jsonResponse = NextResponse.json(
      { message: "Report unsaved successfully" },
      { status: 200 }
    );
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: unknown) {
    console.error("[API/reports/save] Internal server error in DELETE:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 }
    );
  }
}

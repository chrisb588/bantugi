// src/app/api/user/saved-reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';

export async function GET(req: NextRequest) {
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

    console.log(`[API/user/saved-reports] Fetching saved reports for user: ${userId}`);

    // Get query parameters for pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Query to get saved reports with full report details
    const reportQuery = `
      id,
      created_at,
      report:report_id (
        id,
        created_at,
        created_by,
        title,
        description,
        status,
        images,
        category,
        urgency,
        location:location_id (
          location_id,
          latitude,
          longitude,
          area:area_id (
            id,
            province,
            city,
            barangay
          )
        )
      )
    `;

    const { data: savedReports, error, count } = await supabase
      .from('saved_reports')
      .select(reportQuery, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[API/user/saved-reports] Error fetching saved reports:', error);
      return NextResponse.json(
        { error: "Failed to fetch saved reports" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected Report interface
    const transformedReports = savedReports?.map(savedReport => {
      const report = savedReport.report as any;
      if (!report) return null;

      return {
        id: report.id,
        title: report.title,
        description: report.description,
        status: report.status,
        images: report.images || [],
        createdAt: report.created_at,
        category: report.category,
        urgency: report.urgency,
        createdBy: report.created_by,
        location: report.location ? {
          locationId: report.location.location_id,
          coordinates: {
            lat: report.location.latitude,
            lng: report.location.longitude
          },
          area: report.location.area ? {
            id: report.location.area.id,
            province: report.location.area.province,
            city: report.location.area.city,
            barangay: report.location.area.barangay
          } : null
        } : null,
        savedAt: savedReport.created_at
      };
    }).filter(Boolean); // Remove any null entries

    console.log(`[API/user/saved-reports] Successfully fetched ${transformedReports?.length || 0} saved reports`);
    
    const jsonResponse = NextResponse.json({
      reports: transformedReports || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: any) {
    console.error("[API/user/saved-reports] Internal server error:", error.message, error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

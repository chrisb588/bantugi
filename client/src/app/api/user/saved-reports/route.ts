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
        creator: {
          username: "Unknown User", // Will be populated after fetching creator info
          email: undefined,
          profilePicture: undefined,
        },
        location: report.location ? {
          locationId: report.location.location_id,
          coordinates: {
            lat: report.location.latitude,
            lng: report.location.longitude
          },
          address: report.location.area ? 
            `${report.location.area.barangay}, ${report.location.area.city || ""}, ${report.location.area.province}`.replace(/, ,/g, ',').replace(/^,|,$/g, '') 
            : "Unknown Location"
        } : undefined,
        savedAt: savedReport.created_at
      };
    }).filter(Boolean); // Remove any null entries

    // Fetch creator information for all reports
    if (transformedReports && transformedReports.length > 0) {
      const creatorIds = [...new Set(savedReports?.map(sr => (sr.report as any)?.created_by).filter(Boolean))];
      
      if (creatorIds.length > 0) {
        const { data: creators } = await supabase
          .from('profiles')
          .select('user_id, email, username, avatar_url')
          .in('user_id', creatorIds);

        // Update each report with creator information
        transformedReports.forEach((report) => {
          if (!report) return;
          const reportData = savedReports?.find(sr => (sr.report as any)?.id === report.id)?.report as any;
          if (reportData) {
            const creator = creators?.find(c => c.user_id === reportData.created_by);
            if (creator) {
              report.creator = {
                username: creator.username || creator.email || "Unknown User",
                email: creator.email,
                profilePicture: creator.avatar_url || undefined,
              };
            }
          }
        });
      }
    }

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

  } catch (error: unknown) {
    console.error("[API/user/saved-reports] Internal server error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 }
    );
  }
}

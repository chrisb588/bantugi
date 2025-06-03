import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUserID } from '@/lib/supabase/user.server';
import { transformDbReportToReport, DbReportRow, DbUserRow, DbCommentRow } from '@/lib/supabase/reports';
import Report from '@/interfaces/report';

export async function GET(req: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);

    const userId = await getUserID(supabase);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log(`[API/user/saved-reports] Fetching saved reports for user: ${userId}`);

    // Query to get saved reports through the saved_reports table
    const { data: savedReportsData, error: savedReportsError } = await supabase
      .from('saved_reports')
      .select(`
        report_id,
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
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (savedReportsError) {
      console.error('[API/user/saved-reports] Supabase error fetching saved reports:', savedReportsError);
      return NextResponse.json({ error: 'Failed to fetch saved reports', details: savedReportsError.message }, { status: 500 });
    }

    if (!savedReportsData || savedReportsData.length === 0) {
      console.log(`[API/user/saved-reports] No saved reports found for user: ${userId}`);
      return NextResponse.json([], { status: 200 });
    }

    const reports: Report[] = [];

    for (const savedReport of savedReportsData) {
      const dbReport = savedReport.report;
      if (!dbReport) continue;

      // Fetch creator profile for each report
      const { data: creatorProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, avatar_url')
        .eq('user_id', dbReport.created_by)
        .single();
      
      if (profileError) {
        console.warn(`[API/user/saved-reports] Could not fetch profile for user ${dbReport.created_by} for report ${dbReport.id}`);
      }

      // Process location data to match DbLocationRow structure
      let processedLocationForDbReport = null;
      if (dbReport.location) {
        const rawLocationObject = Array.isArray(dbReport.location) && dbReport.location.length > 0
          ? dbReport.location[0]
          : (!Array.isArray(dbReport.location) && typeof dbReport.location === 'object' && dbReport.location !== null)
            ? dbReport.location
            : null;

        if (rawLocationObject && typeof rawLocationObject.location_id !== 'undefined') {
          let areaForDbLocationRow = null;
          if (rawLocationObject.area) {
            const rawAreaObject = Array.isArray(rawLocationObject.area) && rawLocationObject.area.length > 0
              ? rawLocationObject.area[0]
              : (!Array.isArray(rawLocationObject.area) && typeof rawLocationObject.area === 'object' && rawLocationObject.area !== null)
                ? rawLocationObject.area
                : null;

            if (rawAreaObject && typeof rawAreaObject.id !== 'undefined') {
              areaForDbLocationRow = {
                id: rawAreaObject.id,
                province: rawAreaObject.province,
                city: rawAreaObject.city,
                barangay: rawAreaObject.barangay,
              };
            }
          }

          processedLocationForDbReport = {
            location_id: rawLocationObject.location_id,
            latitude: rawLocationObject.latitude,
            longitude: rawLocationObject.longitude,
            area: areaForDbLocationRow,
          };
        }
      }

      const combinedDbReport: DbReportRow = {
        ...(dbReport as any),
        creator: creatorProfile as DbUserRow | null,
        comments: [] as DbCommentRow[], // Empty comments for list view
        location: processedLocationForDbReport,
      };
      
      const transformed = transformDbReportToReport(combinedDbReport);
      if (transformed) {
        reports.push(transformed);
      }
    }
    
    console.log(`[API/user/saved-reports] Successfully fetched ${reports.length} saved reports for user: ${userId}`);
    
    const jsonResponse = NextResponse.json(reports, { status: 200 });
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: any) {
    console.error('[API/user/saved-reports] Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

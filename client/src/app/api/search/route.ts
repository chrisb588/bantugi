import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { transformDbReportToReport } from '@/lib/supabase/reports';
import Report from '@/interfaces/report';

// Interface for the database row structure returned by fuzzy_search_reports RPC
interface DbFuzzySearchReportRow {
  id: string;
  title: string;
  description: string;
  status: "Unresolved" | "Being Addressed" | "Resolved";
  images?: string[] | null;
  created_at: string;
  category: string;
  urgency: "Low" | "Medium" | "High";
  location_id?: number | null;
  created_by: string;
  // Nested location data
  location?: {
    location_id: number;
    latitude: number | null;
    longitude: number | null;
    area?: {
      id: number;
      area_province: string;
      area_city?: string | null;
      area_barangay: string;
    } | null;
  } | null;
  // Nested creator data
  creator?: {
    id: string;
    username?: string | null;
    profile_pic_url?: string | null;
  } | null;
  // Ranking/similarity score from fuzzy search
  rank?: number;
  similarity?: number;
}

export async function GET(req: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    // Extract search query from URL parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    console.log(`[API/search] Performing fuzzy search for query: "${query}"`);

    // Call the fuzzy_search_reports RPC function
    const { data, error, status, statusText } = await supabase
      .rpc('fuzzy_search_reports', {
        p_search_term: query.trim()
      });

    console.log("[API/search] RPC Response Status:", status, statusText);
    console.log("[API/search] RPC Data:", JSON.stringify(data, null, 2));
    console.log("[API/search] RPC Error:", JSON.stringify(error, null, 2));

    if (error) {
      console.error(`[API/search] RPC Error (status ${status}): ${error.message}`, error);
      return NextResponse.json(
        { error: "Search failed", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      console.warn("[API/search] RPC returned no data (data is null or undefined). Returning empty array.");
      return NextResponse.json([], { status: 200 });
    }

    if (!Array.isArray(data)) {
      console.error("[API/search] RPC returned data that is not an array:", data);
      return NextResponse.json(
        { error: "Invalid data format from search" },
        { status: 500 }
      );
    }

    if (data.length === 0) {
      console.log("[API/search] No search results found for query:", query);
      return NextResponse.json([], { status: 200 });
    }

    // Transform database rows to Report objects
    const reports: Report[] = data
      .map((dbRow: DbFuzzySearchReportRow) => {
        try {
          // Use the existing transformation function from reports.ts
          const transformedReport = transformDbReportToReport(dbRow);
          
          if (!transformedReport) {
            console.warn("[API/search] Could not transform report:", dbRow.id);
            return null;
          }

          return transformedReport;
        } catch (error) {
          console.error("[API/search] Error transforming report:", dbRow.id, error);
          return null;
        }
      })
      .filter((report): report is Report => report !== null);

    console.log(`[API/search] Successfully transformed ${reports.length} search results`);

    const jsonResponse = NextResponse.json(reports, { status: 200 });
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return jsonResponse;

  } catch (error: any) {
    console.error("[API/search] Exception caught in search API:", error.message, error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Report from '@/interfaces/report';

// Interface for the optimized search result
interface OptimizedSearchResult {
  result_json: {
    id: string;
    title: string;
    description: string;
    category: string;
    urgency: "Low" | "Medium" | "High";
    status: "Unresolved" | "Being Addressed" | "Resolved";
    location?: {
      coordinates: {
        lat: number;
        lng: number;
      };
      address: {
        id: number;
        province: string;
        city?: string;
        barangay: string;
      };
    } | null;
  };
}

// Transform the optimized search result to Report interface
function transformOptimizedSearchToReport(searchResult: OptimizedSearchResult): Report {
  const data = searchResult.result_json;
  
  // Create a safer transformation that checks if fields exist
  return {
    id: data.id,
    title: data.title || "",
    description: data.description || "",
    category: data.category || "",
    urgency: data.urgency || "Medium",
    status: data.status || "Unresolved", // Use actual status from search result or default to "Unresolved"
    location: data.location ? {
      coordinates: {
        lat: data.location.coordinates.lat,
        lng: data.location.coordinates.lng,
      },
      address: {
        id: data.location.address.id,
        province: data.location.address.province,
        city: data.location.address.city,
        barangay: data.location.address.barangay,
      },
    } : undefined,
    createdAt: new Date(), // Placeholder date
    creator: {
      username: "Unknown User", // Placeholder creator
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    // Extract search query and filter parameters from URL parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const urgency = searchParams.get('urgency');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    console.log(`[API/search] Performing search with query: "${query}" and filters:`, { urgency, category, status });

    // Call the optimized fuzzy_search_reports RPC function with filters
    const { data, error, status: rpcStatus, statusText } = await supabase
      .rpc('fuzzy_search_reports_optimized', {
        search_term: query.trim(),
        similarity_threshold: 0.1,
        filter_urgency: urgency || null,
        filter_category: category || null,
        filter_status: status || null
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
      console.warn("[API/search] RPC returned no data. Returning empty array.");
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

    // Transform optimized search results to Report objects
    const reports: Report[] = data
      .map((searchResult: OptimizedSearchResult) => {
        try {
          return transformOptimizedSearchToReport(searchResult);
        } catch (error) {
          console.error("[API/search] Error transforming search result:", error);
          return null;
        }
      })
      .filter((report): report is Report => report !== null);

    // Apply filters to the search results
    let filteredReports = reports;
    
    if (urgency || category || status) {
      console.log(`[API/search] Applying filters to ${reports.length} search results`);
      console.log('[API/search] Filter values:', { urgency, category, status });
      
      filteredReports = reports.filter(report => {
        // Apply urgency filter if not empty
        if (urgency && urgency !== "" && report.urgency !== urgency) {
          return false;
        }
        
        // Apply category filter if not empty
        if (category && category !== "" && report.category !== category) {
          return false;
        }
        
        // Apply status filter if not empty
        // Skip status filtering if the report doesn't have a status field
        // This handles the case where the SQL function doesn't return a status field
        if (status && status !== "" && report.status && report.status !== status) {
          return false;
        }
        
        return true;
      });
      
      console.log(`[API/search] Filtered results: ${filteredReports.length} out of ${reports.length} reports`);
      // Log which filter(s) actually made a difference
      if (filteredReports.length < reports.length) {
        console.log('[API/search] Filters reduced results - filters applied:', {
          urgencyApplied: !!urgency && urgency !== "",
          categoryApplied: !!category && category !== "",
          statusApplied: !!status && status !== ""
        });
      }
    }

    console.log(`[API/search] Successfully processed ${filteredReports.length} search results`);

    const jsonResponse = NextResponse.json(filteredReports, { status: 200 });
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return jsonResponse;

  } catch (error) {
    console.error("[API/search] Exception caught in search API:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
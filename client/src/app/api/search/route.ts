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
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    urgency: data.urgency,
    status: "Unresolved", // Default status for search results
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
    
    // Extract search query from URL parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    console.log(`[API/search] Performing optimized fuzzy search for query: "${query}"`);

    // Call the optimized fuzzy_search_reports RPC function
    const { data, error, status, statusText } = await supabase
      .rpc('fuzzy_search_reports_optimized', {
        search_term: query.trim(),
        similarity_threshold: 0.1
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

    console.log(`[API/search] Successfully transformed ${reports.length} search results`);

    const jsonResponse = NextResponse.json(reports, { status: 200 });
    
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
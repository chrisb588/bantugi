import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Report from '@/interfaces/report';

export async function GET(req: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);

    // Extract filter parameters from the URL
    const { searchParams } = new URL(req.url);
    const urgency = searchParams.get('urgency'); // "High", "Medium", or "Low"
    const category = searchParams.get('category'); // e.g., "Environment", "Health"
    const status = searchParams.get('status'); // e.g., "Resolved", "Unresolved"

    console.log("[API/filter] Filters received:", { urgency, category, status });

    // Query the database with filters
    const { data, error, status: rpcStatus } = await supabase
      .from('reports')
      .select('*')
      .match({
        ...(urgency ? { urgency } : {}),
        ...(category ? { category } : {}),
        ...(status ? { status } : {}),
      });

    if (error) {
      console.error("[API/filter] Database query error:", error.message, error);
      return NextResponse.json(
        { error: "Filter query failed", details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    console.log(`[API/filter] Successfully retrieved ${data.length} reports`);

    const jsonResponse = NextResponse.json(data, { status: 200 });

    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return jsonResponse;
  } catch (error) {
    console.error("[API/filter] Internal server error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAllReportsByDistance } from '@/lib/supabase/location';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const centerLat = parseFloat(searchParams.get('center_lat') || '0');
  const centerLng = parseFloat(searchParams.get('center_lng') || '0');
  const maxDistanceMeters = parseFloat(searchParams.get('max_distance_meters') || '5000');

  // Create a base NextResponse object.
  // Its headers will be modified by createServerClient if Supabase needs to set/remove cookies.
  const responseForSupabase = new NextResponse(null, { status: 200 });

  const supabase = createServerClient(request, responseForSupabase);

  try {
    const data = await getAllReportsByDistance(supabase, {
      coordinates: { lat: centerLat, lng: centerLng },
      address: '', // Assuming Location interface requires an address string
    }, maxDistanceMeters);

    // Construct the final response with the fetched data as JSON.
    // Crucially, use the headers from `responseForSupabase` which may now include 'Set-Cookie'.
    // Make sure the content-type is correctly set to application/json.
    const headers = new Headers(responseForSupabase.headers); // Copy existing headers (like Set-Cookie)
    headers.set('Content-Type', 'application/json');       // Ensure correct content type

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: headers,
    });

  } catch (error: any) {
    console.error("Error in API route /api/location:", error);

    // Even in case of an error, we should try to send back any cookies
    // that Supabase might have set (e.g., clearing a session).
    const errorHeaders = new Headers(responseForSupabase.headers);
    errorHeaders.set('Content-Type', 'application/json');

    return new NextResponse(JSON.stringify({ error: "Internal server error", message: error.message || 'Unknown error' }), {
      status: 500,
      headers: errorHeaders,
    });
  }
}
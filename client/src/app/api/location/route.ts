import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { fetchLocationsServer } from '@/lib/supabase/location';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const swLat = parseFloat(searchParams.get('sw_lat') || '');
  const swLng = parseFloat(searchParams.get('sw_lng') || '');
  const neLat = parseFloat(searchParams.get('ne_lat') || '');
  const neLng = parseFloat(searchParams.get('ne_lng') || '');

  if (
    isNaN(swLat) || isNaN(swLng) ||
    isNaN(neLat) || isNaN(neLng)
  ) {
    return NextResponse.json({ error: "Missing or invalid bounds parameters" }, { status: 400 });
  }

  // Create a base response object for createServerClient to potentially add cookies to.
  const baseResponse = new NextResponse();
  const supabase = createServerClient(request, baseResponse);

  try {
    console.log(`[API/location] Calling fetchLocationsServer for bounds: SW(${swLat},${swLng}), NE(${neLat},${neLng})`);
    
    // Check authentication status (optional for public data)
    const userId = await getAuthenticatedUserID(request);
    if (userId) {
      console.log(`[API/location] Request from authenticated user: ${userId}`);
    } else {
      console.log('[API/location] Request from unauthenticated user (continuing with public data)');
    }

    const reports = await fetchLocationsServer(
      supabase,
      swLat,
      swLng,
      neLat,
      neLng
    );
    console.log('[API/location] Successfully fetched reports, count:', reports.length);
    
    // Return the data. Any cookies set by Supabase on baseResponse will be included
    // because we pass its headers.
    return NextResponse.json(reports, { status: 200, headers: baseResponse.headers });

  } catch (error: any) {
    console.error("[API/location] Internal server error in GET handler:", error.message, error);
    return NextResponse.json(
        { error: "Internal server error", message: error.message || 'Unknown error' },
        { status: 500 }
    );
  }
}
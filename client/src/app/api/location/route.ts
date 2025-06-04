import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { fetchLocationsServer } from '@/lib/supabase/location';

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

  const response = NextResponse.next();
  const supabase = createServerClient(request, response);

  try {
    // Call the server-side function, passing the supabase client
    const reports = await fetchLocationsServer(
      supabase, // Pass the client!
      swLat,
      swLng,
      neLat,
      neLng
    );

    return NextResponse.json(reports);

  } catch (error: any) {
    console.error("[API/location] Internal server error:", error.message, error);
    return NextResponse.json(
        { error: "Internal server error", message: error.message || 'Unknown error' },
        { status: 500 }
    );
  }
}
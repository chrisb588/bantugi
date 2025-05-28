import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { Report } from '@/interfaces/report';
import Location from '@/interfaces/location';
import User from '@/interfaces/user';
import Area from '@/interfaces/area';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const swLat = parseFloat(searchParams.get('sw_lat') || '0');
  const swLng = parseFloat(searchParams.get('sw_lng') || '0');
  const neLat = parseFloat(searchParams.get('ne_lat') || '0');
  const neLng = parseFloat(searchParams.get('ne_lng') || '0');

  if (
  isNaN(swLat) || isNaN(swLng) ||
  isNaN(neLat) || isNaN(neLng)
) {
  return new NextResponse(JSON.stringify({ error: "Missing or invalid bounds parameters" }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

  const responseForSupabase = new NextResponse(null, { status: 200 });
  const supabase = createServerClient(request, responseForSupabase);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout

  try {
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_reports_within_bounds_detailed', {
        p_sw_lat: swLat,
        p_sw_lng: swLng,
        p_ne_lat: neLat,
        p_ne_lng: neLng,
      })
      .abortSignal(controller.signal);

    clearTimeout(timeout);

    if (rpcError) {
      console.error("Error fetching reports by bounds (RPC):", rpcError.message);
      return new NextResponse(JSON.stringify({ error: "Internal server error during RPC call", message: rpcError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const reports: Report[] = (rpcData || []).map((dbRow: any) => {
      const locationAddressParts = [dbRow.loc_barangay, dbRow.loc_city, dbRow.loc_province].filter(Boolean);
      const location: Location = {
        address: {
          id: dbRow.loc_id,
          province: dbRow.loc_province || '',
          city: dbRow.loc_city || undefined,
          barangay: dbRow.loc_barangay || '',
        },
        coordinates: { lat: dbRow.loc_latitude, lng: dbRow.loc_longitude },
      };

      const creator: User | undefined = dbRow.creator_username ? {
        username: dbRow.creator_username,
        profilePicture: dbRow.creator_profile_picture_url || undefined,
        // Note: creator's location is not part of this RPC result
      } : undefined;

      return {
        id: String(dbRow.id), // Ensure ID is string
        title: dbRow.title,
        category: dbRow.category,
        urgency: dbRow.urgency as "Low" | "Medium" | "High",
        status: dbRow.status as "Unresolved" | "Being Addressed" | "Resolved",
        images: dbRow.images || undefined,
        description: dbRow.description,
        createdAt: dbRow.created_at ? new Date(dbRow.created_at) : undefined,
        location: location,
        creator: creator,
      };
    });

    const headers = new Headers(responseForSupabase.headers);
    headers.set('Content-Type', 'application/json');
    return new NextResponse(JSON.stringify(reports), {
      status: 200,
      headers: headers,
    });

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("RPC call timed out");
      return new NextResponse(JSON.stringify({ error: "Request timed out" }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error("Error in API route /api/location:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error", message: error.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
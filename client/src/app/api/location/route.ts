import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { fetchLocationsServer } from '@/lib/supabase/location';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';
import { generateMapBoundsCacheKey, getCachedPinsData, cachePinsData } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const swLat = parseFloat(searchParams.get('sw_lat') || '');
  const swLng = parseFloat(searchParams.get('sw_lng') || '');
  const neLat = parseFloat(searchParams.get('ne_lat') || '');
  const neLng = parseFloat(searchParams.get('ne_lng') || '');
  const skipCache = searchParams.get('skip_cache') === 'true';

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
    // Check authentication status (optional for public data)
    const userId = await getAuthenticatedUserID(request);
    
    // Generate cache key based on map bounds
    const cacheKey = generateMapBoundsCacheKey(swLat, swLng, neLat, neLng);
    
    // Try to get data from cache first (unless skipCache is true)
    if (!skipCache) {
      const cachedData = await getCachedPinsData(cacheKey);
      if (cachedData) {
        console.log(`[API/location] Cache HIT for bounds: SW(${swLat},${swLng}), NE(${neLat},${neLng})`);
        return NextResponse.json(cachedData, { 
          status: 200, 
          headers: { 
            ...baseResponse.headers,
            'X-Cache': 'HIT'
          } 
        });
      }
      console.log(`[API/location] Cache MISS for bounds: SW(${swLat},${swLng}), NE(${neLat},${neLng})`);
    }
    
    console.log(`[API/location] Fetching fresh data for bounds: SW(${swLat},${swLng}), NE(${neLat},${neLng})`);
    
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
    
    // Cache the results (5 minutes expiration)
    if (!skipCache) {
      await cachePinsData(cacheKey, reports, 300);
    }
    
    // Return the data with cache miss header
    return NextResponse.json(reports, { 
      status: 200, 
      headers: { 
        ...baseResponse.headers,
        'X-Cache': 'MISS'
      } 
    });

  } catch (error: unknown) {
    console.error("[API/location] Internal server error in GET handler:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
        { error: "Internal server error", message: errorMessage },
        { status: 500 }
    );
  }
}
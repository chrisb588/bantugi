import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUserID } from '@/lib/supabase/user.server';
import { getUserCreatedReports } from '@/lib/supabase/reports';
import { 
  generateUserReportsCacheKey, 
  getCachedData, 
  cacheData 
} from '@/lib/redis';

// Cache expiration time in seconds (10 minutes)
const CACHE_EXPIRY_SECONDS = 600;

export async function GET(req: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);

    const userId = await getUserID(supabase);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if skipCache query parameter is present
    const url = new URL(req.url);
    const skipCache = url.searchParams.get('skipCache') === 'true';

    // Generate cache key for this user's reports
    const cacheKey = generateUserReportsCacheKey(userId);
    
    // Try to get data from cache first (unless skipCache is true)
    if (!skipCache) {
      const cachedReports = await getCachedData(cacheKey);
      if (cachedReports) {
        console.log(`[API/user/created-reports] Cache HIT for user: ${userId}`);
        
        const jsonResponse = NextResponse.json(cachedReports, { 
          status: 200,
          headers: { 'X-Cache': 'HIT' }
        });
        
        response.cookies.getAll().forEach(cookie => {
          jsonResponse.cookies.set(cookie);
        });
        
        return jsonResponse;
      }
      console.log(`[API/user/created-reports] Cache MISS for user: ${userId}`);
    } else {
      console.log(`[API/user/created-reports] Cache skip requested for user: ${userId}`);
    }

    console.log(`[API/user/created-reports] Fetching reports created by user: ${userId}`);

    // Fetch fresh data from the database
    const reports = await getUserCreatedReports(supabase, userId);
    
    console.log(`[API/user/created-reports] Successfully fetched ${reports.length} reports for user: ${userId}`);
    
    // Cache the results
    if (!skipCache) {
      await cacheData(cacheKey, reports, CACHE_EXPIRY_SECONDS);
    }
    
    const jsonResponse = NextResponse.json(reports, { 
      status: 200,
      headers: { 'X-Cache': 'MISS' }
    });
    
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: unknown) {
    console.error('[API/user/created-reports] Internal server error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

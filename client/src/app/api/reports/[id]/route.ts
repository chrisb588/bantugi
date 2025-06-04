// app/api/reports/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getReport, deleteReport, updateReport } from '@/lib/supabase/reports';
import { createServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';
import { 
  generateReportCacheKey, 
  generateUserReportsCacheKey,
  getCachedData, 
  cacheData, 
  invalidateCache 
} from '@/lib/redis';

// Cache expiration time in seconds (10 minutes)
const CACHE_EXPIRY_SECONDS = 600;

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> } // params is a Promise
) {
  try {
    const params = await paramsPromise; // Await the params Promise
    const { id } = params; // Destructure id from the resolved params

    if (!id || id === "undefined") {
      console.error('[API GET /api/reports/[id]] Error: Report ID is missing or undefined.');
      return NextResponse.json({ error: "Report ID is missing or undefined in the path" }, { status: 400 });
    }

    // Check if skipCache query parameter is present
    const url = new URL(req.url);
    const skipCache = url.searchParams.get('skipCache') === 'true';

    console.log(`[API GET /api/reports/${id}] Attempting to fetch report for ID: ${id}, skipCache: ${skipCache}`);
    
    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    // Check authentication (optional for public data, but helps with logging)
    const userId = await getAuthenticatedUserID(req);
    if (userId) {
      console.log(`[API GET /api/reports/${id}] Request from authenticated user: ${userId}`);
    } else {
      console.log(`[API GET /api/reports/${id}] Request from unauthenticated user`);
    }

    // Generate cache key for this report
    const cacheKey = generateReportCacheKey(id);
    
    // Try to get data from cache first (unless skipCache is true)
    if (!skipCache) {
      const cachedReport = await getCachedData(cacheKey);
      if (cachedReport) {
        console.log(`[API GET /api/reports/${id}] Cache HIT`);
        
        const jsonResponse = NextResponse.json(cachedReport, { 
          status: 200,
          headers: { 'X-Cache': 'HIT' }
        });
        
        response.cookies.getAll().forEach(cookie => {
          jsonResponse.cookies.set(cookie);
        });
        
        return jsonResponse;
      }
      console.log(`[API GET /api/reports/${id}] Cache MISS`);
    } else {
      console.log(`[API GET /api/reports/${id}] Cache skip requested`);
    }
    
    const reportData = await getReport(supabase, id);

    if (!reportData) {
      console.warn(`[API GET /api/reports/${id}] Report not found for ID: ${id}.`);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    console.log(`[API GET /api/reports/${id}] Report found for ID: ${id}.`);
    
    const jsonResponse = NextResponse.json(reportData, { status: 200 });
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    // Cache the report data with an expiration time
    await cacheData(cacheKey, reportData, CACHE_EXPIRY_SECONDS);
    
    return jsonResponse;

  } catch (error) {
    console.error(`[API GET /api/reports] Internal server error:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred";
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> } // params is a Promise
) {
  try {
    const params = await paramsPromise; // Await the params Promise
    const { id } = params; // Destructure id from the resolved params

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Report ID is missing" }, { status: 400 });
    }

    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    // Check authentication - deletion requires authentication
    const userId = await getAuthenticatedUserID(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required for deletion" },
        { status: 401 }
      );
    }

    console.log(`[API DELETE /api/reports/${id}] Attempting to delete report for user: ${userId}`);
    
    const success = await deleteReport(supabase, id);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to delete report or report not found" }, { status: 404 });
    }
    
    console.log(`[API DELETE /api/reports/${id}] Successfully deleted report`);
    
    // Invalidate the cache for this report
    const cacheKey = generateReportCacheKey(id);
    await invalidateCache(cacheKey);
    
    // Also invalidate user reports cache since this report has been deleted
    const userReportsCacheKey = generateUserReportsCacheKey(userId);
    await invalidateCache(userReportsCacheKey);
    
    const jsonResponse = NextResponse.json(
      { message: "Report deleted successfully" },
      { status: 200 }
    );
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: unknown) {
    console.error(`[API DELETE /api/reports] Internal server error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const { id } = params;

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Report ID is missing" }, { status: 400 });
    }

    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    // Check authentication - updating requires authentication
    const userId = await getAuthenticatedUserID(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required for updating" },
        { status: 401 }
      );
    }

    console.log(`[API PUT /api/reports/${id}] Attempting to update report for user: ${userId}`);
    
    // Parse request body
    let updateData;
    try {
      updateData = await req.json();
    } catch (parseError) {
      console.error(`[API PUT /api/reports/${id}] Error parsing request body:`, parseError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    // Validate that at least some update data is provided
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No update data provided" }, { status: 400 });
    }

    // Optional: Validate update data structure
    const allowedFields = [
      'title', 'description', 'category', 'urgency', 'status', 'images',
      'latitude', 'longitude', 'areaProvince', 'areaCity', 'areaBarangay'
    ];
    
    const invalidFields = Object.keys(updateData).filter(key => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Call the updateReport function
    const result = await updateReport(supabase, id, updateData);
    
    if (!result.success) {
      // Determine appropriate status code based on error
      let statusCode = 500;
      if (result.error?.includes('Authentication required')) {
        statusCode = 401;
      } else if (result.error?.includes('Unauthorized')) {
        statusCode = 403;
      } else if (result.error?.includes('not found')) {
        statusCode = 404;
      } else if (result.error?.includes('validation') || result.error?.includes('Invalid')) {
        statusCode = 400;
      }
      
      return NextResponse.json({ error: result.error }, { status: statusCode });
    }
    
    console.log(`[API PUT /api/reports/${id}] Successfully updated report`);
    
    // Invalidate the cache for this report
    const cacheKey = generateReportCacheKey(id);
    await invalidateCache(cacheKey);
    
    // Also invalidate user reports cache since this report has been updated
    const userReportsCacheKey = generateUserReportsCacheKey(userId);
    await invalidateCache(userReportsCacheKey);
    
    const jsonResponse = NextResponse.json({
      message: "Report updated successfully",
      data: result.data
    }, { status: 200 });
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: unknown) {
    console.error(`[API PUT /api/reports] Internal server error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 }
    );
  }
}
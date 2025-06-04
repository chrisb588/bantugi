import { createServerClient } from '@/lib/supabase/server';
import { deleteUserFoldersFromBuckets } from '@/lib/supabase/storage-utils';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';

/**
 * API endpoint for cleaning up orphaned storage folders
 * This can be used for maintenance or fixing issues where user folders weren't properly deleted
 */

export async function POST(req: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    // Check authentication - only allow authenticated users to trigger cleanup
    const userId = await getAuthenticatedUserID(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { targetUserId, buckets } = await req.json();
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    // Default buckets to clean up
    const bucketsToClean = buckets || ['report-images', 'avatars'];
    
    console.log(`[API/storage/cleanup] Cleaning up storage for user: ${targetUserId} from buckets: ${bucketsToClean.join(', ')}`);

    const cleanupResult = await deleteUserFoldersFromBuckets(supabase, targetUserId, bucketsToClean);
    
    const totalDeleted = cleanupResult.results.reduce((sum, result) => sum + result.deletedCount, 0);
    
    return NextResponse.json({
      success: cleanupResult.success,
      message: `Storage cleanup completed. Deleted ${totalDeleted} files total.`,
      results: cleanupResult.results
    });

  } catch (error: unknown) {
    console.error('[API/storage/cleanup] Internal server error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

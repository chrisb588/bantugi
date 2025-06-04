import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Delete entire user folder from a Supabase storage bucket
 * @param supabase - Supabase client instance
 * @param bucketName - Name of the storage bucket
 * @param userId - User ID (folder name)
 * @param limit - Maximum number of files to delete at once (default: 1000)
 * @returns Promise<{ success: boolean, deletedCount: number, error?: string }>
 */
export async function deleteUserFolder(
  supabase: SupabaseClient,
  bucketName: string,
  userId: string,
  limit: number = 1000
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    console.log(`[deleteUserFolder] Deleting user folder from ${bucketName}: ${userId}/`);
    
    // List all files in the user's folder
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list(userId, { limit });
    
    if (listError) {
      console.error(`[deleteUserFolder] Error listing files in ${bucketName}/${userId}:`, listError);
      return { success: false, deletedCount: 0, error: listError.message };
    }
    
    if (!files || files.length === 0) {
      console.log(`[deleteUserFolder] No files found in ${bucketName}/${userId}`);
      return { success: true, deletedCount: 0 };
    }
    
    // Create full file paths for deletion
    const filePaths = files.map(file => `${userId}/${file.name}`);
    console.log(`[deleteUserFolder] Found ${filePaths.length} files to delete from ${bucketName}`);
    
    const { error: deleteFilesError } = await supabase.storage
      .from(bucketName)
      .remove(filePaths);
    
    if (deleteFilesError) {
      console.error(`[deleteUserFolder] Failed to delete files from ${bucketName}:`, deleteFilesError);
      return { success: false, deletedCount: 0, error: deleteFilesError.message };
    }
    
    console.log(`[deleteUserFolder] Successfully deleted ${filePaths.length} files from ${bucketName}`);
    return { success: true, deletedCount: filePaths.length };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[deleteUserFolder] Error during ${bucketName} storage cleanup:`, error);
    return { success: false, deletedCount: 0, error: errorMessage };
  }
}

/**
 * Delete user folders from multiple storage buckets
 * @param supabase - Supabase client instance
 * @param userId - User ID (folder name)
 * @param bucketNames - Array of bucket names to clean up
 * @returns Promise<{ success: boolean, results: Array<{ bucket: string, deletedCount: number, error?: string }> }>
 */
export async function deleteUserFoldersFromBuckets(
  supabase: SupabaseClient,
  userId: string,
  bucketNames: string[]
): Promise<{ 
  success: boolean; 
  results: Array<{ bucket: string; deletedCount: number; error?: string }> 
}> {
  console.log(`[deleteUserFoldersFromBuckets] Cleaning up storage for user: ${userId} from buckets: ${bucketNames.join(', ')}`);
  
  const results = [];
  let overallSuccess = true;
  
  for (const bucketName of bucketNames) {
    const result = await deleteUserFolder(supabase, bucketName, userId);
    results.push({
      bucket: bucketName,
      deletedCount: result.deletedCount,
      error: result.error
    });
    
    if (!result.success) {
      overallSuccess = false;
    }
  }
  
  return { success: overallSuccess, results };
}

/**
 * Utility to extract file path from Supabase storage URL
 * @param url - Full Supabase storage URL
 * @param bucketName - Name of the bucket
 * @returns File path or null if URL format is invalid
 */
export function extractFilePathFromUrl(url: string, bucketName: string): string | null {
  const regex = new RegExp(`/storage/v1/object/public/${bucketName}/(.+)$`);
  const match = url.match(regex);
  return match ? match[1] : null;
}

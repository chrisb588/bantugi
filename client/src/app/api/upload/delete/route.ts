import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';

export async function DELETE(req: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    // Check authentication
    const userId = await getAuthenticatedUserID(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    console.log(`[API/upload/delete] Deleting image: ${imageUrl} for user: ${userId}`);

    // Extract the file path from the image URL
    // Expected format: https://...supabase.co/storage/v1/object/public/report-images/{path}
    const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/report-images\/(.+)$/);
    
    if (!pathMatch) {
      console.warn(`[API/upload/delete] Could not extract file path from image URL: ${imageUrl}`);
      return NextResponse.json(
        { error: "Invalid image URL format" },
        { status: 400 }
      );
    }

    const filePath = pathMatch[1];
    
    // Verify the file belongs to the authenticated user by checking the path starts with userId
    if (!filePath.startsWith(`${userId}/`)) {
      console.error(`[API/upload/delete] Unauthorized: User ${userId} tried to delete file ${filePath}`);
      return NextResponse.json(
        { error: "Unauthorized: You can only delete your own files" },
        { status: 403 }
      );
    }

    console.log(`[API/upload/delete] Deleting file: ${filePath}`);
    
    // First, check if the file exists before trying to delete it
    const { data: fileExists, error: checkError } = await supabase.storage
      .from('report-images')
      .list(filePath.split('/')[0], {
        search: filePath.split('/').slice(1).join('/')
      });
    
    if (checkError) {
      console.error(`[API/upload/delete] Error checking if file exists ${filePath}:`, checkError);
    } else {
      console.log(`[API/upload/delete] File exists check for ${filePath}:`, fileExists?.length > 0 ? 'Found' : 'Not found');
    }
    
    const { data: deleteResult, error: deleteFileError } = await supabase.storage
      .from('report-images')
      .remove([filePath]);
    
    console.log(`[API/upload/delete] Storage delete result for ${filePath}:`, deleteResult);
    
    if (deleteFileError) {
      console.error(`[API/upload/delete] Failed to delete file ${filePath}:`, deleteFileError);
      return NextResponse.json(
        { error: 'Failed to delete file from storage', details: deleteFileError.message },
        { status: 500 }
      );
    }

    // Verify the file was actually deleted by checking again
    const { data: verifyDelete, error: verifyError } = await supabase.storage
      .from('report-images')
      .list(filePath.split('/')[0], {
        search: filePath.split('/').slice(1).join('/')
      });
    
    if (verifyError) {
      console.warn(`[API/upload/delete] Could not verify deletion of ${filePath}:`, verifyError);
    } else {
      const fileStillExists = verifyDelete?.length > 0;
      console.log(`[API/upload/delete] Verification: File ${filePath} still exists: ${fileStillExists}`);
      
      if (fileStillExists) {
        console.error(`[API/upload/delete] File ${filePath} still exists after deletion attempt`);
        return NextResponse.json(
          { error: 'File deletion verification failed - file may still exist' },
          { status: 500 }
        );
      }
    }

    console.log(`[API/upload/delete] Successfully deleted file: ${filePath}`);
    
    const jsonResponse = NextResponse.json(
      { message: "Image deleted successfully" },
      { status: 200 }
    );
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: unknown) {
    console.error('[API/upload/delete] Internal server error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

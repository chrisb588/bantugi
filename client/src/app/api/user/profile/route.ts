import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';
import { deleteUserFoldersFromBuckets } from '@/lib/supabase/storage-utils';

// GET - Fetch user profile
export async function GET(req: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    const userId = await getAuthenticatedUserID(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`[API/user/profile] Fetching profile for user: ${userId}`);
    
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('user_id, email, avatar_url, username, address')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[API/user/profile] Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: error.message },
        { status: 500 }
      );
    }

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const userProfile = {
      username: profileData.username || profileData.email || '',
      email: profileData.email || '',
      profilePicture: profileData.avatar_url || undefined,
      address: profileData.address || undefined,
      emailConfirmedAt: null,
    };

    console.log(`[API/user/profile] Successfully fetched profile for user: ${userId}`);
    
    const jsonResponse = NextResponse.json(
      { profile: userProfile },
      { status: 200 }
    );
    
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: unknown) {
    console.error('[API/user/profile] Internal server error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update user profile with optional avatar upload
export async function PUT(req: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    const userId = await getAuthenticatedUserID(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`[API/user/profile] Updating profile for user: ${userId}`);
    
    const contentType = req.headers.get('content-type') || '';
    let updateData: any = {};
    let avatarFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      
      const email = formData.get('email') as string;
      const username = formData.get('username') as string;
      const address = formData.get('address') as string;
      
      if (email) {
        updateData.email = email;
      }
      if (username) {
        updateData.username = username;
      }
      if (address) {
        updateData.address = address;
      }

      avatarFile = formData.get('avatar') as File;
      
    } else {
      const body = await req.json();
      updateData = body;
    }

    let avatarUrl: string | undefined;
    if (avatarFile && avatarFile.size > 0) {
      console.log(`[API/user/profile] Processing avatar upload for user: ${userId}`);
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(avatarFile.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only images are allowed.' },
          { status: 400 }
        );
      }

      const maxSize = 5 * 1024 * 1024;
      if (avatarFile.size > maxSize) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }

      const fileExtension = avatarFile.name.split('.').pop() || 'jpg';
      const fileName = `${userId}/avatar-${Date.now()}.${fileExtension}`;
      
      console.log(`[API/user/profile] Uploading avatar: ${fileName}`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { 
          cacheControl: '3600', 
          upsert: true
        });

      if (uploadError) {
        console.error('[API/user/profile] Avatar upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload avatar', details: uploadError.message },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      avatarUrl = publicUrlData.publicUrl;
      updateData.avatar_url = avatarUrl;
      
      console.log(`[API/user/profile] Successfully uploaded avatar: ${fileName}`);
    }

    const profileUpdateData: any = {};
    if (updateData.email !== undefined) {
      profileUpdateData.email = updateData.email;
    }
    if (updateData.username !== undefined) {
      profileUpdateData.username = updateData.username;
    }
    if (updateData.address !== undefined) {
      profileUpdateData.address = updateData.address;
    }
    if (updateData.avatar_url !== undefined) {
      profileUpdateData.avatar_url = updateData.avatar_url;
    }

    if (Object.keys(profileUpdateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(profileUpdateData)
      .eq('user_id', userId)
      .select('user_id, email, avatar_url, username, address')
      .single();

    if (updateError) {
      console.error('[API/user/profile] Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      );
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Profile not found or update failed' },
        { status: 404 }
      );
    }

    const userProfile = {
      username: updatedProfile.username || updatedProfile.email || '',
      email: updatedProfile.email || '',
      profilePicture: updatedProfile.avatar_url || undefined,
      address: updatedProfile.address || undefined,
      emailConfirmedAt: null,
    };

    console.log(`[API/user/profile] Successfully updated profile for user: ${userId}`);
    
    const jsonResponse = NextResponse.json(
      { 
        profile: userProfile,
        message: 'Profile updated successfully',
        ...(avatarUrl && { avatarUrl })
      },
      { status: 200 }
    );
    
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: unknown) {
    console.error('[API/user/profile] Internal server error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete user profile and account
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

    console.log(`[API/user/profile] Deleting profile for user: ${userId}`);
    
    // Delete entire user folder from storage buckets
    console.log(`[API/user/profile] Cleaning up storage for user: ${userId}`);
    
    const storageCleanup = await deleteUserFoldersFromBuckets(supabase, userId, ['report-images', 'avatars']);
    
    if (!storageCleanup.success) {
      console.warn('[API/user/profile] Some storage cleanup operations failed:', storageCleanup.results);
      // Continue with deletion even if storage cleanup partially fails
    } else {
      const totalDeleted = storageCleanup.results.reduce((sum, result) => sum + result.deletedCount, 0);
      console.log(`[API/user/profile] Successfully cleaned up ${totalDeleted} files from storage`);
    }

    // First, delete all related data (reports, saved reports, comments)
    console.log(`[API/user/profile] Cleaning up user data for user: ${userId}`);
    
    // Delete user's saved reports
    const { error: savedReportsError } = await supabase
      .from('saved_reports')
      .delete()
      .eq('user_id', userId);
    
    if (savedReportsError) {
      console.warn('[API/user/profile] Failed to delete saved reports:', savedReportsError);
      // Continue with deletion even if this fails
    }

    // Delete user's comments
    const { error: commentsError } = await supabase
      .from('comment')
      .delete()
      .eq('creatorid', userId);
    
    if (commentsError) {
      console.warn('[API/user/profile] Failed to delete comments:', commentsError);
      // Continue with deletion even if this fails
    }

    // Delete user's reports from database (storage already cleaned up above)
    const { data: userReports, error: reportsError } = await supabase
      .from('reports')
      .select('id')
      .eq('created_by', userId);

    if (userReports && userReports.length > 0) {
      console.log(`[API/user/profile] Found ${userReports.length} reports to delete from database`);
      
      // Delete the reports from database
      const { error: deleteReportsError } = await supabase
        .from('reports')
        .delete()
        .eq('created_by', userId);
      
      if (deleteReportsError) {
        console.warn('[API/user/profile] Failed to delete reports from database:', deleteReportsError);
        // Continue with deletion even if this fails
      } else {
        console.log(`[API/user/profile] Successfully deleted ${userReports.length} reports from database`);
      }
    }

    // Delete the user's profile from the profiles table
    // Note: Database trigger will automatically delete the auth user
    console.log(`[API/user/profile] Deleting profile (trigger will handle auth user deletion): ${userId}`);
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      console.error('[API/user/profile] Error deleting profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to delete profile', details: profileError.message },
        { status: 500 }
      );
    }

    console.log(`[API/user/profile] Successfully deleted profile (auth user deleted by trigger): ${userId}`);

    console.log(`[API/user/profile] Successfully deleted user account: ${userId}`);
    
    const jsonResponse = NextResponse.json(
      { message: 'User account deleted successfully' },
      { status: 200 }
    );
    
    // Clear any auth cookies
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie.name, '', { maxAge: 0 });
    });
    
    return jsonResponse;

  } catch (error: unknown) {
    console.error('[API/user/profile] Internal server error during deletion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH - Alternative update method for partial updates
export async function PATCH(req: NextRequest) {
  return PUT(req);
}

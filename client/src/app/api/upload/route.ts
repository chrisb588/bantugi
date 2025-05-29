import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    // Check authentication - file uploads require authentication
    const userId = await getAuthenticatedUserID(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required for file uploads" },
        { status: 401 }
      );
    }

    console.log(`[API/upload] Processing file upload for user: ${userId}`);
    
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (optional security measure)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const fileName = `${userId}/${Date.now()}-${file.name}`;
    console.log(`[API/upload] Uploading file: ${fileName}`);
    
    const { data, error } = await supabase.storage
      .from('report-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('[API/upload] Supabase storage error:', error);
      return NextResponse.json({ error: 'Failed to upload file', details: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(data.path);

    console.log(`[API/upload] Successfully uploaded file: ${fileName}`);
    
    const jsonResponse = NextResponse.json(
      { fileUrl: publicUrlData.publicUrl },
      { status: 200 }
    );
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: any) {
    console.error('[API/upload] Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
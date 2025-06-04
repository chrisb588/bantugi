import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  
  try {
    const formData = await req.formData();
    const response = NextResponse.next();
    const supabase = createServerClient(req, response);
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('report-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ fileUrl: publicUrlData.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
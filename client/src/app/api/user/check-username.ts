import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server-client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: 'Missing or invalid username' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (error) {
      console.error('[check-username] DB error:', error.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    // If data is null, username is available
    if (!data) {
      return NextResponse.json({ available: true }, { status: 200 });
    }
    // If data exists, username is taken
    return NextResponse.json({ available: false }, { status: 200 });
  } catch (err) {
    console.error('[check-username] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

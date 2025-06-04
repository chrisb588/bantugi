import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server-client';

export async function GET(req: NextRequest) {
  // Generate a unique request ID for traceability
  const requestId = crypto.randomUUID();
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    // Minimum username length validation
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters', requestId }, { status: 400 });
    }

    // Use the typed Supabase client for safety
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      // Provide more descriptive error messages for known error codes
      let clientMessage = 'Database error';
      if (error.code === '42P01') { // undefined_table
        clientMessage = 'Users table not found in database';
      } else if (error.code === '42703') { // undefined_column
        clientMessage = 'Username column not found in users table';
      } else if (error.code === '42501') { // insufficient_privilege
        clientMessage = 'Insufficient database privileges';
      } else if (error.code === '28P01') { // invalid_authentication
        clientMessage = 'Database authentication failed';
      }
      // Log the full error object for debugging
      console.error('[check-username] DB error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
        requestId,
        url: req.url,
        method: req.method,
      });
      return NextResponse.json({ error: clientMessage, requestId }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ available: true, requestId }, { status: 200 });
    }
    return NextResponse.json({ available: false, requestId }, { status: 200 });
  } catch (err: any) {
    // Log the full error object for unexpected errors
    console.error('[check-username] Unexpected error:', {
      message: err.message,
      stack: err.stack,
      requestId,
      url: req.url,
      method: req.method,
    });
    return NextResponse.json({ error: 'Internal server error', requestId }, { status: 500 });
  }
}

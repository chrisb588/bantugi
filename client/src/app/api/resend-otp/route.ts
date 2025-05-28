import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Call Django backend to resend OTP
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resend-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Failed to resend OTP' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

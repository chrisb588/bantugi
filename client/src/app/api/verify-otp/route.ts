import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    // Verify OTP with your Django backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Failed to verify OTP' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'OTP verified successfully' });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

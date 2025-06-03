import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUserID } from '@/lib/supabase/user.server';
import { getUserCreatedReports } from '@/lib/supabase/reports';
import Report from '@/interfaces/report';

export async function GET(req: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = createServerClient(req, response);

    const userId = await getUserID(supabase);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log(`[API/user/created-reports] Fetching reports created by user: ${userId}`);

    // Use the new function from reports.ts
    const reports = await getUserCreatedReports(supabase, userId);
    
    console.log(`[API/user/created-reports] Successfully fetched ${reports.length} reports for user: ${userId}`);
    
    const jsonResponse = NextResponse.json(reports, { status: 200 });
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error: any) {
    console.error('[API/user/created-reports] Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

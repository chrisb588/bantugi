import { NextRequest, NextResponse } from 'next/server';
import { getCommentsByReportId, createComment } from '@/lib/supabase/reports';
import { createServerClient } from '@/lib/supabase/server';
import { getAuthenticatedUserID } from '@/lib/supabase/auth-utils';

// GET - Fetch comments for a specific report
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const { id: reportId } = params;

    if (!reportId || reportId === "undefined") {
      console.error('[API GET /api/reports/[id]/comments] Error: Report ID is missing or undefined.');
      return NextResponse.json({ error: "Report ID is missing or undefined in the path" }, { status: 400 });
    }

    console.log(`[API GET /api/reports/${reportId}/comments] Attempting to fetch comments for report ID: ${reportId}`);
    
    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    // Fetch comments for the report
    const comments = await getCommentsByReportId(supabase, reportId);

    console.log(`[API GET /api/reports/${reportId}/comments] Found ${comments.length} comments for report ID: ${reportId}`);
    
    const jsonResponse = NextResponse.json({ comments }, { status: 200 });
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error) {
    console.error('[API GET /api/reports/[id]/comments] Server error:', error);
    return NextResponse.json(
      { error: "Internal server error while fetching comments" },
      { status: 500 }
    );
  }
}

// POST - Create a new comment for a specific report
export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const { id: reportId } = params;

    if (!reportId || reportId === "undefined") {
      console.error('[API POST /api/reports/[id]/comments] Error: Report ID is missing or undefined.');
      return NextResponse.json({ error: "Report ID is missing or undefined in the path" }, { status: 400 });
    }

    // Parse request body
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required and must be a non-empty string" }, { status: 400 });
    }

    console.log(`[API POST /api/reports/${reportId}/comments] Attempting to create comment for report ID: ${reportId}`);
    
    const response = new NextResponse();
    const supabase = createServerClient(req, response);
    
    // Check authentication - required for creating comments
    const userId = await getAuthenticatedUserID(req);
    if (!userId) {
      console.warn(`[API POST /api/reports/${reportId}/comments] Unauthorized request - user not authenticated`);
      return NextResponse.json({ error: "Authentication required to create comments" }, { status: 401 });
    }

    console.log(`[API POST /api/reports/${reportId}/comments] Request from authenticated user: ${userId}`);

    // Create the comment using the helper function
    const newComment = await createComment(supabase, reportId, content, userId);

    if (!newComment) {
      console.error(`[API POST /api/reports/${reportId}/comments] Failed to create comment`);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    console.log(`[API POST /api/reports/${reportId}/comments] Comment created successfully with ID: ${newComment.id}`);
    
    const jsonResponse = NextResponse.json({ comment: newComment }, { status: 201 });
    
    // Copy any cookies set by Supabase
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie);
    });
    
    return jsonResponse;

  } catch (error) {
    console.error('[API POST /api/reports/[id]/comments] Server error:', error);
    return NextResponse.json(
      { error: "Internal server error while creating comment" },
      { status: 500 }
    );
  }
}
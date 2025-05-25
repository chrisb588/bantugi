// Where to function for CRUD function
import { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from './server'
import { Report, Comment } from '../../components/report/report-view'

// Pinky promise you return report or else its null
export async function getReport(reportId: string): Promise<Report | null> {
    const supabase: SupabaseClient = createServerClient()
  
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('report_no', reportId)
      .single() // because you're expecting only one report
  
    if (error) {
      console.error('Get report error:', error)
      return null
    } else if (!data) {
        console.warn('No data was returned')
    } else {
        console.log('Got report:', data)
    }
  
    return data as Report
  }

// User needs to be authenticated when inserting 
// data to reports table
// CHECK: Auth policies for reports table  
export async function createReport(data: {
    title: string;
    category: string;
    location: string;
    status: "Unresolved" | "In Progress" | "Resolved";
    description: string;
    images: string[];
    latitude: number;
    longitude: number;
}): Promise<Report | null> {
    const supabase: SupabaseClient = createServerClient()
    const {data : report, error } = await supabase
    .from('reports')
    .insert([data])
    .select()
    .single();

    if (error) {
        console.error('Supabase insert error:', error);
        return null;
      }
    
    return report;
}

export async function updateReport(
    reportId: string,
    payload: Partial<{
      title: string;
      category: string;
      location: string;
      status: 'Unresolved' | 'In Progress' | 'Resolved';
      description: string;
      images: string[];
      latitude: number;
      longitude: number;
    }>
  ): Promise<Report | null> {
    const supabase: SupabaseClient = await createServerClient();
  
    const { data: report, error } = await supabase
      .from('reports')
      .update(payload)
      .eq('report_no', reportId)
      .select() 
      .single();  
  
    if (error) {
      console.error('Update report error:', error);
      return null;
    }

    return report;
  }

// needs the current user data to delete a report
// to be updated
export async function deleteReport(
    id: string
) {
    const supabase: SupabaseClient = await createServerClient();

    const { data, error} = await supabase
    .from('reports')
    .delete()
    .eq('report_no', id);

    if (error) {
        console.error('Delete report error:', error);
        return false
    }

    return true;
}

// pinky promise you return an array of comments
export async function getCommentsByReportId(
  reportId: string
): Promise<Comment[]> {
  const supabase: SupabaseClient = await createServerClient();

  const { data, error } = await supabase
  .from("comments")
  .select(`
    id,
    text,
    datePosted,
    author:author_id (name, location, avatar)
  `)
  .eq("report_id", reportId);

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

    // Transform the data to match the Comment interface
    const comments: Comment[] = (data || []).map((item) => ({
      id: item.id,
      text: item.text,
      datePosted: item.datePosted,
      author: Array.isArray(item.author) ? item.author[0] : item.author, // Ensure author is a single object
    }));
  
    return comments;
}
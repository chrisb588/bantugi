// Where to function for CRUD function
import { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from './server'
import Comment from '@/interfaces/comment'
import { getUserID } from './user.server'
import Report from '@/interfaces/report';
import Location from '@/interfaces/location';
import Area from '@/interfaces/area';
import User from '@/interfaces/user';

export async function getReport(server: SupabaseClient, reportId: string) {
  const supabase: SupabaseClient = server;

  const reportQuery = `
    id,
    created_at,
    created_by,
    title,
    description,
    status,
    images,
    category,
    urgency,
    location:location_id (
      location_id,
      latitude,
      longitude,
      area:area_id (
        id,
        province,
        city,
        barangay
      )
    )
  `;

  const { data: dbReportData, error } = await supabase
    .from('reports')
    .select(reportQuery)
    .eq('id', reportId)
    .maybeSingle();

  if (error) {
    console.error('Supabase getReport error:', error);
    return null;
  }

  if (!dbReportData) {
    console.warn(`No report found for ID: ${reportId}`);
    return null;
  }

  // Fetch creator separately using created_by field
  const { data: creatorData, error: creatorError } = await supabase
    .from('profiles')
    .select('user_id, email, username, avatar_url')
    .eq('user_id', dbReportData.created_by)
    .maybeSingle();

  if (creatorError) {
    console.error('Error fetching report creator:', creatorError);
  }

  // Fetch comments separately since there's no FK constraint for comment.creatorid
  const { data: commentsData, error: commentsError } = await supabase
    .from('comment')
    .select(`
      id,
      content,
      created_at,
      creatorid
    `)
    .eq('report_id', reportId);

  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
  }

  // Fetch creator profiles for comments if comments exist
  let commentsWithCreators: (DbCommentRow & { creator: DbUserRow | null })[] = [];
  if (commentsData && commentsData.length > 0) {
    const creatorIds = commentsData.map(comment => comment.creatorid).filter(Boolean);
    
    if (creatorIds.length > 0) {
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('profiles')
        .select('user_id, email, username, avatar_url') // Select only existing fields
        .in('user_id', creatorIds);

      if (creatorsError) {
        console.error('Error fetching comment creators:', creatorsError);
      }

      // Map comments with their creators
      commentsWithCreators = commentsData.map(comment => ({
        ...comment,
        creator: creatorsData?.find(creator => creator.user_id === comment.creatorid) || null
      }));
    } else {
      commentsWithCreators = commentsData.map(comment => ({
        ...comment,
        creator: null
      }));
    }
  }

  // Process location data to match DbLocationRow structure
  let processedLocationForDbReport: DbLocationRow | null = null;
  if (dbReportData.location) {
    // Normalize dbReportData.location to a single object or null.
    const rawLocationObject = Array.isArray(dbReportData.location) && dbReportData.location.length > 0
      ? dbReportData.location[0]
      : (!Array.isArray(dbReportData.location) && typeof dbReportData.location === 'object' && dbReportData.location !== null)
        ? dbReportData.location
        : null;

    if (rawLocationObject && typeof rawLocationObject.location_id !== 'undefined') {
      // Normalize rawLocationObject.area to a single DbAreaRow object or null.
      let areaForDbLocationRow: DbAreaRow | null = null;
      if (rawLocationObject.area) {
        const rawAreaObject = Array.isArray(rawLocationObject.area) && rawLocationObject.area.length > 0
          ? rawLocationObject.area[0]
          : (!Array.isArray(rawLocationObject.area) && typeof rawLocationObject.area === 'object' && rawLocationObject.area !== null)
            ? rawLocationObject.area
            : null;

        if (rawAreaObject && typeof rawAreaObject.id !== 'undefined') {
          areaForDbLocationRow = {
            id: rawAreaObject.id,
            province: rawAreaObject.province,
            city: rawAreaObject.city,
            barangay: rawAreaObject.barangay,
          };
        }
      }

      processedLocationForDbReport = {
        location_id: rawLocationObject.location_id,
        latitude: rawLocationObject.latitude,
        longitude: rawLocationObject.longitude,
        area: areaForDbLocationRow,
      };
    }
  }

  const combinedDbReport: DbReportRow = {
    ...dbReportData,
    creator: creatorData || null,
    comments: commentsWithCreators,
    location: processedLocationForDbReport,
  };

  // Transform the combined data using our transformation function
  const transformedReport = transformDbReportToReport(combinedDbReport);
  console.log("Transformed Report:", transformedReport);
  return transformedReport;
}

export async function createReport(server: SupabaseClient, data: {
  title: string;
  category: string;
  description: string;
  images: string[];
  urgency: "Low" | "Medium" | "High";
  status: "Unresolved" | "Being Addressed" | "Resolved"; // Updated status type

  latitude: number;
  longitude: number;

  areaProvince: string;
  areaCity?: string;
  // areaMunicipality?: string; // Removed as it's not in the area table DDL
  areaBarangay: string;
}) {
  const supabase: SupabaseClient = server;

  const user_id = await getUserID(server);
  if (!user_id) {
    console.error('Authentication required: No user ID found');
    return {
      success: false,
      error: 'Authentication required',
      status: 401
    };
  }

  const createdAreaData = await createAreaRecord(supabase, {
    areaProvince: data.areaProvince,
    areaCity: data.areaCity,
    // areaMunicipality: data.areaMunicipality, // Removed
    areaBarangay: data.areaBarangay,
  });
  const area_id = createdAreaData.id;

  const createdLocationData = await createLocationRecord(supabase, {
    latitude: data.latitude,
    longitude: data.longitude,
    area_id: area_id, 
  });

  const report_location_id = Array.isArray(createdLocationData) 
    ? createdLocationData[0]?.location_id 
    : createdLocationData?.location_id;
    
  console.log("Report location ID:", report_location_id);
  
  if (!report_location_id) {
    console.error('Could not extract location_id from RPC response:', createdLocationData);
    throw new Error('Failed to get location_id from created location');
  }
  const { data: createdReportRow, error: reportError } = await supabase
  .from('reports')
  .insert({
      title: data.title,
      description: data.description,
      images: data.images,
      status: data.status,
      category: data.category,
      urgency: data.urgency,
      created_by: user_id, // Changed from creator_id to match DB schema
      location_id: report_location_id, // from createLocationRecord
  })
  .select('id, title, description, category, urgency, status, images, created_at, created_by, location_id') // Changed creator_id to created_by
  .single();

  if (reportError || !createdReportRow) {
      console.error('Error creating report:', reportError?.message);
      // It might be better to return an error object or throw an error
      return null; 
  }

  return createdReportRow;
}

async function createAreaRecord(
  supabase: SupabaseClient,
  areaData: {
    areaProvince: string;
    areaCity?: string;
    areaBarangay: string;
  }
) {
  const { data: createdAreaData, error: areaError } = await supabase
    .from('area')
    .insert({
      province: areaData.areaProvince,
      city: areaData.areaCity,
      barangay: areaData.areaBarangay,
    })
    .select('id, province, city, barangay')
    .single();

  if (areaError) {
    console.error('Error creating area in helper:', areaError.message);
    throw areaError; // Or return an error object: { error: areaError, data: null }
  }
  if (!createdAreaData) {
    const noDataError = new Error('No data returned after creating area.');
    console.error(noDataError.message);
    throw noDataError; // Or return an error object
  }
  return createdAreaData;
}

async function createLocationRecord(
  supabase: SupabaseClient,
  locationData: {
    latitude: number;
    longitude: number;
    area_id: number;
  }
) {
  const rpcParams = {
    lat: locationData.latitude,
    lon: locationData.longitude,
    area_id: locationData.area_id,
  };

  const { data: createdLocationData, error: locationError } = await supabase
    .rpc('insert_location_with_point', rpcParams);
    
  if (locationError) {
    console.error('Error creating location in helper:', locationError.message);
    throw locationError; // Or return an error object
  }
  
  if (!createdLocationData) {
    console.error('No data returned from RPC function');
    throw new Error('No data returned from insert_location_with_point RPC');
  }
  
  return createdLocationData;
}

// Delete a report - only the creator can delete their own reports
export async function deleteReport(
    server: SupabaseClient,
    reportId: string
): Promise<boolean> {
    const supabase: SupabaseClient = server;

    // Get the current user's ID
    const userId = await getUserID(server);
    if (!userId) {
        console.error('[deleteReport] Authentication required: No user ID found');
        return false;
    }

    console.log(`[deleteReport] Attempting to delete report ${reportId} by user ${userId}`);

    try {
        // First, verify that the report exists and the user is the creator
        const { data: reportData, error: fetchError } = await supabase
            .from('reports')
            .select('id, created_by, title, images')
            .eq('id', reportId)
            .single();

        if (fetchError) {
            console.error('[deleteReport] Error fetching report for verification:', fetchError);
            return false;
        }

        if (!reportData) {
            console.error('[deleteReport] Report not found:', reportId);
            return false;
        }

        // Check if the current user is the creator of the report
        if (reportData.created_by !== userId) {
            console.error('[deleteReport] Unauthorized: User is not the creator of this report');
            return false;
        }

        console.log(`[deleteReport] User ${userId} is authorized to delete report "${reportData.title}"`);

        // Handle image cleanup before deleting the report
        if (reportData.images && reportData.images.length > 0) {
            console.log(`[deleteReport] Cleaning up ${reportData.images.length} images from storage`);
            
            // Delete all images from storage
            for (const imageUrl of reportData.images) {
                try {
                    // Extract the file path from the image URL
                    // Expected format: https://...supabase.co/storage/v1/object/public/report-images/{path}
                    const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/report-images\/(.+)$/);
                    
                    if (pathMatch) {
                        const filePath = pathMatch[1];
                        console.log(`[deleteReport] Deleting image file: ${filePath}`);
                        
                        const { error: deleteFileError } = await supabase.storage
                            .from('report-images')
                            .remove([filePath]);
                        
                        if (deleteFileError) {
                            console.warn(`[deleteReport] Failed to delete image file ${filePath}:`, deleteFileError);
                            // Continue with deletion even if file deletion fails
                        } else {
                            console.log(`[deleteReport] Successfully deleted image file: ${filePath}`);
                        }
                    } else {
                        console.warn(`[deleteReport] Could not extract file path from image URL: ${imageUrl}`);
                    }
                } catch (imageCleanupError) {
                    console.warn(`[deleteReport] Error during image cleanup for ${imageUrl}:`, imageCleanupError);
                    // Continue with deletion even if image cleanup fails
                }
            }
        }

        // Delete the report
        const { error: deleteError } = await supabase
            .from('reports')
            .delete()
            .eq('id', reportId)
            .eq('created_by', userId); // Additional safety check

        if (deleteError) {
            console.error('[deleteReport] Error deleting report:', deleteError);
            return false;
        }

        console.log(`[deleteReport] Successfully deleted report ${reportId}`);
        return true;

    } catch (error) {
        console.error('[deleteReport] Unexpected error:', error);
        return false;
    }
}

// pinky promise you return an array of comments
export async function getCommentsByReportId(
  server: SupabaseClient,
  reportId: string
): Promise<Comment[]> {
  const { data, error } = await server
    .from("comment") // Changed from "comments" to "comment" to match schema table name
    .select(`
      id,
      content,      
      created_at,
      creator:creatorid ( 
        user_id,
        email,
        avatar_url
      )
    `) // Corrected select for creator, assuming creatorid is FK to profiles.user_id
    .eq("report_id", reportId);

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  // Transform the data to match the Comment interface
  const comments: Comment[] = convertToComments(data); // Pass data to convertToComments

  return comments;

  function convertToComments(dbComments: any[] | null): Comment[] { // Added type for dbComments
    return (dbComments || []).map((item) => {
      // item.creator is now the object fetched from profiles
      const userObject = item.creator; 

      return {
        id: item.id,
        creator: {
          // Use email as username, as profiles table doesn't have a username field
          username: userObject ? userObject.email : "Anon User", 
          profilePicture: userObject ? userObject.avatar_url : null,
          // location is not available in profiles table as per schema.txt
        },
        content: item.content, // Changed from item.text to item.content
        createdAt: new Date(item.created_at), // Changed from item.datePosted to item.created_at
      }
    })
  }
}

// Create a new comment for a report
export async function createComment(
  server: SupabaseClient,
  reportId: string,
  content: string,
  userId: string
): Promise<Comment | null> {
  const supabase: SupabaseClient = server;

  // Insert the comment
  const { data: commentData, error: commentError } = await supabase
    .from('comment')
    .insert({
      report_id: reportId,
      creatorid: userId,
      content: content.trim()
    })
    .select(`
      id,
      content,
      created_at,
      creator:creatorid (
        user_id,
        email,
        username,
        avatar_url
      )
    `)
    .single();

  if (commentError) {
    console.error('Error creating comment:', commentError);
    return null;
  }

  if (!commentData) {
    console.error('No comment data returned after creation');
    return null;
  }

  // Transform the database comment to match the Comment interface
  const creatorData = Array.isArray(commentData.creator) ? commentData.creator[0] : commentData.creator;
  
  return {
    id: commentData.id,
    content: commentData.content,
    createdAt: new Date(commentData.created_at),
    creator: {
      username: creatorData?.username || creatorData?.email || "Unknown User",
      email: creatorData?.email,
      profilePicture: creatorData?.avatar_url || undefined,
    }
  };
}

// Helper functions to transform Supabase DB rows to application interfaces

// Import interfaces (ensure these are correctly pathed if not at top level of this file)

// Define placeholder types for DB row structures based on DDL.
interface DbAreaRow {
  id: number;
  province: string;
  city?: string | null;
  barangay: string;
}

interface DbLocationRow {
  location_id: number;
  latitude: number | null;
  longitude: number | null;
  area?: DbAreaRow | null; // area_id join should result in one area object or null
}

interface DbUserRow {
  user_id: string;
  email?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

interface DbCommentRow {
  id: string;
  content: string;
  created_at: string;
  creator?: DbUserRow | null;
}

interface DbReportRow {
  id: string; 
  title: string;
  description: string;
  status: "Unresolved" | "Being Addressed" | "Resolved";
  images?: string[] | null;
  created_at: string; // Should always be present as per DB schema (NOT NULL DEFAULT now())
  category: string;
  urgency: "Low" | "Medium" | "High";
  created_by: string; 
  location?: DbLocationRow | null;
  creator?: DbUserRow | null;
  comments?: DbCommentRow[] | null;
}

export function transformDbAreaToArea(dbArea: DbAreaRow | null | undefined): Area | undefined {
  if (!dbArea) {
    return undefined;
  }
  return {
    id: dbArea.id, // Use id from DbAreaRow
    province: dbArea.province,
    city: dbArea.city ?? undefined,
    barangay: dbArea.barangay,
  };
}

export function transformDbLocationToLocation(dbLocation: DbLocationRow | null | undefined): Location | undefined {
  if (!dbLocation) {
    console.warn("transformDbLocationToLocation: Received null or undefined dbLocation.");
    return undefined;
  }

  // Check for valid coordinates
  if (typeof dbLocation.latitude !== 'number' || typeof dbLocation.longitude !== 'number') {
    console.warn("transformDbLocationToLocation: Missing or invalid latitude/longitude for location_id:", dbLocation.location_id);
    return undefined; // Coordinates are mandatory for a Location object
  }

  // Check and transform area
  // dbLocation.area is now expected to be DbAreaRow | null
  const area = dbLocation.area ? transformDbAreaToArea(dbLocation.area) : undefined;
  
  if (!area) {
    console.warn("transformDbLocationToLocation: Could not transform area for location_id:", dbLocation.location_id, "or area data is missing.");
    return undefined; // Address (Area) is mandatory for a Location object
  }

  // If all checks pass, create and return the Location object
  return {
    coordinates: {
      lat: dbLocation.latitude,
      lng: dbLocation.longitude,
    },
    address: area,
  };
}

export function transformDbUserToUser(dbUser: DbUserRow | null | undefined): User | undefined {
  if (!dbUser || !dbUser.email) {
    return undefined; 
  }
  return {
    username: dbUser.username || dbUser.email, // Use username with email fallback
    email: dbUser.email,
    profilePicture: dbUser.avatar_url ?? undefined,
  };
}

export function transformDbCommentToComment(dbComment: DbCommentRow | null | undefined): Comment | undefined {
  if (!dbComment) {
    return undefined;
  }

  let creator: User;
  const transformedCreator = dbComment.creator ? transformDbUserToUser(dbComment.creator) : undefined;

  if (transformedCreator) {
    creator = transformedCreator;
  } else {
    // Provide a default "Unknown User" if creator data is missing
    console.warn(`Comment ${dbComment.id} is missing valid creator information. Using default.`);
    creator = {
      username: "Unknown User",
      profilePicture: undefined,
    };
  }

  return {
    id: dbComment.id,
    content: dbComment.content,
    createdAt: new Date(dbComment.created_at),
    creator: creator,
  };
}

export function transformDbReportToReport(dbReport: DbReportRow | null | undefined): Report | undefined {
  if (!dbReport) {
    return undefined;
  }

  // Ensure dbReport.created_at is present before creating a Date object
  // This check is more for robustness; schema says it's NOT NULL.
  if (!dbReport.created_at) {
    console.error(`Critical: Report ${dbReport.id} is missing created_at field, which is unexpected.`);
    // Depending on strictness, you might return undefined or use a fallback.
    // For now, using a fallback to prevent crashes, but this signals a data integrity issue.
    // dbReport.created_at = new Date().toISOString(); // Fallback if absolutely necessary, but investigate why it's missing
    return undefined; // More strict: if critical data is missing, don't form the report.
  }

  const location = dbReport.location ? transformDbLocationToLocation(dbReport.location) : undefined;
  const creator = dbReport.creator ? transformDbUserToUser(dbReport.creator) : undefined;

  if (!creator) {
    console.warn(`Report ${dbReport.id} is missing valid creator information or creator could not be transformed. Using default.`);
    const defaultCreator: User = {
      username: "Unknown User",
      profilePicture: undefined,
    };
    
    const comments = dbReport.comments
      ?.map(transformDbCommentToComment)
      .filter((comment): comment is Comment => comment !== undefined) ?? [];

    return {
      id: dbReport.id,
      title: dbReport.title,
      description: dbReport.description,
      category: dbReport.category,
      urgency: dbReport.urgency,
      status: dbReport.status,
      images: dbReport.images ?? undefined,
      createdAt: new Date(dbReport.created_at), // dbReport.created_at is now guaranteed by the check above or schema
      location: location,
      creator: defaultCreator,
      comments: comments.length > 0 ? comments : undefined,
    };
  }

  const comments = dbReport.comments
    ?.map(transformDbCommentToComment)
    .filter((comment): comment is Comment => comment !== undefined) ?? [];

  return {
    id: dbReport.id,
    title: dbReport.title,
    description: dbReport.description,
    category: dbReport.category,
    urgency: dbReport.urgency,
    status: dbReport.status,
    images: dbReport.images ?? undefined,
    createdAt: new Date(dbReport.created_at), // dbReport.created_at is now guaranteed
    location: location,
    creator: creator,
    comments: comments.length > 0 ? comments : undefined,
  };
}

export async function getUserCreatedReports(server: SupabaseClient, userId?: string): Promise<Report[]> {
  const supabase: SupabaseClient = server;

  // If no userId provided, get the current user's ID
  const targetUserId = userId || await getUserID(server);
  if (!targetUserId) {
    console.error('[getUserCreatedReports] Authentication required: No user ID found');
    return [];
  }

  console.log(`[getUserCreatedReports] Fetching reports created by user: ${targetUserId}`);

  // Query for multiple reports filtered by created_by
  const reportQuery = `
    id,
    created_at,
    created_by,
    title,
    description,
    status,
    images,
    category,
    urgency,
    location:location_id (
      location_id,
      latitude,
      longitude,
      area:area_id (
        id,
        province,
        city,
        barangay
      )
    )
  `;

  const { data: dbReportsData, error: reportsError } = await supabase
    .from('reports')
    .select(reportQuery)
    .eq('created_by', targetUserId)
    .order('created_at', { ascending: false }); // Get newest reports first

  if (reportsError) {
    console.error('[getUserCreatedReports] Supabase error fetching reports:', reportsError);
    return [];
  }

  if (!dbReportsData || dbReportsData.length === 0) {
    console.log(`[getUserCreatedReports] No reports found for user: ${targetUserId}`);
    return [];
  }

  // Fetch the creator's profile once since all reports are by the same user
  const { data: creatorProfile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, email, username, avatar_url')
    .eq('user_id', targetUserId)
    .single();
  
  if (profileError) {
    console.warn(`[getUserCreatedReports] Could not fetch profile for user ${targetUserId}:`, profileError);
  }

  const reports: Report[] = [];

  for (const dbReport of dbReportsData) {
    // Process location to ensure it's a single object, not an array
    let processedLocation = null;
    if (dbReport.location && !Array.isArray(dbReport.location)) {
      processedLocation = dbReport.location;
    } else if (Array.isArray(dbReport.location) && dbReport.location.length > 0) {
      processedLocation = dbReport.location[0];
    }

    // Create combined DbReport structure for transformation
    const combinedDbReport: DbReportRow = {
      ...(dbReport as any), // Cast to satisfy TypeScript
      creator: creatorProfile as DbUserRow | null,
      comments: [], // Empty comments for list view to avoid large payloads
      location: processedLocation,
    };
    
    const transformed = transformDbReportToReport(combinedDbReport);
    if (transformed) {
      reports.push(transformed);
    }
  }
  
  console.log(`[getUserCreatedReports] Successfully fetched ${reports.length} reports for user: ${targetUserId}`);
  return reports;
}

// Update a report - only the creator can update their own reports
export async function updateReport(
    server: SupabaseClient,
    reportId: string,
    updateData: {
        title?: string;
        description?: string;
        category?: string;
        urgency?: "Low" | "Medium" | "High";
        status?: "Unresolved" | "Being Addressed" | "Resolved";
        images?: string[];
        // Location updates (optional)
        latitude?: number;
        longitude?: number;
        areaProvince?: string;
        areaCity?: string;
        areaBarangay?: string;
    }
): Promise<{ success: boolean; data?: Report; error?: string }> {
    const supabase: SupabaseClient = server;

    // Get the current user's ID
    const userId = await getUserID(server);
    if (!userId) {
        console.error('[updateReport] Authentication required: No user ID found');
        return { success: false, error: 'Authentication required' };
    }

    console.log(`[updateReport] Attempting to update report ${reportId} by user ${userId}`);

    try {
        // First, verify that the report exists and the user is the creator
        const { data: reportData, error: fetchError } = await supabase
            .from('reports')
            .select('id, created_by, title, location_id, images')
            .eq('id', reportId)
            .single();

        if (fetchError) {
            console.error('[updateReport] Error fetching report for verification:', fetchError);
            return { success: false, error: 'Failed to fetch report for verification' };
        }

        if (!reportData) {
            console.error('[updateReport] Report not found:', reportId);
            return { success: false, error: 'Report not found' };
        }

        // Check if the current user is the creator of the report
        if (reportData.created_by !== userId) {
            console.error('[updateReport] Unauthorized: User is not the creator of this report');
            return { success: false, error: 'Unauthorized: You can only update your own reports' };
        }

        console.log(`[updateReport] User ${userId} is authorized to update report "${reportData.title}"`);

        // Handle image cleanup if images are being updated
        if (updateData.images !== undefined) {
            const currentImages: string[] = reportData.images || [];
            const newImages: string[] = updateData.images || [];
            
            // Find images that are being removed
            const removedImages = currentImages.filter(img => !newImages.includes(img));
            
            if (removedImages.length > 0) {
                console.log(`[updateReport] Cleaning up ${removedImages.length} removed images`);
                
                // Delete removed images from storage
                for (const imageUrl of removedImages) {
                    try {
                        // Extract the file path from the image URL
                        // Expected format: https://...supabase.co/storage/v1/object/public/report-images/{path}
                        const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/report-images\/(.+)$/);
                        
                        if (pathMatch) {
                            const filePath = pathMatch[1];
                            console.log(`[updateReport] Deleting image file: ${filePath}`);
                            
                            const { error: deleteFileError } = await supabase.storage
                                .from('report-images')
                                .remove([filePath]);
                            
                            if (deleteFileError) {
                                console.warn(`[updateReport] Failed to delete image file ${filePath}:`, deleteFileError);
                                // Continue with update even if file deletion fails
                            } else {
                                console.log(`[updateReport] Successfully deleted image file: ${filePath}`);
                            }
                        } else {
                            console.warn(`[updateReport] Could not extract file path from image URL: ${imageUrl}`);
                        }
                    } catch (imageCleanupError) {
                        console.warn(`[updateReport] Error during image cleanup for ${imageUrl}:`, imageCleanupError);
                        // Continue with update even if image cleanup fails
                    }
                }
            }
        }
        let newLocationId = reportData.location_id;
        if (updateData.latitude && updateData.longitude && updateData.areaProvince && updateData.areaBarangay) {
            try {
                // Create new area record
                const createdAreaData = await createAreaRecord(supabase, {
                    areaProvince: updateData.areaProvince,
                    areaCity: updateData.areaCity,
                    areaBarangay: updateData.areaBarangay,
                });

                // Create new location record
                const createdLocationData = await createLocationRecord(supabase, {
                    latitude: updateData.latitude,
                    longitude: updateData.longitude,
                    area_id: createdAreaData.id,
                });

                newLocationId = Array.isArray(createdLocationData) 
                    ? createdLocationData[0]?.location_id 
                    : createdLocationData?.location_id;

                if (!newLocationId) {
                    console.error('[updateReport] Failed to create new location');
                    return { success: false, error: 'Failed to update location' };
                }
            } catch (locationError) {
                console.error('[updateReport] Error updating location:', locationError);
                return { success: false, error: 'Failed to update location' };
            }
        }

        // Prepare update object with only provided fields
        const reportUpdateData: any = {};
        if (updateData.title !== undefined) reportUpdateData.title = updateData.title;
        if (updateData.description !== undefined) reportUpdateData.description = updateData.description;
        if (updateData.category !== undefined) reportUpdateData.category = updateData.category;
        if (updateData.urgency !== undefined) reportUpdateData.urgency = updateData.urgency;
        if (updateData.status !== undefined) reportUpdateData.status = updateData.status;
        if (updateData.images !== undefined) reportUpdateData.images = updateData.images;
        if (newLocationId !== reportData.location_id) reportUpdateData.location_id = newLocationId;

        // Update the report
        const { data: updatedReport, error: updateError } = await supabase
            .from('reports')
            .update(reportUpdateData)
            .eq('id', reportId)
            .eq('created_by', userId) // Additional safety check
            .select('id, title, description, category, urgency, status, images, created_at, created_by, location_id')
            .single();

        if (updateError) {
            console.error('[updateReport] Error updating report:', updateError);
            return { success: false, error: 'Failed to update report' };
        }

        if (!updatedReport) {
            console.error('[updateReport] No data returned after update');
            return { success: false, error: 'Failed to update report' };
        }

        console.log(`[updateReport] Successfully updated report ${reportId}`);

        // Fetch the complete updated report to return
        const completeReport = await getReport(supabase, reportId);
        if (!completeReport) {
            console.warn('[updateReport] Could not fetch complete updated report');
            return { success: true }; // Update was successful, but couldn't fetch complete data
        }

        return { success: true, data: completeReport };

    } catch (error) {
        console.error('[updateReport] Unexpected error:', error);
        return { success: false, error: 'Internal server error' };
    }
}

// Saved Reports Functions
export async function saveReport(supabase: SupabaseClient, userId: string, reportId: string) {
    try {
        // Check if already saved
        const { data: existingSave } = await supabase
            .from('saved_reports')
            .select('id')
            .eq('user_id', userId)
            .eq('report_id', reportId)
            .maybeSingle();

        if (existingSave) {
            return { success: false, error: 'Report is already saved' };
        }

        const { data, error } = await supabase
            .from('saved_reports')
            .insert({
                user_id: userId,
                report_id: reportId
            })
            .select('id, created_at')
            .single();

        if (error) {
            console.error('[saveReport] Error saving report:', error);
            return { success: false, error: 'Failed to save report' };
        }

        return { success: true, data };
    } catch (error) {
        console.error('[saveReport] Unexpected error:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function unsaveReport(supabase: SupabaseClient, userId: string, reportId: string) {
    try {
        const { error } = await supabase
            .from('saved_reports')
            .delete()
            .eq('user_id', userId)
            .eq('report_id', reportId);

        if (error) {
            console.error('[unsaveReport] Error unsaving report:', error);
            return { success: false, error: 'Failed to unsave report' };
        }

        return { success: true };
    } catch (error) {
        console.error('[unsaveReport] Unexpected error:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function getSavedReports(supabase: SupabaseClient, userId: string, page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;

        const reportQuery = `
            id,
            created_at,
            report:report_id (
                id,
                created_at,
                created_by,
                title,
                description,
                status,
                images,
                category,
                urgency,
                location:location_id (
                    location_id,
                    latitude,
                    longitude,
                    area:area_id (
                        id,
                        province,
                        city,
                        barangay
                    )
                )
            )
        `;

        const { data: savedReports, error, count } = await supabase
            .from('saved_reports')
            .select(reportQuery, { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('[getSavedReports] Error fetching saved reports:', error);
            return { success: false, error: 'Failed to fetch saved reports' };
        }

        // Fetch creator information for all saved reports
        const creatorIds = [...new Set(savedReports?.map(sr => (sr.report as any)?.created_by).filter(Boolean))];
        let creatorsData: DbUserRow[] = [];
        
        if (creatorIds.length > 0) {
            const { data: creators, error: creatorsError } = await supabase
                .from('profiles')
                .select('user_id, email, username, avatar_url')
                .in('user_id', creatorIds);
                
            if (creatorsError) {
                console.error('[getSavedReports] Error fetching creators:', creatorsError);
            } else {
                creatorsData = creators || [];
            }
        }

        // Transform the data to match Report interface
        const transformedReports = savedReports?.map(savedReport => {
            const report = savedReport.report as any;
            if (!report) return null;

            // Find creator for this report
            const creator = creatorsData.find(c => c.user_id === report.created_by);
            const transformedCreator = transformDbUserToUser(creator);

            // Process location to match Location interface
            const location = report.location ? transformDbLocationToLocation({
                location_id: report.location.location_id,
                latitude: report.location.latitude,
                longitude: report.location.longitude,
                area: report.location.area ? {
                    id: report.location.area.id,
                    province: report.location.area.province,
                    city: report.location.area.city,
                    barangay: report.location.area.barangay
                } : null
            }) : undefined;

            const transformedReport: Report = {
                id: report.id,
                title: report.title,
                description: report.description,
                status: report.status,
                images: report.images || undefined,
                createdAt: new Date(report.created_at),
                category: report.category,
                urgency: report.urgency,
                creator: transformedCreator || {
                    username: "Unknown User",
                    profilePicture: undefined,
                },
                location: location,
                comments: undefined, // No comments in list view
            };

            return transformedReport;
        }).filter((report): report is Report => report !== null);

        return {
            success: true,
            data: {
                reports: transformedReports || [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit)
                }
            }
        };
    } catch (error) {
        console.error('[getSavedReports] Unexpected error:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function isReportSaved(supabase: SupabaseClient, userId: string, reportId: string) {
    try {
        const { data: savedReport, error } = await supabase
            .from('saved_reports')
            .select('id, created_at')
            .eq('user_id', userId)
            .eq('report_id', reportId)
            .maybeSingle();

        if (error) {
            console.error('[isReportSaved] Error checking saved status:', error);
            return { success: false, error: 'Failed to check saved status' };
        }

        return {
            success: true,
            data: {
                isSaved: !!savedReport,
                savedAt: savedReport?.created_at || null
            }
        };
    } catch (error) {
        console.error('[isReportSaved] Unexpected error:', error);
        return { success: false, error: 'Internal server error' };
    }
}
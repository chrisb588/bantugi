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
  
  // If we have a location_id, explicitly fetch the most up-to-date location data
  let freshLocationData = null;
  const locationData = Array.isArray(dbReportData.location) && dbReportData.location.length > 0
    ? dbReportData.location[0]
    : (!Array.isArray(dbReportData.location) && typeof dbReportData.location === 'object' && dbReportData.location !== null)
      ? dbReportData.location
      : null;
  
  if (locationData && locationData.location_id) {
    const { data: freshLocation, error: locationError } = await supabase
      .from('location')
      .select(`
        location_id,
        latitude,
        longitude,
        area:area_id (
          id,
          province,
          city,
          barangay
        )
      `)
      .eq('location_id', locationData.location_id)
      .single();
      
    if (locationError) {
      console.error('Error fetching fresh location data:', locationError);
    } else if (freshLocation) {
      freshLocationData = freshLocation;
    }
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
  
  // Use freshly fetched location data if available, otherwise fall back to data from the join
  if (freshLocationData) {
    let areaForDbLocationRow: DbAreaRow | null = null;
    if (freshLocationData.area) {
      const rawAreaObject = Array.isArray(freshLocationData.area) && freshLocationData.area.length > 0
        ? freshLocationData.area[0]
        : (!Array.isArray(freshLocationData.area) && typeof freshLocationData.area === 'object' && freshLocationData.area !== null)
          ? freshLocationData.area
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
      location_id: freshLocationData.location_id,
      latitude: freshLocationData.latitude,
      longitude: freshLocationData.longitude,
      area: areaForDbLocationRow,
    };
  } else if (dbReportData.location) {
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

  // Now update the location record with the report_id to complete the bidirectional relationship
  const { error: locationUpdateError } = await supabase
    .from('location')
    .update({ report_id: createdReportRow.id })
    .eq('location_id', report_location_id);

  if (locationUpdateError) {
    console.error('Error updating location with report_id:', locationUpdateError?.message);
    // Log the error but don't fail the report creation since the core data is already created
    console.warn('Report created successfully but location relationship may be incomplete');
  } else {
    console.log(`Successfully linked location ${report_location_id} to report ${createdReportRow.id}`);
  }

  // Update the area record with the report_id to complete the relationship
  const { error: areaUpdateError } = await supabase
    .from('area')
    .update({ report_id: createdReportRow.id })
    .eq('id', area_id);

  if (areaUpdateError) {
    console.error('Error updating area with report_id:', areaUpdateError?.message);
    console.warn('Report created successfully but area relationship may be incomplete');
  } else {
    console.log(`Successfully linked area ${area_id} to report ${createdReportRow.id}`);
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
            .select('id, created_by, title, images, location_id')
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

        // Delete the report - CASCADE DELETE will automatically handle the location relationship
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
        
        // Enhanced location and area update logic
        if (updateData.latitude && updateData.longitude) {
            try {
                console.log(`[updateReport] Processing location update for coordinates: ${updateData.latitude}, ${updateData.longitude}`);
                
                // Always ensure we have the most current location ID from the report
                let currentLocationId = reportData.location_id;
                
                // If report doesn't have a location_id, try to find one by querying the location table
                if (!currentLocationId) {
                    console.log('[updateReport] Report has no location_id, searching for existing location by report_id');
                    const { data: existingLocationByReport, error: locationSearchError } = await supabase
                        .from('location')
                        .select('location_id, area_id')
                        .eq('report_id', reportId)
                        .maybeSingle();
                        
                    if (locationSearchError) {
                        console.warn('[updateReport] Error searching for existing location:', locationSearchError);
                    } else if (existingLocationByReport) {
                        currentLocationId = existingLocationByReport.location_id;
                        console.log(`[updateReport] Found existing location by report_id: ${currentLocationId}`);
                    }
                }

                if (currentLocationId) {
                    console.log(`[updateReport] Updating existing location ${currentLocationId} with new coordinates and spatial index`);
                    
                    // Get complete existing location data including area_id and current coordinates
                    const { data: existingLocation, error: locationFetchError } = await supabase
                        .from('location')
                        .select(`
                            location_id,
                            latitude,
                            longitude,
                            area_id,
                            spatial_index,
                            report_id
                        `)
                        .eq('location_id', currentLocationId)
                        .single();

                    if (locationFetchError) {
                        console.error('[updateReport] Error fetching existing location details:', locationFetchError);
                        return { success: false, error: 'Failed to fetch existing location details' };
                    }

                    if (!existingLocation) {
                        console.error('[updateReport] Location not found despite having location_id');
                        return { success: false, error: 'Location record not found' };
                    }

                    console.log(`[updateReport] Current location data:`, existingLocation);

                    // Update the area record if we have both area_id and area data
                    if (existingLocation.area_id && (updateData.areaProvince || updateData.areaBarangay || updateData.areaCity !== undefined)) {
                        console.log(`[updateReport] Updating area record ${existingLocation.area_id} with new area data`);
                        
                        // Prepare area update object with comprehensive data handling
                        const areaUpdateData: any = {};
                        
                        // Only update fields that are provided
                        if (updateData.areaProvince !== undefined) {
                            areaUpdateData.province = updateData.areaProvince;
                        }
                        if (updateData.areaBarangay !== undefined) {
                            areaUpdateData.barangay = updateData.areaBarangay;
                        }
                        if (updateData.areaCity !== undefined) {
                            areaUpdateData.city = updateData.areaCity && updateData.areaCity.trim() !== '' 
                                ? updateData.areaCity 
                                : null;
                        }
                        
                        // Only proceed if we have at least one field to update
                        if (Object.keys(areaUpdateData).length > 0) {
                            console.log(`[updateReport] Area update data:`, areaUpdateData);
                            
                            const { error: areaUpdateError } = await supabase
                                .from('area')
                                .update(areaUpdateData)
                                .eq('id', existingLocation.area_id);

                            if (areaUpdateError) {
                                console.error('[updateReport] Error updating existing area:', areaUpdateError);
                                return { success: false, error: 'Failed to update area information' };
                            }

                            // Verify area update with detailed logging
                            const { data: updatedArea, error: areaVerifyError } = await supabase
                                .from('area')
                                .select('*')
                                .eq('id', existingLocation.area_id)
                                .single();
                                
                            if (areaVerifyError) {
                                console.warn('[updateReport] Could not verify area update:', areaVerifyError);
                            } else {
                                console.log(`[updateReport] Successfully updated and verified area ${existingLocation.area_id}:`, updatedArea);
                            }
                        } else {
                            console.log('[updateReport] No area fields to update, skipping area update');
                        }
                    } else if (!existingLocation.area_id && updateData.areaProvince && updateData.areaBarangay) {
                        console.log('[updateReport] Location exists but no area_id found. Creating new area record.');
                        
                        // Create new area record only if we have the required area data
                        const { data: newArea, error: areaCreateError } = await supabase
                            .from('area')
                            .insert({
                                province: updateData.areaProvince,
                                city: updateData.areaCity && updateData.areaCity.trim() !== '' ? updateData.areaCity : null,
                                barangay: updateData.areaBarangay,
                                report_id: reportId
                            })
                            .select('id')
                            .single();
                            
                        if (areaCreateError || !newArea) {
                            console.error('[updateReport] Error creating new area:', areaCreateError);
                            return { success: false, error: 'Failed to create area information' };
                        }
                        
                        console.log(`[updateReport] Created new area record ${newArea.id}`);
                        
                        // Update the existing location's area_id reference
                        existingLocation.area_id = newArea.id;
                    } else {
                        console.log('[updateReport] Skipping area update - no area_id or insufficient area data provided');
                    }

                    // Update location with new coordinates and spatial index using RPC function
                    console.log(`[updateReport] Calling RPC to update location ${currentLocationId} with spatial index generation`);
                    
                    const { data: updatedLocationData, error: locationUpdateError } = await supabase
                        .rpc('update_location_with_spatial_index', {
                            location_id_param: currentLocationId,
                            lat: updateData.latitude,
                            lon: updateData.longitude,
                            area_id_param: existingLocation.area_id
                        });

                    if (locationUpdateError) {
                        console.error('[updateReport] Error updating location with spatial index:', locationUpdateError);
                        return { success: false, error: 'Failed to update location coordinates and spatial index' };
                    }

                    if (!updatedLocationData || updatedLocationData.length === 0) {
                        console.error('[updateReport] No data returned from location update RPC');
                        return { success: false, error: 'Location update did not return expected data' };
                    }

                    console.log(`[updateReport] RPC returned updated location data:`, updatedLocationData);

                    // Verify the location update by fetching the complete updated record
                    const { data: verifyLocation, error: verifyError } = await supabase
                        .from('location')
                        .select(`
                            location_id,
                            latitude,
                            longitude,
                            spatial_index,
                            area_id,
                            report_id
                        `)
                        .eq('location_id', currentLocationId)
                        .single();
                        
                    if (verifyError) {
                        console.warn('[updateReport] Could not verify location update:', verifyError);
                    } else {
                        console.log(`[updateReport] Successfully verified updated location ${currentLocationId}:`, verifyLocation);
                        console.log(`[updateReport] Spatial index generated: ${verifyLocation.spatial_index ? 'YES' : 'NO'}`);
                    }

                    newLocationId = currentLocationId;

                } else {
                    // No existing location found - create new location record
                    console.log('[updateReport] No existing location found, creating new location record');
                    
                    let newAreaId = null;
                    
                    // Create new area record only if we have the required area data
                    if (updateData.areaProvince && updateData.areaBarangay) {
                        console.log('[updateReport] Creating new area record with provided area data');
                        
                        const { data: newArea, error: areaCreateError } = await supabase
                            .from('area')
                            .insert({
                                province: updateData.areaProvince,
                                city: updateData.areaCity && updateData.areaCity.trim() !== '' ? updateData.areaCity : null,
                                barangay: updateData.areaBarangay,
                                report_id: reportId
                            })
                            .select('id')
                            .single();
                            
                        if (areaCreateError || !newArea) {
                            console.error('[updateReport] Error creating new area:', areaCreateError);
                            return { success: false, error: 'Failed to create area information' };
                        }
                        
                        newAreaId = newArea.id;
                        console.log(`[updateReport] Created new area record ${newAreaId}`);
                    } else {
                        console.log('[updateReport] No area data provided, creating location without area reference');
                    }
                    
                    // Create new location record with coordinates and optional area reference
                    if (newAreaId) {
                        // Use RPC function if we have area data
                        const { data: newLocationData, error: locationCreateError } = await supabase
                            .rpc('insert_location_with_point', {
                                lat: updateData.latitude,
                                lon: updateData.longitude,
                                area_id: newAreaId,
                            });
                            
                        if (locationCreateError || !newLocationData) {
                            console.error('[updateReport] Error creating new location with area:', locationCreateError);
                            return { success: false, error: 'Failed to create location with spatial index' };
                        }
                        
                        const createdLocationId = Array.isArray(newLocationData) 
                            ? newLocationData[0]?.location_id 
                            : newLocationData?.location_id;
                            
                        if (!createdLocationId) {
                            console.error('[updateReport] Could not extract location_id from creation response:', newLocationData);
                            return { success: false, error: 'Failed to get location_id from created location' };
                        }
                        
                        console.log(`[updateReport] Created new location record ${createdLocationId} with area reference`);
                        newLocationId = createdLocationId;
                    } else {
                        // Create location without area reference using direct insert
                        const { data: newLocationData, error: locationCreateError } = await supabase
                            .from('location')
                            .insert({
                                latitude: updateData.latitude,
                                longitude: updateData.longitude,
                                spatial_index: `ST_SetSRID(ST_MakePoint(${updateData.longitude}, ${updateData.latitude}), 4326)`,
                                report_id: reportId,
                                area_id: null
                            })
                            .select('location_id')
                            .single();
                            
                        if (locationCreateError || !newLocationData) {
                            console.error('[updateReport] Error creating new location without area:', locationCreateError);
                            return { success: false, error: 'Failed to create location record' };
                        }
                        
                        console.log(`[updateReport] Created new location record ${newLocationData.location_id} without area reference`);
                        newLocationId = newLocationData.location_id;
                    }
                    
                    // Update the location with the report_id to complete the relationship (if needed)
                    if (newLocationId) {
                        const { error: locationLinkError } = await supabase
                            .from('location')
                            .update({ report_id: reportId })
                            .eq('location_id', newLocationId);
                            
                        if (locationLinkError) {
                            console.warn('[updateReport] Could not link location to report:', locationLinkError);
                        } else {
                            console.log(`[updateReport] Successfully linked location ${newLocationId} to report ${reportId}`);
                        }
                    }
                }
                
                console.log(`[updateReport] Location update completed successfully. Final location_id: ${newLocationId}`);
                
            } catch (locationError) {
                console.error('[updateReport] Unexpected error during location update:', locationError);
                return { success: false, error: 'Unexpected error during location update' };
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
        
        // Handle location_id update with enhanced logic
        if (updateData.latitude && updateData.longitude && updateData.areaProvince && updateData.areaBarangay) {
            // Always update location_id in the report to ensure consistency
            if (newLocationId !== null && newLocationId !== undefined) {
                reportUpdateData.location_id = newLocationId;
                console.log(`[updateReport] Setting report.location_id to ${newLocationId}`);
            } else {
                console.warn('[updateReport] No valid location_id available for report update');
            }
        } else if (newLocationId !== reportData.location_id) {
            // If location_id changed but no location data provided, update it anyway
            reportUpdateData.location_id = newLocationId;
            console.log(`[updateReport] Updating report.location_id to ${newLocationId} (changed from ${reportData.location_id})`);
        }

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

        // Clear any query cache and ensure we get fresh data
        console.log('[updateReport] Clearing cache and fetching updated report with fresh location data');
        
        // Multiple cache-busting queries to ensure fresh data
        await Promise.all([
            supabase.from('reports').select('id').eq('id', reportId).single(),
            newLocationId ? supabase.from('location').select('location_id').eq('location_id', newLocationId).single() : Promise.resolve(),
            supabase.from('area').select('id').limit(1).single()
        ]);
        
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
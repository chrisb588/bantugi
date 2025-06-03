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
    .select('user_id, email, avatar_url')
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
        .select('user_id, email, avatar_url') // Select only existing fields
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

// needs the current user data to delete a report
// to be updated
export async function deleteReport(
    server: SupabaseClient,
    id: string
) {

    const { data, error} = await server
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
    username: dbUser.email, // Use email as username since schema doesn't have username field
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
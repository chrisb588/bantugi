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

  const expectedColumns = `
    id,
    created_at, 
    title,
    description,
    status,
    images,
    category,
    urgency,
    location_id,
    created_by
  `;

  const { data: dbReportData, error } = await supabase
    .from('reports')
    .select(expectedColumns)
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

  return dbReportData;
}

export async function createReport(server: SupabaseClient, data: {
  title: string;
  category: string;
  description: string;
  images: string[];
  urgency: "Low" | "Medium" | "High";
  status: "Unresolved" | "In Progress" | "Resolved"; 

  latitude: number;
  longitude: number;
  locationAddressText: string;

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
  const area_id = createdAreaData.area_id;

  const createdLocationData = await createLocationRecord(supabase, {
    latitude: data.latitude,
    longitude: data.longitude,
    area_id: area_id, 
  });

  const location_id = createdLocationData.location_id;

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
      location_id: location_id, // from createLocationRecord
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
    // areaMunicipality?: string; // Removed
    areaBarangay: string;
  }
) {
  const { data: createdAreaData, error: areaError } = await supabase
    .from('area')
    .insert({
      area_province: areaData.areaProvince,
      area_city: areaData.areaCity,
      // area_municipality: areaData.areaMunicipality, // Removed
      area_barangay: areaData.areaBarangay,
    })
    .select('area_id, area_province, area_city, area_barangay') // Removed area_municipality
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
    p_area_id: locationData.area_id,
  };

  const { data: createdLocationData, error: locationError } = await supabase
    .rpc('insert_location_with_point', rpcParams);
  if (locationError) {
    console.error('Error creating location in helper:', locationError.message);
    throw locationError; // Or return an error object
  }
  return createdLocationData; // This might be null or a status if RPC doesn't return the row
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
    .from("comments")
    .select(`
      id,
      text,
      datePosted,
      user:user_id (username, location, profile_pic_url)
    `)
    .eq("report_id", reportId);

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  // Transform the data to match the Comment interface
  const comments: Comment[] = convertToComments();

  return comments;

  function convertToComments(): Comment[] {
    return (data || []).map((item) => {
      const userObject = item.user && item.user.length > 0 ? item.user[0] : null

      return {
        id: item.id,
        creator: {
          username: userObject ? userObject.username : "Anon User",
          password: "", // Password is not returned from the database for security reasons
          profilePicture: userObject ? userObject.profile_pic_url : null,
          location: userObject ? userObject.location : null,
        },
        content: item.text,
        createdAt: new Date(item.datePosted),
      }
    })
  }
}

// Helper functions to transform Supabase DB rows to application interfaces

// Import interfaces (ensure these are correctly pathed if not at top level of this file)

// Define placeholder types for DB row structures based on DDL.
interface DbAreaRow {
  id: number; // Matches area.id PK
  area_province: string;
  area_city?: string | null;
  // area_municipality?: string | null; // Removed
  area_barangay: string;
}

interface DbLocationRow {
  location_id: number;
  latitude: number | null;
  longitude: number | null;
  area?: DbAreaRow | null; 
}

interface DbUserRow {
  id: string; 
  username?: string | null;
  profile_pic_url?: string | null;
}

interface DbReportRow {
  id: string; 
  title: string;
  description: string;
  status: "Unresolved" | "Being Addressed" | "Resolved";
  images?: string[] | null;
  created_at: string; 
  category: string;
  urgency: "Low" | "Medium" | "High";
  location_id?: number | null;
  location?: DbLocationRow | null;
  created_by: string; 
  creator?: DbUserRow | null;
}

export function transformDbAreaToArea(dbArea: DbAreaRow | null | undefined): Area | undefined {
  if (!dbArea) {
    return undefined;
  }
  return {
    id: dbArea.id, // Use id from DbAreaRow
    province: dbArea.area_province,
    city: dbArea.area_city ?? undefined,
    barangay: dbArea.area_barangay,
  };
}

export function transformDbLocationToLocation(dbLocation: DbLocationRow | null | undefined): Location | undefined {
  if (!dbLocation || dbLocation.latitude === null || dbLocation.longitude === null) {
    return undefined;
  }

  const area = dbLocation.area ? transformDbAreaToArea(dbLocation.area) : undefined;
  
  if (!area) {
    console.warn("Could not transform area for location_id:", dbLocation.location_id);
    return undefined;
  }

  return {
    coordinates: {
      lat: dbLocation.latitude,
      lng: dbLocation.longitude,
    },
    address: area,
  };
}

export function transformDbUserToUser(dbUser: DbUserRow | null | undefined): User | undefined {
  if (!dbUser || !dbUser.username) {
    return undefined; 
  }
  return {
    username: dbUser.username,
    profilePicture: dbUser.profile_pic_url ?? undefined,
  };
}

export function transformDbReportToReport(dbReport: DbReportRow | null | undefined): Report | undefined {
  if (!dbReport) {
    return undefined;
  }

  const location = dbReport.location ? transformDbLocationToLocation(dbReport.location) : undefined;
  const creator = dbReport.creator ? transformDbUserToUser(dbReport.creator) : undefined;

  if (!creator) {
    console.warn(`Report ${dbReport.id} is missing valid creator information or creator could not be transformed.`);
    return undefined;
  }

  return {
    id: dbReport.id,
    title: dbReport.title,
    description: dbReport.description,
    category: dbReport.category,
    urgency: dbReport.urgency,
    status: dbReport.status,
    images: dbReport.images ?? undefined,
    createdAt: new Date(dbReport.created_at),
    location: location,
    creator: creator,
  };
}
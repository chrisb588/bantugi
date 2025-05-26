// Where to function for CRUD function
import { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from './server'
import Report from '@/interfaces/report'
import Comment from '@/interfaces/comment'
import Location from '@/interfaces/location'
import Area from '@/interfaces/area'
import { getUserID } from './user.server'

// Pinky promise you return report or else its null
export async function getReport(reportId: string): Promise<Report | null> {
  const supabase: SupabaseClient = createServerClient();

  const expectedColumns = ` 
    report_no, 
    datePosted, 
    category, 
    description, 
    title, 
    status, 
    images, 
    user_id, 
    urgency,
    location:location_id (
      latitude,
      longitude,
      area:area_id (
        area_id, 
        area_province,
        area_city,
        area_municipality,
        area_barangay
      )
    )
  `;

  const { data: dbReportData, error } = await supabase
    .from('reports')
    .select(expectedColumns)
    .eq('id', reportId)
    .single();

  if (error) {
    console.error('Get report error:', error.message);
    return null;
  }
  
  if (!dbReportData) {
    console.warn(`No data was returned for reportId: ${reportId}`);
    return null;
  }

  // console.log('Raw data from Supabase:', JSON.stringify(dbReportData, null, 2)); // For debugging
  //return transformSupabaseReportToAppReport(dbReportData);
  return dbReportData
}

// User needs to be authenticated when inserting 
// data to reports table
// CHECK: Auth policies for reports table  
export async function createReport(data: {
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
  areaMunicipality?: string;
  areaBarangay: string;
}) {
  const supabase: SupabaseClient = createServerClient();

  const user_id = getUserID();
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
    areaMunicipality: data.areaMunicipality,
    areaBarangay: data.areaBarangay,
  });
  const area_id = createdAreaData.area_id;

  const createdLocationData = await createLocationRecord(supabase, {
    latitude: data.latitude,
    longitude: data.longitude,
    area_id: area_id, 
  });

  if (error || !createdLocationData) {
  console.error('Error creating location:', error?.message);
  return null;
  }
  const location_id = createdLocationData.location_id;


  const { data: createdReportRow, error: reportError } = await supabase
  .from('reports')
  .insert({
      title: data.title,
      location: data.locationAddressText,
      description: data.description,
      images: data.images,
      status: data.status,
      user_id: user_id,
  })
  .select('id, user_id')
  .single();

  if (reportError || !createdReportRow) {
      console.error('Error creating report:', reportError?.message);
      return null;
  }

  return createdLocationData;
}

async function createAreaRecord(
  supabase: SupabaseClient,
  areaData: {
    areaProvince: string;
    areaCity?: string;
    areaMunicipality?: string;
    areaBarangay: string;
  }
) {
  const { data: createdAreaData, error: areaError } = await supabase
    .from('area')
    .insert({
      area_province: areaData.areaProvince,
      area_city: areaData.areaCity,
      area_municipality: areaData.areaMunicipality,
      area_barangay: areaData.areaBarangay,
    })
    .select('area_id, area_province, area_city, area_municipality, area_barangay')
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

// to be redone once backend is finalized and interface doesnt change
// function transformSupabaseReportToAppReport(dbReportData: any): Report | null {
//   if (!dbReportData) {
//     return null;
//   }

//   try {
//     // Safely access nested location and area data
//     const firstLocationData = dbReportData.location && Array.isArray(dbReportData.location) && dbReportData.location.length > 0
//       ? dbReportData.location[0]
//       : null;

//     // Assuming firstLocationData.area is also an array
//     const firstAreaData = firstLocationData?.area && Array.isArray(firstLocationData.area) && firstLocationData.area.length > 0
//       ? firstLocationData.area[0]
//       : null;

//     const area = transformToArea(firstAreaData);
//     const location = transformToLocation(firstLocationData, area);
//     const transformedReport = transformToReport(dbReportData, location)

//     return transformedReport;

//   } catch (transformationError: any) {
//     console.error('Error transforming Supabase report data:', transformationError.message, 'Raw data:', dbReportData);
//     return null;
//   }
// }

// function transformToArea(areaData: any): Area {
//   return {
//     id: areaData.area_id,
//     province: areaData.area_province,
//     city: areaData.area_city,
//     municipality: areaData.area_municipality,
//     barangay: areaData.area_barangay,
//   };
// }

// function transformToLocation(locationData: any, area: Area): Location {
//   return {
//     address: area,
//     coordinates: {
//       lat: locationData.latitude,
//       lng: locationData.longitude,
//     },
//   };
// }

// function transformToReport(reportData: any, location: Location): Report {
//   return {
//     id: reportData.report_no,
//     title: reportData.title,
//     description: reportData.description,
//     category: reportData.category,
//     urgency: reportData.urgency as "Low" | "Medium" | "High",
//     status: reportData.status as "Unresolved" | "Being Addressed" | "Resolved",
//     images: reportData.images,
//     location: location,
//     createdAt: new Date(reportData.datePosted),
//   };
// }
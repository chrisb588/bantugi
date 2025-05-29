import type { SupabaseClient } from '@supabase/supabase-js';
import Pin from '@/interfaces/pin';


// Server-side function
export async function fetchLocationsServer(
  supabase: SupabaseClient, // Accepts the Supabase client
  swLat: number,
  swLng: number,
  neLat: number,
  neLng: number
): Promise<Pin[]> { // Explicitly define return type
  console.log(`[Server fetchLocations] === ENTERING fetchLocationsServer FUNCTION ===`);
  console.log(`[Server fetchLocations] Received bounds: SW_Lat=${swLat}, SW_Lng=${swLng}, NE_Lat=${neLat}, NE_Lng=${neLng}`);

  try {
    const { data, error, status, statusText } = await supabase // Destructure status and statusText for more info
      .rpc('get_reports_within_bounds', {
        p_sw_lat: swLat,
        p_sw_lng: swLng,
        p_ne_lat: neLat,
        p_ne_lng: neLng,
      });

    // Log more details from the RPC response
    console.log("[Server fetchLocations] RPC Response Status:", status, statusText);
    console.log("[Server fetchLocations] RPC Data:", JSON.stringify(data, null, 2));
    console.log("[Server fetchLocations] RPC Error:", JSON.stringify(error, null, 2));

    if (error) {
      // Even if there's an error object, it might not be a "throwable" error for Supabase client
      // It could be a functional error from the RPC (e.g., no rows found, which isn't a system error)
      // However, if it indicates a real problem, log it and throw a specific error.
      console.error(`[Server fetchLocations] RPC Error (status ${status}): ${error.message}`, error);
      // Consider what kind of errors from RPC should be actual thrown errors vs. returning empty data
      // For instance, if the RPC itself has a bug, it might be a 500. If it's "no data found", that's often a 200 with empty array.
      throw new Error(`RPC error: ${error.message} (Code: ${error.code}, Hint: ${error.hint})`);
    }

    if (!data) {
      console.warn("[Server fetchLocations] RPC returned no data (data is null or undefined). Returning empty array.");
      return [];
    }
    
    if (Array.isArray(data) && data.length === 0) {
      console.log("[Server fetchLocations] RPC returned an empty array (no reports in bounds).");
      // This is a valid successful response, just no data.
    }

    // Ensure data is an array before mapping
    if (!Array.isArray(data)) {
      console.error("[Server fetchLocations] RPC returned data that is not an array:", data);
      throw new Error("Invalid data format from RPC: expected an array.");
    }

    const pins: Pin[] = data.map((dbRow: any) => {
      // Validate fields based on the new SQL function output
      if (typeof dbRow.loc_latitude !== 'number' || 
          typeof dbRow.loc_longitude !== 'number' || 
          !dbRow.id || 
          !dbRow.urgency) {
        console.warn("[Server fetchLocations] Invalid or missing fields (id, urgency, loc_latitude, loc_longitude) in dbRow, skipping pin:", dbRow);
        return null; // Return null for invalid rows
      }
      return {
        report_id: dbRow.id, // Changed from dbRow.report_id
        urgency: dbRow.urgency, // Remains the same
        lat: dbRow.loc_latitude,    // Changed from dbRow.lat
        lng: dbRow.loc_longitude,   // Changed from dbRow.lng
      };
    }).filter(pin => pin !== null) as Pin[]; // Filter out nulls and assert type
    
    console.log("[Server fetchLocations] Mapped pins count:", pins.length);
    return pins;

  } catch (error: any) {
    // This will catch errors from the await supabase.rpc call if it throws,
    // or errors thrown manually above.
    console.error("[Server fetchLocations] Exception caught in fetchLocationsServer:", error.message, error);
    // Re-throw the error to be caught by the API route's try/catch block
    // This ensures the API route can return a proper 500 response.
    throw error; 
  }
}
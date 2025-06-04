import type { SupabaseClient } from '@supabase/supabase-js';
import Pin from '@/interfaces/pin';


// Server-side function
export async function fetchLocationsServer(
  supabase: SupabaseClient, // Accepts the Supabase client
  swLat: number,
  swLng: number,
  neLat: number,
  neLng: number
) { // Or Promise<DbReportRow[]> if you return minimal data
  console.log(`[Server fetchLocations] Fetching for bounds: SW(${swLat},${swLng}), NE(${neLat},${neLng})`);

  try {
    const { data, error } = await supabase
      .rpc('get_reports_within_bounds', { // Ensure this is your RPC name
        p_sw_lat: swLat,
        p_sw_lng: swLng,
        p_ne_lat: neLat,
        p_ne_lng: neLng,
      });

    if (error) {
      console.error("[Server fetchLocations] RPC Error:", error);
      throw new Error(`Failed to fetch server locations: ${error.message}`);
    }

    // Map the minimal data to your Report[] type IF your RPC returns minimal data
    // If your RPC returns full data matching Report[], just return 'data || []'
    const pins: Pin[] = (data as Pin[] || []).map(dbRow => ({
      report_id: dbRow.report_id,
      urgency: dbRow.urgency,
      lat: dbRow.lat,
      lng: dbRow.lng,
    }));
    
    return pins;

  } catch (error: any) {
    console.error("[Server fetchLocations] Caught an error:", error.message, error);
    throw error; // Re-throw to be caught by the API route
  }
}
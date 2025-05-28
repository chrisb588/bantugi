import Location from "@/interfaces/location"; 
import { createServerClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
// Get all reports X distance away from the center of the map view
export async function getAllReportsByDistance(
    server: SupabaseClient,
  centerLocation: Location,
  maxDistanceMeters: number = 5000 // Default 5km
) {
  const { data, error } = await server.rpc(
    'get_locations_within_distance',
    {
      center_lat: centerLocation.coordinates.lat,
      center_lng: centerLocation.coordinates.lng,
      max_distance_meters: maxDistanceMeters
    }
  );

  if (error) {
    console.error('Error fetching locations by distance:', error.message);
    return [];
  }

  return data || [];
}
import Location from "@/interfaces/location"; 
import { createServerClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { Report } from "@/interfaces/report";
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

export async function fetchLocations(
  swLat: number,
  swLng: number,
  neLat: number,
  neLng: number
): Promise<Report[]> { // Ensure return type is Promise<Report[]>
  console.log(`Attempting to fetch reports for bounds: SW(${swLat},${swLng}), NE(${neLat},${neLng})`);
  try {
    const response = await fetch(`/api/location?sw_lat=${swLat}&sw_lng=${swLng}&ne_lat=${neLat}&ne_lng=${neLng}`);
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      console.error(`Error fetching reports by bounds: ${response.status} ${response.statusText}`, errorData);
      throw new Error(`Failed to fetch reports by bounds: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data as Report[]; // Cast to Report[]
  } catch (error) {
    console.error("fetchLocations (by bounds) caught an error:", error);
    return [];
  }
}
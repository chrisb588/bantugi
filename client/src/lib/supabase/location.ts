import Location from "@/interfaces/location"; 
// Get all reports X distance away from the center of the map view
export async function getAllReportsByDistance(centerlocation: Location) {
    // Call some rpc function from supabase to get the closest spatial indexes to that
    // location
}
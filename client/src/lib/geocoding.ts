import type Area from '@/interfaces/area';
import type { LatLng } from 'leaflet';

export async function convertLatLngToArea(latLng: LatLng): Promise<Area | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latLng.lat}&lon=${latLng.lng}&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();
    const address = data.address;

    // Create Area object from the response
    const area: Area = {
      id: generateAreaId(latLng), // Generate a unique ID based on coordinates
      province: address.province || address.state || '',
      city: address.city || address.town || address.municipality || undefined,
      barangay: address.suburb || address.neighbourhood || address.village || ''
    };

    return area;
  } catch (error) {
    console.error('Error converting coordinates to area:', error);
    return null;
  }
}

// Helper function to generate a unique ID based on coordinates
function generateAreaId(latLng: LatLng): number {
  // Convert lat/lng to a string and hash it to create a unique number
  const coordString = `${latLng.lat}${latLng.lng}`;
  let hash = 0;
  for (let i = 0; i < coordString.length; i++) {
    const char = coordString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
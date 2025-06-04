'use client';

import { useState, useEffect, useCallback, useMemo } from "react"; // Added useMemo
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryDropdownMenu } from "@/components/report/report-form/category-dropdown";
import { UrgencyDropdownMenu } from "@/components/report/report-form/urgency-dropdown";
import ImageUploader from "@/components/report/report-form/image-uploader";
import { Separator } from "@/components/ui/separator";
import Report from "@/interfaces/report";
import Pin from "@/interfaces/pin"; // Import Pin interface
import { Locate } from "lucide-react";
import { useMapContext } from "@/context/map-context";
// Removed useMapMarker as its direct marker manipulation functions for this pin are replaced by useDrawPins
import { useDrawPins } from "@/hooks/useDrawPins"; // Import useDrawPins
import { convertLatLngToArea } from "@/lib/geocoding";
import type { LatLng, LeafletMouseEvent } from 'leaflet';
import type Location from "@/interfaces/location";

interface ReportFormProps {
  className?: string;
  report?: Report;
}

const SELECTION_PIN_ID = "report-form-selection-pin";

export function ReportForm({
  className,
  report,
  ...props
}: ReportFormProps) {
  const [choosingLocation, setChoosingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [formData, setFormData] = useState<Partial<Report>>({
    title: report?.title || '',
    description: report?.description || '',
    category: report?.category || '',
    urgency: report?.urgency || 'Low',
    status: report?.status || 'Unresolved',
    images: report?.images || [],
    location: report?.location || undefined,
  });

  const { mapInstanceRef, isMapReady, L } = useMapContext();
  const router = useRouter();

  // Effect to initialize selectedLocation based on report prop or map center for new reports
  useEffect(() => {
    if (!L || !isMapReady || !mapInstanceRef.current) {
      return;
    }

    if (report?.location?.coordinates) {
      if (!selectedLocation) { // Only initialize if not already set
        const initialLatLng = new L.LatLng(report.location.coordinates.lat, report.location.coordinates.lng);
        setSelectedLocation(initialLatLng);
        // Center map on existing report location
        mapInstanceRef.current.setView(initialLatLng, mapInstanceRef.current.getZoom() || 15);
      }
    } else if (!report && !selectedLocation && !choosingLocation) {
      // For new reports, if not already choosing a location, set selectedLocation to map center.
      // The pin will only appear if choosingLocation becomes true.
      // const mapCenter = mapInstanceRef.current.getCenter();
      // setSelectedLocation(mapCenter); // Optionally pre-fill, or wait for user interaction
    }
  }, [L, isMapReady, report, selectedLocation, choosingLocation, mapInstanceRef]);


  // Create the pin array for useDrawPins
  const pinForSelection: Pin[] = useMemo(() => {
    if (choosingLocation && selectedLocation && L) {
      return [{
        report_id: SELECTION_PIN_ID, // Temporary ID for this selection pin
        urgency: formData.urgency || 'Low', // Use form's urgency or default
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      }];
    }
    return []; // Empty array if not choosing or no location selected
  }, [choosingLocation, selectedLocation, L, formData.urgency]);

  // Use useDrawPins to show the temporary selection pin
  useDrawPins(pinForSelection);


  // Cleanup map click listener on unmount or when choosingLocation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Define mapClickHandler here or ensure it's stable if defined outside
    const currentMapClickHandler = (e: LeafletMouseEvent) => {
        if (choosingLocation) { // Only act if we are in choosing mode
            console.log("Map clicked at:", e.latlng);
            setSelectedLocation(e.latlng);
        }
    };

    if (choosingLocation) {
      map.on('click', currentMapClickHandler);
    } else {
      map.off('click', currentMapClickHandler);
    }

    return () => {
      map.off('click', currentMapClickHandler);
    };
  }, [choosingLocation, mapInstanceRef, L]); // L dependency to ensure mapClickHandler can use L if needed


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleUrgencyChange = (urgency: "Low" | "Medium" | "High") => {
    setFormData(prev => ({ ...prev, urgency }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSetLocation = () => {
    setChoosingLocation(true);
    console.log("handleSetLocation: Choosing location. Map instance:", !!mapInstanceRef.current, "L loaded:", !!L);

    if (isMapReady && mapInstanceRef.current && L) {
      if (selectedLocation) {
        // If a location is already selected (e.g., from form data or previous interaction),
        // ensure the map is centered there. The pin will be drawn by useDrawPins.
        mapInstanceRef.current.setView(selectedLocation, mapInstanceRef.current.getZoom() || 15);
      } else {
        // If no location selected yet, try to center on user's current location or map center
        navigator.geolocation.getCurrentPosition(
          pos => {
            mapInstanceRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 15);
          },
          () => { // Fallback to current map center if geolocation fails or is denied
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setView(mapInstanceRef.current.getCenter(), mapInstanceRef.current.getZoom() || 13);
            }
          }
        );
      }
      // Map click listener is now managed by the useEffect hook based on choosingLocation
    } else {
      console.error("Map instance or Leaflet (L) not available in handleSetLocation.");
    }
  };

  const handleCancelSetLocation = () => {
    setChoosingLocation(false); // This will make pinForSelection empty, removing the pin via useDrawPins
    // Map click listener is removed by the useEffect hook

    // Restore previous selectedLocation if editing, or clear if new
    if (L && report?.location?.coordinates) {
      setSelectedLocation(
        new L.LatLng(report.location.coordinates.lat, report.location.coordinates.lng)
      );
    } else if (!report?.location?.coordinates) {
      setSelectedLocation(null);
    }
  };

  const handleConfirmLocation = async () => {
    // Map click listener is removed by the useEffect hook when choosingLocation becomes false
    if (selectedLocation) {
      try {
        const addressDetails = await convertLatLngToArea(selectedLocation);

        if (addressDetails === null) {
          console.error('Could not determine address for the selected location.');
          // TODO: Provide user feedback
          return;
        }

        setFormData(prev => ({
          ...prev,
          location: {
            coordinates: { lat: selectedLocation.lat, lng: selectedLocation.lng },
            address: addressDetails,
          }
        }));
        setChoosingLocation(false); // This will also remove the pin via useDrawPins
        console.log("Location confirmed:", selectedLocation, "Address:", addressDetails);
      } catch (error) {
        console.error('Failed to process location:', error);
        // TODO: Provide user feedback
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location?.address || !formData.location?.coordinates) {
      console.error("Validation failed: Title and a confirmed location (with coordinates and address) are required.");
      // TODO: Show a more user-friendly error message
      return;
    }

    const finalLocation: Location = {
      coordinates: formData.location.coordinates,
      address: formData.location.address,
    };

    const finalReportData: Partial<Report> = {
      ...formData,
      title: formData.title,
      location: finalLocation,
      createdAt: formData.createdAt || new Date(),
      status: formData.status || 'Unresolved',
    };

    console.log('Submitting report:', finalReportData);
    // TODO: Actual submission logic
    // router.push('/home');
  };

  const handleCancel = () => {
    router.back();
  };

  // console.log("[ReportForm Render] isMapReady:", isMapReady, "L:", !!L, "choosingLocation:", choosingLocation, "selectedLocation:", selectedLocation);

  return (
    <div className={cn("w-full max-w-lg flex flex-col gap-4 -mt-12", className)} {...props}>
      <Card className={cn(
        "h-[85vh] min-h-[400px] max-h-[800px] transition-all duration-300 ease-in-out",
        choosingLocation ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto",
      )}>
        <CardHeader>
          <CardTitle>{report ? "Edit Report" : "Create New Report"}</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(85vh-150px)]">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title*</Label>
                <Input id="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description || ''} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <CategoryDropdownMenu value={formData.category as any} onValueChange={handleCategoryChange} />
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <UrgencyDropdownMenu value={formData.urgency} onValueChange={handleUrgencyChange} />
                </div>
              </div>
              <div>
                <Label>Location*</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSetLocation}
                  className="w-full flex justify-between items-center"
                  disabled={!L || !isMapReady}
                >
                  {/* Display from formData.location if confirmed, otherwise from selectedLocation if actively choosing */}
                  {formData.location?.coordinates && !choosingLocation
                    ? `Lat: ${formData.location.coordinates.lat.toFixed(4)}, Lng: ${formData.location.coordinates.lng.toFixed(4)}`
                    : selectedLocation && choosingLocation
                      ? `Lat: ${selectedLocation.lat.toFixed(4)}, Lng: ${selectedLocation.lng.toFixed(4)} (Choosing)`
                      : "Mark Location on Map"}
                  <Locate size={16} className={(formData.location?.coordinates && !choosingLocation) || (selectedLocation && choosingLocation) ? "text-primary" : ""} />
                </Button>
                {(formData.location?.address && !choosingLocation) && <div className="text-xs text-muted-foreground mt-1">Address: {formData.location.address.province} {formData.location.address.barangay}, {formData.location.address.city}</div>}
                {(selectedLocation && !formData.location?.address && !choosingLocation) && <div className="text-xs text-muted-foreground mt-1">Location selected, needs confirmation. Click "Mark Location" then "Confirm".</div>}
                {choosingLocation && <div className="text-xs text-muted-foreground mt-1">Click on the map to set location.</div>}
              </div>
              <div>
                <Label>Images</Label>
                <ImageUploader images={formData.images || []} onChange={handleImagesChange} />
              </div>
              <Separator />
              <Button type="submit" className="w-full" disabled={!formData.title || !formData.location?.coordinates}>
                {report ? "Save Changes" : "Submit Report"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="w-full">
                Cancel
              </Button>
            </form>
          </CardContent>
        </ScrollArea>
      </Card>

      {choosingLocation && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1001] flex gap-4 p-4 bg-background shadow-lg rounded-lg pointer-events-auto">
          <Button onClick={handleConfirmLocation} disabled={!selectedLocation}>
            Confirm Location
          </Button>
          <Button variant="outline" onClick={handleCancelSetLocation}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
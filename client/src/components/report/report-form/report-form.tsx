'use client';

import { useState, useEffect, useCallback } from "react"; // Added useCallback
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
import { Locate } from "lucide-react";
import { useMapContext } from "@/context/map-context";
import { useMapMarker } from "@/hooks/use-map-marker";
import { convertLatLngToArea } from "@/lib/geocoding";
import type { LatLng, LeafletMouseEvent } from 'leaflet'; 
import type Location  from "@/interfaces/location"; 

interface ReportFormProps {
  className?: string;
  report?: Report;
}

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

  const { mapInstanceRef, isMapReady } = useMapContext(); // Get isMapReady
  const { addMarker, removeMarker, getMarkerPosition, initializeMarker, L } = useMapMarker();
  const router = useRouter();

  // Effect to initialize selectedLocation and marker based on report prop or map center for new reports
  useEffect(() => {
    // Guard conditions: L must be loaded, map must be ready, and map instance must exist.
    if (!L || !isMapReady || !mapInstanceRef.current) {
      return;
    }

    if (report?.location?.coordinates) {
      // Editing an existing report with a defined location
      if (!selectedLocation) { // Only initialize if not already set (e.g., by user interaction or previous effect run)
        console.log("[ReportForm InitEffect] Initializing for existing report from report.location.coordinates:", report.location.coordinates);
        const initialLatLng = new L.LatLng(report.location.coordinates.lat, report.location.coordinates.lng);
        setSelectedLocation(initialLatLng);
        // Initialize marker on the map if not currently in the process of choosing a new location
        if (!choosingLocation) {
          initializeMarker(initialLatLng);
        }
      }
    } else if (!report && !selectedLocation) {
      // Creating a new report AND no location has been selected yet (e.g., by a previous map click or effect run)
      console.log("[ReportForm InitEffect] Initializing for new report at current map center.");
      const mapCenter = mapInstanceRef.current.getCenter();
      setSelectedLocation(mapCenter); // Update form's state for the location
      initializeMarker(mapCenter);    // Place the marker on the map and center map view
    }
  }, [L, isMapReady, report, selectedLocation, choosingLocation, initializeMarker, mapInstanceRef]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      removeMarker();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click');
      }
    };
  }, [removeMarker, mapInstanceRef]);


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

  const mapClickHandler = useCallback((e: LeafletMouseEvent) => {
    console.log("Map clicked at:", e.latlng);
    if (addMarker(e.latlng)) {
        setSelectedLocation(e.latlng);
    } else {
        console.log("Failed to add marker on map click in ReportForm");
    }
  }, [addMarker, setSelectedLocation]);

  const handleSetLocation = () => {
    setChoosingLocation(true);
    console.log("handleSetLocation: Choosing location. Map instance:", !!mapInstanceRef.current, "L loaded:", !!L);

    if (isMapReady && mapInstanceRef.current && L) {
      // If a location is already selected (e.g., editing), initialize marker there.
      // The map should also center on this.
      if (selectedLocation) {
        console.log("handleSetLocation: Initializing marker at existing selectedLocation:", selectedLocation);
        initializeMarker(selectedLocation);
      } else {
        // If no location selected yet, and user has location, center map there first.
        // This helps if map starts far away.
        navigator.geolocation.getCurrentPosition(pos => {
            mapInstanceRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 15);
        });
      }
      
      // Remove any previous click listener before adding a new one
      mapInstanceRef.current.off('click', mapClickHandler);
      mapInstanceRef.current.on('click', mapClickHandler);
    } else {
      console.error("Map instance or Leaflet (L) not available in handleSetLocation.");
    }
  };

  const handleCancelSetLocation = () => {
    setChoosingLocation(false);
    removeMarker();
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.off('click', mapClickHandler);
    }

    // Restore previous selectedLocation if editing
    if (L && report?.location?.coordinates) {
      setSelectedLocation(
        new L.LatLng(report.location.coordinates.lat, report.location.coordinates.lng)
      );
    } else if (!report?.location?.coordinates) {
        setSelectedLocation(null); // Clear if it was a new report
    }
  };

  const handleConfirmLocation = async () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.off('click', mapClickHandler);
    }

    if (selectedLocation) {
      try {
        const addressDetails = await convertLatLngToArea(selectedLocation); // Assuming this returns Area | null

        if (addressDetails === null) {
          console.error('Could not determine address for the selected location. Please try a different location or ensure the geocoding service is working.');
          // TODO: Provide user feedback (e.g., a toast message)
          // Do not update formData if address is invalid and Location.address must be Area
          return;
        }

        // addressDetails is now confirmed to be 'Area'
        setFormData(prev => ({
          ...prev,
          location: {
            // Set the full location object, ensuring both coordinates and address are from the confirmed step
            coordinates: { lat: selectedLocation.lat, lng: selectedLocation.lng },
            address: addressDetails, // addressDetails is of type 'Area' here
          }
        }));
        setChoosingLocation(false); // Close the location confirmation UI
        console.log("Location confirmed:", selectedLocation, "Address:", addressDetails);
      } catch (error) {
        console.error('Failed to process location:', error);
        // TODO: Provide user feedback for other errors
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate title, selectedLocation, and that formData.location and its address are properly set.
    // formData.location?.address checks if formData.location exists AND formData.location.address is truthy.
    // Since handleConfirmLocation now ensures addressDetails is not null before setting,
    // formData.location.address here implies it's a valid 'Area'.
    if (!formData.title || !selectedLocation || !formData.location?.address || !formData.location?.coordinates) {
      console.error("Validation failed: Title and a confirmed location (with coordinates and address) are required.");
      // TODO: Show a more user-friendly error message
      return;
    }

    // At this point, we know:
    // - formData.title is a string.
    // - selectedLocation is LatLng (though the confirmed location is in formData.location).
    // - formData.location.address is of type 'Area'.
    // - formData.location.coordinates is { lat: number, lng: number }.

    const finalLocation: Location = { // Ensure 'Location' is the correct type for Report.location
      coordinates: formData.location.coordinates, // Guaranteed to be valid by the check above
      address: formData.location.address,       // Guaranteed to be 'Area' by the check above
    };

    const finalReportData: Partial<Report> = {
      ...formData, // Spreads other properties like description, category, etc.
      title: formData.title, // Explicitly include validated title
      location: finalLocation, // Assign the correctly typed and validated location object
      // Handle createdAt and status for new vs. existing reports
      createdAt: formData.createdAt || new Date(),
      status: formData.status || 'Unresolved',
      // authorId might be needed here if it's a new report and not part of formData
    };

    console.log('Submitting report:', finalReportData);
    // TODO: Actual submission logic, e.g., await createReport(finalReportData);
    // router.push('/home'); // Or to the report details page
  };

  const handleCancel = () => {
    router.back();
  };

  console.log("[ReportForm Render] isMapReady:", isMapReady, "L:", !!L);

  return (
    <div className={cn("w-full max-w-lg flex flex-col gap-4 -mt-12", className)} {...props}>
      <Card className={cn(
        "h-[85vh] min-h-[400px] max-h-[800px] transition-all duration-300 ease-in-out",
        choosingLocation ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto",
      )}>
        <CardHeader>
          <CardTitle>{report ? "Edit Report" : "Create New Report"}</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(85vh-150px)]"> {/* Adjust height based on header/footer */}
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields ... */}
              <div>
                <Label htmlFor="title">Title*</Label>
                <Input id="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleInputChange} />
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
                  disabled={!L || !isMapReady} // Corrected: Add !isMapReady check
                >
                  {selectedLocation ? `Lat: ${selectedLocation.lat.toFixed(4)}, Lng: ${selectedLocation.lng.toFixed(4)}` : "Mark Location on Map"}
                  <Locate size={16} className={selectedLocation ? "text-primary" : ""} />
                </Button>
                {selectedLocation && <div className="text-xs text-muted-foreground mt-1">Location Selected. Click again to change.</div>}
              </div>
              <div>
                <Label>Images</Label>
                <ImageUploader images={formData.images || []} onChange={handleImagesChange} />
              </div>
              <Separator />
              <Button type="submit" className="w-full" disabled={!formData.title || !selectedLocation}>
                {report ? "Save Changes" : "Submit Report"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="w-full">
                Cancel
              </Button>
              
            </form>
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Buttons for confirming/canceling location selection, shown when choosingLocation is true */}
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
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area"; // Make sure to import the proper ScrollArea
import { CategoryDropdownMenu } from "@/components/report/report-form/category-dropdown";
import { UrgencyDropdownMenu } from "@/components/report/report-form/urgency-dropdown";
import ImageUploader from "@/components/report/report-form/image-uploader";
import { Separator } from "@/components/ui/separator";
import Report from "@/interfaces/report";
import { Locate } from "lucide-react";
import { useMapContext } from "@/context/map-context";
import { useMapMarker } from "@/hooks/use-map-marker";
import L from "leaflet";
import { convertLatLngToArea } from "@/lib/geocoding";

interface ReportFormProps extends React.ComponentProps<"div"> {
  report?: Report;
}

export function ReportForm({
  className,
  report,
  ...props
}: ReportFormProps) {
  const [choosingLocation, setChoosingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<L.LatLng | null>(
    report?.location?.coordinates ? 
    new L.LatLng(report.location.coordinates.lat, report.location.coordinates.lng) : 
    null
  );
  const [formData, setFormData] = useState<Partial<Report>>({
    title: report?.title || '',
    description: report?.description || '',
    category: report?.category || '',
    urgency: report?.urgency || 'Low',
    status: report?.status || 'Unresolved',
    images: report?.images || [],
    location: report?.location || undefined,
  });

  const { mapInstanceRef } = useMapContext();
  const { addMarker, removeMarker, getMarkerPosition, initializeMarker } = useMapMarker();

  const router = useRouter();

  useEffect(() => {
    // Cleanup marker when component unmounts
    return () => {
      removeMarker();
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category
    }));
  };

  const handleUrgencyChange = (urgency: "Low" | "Medium" | "High") => {
    setFormData(prev => ({
      ...prev,
      urgency
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleSetLocation = () => {
    setChoosingLocation(true);

    if (mapInstanceRef.current) {
      // If editing an existing location, initialize the marker there
      if (selectedLocation) {
        const marker = initializeMarker(selectedLocation);
        
        if (marker) {
          marker.on('dragend', () => {
            const position = getMarkerPosition();
            if (position) {
              setSelectedLocation(position);
            }
          });
        }
      }

      // Add click handler to map
      mapInstanceRef.current.on('click', (e) => {
        const marker = addMarker(e.latlng);
        
        if (marker) {
          marker.on('dragend', () => {
            const position = getMarkerPosition();
            if (position) {
              setSelectedLocation(position);
            }
          });
          
          setSelectedLocation(e.latlng);
        }
      });
    }
  };

  const handleCancelSetLocation = () => {
    setChoosingLocation(false);
    removeMarker();
    
    // Restore previous location if editing
    if (report?.location?.coordinates) {
      setSelectedLocation(
        new L.LatLng(report.location.coordinates.lat, report.location.coordinates.lng)
      );
    }

    // Remove click handler from map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.off('click');
    }
  };

  const handleConfirmLocation = async () => {
    setChoosingLocation(false);
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.off('click');
    }

    if (selectedLocation) {
      try {
        const address = await convertLatLngToArea(selectedLocation);
        setFormData(prev => ({
          ...prev,
          location: Object.assign({}, prev.location, {
            coordinates: { lat: selectedLocation.lat, lng: selectedLocation.lng },
            address: address ?? prev.location?.address
          })
        }));
      } catch (error) {
        console.error('Failed to get address:', error);
        // Handle error (maybe set a default address or show error message)
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.location?.coordinates) {
      // Show error message
      return;
    }

    // Create final report object
    const finalReport: Partial<Report> = {
      ...formData,
      createdAt: new Date(),
      status: 'Unresolved',
      // Add other required fields
    };

    // api call to create report

    console.log('Submitting report:', finalReport);
    router.push('/home');
  };

  const handleCancel = () => {
    // clear form

    router.back();
  }

  return (
    <div className={cn(
      "w-full max-w-lg flex flex-col gap-4 -mt-12", 
      className,
    )} {...props}>
      <Card className={cn(
        "h-[85vh] min-h-[400px] max-h-[800px]",
        choosingLocation ? "pointer-events-none hidden" : "pointer-events-auto",
      )}> {/* Set fixed height here */}
        <ScrollArea className="h-full"> {/* Make ScrollArea full height of card */}
          <CardHeader className="text-left sticky top-0 bg-background z-10">
            <CardTitle className="text-2xl">{report ? "Edit Report" : "Create a Report"}</CardTitle>
          </CardHeader>
          <div className="px-6">
            <Separator />
          </div>
          <CardContent className="flex flex-col items-center py-4">
            <form className="w-full max-w-full">
              <div className="w-full grid gap-6">
                <div className="w-full grid gap-3">
                  <div className="grid gap-1">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-1">
                    <div className="flex items-center">
                      <Label htmlFor="description">Description</Label>
                    </div>
                    <Textarea
                      id="description"
                      className="min-h-[100px]"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="grid gap-1 w-full">
                      <Label htmlFor="category">Category</Label>
                      <CategoryDropdownMenu
                        value={formData.category}
                        onValueChange={handleCategoryChange}
                      />
                    </div>
                    <div className="grid gap-1 w-full">
                      <Label htmlFor="urgency">Urgency</Label>
                      <UrgencyDropdownMenu
                        value={formData.urgency}
                        onValueChange={handleUrgencyChange}
                      />
                    </div>
                  </div>
                  <div 
                    className="flex items-center justify-start gap-2 text-md font-medium"
                    onClick={handleSetLocation}
                  >
                    Mark Location on Map*
                    <Locate size={16} className={selectedLocation ? "text-primary" : "text-foreground"} />
                  </div>
                  <ImageUploader
                    images={formData.images}
                    onChange={handleImagesChange}
                  />
                </div>
                <Button type="submit" className="w-[70%] mx-auto" onClick={handleSubmit}>
                  {report ? "Save" : "Submit"} 
                </Button>
              </div>
            </form>
            <Button variant="outline" className="w-[70%] mx-auto mt-4" onClick={handleCancel}>
              Cancel
            </Button>
          </CardContent>
        </ScrollArea> 
      </Card>

      {choosingLocation && (
        <div className="fixed bottom-20 left-4 z-[1000] flex gap-2 pointer-events-auto">
          <Button
            onClick={handleConfirmLocation}
            disabled={!selectedLocation}
          >
            Confirm Location
          </Button>
          <Button
            variant="outline"
            onClick={handleCancelSetLocation}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
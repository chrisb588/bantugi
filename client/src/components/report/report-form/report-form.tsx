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

interface ReportFormProps extends React.ComponentProps<"div"> {
  report?: Report;
}

export function ReportForm({
  className,
  report,
  ...props
}: ReportFormProps) {
  const [choosingLocation, setChoosingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<L.LatLng | null>(null);
  const { mapInstanceRef } = useMapContext();
  const { addMarker, removeMarker, getMarkerPosition } = useMapMarker();

  const router = useRouter();

  useEffect(() => {
    // Cleanup marker when component unmounts
    return () => {
      removeMarker();
    };
  }, []);

  const handleSetLocation = () => {
    setChoosingLocation(true);

    // Add click handler to map
    if (mapInstanceRef.current) {
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
    removeMarker();
    setSelectedLocation(null);
  };

  const handleConfirmLocation = () => {
    setChoosingLocation(false);
    
    // Remove click handler from map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.off('click');
    }

    console.log(selectedLocation);
  };

  const handleSubmit = () => {
    // submit logic here

    router.push('/home');
  }

  const handleCancel = () => {
    // clear form

    router.back();
  }

  // TODO: Add button to confirm location and return to form

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
                    />
                  </div>
                  <div className="grid gap-1">
                    <div className="flex items-center">
                      <Label htmlFor="description">Description</Label>
                    </div>
                    <Textarea id="description" className="min-h-[100px]" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="grid gap-1 w-full">
                      <Label htmlFor="category">Category</Label>
                      <CategoryDropdownMenu />
                    </div>
                    <div className="grid gap-1 w-full">
                      <Label htmlFor="urgency">Urgency</Label>
                      <UrgencyDropdownMenu />
                    </div>
                  </div>
                  <div 
                    className="flex items-center justify-start gap-2 text-md font-medium"
                    onClick={handleSetLocation}
                  >
                    Mark Location on Map*
                    <Locate size={16} className={selectedLocation ? "text-primary" : "text-foreground"} />
                  </div>
                  <ImageUploader />
                </div>
                <Button type="submit" className="w-[70%] mx-auto" onClick={handleSubmit}>
                  Submit
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
        <Button
          className="fixed bottom-20 left-4 z-[1000] pointer-events-auto"
          onClick={handleConfirmLocation}
          disabled={!selectedLocation}
        >
          Confirm Location
        </Button>
      )}
    </div>
  )
}
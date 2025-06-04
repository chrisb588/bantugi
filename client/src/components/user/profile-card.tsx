'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, formatArea } from "@/lib/utils"
import Image from "next/image";
import { MapPin, Settings2, Trash, ArrowLeftFromLine, Pencil, ChevronLeft } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"; // Make sure to import the proper ScrollArea
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { useMapContext } from "@/context/map-context";
import { useMapMarker } from "@/hooks/use-map-marker";
import EditDetailsCard from "@/components/user/edit-details-card";
import L from "leaflet";
import { useUserContext } from "@/context/user-context";
import { convertLatLngToArea } from "@/lib/geocoding";

interface ProfileCardProps extends React.ComponentProps<"div"> {
  edit?: boolean;
}

export default function ProfileCard({
  className,
  edit = false,
  ...props
}: ProfileCardProps) {
  const { state: { user }, updateUser } = useUserContext();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<L.LatLng | null>(
    user?.location?.coordinates ? 
    new L.LatLng(user.location.coordinates.lat, user.location.coordinates.lng) : 
    null
  );
  
  const { mapInstanceRef } = useMapContext();
  const { addMarker, removeMarker, getMarkerPosition, initializeMarker } = useMapMarker();
  const router = useRouter();

  const navigateToEditProfile = () => {
    router.push(`/${user?.username}/account/edit`);
  };

  const navigateBackToProfile = () => {
    router.back();
  }

  // you can use the edit details card component
  const handleEditName = () => {
    setIsEditingName(true);
  }

  const handleConfirmNameEdit = (newUsername: string) => {
    updateUser({ username: newUsername });
    setIsEditingName(false);
    // TODO: Add API call to update username (backend)
  };

  const handleEditLocation = () => {
    setIsEditingLocation(true);

    if (mapInstanceRef.current) {
      // Initialize marker at current location if exists
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
  }

  const handleConfirmLocation = async () => {
    if (selectedLocation) {
      const address = await convertLatLngToArea(selectedLocation);

      if (!address) {
        // Provide a fallback or handle the error as needed
        // Here, we throw an error, but you can set a default Area object if appropriate
        throw new Error("Failed to retrieve address for the selected location.");
      }
      
      updateUser({
        location: {
          coordinates: {
            lat: selectedLocation.lat,
            lng: selectedLocation.lng
          },
          address: address,
        }
      });
    }
    setIsEditingLocation(false);
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.off('click');
    }
  };

  const handleCancelLocation = () => {
    setIsEditingLocation(false);
    removeMarker();
    
    // Remove click handler from map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.off('click');
    }
  };

  const handleDeleteAccount = () => {
    alert('Account delete clicked'); //just put the delete logic here

    router.push('/');
  };

  const handleLogout = () => {
    alert('Logout clicked');

    router.push('/');
  };

  // FIXME: fix windows is not defined error

  return (
    <>
      <div className={cn(
        "w-full max-w-lg flex flex-col gap-4 -mt-12", 
        className,
        isEditingLocation ? "pointer-events-none hidden" : "pointer-events-auto",
      )} {...props}>
        <Card className="h-[85vh] min-h-[400px] max-h-[800px]"> {/* Set fixed height here */}
          <ScrollArea className="h-full"> {/* Make ScrollArea full height of card */}
            <CardHeader className="text-center sticky top-0 bg-background z-10">
              {edit && (
                <div className="flex justify-start mb-2">
                  <Button
                    variant="ghost"
                    style={{ height: '40px', width: '40px', padding: '0' }}
                    onClick={navigateBackToProfile}
                  >
                    <ChevronLeft 
                    size={32}
                    style={{ height: '32px', width: '32px' }}
                    className="text-foreground hover:text-secondary"
                    />
                  </Button>
                </div>
              )}
              <CardTitle className="text-2xl">YOUR PROFILE</CardTitle>
            </CardHeader>
            {edit && (
              <div className="px-6">
                <Separator />
              </div>
            )}
            <CardContent className="flex flex-col items-center py-4 gap-2">
              {edit && (
                <div className="text-lg font-bold text-foreground">
                  Edit Account
                </div>
              )}
              <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted">
                <Image
                src={user?.profilePicture || "/img/avatar.png"}
                alt="Profile"
                fill
                className="object-cover"
              />
              </div>
              <div className="flex flex-col items-center">
                {edit ? (
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-lg text-foreground">{user ? user.username : "User"}</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={handleEditName}
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="font-bold text-lg text-foreground">{user?.username}</div>
                )}
                <div className="flex items-center gap-1 text-foreground">
                  <MapPin size={16} />
                  <div className="font-bold text-sm">
                    {user?.location ? formatArea(user?.location?.address) : "Unknown Location"}
                  </div>
                  {edit && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 ml-1"
                      onClick={handleEditLocation}
                    >
                      <Pencil size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            {edit && (
              <div className="px-6">
                <Separator />
              </div>
            )}
            <CardContent className="flex flex-col items-center py-4 gap-2">
              {edit ? (
                <div className="flex flex-col items-center gap-2">
                  <DeleteConfirmationDialog
                    trigger={
                      <Button variant="ghost">
                        <div className="flex items-center gap-1 text-primary mt-4">
                          <Trash size={16} />
                          <div className="font-bold text-sm">
                            Delete Account
                          </div>
                        </div>
                      </Button>
                    }
                    title="Are you sure you want to delete your account?"
                    description="This action is irreversible."
                    onConfirm={handleDeleteAccount}
                  />
                  <Button variant="ghost" onClick={handleLogout}>
                    <div className="flex items-center gap-1 text-accent mt-4">
                      <ArrowLeftFromLine size={16} />
                      <div className="font-bold text-sm">
                        Logout
                      </div>
                    </div>
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" onClick={navigateToEditProfile}>
                  <div className="flex items-center gap-1 text-accent mt-4">
                    <Settings2 size={16} />
                    <div className="font-bold text-sm">
                      Account Settings
                    </div>
                  </div>
                </Button>
              )}
            </CardContent>
          </ScrollArea> 
        </Card>
      </div>

      {isEditingName && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <EditDetailsCard
              label="Edit Username"
              onConfirm={handleConfirmNameEdit}
            />
          </div>
        </div>
      )}

      {isEditingLocation && (
        <div className="fixed bottom-20 left-4 z-[1000] flex gap-2 pointer-events-auto">
          <Button
            onClick={handleConfirmLocation}
            disabled={!selectedLocation}
          >
            Confirm Location
          </Button>
          <Button
            variant="outline"
            onClick={handleCancelLocation}
          >
            Cancel
          </Button>
        </div>
      )}
    </>
  )
}
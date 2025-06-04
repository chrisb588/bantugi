'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn, formatArea } from "@/lib/utils"
import Image from "next/image";
import { MapPin, Settings2, Trash, ArrowLeftFromLine, Pencil, ChevronLeft, Camera } from "lucide-react";
import { toast } from "sonner";

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
import EditProfileCard from "@/components/user/edit-profile-card";
import type LType from "leaflet"; // Import LType for type annotation
import { useUserContext } from "@/context/user-context";
import { useUserProfile } from "@/hooks/useUserProfile";
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
  const { updateProfile, deleteProfile, isUpdating, isDeleting, error } = useUserProfile();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Get L from useMapContext
  const { mapInstanceRef, L } = useMapContext(); 
  const { addMarker, removeMarker, getMarkerPosition, initializeMarker } = useMapMarker();
  const router = useRouter();

  // Initialize selectedLocation to null and set it in useEffect when L and user data are available
  const [selectedLocation, setSelectedLocation] = useState<LType.LatLng | null>(null);

  useEffect(() => {
    if (L && user?.location?.coordinates) {
      setSelectedLocation(new L.LatLng(user.location.coordinates.lat, user.location.coordinates.lng));
    } else {
      // Ensure selectedLocation is null if L or user coordinates are not available
      setSelectedLocation(null); 
    }
  }, [L, user?.location?.coordinates]); // Dependencies: L and user's location coordinates

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

  const handleConfirmNameEdit = async (newUsername: string) => {
    try {
      await updateProfile({ email: newUsername }); // Using email as username
      setIsEditingName(false);
      toast.success('Username updated successfully');
    } catch (error) {
      console.error('Failed to update username:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update username';
      toast.error(errorMessage);
    }
  };

  const handleEditLocation = () => {
    setIsEditingLocation(true);

    if (mapInstanceRef.current && L) { // Ensure L is available
      // Initialize marker at current location if exists
      if (selectedLocation) {
        const marker = initializeMarker(selectedLocation, { draggable: true }); // Make marker draggable
        
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
      mapInstanceRef.current.on('click', (e: LType.LeafletMouseEvent) => { // Type the event
        const marker = addMarker(e.latlng, { draggable: true }); // Make new marker draggable
        
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
    if (selectedLocation && L) { // Ensure L is available for convertLatLngToArea if it uses L
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

  const handleDeleteAccount = async () => {
    try {
      await deleteProfile();
      toast.success('Account deleted successfully');
      console.log('Account deleted successfully');
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    alert('Logout clicked');

    router.push('/');
  };

  const handleEditAvatar = () => {
    setIsEditingProfile(true);
  };

  const handleConfirmProfileEdit = async (data: { email?: string; avatar?: File }) => {
    try {
      await updateProfile(data);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    }
  };

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
  };

  // FIXME: fix windows is not defined error

  return (
    <>
      <div className={cn(
        "w-full max-w-lg flex flex-col gap-4 -mt-12", 
        className,
        (isEditingLocation || isEditingProfile || isDeleting) ? "pointer-events-none" : "pointer-events-auto",
        isDeleting ? "opacity-50" : "",
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
                {edit && (
                  <button
                    onClick={handleEditAvatar}
                    className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    aria-label="Edit avatar"
                  >
                    <Camera size={24} className="text-white" />
                  </button>
                )}
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
                      <Button variant="ghost" disabled={isDeleting}>
                        <div className="flex items-center gap-1 text-primary mt-4">
                          <Trash size={16} />
                          <div className="font-bold text-sm">
                            {isDeleting ? "Deleting..." : "Delete Account"}
                          </div>
                        </div>
                      </Button>
                    }
                    title="Are you sure you want to delete your account?"
                    description="This action is irreversible and will permanently delete all your data including reports and profile information."
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

      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <EditProfileCard
              label="Edit Profile"
              initialEmail={user?.username || ''}
              currentAvatar={user?.profilePicture}
              isUpdating={isUpdating}
              onConfirm={handleConfirmProfileEdit}
              onCancel={handleCancelProfileEdit}
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
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
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
import EditDetailsCard from "@/components/user/edit-details-card";
import EditProfileCard from "@/components/user/edit-profile-card";
import { useUserContext } from "@/context/user-context";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth"; // Added import for useAuth

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
  const { logout: authLogout } = useAuth(); // Get logout from useAuth
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
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

  const handleConfirmNameEdit = async (newUsername: string) => {
    try {
      await updateProfile({ username: newUsername });
      setIsEditingName(false);
      toast.success('Username updated successfully');
    } catch (error) {
      console.error('Failed to update username:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update username';
      toast.error(errorMessage);
    }
  };

  const handleEditAddress = () => {
    setIsEditingAddress(true);
  };

  const handleConfirmAddressEdit = async (newAddress: string) => {
    try {
      await updateProfile({ address: newAddress });
      setIsEditingAddress(false);
      toast.success('Address updated successfully');
    } catch (error) {
      console.error('Failed to update address:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update address';
      toast.error(errorMessage);
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

  const handleLogout = async () => {
    try {
      await authLogout();
      // Redirect to landing page after logout
      router.push('/'); 
    } catch (e) {
      console.error("Logout failed in profile-card", e);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleEditAvatar = () => {
    setIsEditingProfile(true);
  };

  const handleConfirmProfileEdit = async (data: { username?: string; address?: string; avatar?: File }) => {
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

  return (
    <>
      <div className={cn(
        "w-full max-w-lg flex flex-col gap-4 -mt-12", 
        className,
        (isEditingProfile || isDeleting) ? "pointer-events-none" : "pointer-events-auto",
        isDeleting ? "opacity-50" : "",
      )} {...props}>
        <Card className="h-[85vh] min-h-[400px] max-h-[800px]"> {/* Set fixed height here */}
          <ScrollArea className="h-full"> {/* Make ScrollArea full height of card */}
            <CardHeader className="sticky top-0 bg-background z-10">
              <div className="flex gap-1 items-center">
                {edit && (
                  <div className="flex justify-center mb-2">
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
                <CardTitle className="text-2xl pb-2">
                  {edit ? 'EDIT PROFILE' : 'YOUR PROFILE'}
                </CardTitle>
              </div>
            </CardHeader>
            <div className="px-6">
              <Separator />
            </div>
            <CardContent className="flex py-4 gap-2">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={user?.profilePicture || "/img/avatar.png"}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col items-start justify-center overflow-hidden">
                <div className="font-bold text-lg text-foreground text-ellipsis">{user?.username || "User"}</div>
                {user?.email && (
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                )}
                {user?.address && (
                  <div className="flex items-start gap-1 text-foreground mt-2">
                    <MapPin size={16} className="mt-1" />
                    <div className="text-sm text-muted-foreground">{user.address}</div>
                  </div>
                )}
              </div>
            </CardContent>
            <div className="px-6">
              <Separator />
            </div>
            {edit && (
              <CardContent className="py-2">
                <div className="text-sm font-bold">
                  Edit Account Details
                </div>
                <div className="py-4" onClick={(e) => e.stopPropagation()}>
                  <EditProfileCard
                    initialEmail={user?.email || ''}
                    initialUsername={user?.username || ''}
                    initialAddress={user?.address || ''}
                    currentAvatar={user?.profilePicture}
                    isUpdating={isUpdating}
                    onConfirm={handleConfirmProfileEdit}
                    onCancel={handleCancelProfileEdit}
                  />
                </div>
              </CardContent>
            )}
            {edit && (
              <div className="px-6">
                <Separator />
              </div>
            )}
            <CardContent className="py-2">
              {edit ? (
                <div className="flex flex-col items-start gap-2">
                  <DeleteConfirmationDialog
                    trigger={
                      <Button variant="ghost" disabled={isDeleting} className="p-0">
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
                  <Button variant="ghost" onClick={handleLogout} className="p-0">
                    <div className="flex items-center gap-1 text-accent mt-4">
                      <ArrowLeftFromLine size={16} />
                      <div className="font-bold text-sm">
                        Logout
                      </div>
                    </div>
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" onClick={navigateToEditProfile} className="p-0">
                  <div className="flex items-center gap-1 text-accent">
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

      {/* {isEditingName && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <EditDetailsCard
              label="Edit Username"
              initialValue={user?.username || ''}
              onConfirm={handleConfirmNameEdit}
              onCancel={() => setIsEditingName(false)}
            />
          </div>
        </div>
      )}

      {isEditingAddress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <EditDetailsCard
              label="Edit Address"
              initialValue={user?.address || ''}
              onConfirm={handleConfirmAddressEdit}
              onCancel={() => setIsEditingAddress(false)}
            />
          </div>
        </div>
      )}

      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md py-4" onClick={(e) => e.stopPropagation()}>
            <EditProfileCard
              label="Edit Profile"
              initialEmail={user?.email || ''}
              initialUsername={user?.username || ''}
              initialAddress={user?.address || ''}
              currentAvatar={user?.profilePicture}
              isUpdating={isUpdating}
              onConfirm={handleConfirmProfileEdit}
              onCancel={handleCancelProfileEdit}
            />
          </div>
        </div> */}
      {/* )} */}

    </>
  )
}
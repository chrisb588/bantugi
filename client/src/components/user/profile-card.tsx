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
  const [editError, setEditError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  // For username uniqueness check
  async function checkUsernameUnique(username: string): Promise<boolean> {
    setIsCheckingUsername(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error:', errorText);
        setEditError('Could not verify username uniqueness.');
        setIsCheckingUsername(false);
        return false;
      }
      const data = await res.json();
      // API returns { available: true/false }
      setIsCheckingUsername(false);
      return !!data.available;
    } catch (e) {
      console.error('Network or parsing error:', e);
      setEditError('Could not verify username uniqueness.');
      setIsCheckingUsername(false);
      return false;
    }
  }
  
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
    alert('Logout clicked');
    try {
      await authLogout();
      // Redirect to landing page after logout
      router.push('/'); 
    } catch (e) {
      console.error("Logout failed in profile-card", e);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Unified edit handler for account details
  const handleEditAccountDetails = () => {
    setEditError(null);
    setIsEditingProfile(true);
  };

  // Enhanced confirm handler with username uniqueness validation
  const handleConfirmProfileEdit = async (data: { username?: string; address?: string; avatar?: File }) => {
    setEditError(null);
    if (!data.username || !data.username.trim()) {
      setEditError('Username is required.');
      return;
    }
    // Only check uniqueness if username is changed
    if (data.username !== user?.username) {
      const isUnique = await checkUsernameUnique(data.username.trim());
      if (!isUnique) {
        setEditError('Username is already taken.');
        return;
      }
    }
    try {
      await updateProfile(data);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setEditError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancelProfileEdit = () => {
    setEditError(null);
    setIsEditingProfile(false);
  };

  // FIXME: fix windows is not defined error

  return (
    <>
      {/* Edit Account Details Button (always visible, consistent with design) */}
      <div className="w-full flex justify-end mb-2">
        <Button variant="outline" size="sm" onClick={handleEditAccountDetails}>
          Edit Account Details
        </Button>
      </div>
      {/* Main Profile Card UI (preserved) */}
      <div className={cn(
        "w-full max-w-lg flex flex-col gap-4 -mt-12", 
        className,
        (isEditingProfile || isDeleting) ? "pointer-events-none" : "pointer-events-auto",
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
              {/* Edit Profile Modal (reusing your EditProfileCard) */}
              {isEditingProfile && (
                <EditProfileCard
                  label="Edit Account Details"
                  initialEmail={user?.email || ''}
                  initialUsername={user?.username || ''}
                  initialAddress={user?.address || ''}
                  currentAvatar={user?.profilePicture}
                  isUpdating={isUpdating || isCheckingUsername}
                  onConfirm={handleConfirmProfileEdit}
                  onCancel={handleCancelProfileEdit}
                />
              )}
              {/* Show validation or API errors */}
              {editError && (
                <div className="text-red-500 text-sm mb-2">{editError}</div>
              )}
              {/* Rest of the profile card UI (unchanged) */}
              {!isEditingProfile && (
                <>
                  <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={user?.profilePicture || "/img/avatar.png"}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="font-bold text-lg text-foreground">{user?.username || "User"}</div>
                    {user?.email && (
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    )}
                    {user?.address && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin size={14} />
                        <span>{user.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Account Settings Section */}
                  <div className="w-full mt-8 px-4">
                    <div className="font-semibold text-base mb-2">Account Settings</div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={handleLogout}>
                        Log Out
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { useUserContext } from '@/context/user-context';
import { fetchUserProfile, updateUserProfile, deleteUserProfile, ProfileUpdateData } from '@/lib/api/user-profile';
import type User from '@/interfaces/user';

interface UseUserProfileReturn {
  profile: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updateAvatar: (avatar: File) => Promise<void>;
  deleteProfile: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const { state: { user }, setUser, updateUser, clearUser } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchUserProfile();
      setUser(response.profile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const updateProfile = useCallback(async (data: ProfileUpdateData) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const response = await updateUserProfile(data);
      
      // Update user context with the new profile data
      setUser(response.profile);
      
      console.log('Profile updated successfully:', response.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Error updating profile:', err);
      throw err; // Re-throw so components can handle the error
    } finally {
      setIsUpdating(false);
    }
  }, [setUser]);

  const updateEmail = useCallback(async (email: string) => {
    await updateProfile({ email });
  }, [updateProfile]);

  const updateAvatar = useCallback(async (avatar: File) => {
    await updateProfile({ avatar });
  }, [updateProfile]);

  const deleteProfile = useCallback(async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      await deleteUserProfile();
      
      // Clear user data from context after successful deletion
      clearUser();
      console.log('Profile deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete profile';
      setError(errorMessage);
      console.error('Error deleting profile:', err);
      throw err; // Re-throw so components can handle the error
    } finally {
      setIsDeleting(false);
    }
  }, [clearUser]);

  // Load profile on mount if not already loaded
  useEffect(() => {
    if (!user && !isLoading) {
      refetchProfile();
    }
  }, [user, isLoading, refetchProfile]);

  return {
    profile: user,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    refetchProfile,
    updateProfile,
    updateEmail,
    updateAvatar,
    deleteProfile,
  };
}

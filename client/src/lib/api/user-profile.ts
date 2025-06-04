// Client-side service for user profile API operations
import type User from '@/interfaces/user';

export interface ProfileUpdateData {
  username?: string; // Add username field
  address?: string;  // Add address field
  avatar?: File;
}

export interface ProfileResponse {
  profile: User;
  message?: string;
  avatarUrl?: string;
}

export interface ProfileError {
  error: string;
  details?: string;
  message?: string;
}

/**
 * Fetch user profile from the API
 */
export async function fetchUserProfile(): Promise<ProfileResponse> {
  const response = await fetch('/api/user/profile', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error: ProfileError = await response.json();
    throw new Error(error.error || 'Failed to fetch profile');
  }

  return response.json();
}

/**
 * Update user profile with optional avatar upload
 */
export async function updateUserProfile(data: ProfileUpdateData): Promise<ProfileResponse> {
  let body: FormData | string;
  let headers: HeadersInit = {};

  // If avatar file is provided, use FormData
  if (data.avatar) {
    const formData = new FormData();
    
    if (data.username) {
      formData.append('username', data.username);
    }
    if (data.address) {
      formData.append('address', data.address);
    }
    formData.append('avatar', data.avatar);
    
    body = formData;
    // Don't set Content-Type header - let browser set it for FormData
  } else {
    // JSON payload for text-only updates
    body = JSON.stringify(data);
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    credentials: 'include',
    headers,
    body,
  });

  if (!response.ok) {
    const error: ProfileError = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }

  return response.json();
}

/**
 * Update only the username (convenience function)
 */
export async function updateUserUsername(username: string): Promise<ProfileResponse> {
  return updateUserProfile({ username });
}

/**
 * Update only the address (convenience function)
 */
export async function updateUserAddress(address: string): Promise<ProfileResponse> {
  return updateUserProfile({ address });
}

/**
 * Update only the avatar (convenience function)
 */
export async function updateUserAvatar(avatar: File): Promise<ProfileResponse> {
  return updateUserProfile({ avatar });
}

/**
 * Delete user profile and account
 */
export async function deleteUserProfile(): Promise<{ message: string }> {
  const response = await fetch('/api/user/profile', {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error: ProfileError = await response.json();
    throw new Error(error.error || 'Failed to delete profile');
  }

  return response.json();
}

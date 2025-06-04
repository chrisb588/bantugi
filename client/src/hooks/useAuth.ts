import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/auth-context';
import UserAuthDetails from "@/interfaces/user-auth";
import { useEffect } from 'react'; // Import useEffect

export function useAuth() {
  const context = useAuthContext();
  const router = useRouter();

  const { state, login: contextLogin, signup: contextSignup, logout: contextLogout } = context;

  const login = async (credentials: UserAuthDetails): Promise<boolean> => {
    const user = await contextLogin(credentials);
    return !!user; // Return true if user object is returned, false otherwise
  };

  const signup = async (credentials: UserAuthDetails): Promise<boolean> => {
    const user = await contextSignup(credentials);
    return !!user; // Return true if user object is returned, false otherwise
  };

  const logout = async (options?: { redirect?: boolean, redirectPath?: string }) => {
    try {
      await contextLogout();
      
      // Handle redirection after logout if specified
      const shouldRedirect = options?.redirect ?? true; // Default to redirecting
      const redirectPath = options?.redirectPath ?? '/login'; // Default redirect path
      
      if (shouldRedirect) {
        router.push(redirectPath);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails at the Supabase level, we should still redirect
      // This ensures users aren't stuck in a logged-in UI state
      if (options?.redirect ?? true) {
        router.push(options?.redirectPath ?? '/login');
      }
    }
  };

  return {
    user: state.user,
    isLoading: state.loading,
    error: state.error,
    initialAuthCheckComplete: state.initialAuthCheckComplete,
    login,
    signup,
    logout,
  };
}
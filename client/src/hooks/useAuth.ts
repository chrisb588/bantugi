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

  const logout = async () => {
    await contextLogout();
    // Consider if this immediate redirect is always desired or should also be effect-driven
    // For now, keeping it as is, as it's less likely to cause issues than login/signup redirects
    router.push('/'); 
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
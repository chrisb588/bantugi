import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userSignUp, signInWithPassword } from '@/lib/supabase/user.client';
import UserAuthDetails from "@/interfaces/user-auth";
import { useAuthContext } from '@/context/auth-context';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { dispatch } = useAuthContext();

  const login = async (credentials: UserAuthDetails) => {
    setIsLoading(true);
    setError(null);
    dispatch({ type: "AUTH/LOGIN_REQUEST" });
    
    try {
      const user = await signInWithPassword(credentials);
      if (user) {
        dispatch({ type: "AUTH/LOGIN_SUCCESS", payload: user });
        router.push('/home');
        return true;
      } else {
        const errorMsg = 'Login failed. Please check your credentials.';
        dispatch({ type: "AUTH/LOGIN_FAILURE", payload: errorMsg });
        setError(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = 'An error occurred during login.';
      dispatch({ type: "AUTH/LOGIN_FAILURE", payload: errorMsg });
      setError(errorMsg);
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (credentials: UserAuthDetails) => {
    setIsLoading(true);
    setError(null);
    dispatch({ type: "AUTH/SIGNUP_REQUEST" });
    
    try {
      const user = await userSignUp(credentials);
      if (user) {
        dispatch({ type: "AUTH/SIGNUP_SUCCESS", payload: user });
        router.push('/home');
        return true;
      } else {
        const errorMsg = 'Signup failed.';
        dispatch({ type: "AUTH/SIGNUP_FAILURE", payload: errorMsg });
        setError(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = 'An error occurred during signup.';
      dispatch({ type: "AUTH/SIGNUP_FAILURE", payload: errorMsg });
      setError(errorMsg);
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, signup, isLoading, error };
}
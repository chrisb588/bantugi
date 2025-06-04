'use client'
import React, { useContext, createContext, useReducer, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { AuthState } from '@/interfaces/action-states/auth';
import authReducer from '@/reducers/auth';
import AuthAction from '@/types/actions/auth';

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  signup: (credentials: { email: string; password: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
} | null>(null);

const InitialState: AuthState = {
  data: null,
  loading: false,
  error: null,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, InitialState);
  const router = useRouter();

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Input validation
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required');
      }

      // Log the authentication attempt
      console.log('Auth: Starting login process for:', credentials.email);

      // First, check if there's an existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        console.log('Auth: Found existing session, signing out first');
        await supabase.auth.signOut();
      }

      // Attempt to sign in
      console.log('Auth: Attempting sign in');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email, // Email already cleaned by login form
        password: credentials.password
      });

      if (error) {
        console.error('Auth: Sign in error:', {
          name: error.name,
          message: error.message,
          status: error.status
        });
        throw error;
      }

      if (!data?.user || !data?.session) {
        console.error('Auth: No user data or session received');
        throw new Error('Authentication failed - no user data received');
      }

      console.log('Auth: Login successful, user:', data.user.email);

      // Set user in state
      dispatch({ type: 'SET_USER', payload: data.user });
      
      // Store session
      try {
        localStorage.setItem('supabase.auth.token', data.session.access_token);
        console.log('Auth: Session token stored');
      } catch (storageError) {
        console.warn('Auth: Failed to store session token:', storageError);
      }

      // Navigate to home page with map
      console.log('Auth: Redirecting to home page with map');
      toast.success('Login successful! Redirecting to map...');
      router.push('/home');
      return true;
    } catch (error: any) {
      console.error('Auth: Login failed:', {
        name: error?.name,
        message: error?.message,
        status: error?.status
      });

      const message = error?.message || 'Failed to login';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [router]);

  const signup = useCallback(async (credentials: { email: string; password: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        toast.error(error.message);
        return false;
      }

      toast.success('Please check your email to confirm your registration');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign up';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      dispatch({ type: 'SIGN_OUT' });
      router.push('/auth/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [router]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        toast.error(error.message);
        return;
      }

      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Add session recovery
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Auth context: Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error recovering session:', error);
          return;
        }

        if (session?.user) {
          console.log('Auth context: Found existing session, restoring user data');
          dispatch({ type: 'SET_USER', payload: session.user });
        } else {
          console.log('Auth context: No existing session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    state,
    dispatch,
    login,
    signup,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Keep the original name as well
export const AuthContextProvider = AuthProvider;

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be within an AuthContextProvider');
  }
  
  return context;
}

export default AuthContext;
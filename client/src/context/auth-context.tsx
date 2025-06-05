'use client'
import React, { useContext, createContext, ReactNode, useReducer, useEffect } from 'react';
import type User from '@/interfaces/user'; 
import { AuthState } from '@/interfaces/action-states/auth';
import {
  getCurrentUser,
  signInWithPassword as supabaseSignIn,
  userSignUp as supabaseSignUp,
  signOut as supabaseSignOut // Import signOut
} from '@/lib/supabase/user.client'; 
import UserAuthDetails from '@/interfaces/user-auth';
import { formatAuthError } from '@/lib/auth-error-utils';
import { syncUserProfile } from '@/lib/user-profile-sync';
import { logger } from '@/lib/logger'; 

// --- Start: Moved from types/actions/auth.ts ---
type AuthAction = 
  | { type: "AUTH/INITIAL_AUTH_CHECK_START" }
  | { type: "AUTH/LOGIN_REQUEST" }
  | { type: "AUTH/SIGNUP_REQUEST" }
  | { type: "AUTH/LOGIN_SUCCESS", payload: User } // Payload is User object
  | { type: "AUTH/SIGNUP_SUCCESS", payload: User } // Payload is User object
  | { type: "AUTH/LOGIN_FAILURE", payload: string }
  | { type: "AUTH/SIGNUP_FAILURE", payload: string }
  | { type: "AUTH/LOGOUT_SUCCESS" }
  | { type: "AUTH/NO_ACTIVE_SESSION" }; // When initial check finds no user
// --- End: Moved from types/actions/auth.ts ---

// --- Start: Moved from reducers/auth.ts ---
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH/INITIAL_AUTH_CHECK_START":
      return { ...state, loading: true, error: null, initialAuthCheckComplete: false };
    case "AUTH/LOGIN_REQUEST":
    case "AUTH/SIGNUP_REQUEST":
      return { ...state, loading: true, user: null, error: null };
    
    case "AUTH/LOGIN_SUCCESS":
    case "AUTH/SIGNUP_SUCCESS":
      return { ...state, loading: false, user: action.payload, error: null, initialAuthCheckComplete: true };

    case "AUTH/LOGIN_FAILURE":
    case "AUTH/SIGNUP_FAILURE":
      return { ...state, loading: false, user: null, error: action.payload, initialAuthCheckComplete: true };
    
    case "AUTH/LOGOUT_SUCCESS":
      return { ...state, loading: false, user: null, error: null, initialAuthCheckComplete: true };
    
    case "AUTH/NO_ACTIVE_SESSION":
      return { ...state, loading: false, user: null, error: null, initialAuthCheckComplete: true };

    default:
      return state;
  }
}
// --- End: Moved from reducers/auth.ts ---

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (credentials: UserAuthDetails) => Promise<User | null>;
  signup: (credentials: UserAuthDetails) => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const InitialState: AuthState = {
  user: null, 
  loading: true, 
  error: null,
  initialAuthCheckComplete: false, 
};

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  console.log('[AuthContextProvider] AuthContextProvider function body executing...'); // ADDED THIS LOG
  const [state, dispatch] = useReducer(authReducer, InitialState);

  useEffect(() => {
    console.log('[AuthContextProvider] useEffect for checkCurrentUser running...'); // ADDED THIS LOG
    const checkCurrentUser = async () => {
      dispatch({ type: "AUTH/INITIAL_AUTH_CHECK_START" });
      try {
        const user = await getCurrentUser(); 
        if (user) {
          dispatch({ type: "AUTH/LOGIN_SUCCESS", payload: user });
        } else {
          dispatch({ type: "AUTH/NO_ACTIVE_SESSION" });
        }
      } catch (error) {
        console.error("Initial auth check failed:", error);
        // Ensure payload is a string for LOGIN_FAILURE
        const errorMessage = error instanceof Error ? error.message : "Auth check failed";
        dispatch({ type: "AUTH/LOGIN_FAILURE", payload: errorMessage });
      }
    };

    // Only run the auth check once when the component mounts
    checkCurrentUser();
  }, []); // Empty dependency array to run only once

  const login = async (credentials: UserAuthDetails): Promise<User | null> => {
    dispatch({ type: "AUTH/LOGIN_REQUEST" });
    try {
      const user = await supabaseSignIn(credentials);
      if (user) {
        // Ensure user profile is synchronized
        if (user.id) {
          await syncUserProfile(user);
        }
        
        dispatch({ type: "AUTH/LOGIN_SUCCESS", payload: user });
        logger.auth.info("Login successful");
        return user;
      }
      // This path might not be hit if supabaseSignIn always throws on error
      dispatch({ type: "AUTH/LOGIN_FAILURE", payload: "Login failed. Please check credentials." });
      return null;
    } catch (error: any) {
      logger.auth.error("Login failed:", error);
      // Standardize error messages from Supabase
      const errorMessage = formatAuthError(error, "Invalid email or password. Please try again.");
      dispatch({ type: "AUTH/LOGIN_FAILURE", payload: errorMessage });
      return null;
    }
  };

  const signup = async (credentials: UserAuthDetails): Promise<User | null> => {
    dispatch({ type: "AUTH/SIGNUP_REQUEST" });
    try {
      const user = await supabaseSignUp(credentials);
      if (user) {
        // Ensure user profile is created after signup
        if (user.id) {
          await syncUserProfile(user);
        }
        
        dispatch({ type: "AUTH/SIGNUP_SUCCESS", payload: user });
        logger.auth.info("Signup successful");
        return user;
      }
      // This path might not be hit if supabaseSignUp always throws on error
      dispatch({ type: "AUTH/SIGNUP_FAILURE", payload: "Signup failed." });
      return null;
    } catch (error: any) {
      logger.auth.error("Signup failed:", error);
      
      // Handle specific case of email already in use
      if (error.message && (
        error.message.toLowerCase().includes('email already registered') ||
        error.message.toLowerCase().includes('already in use') ||
        error.message.toLowerCase().includes('already exists')
      )) {
        const errorMessage = "This email is already registered. Please use a different email or try logging in.";
        dispatch({ type: "AUTH/SIGNUP_FAILURE", payload: errorMessage });
        return null;
      }
      
      // Standardize other error messages from Supabase
      const errorMessage = formatAuthError(error, "Failed to create account. Please try again.");
      dispatch({ type: "AUTH/SIGNUP_FAILURE", payload: errorMessage });
      return null;
    }
  };

  const logout = async () => {
    try {
      await supabaseSignOut();
      dispatch({ type: "AUTH/LOGOUT_SUCCESS" });
      logger.auth.info('User logged out successfully');
    } catch (error: any) {
      logger.auth.error('Logout error', error);
      // Even if logout fails, clear the local state to prevent stuck state
      dispatch({ type: "AUTH/LOGOUT_SUCCESS" });
    }
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be within an AuthContextProvider');
  }
  return context;
}
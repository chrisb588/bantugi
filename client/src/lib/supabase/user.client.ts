import { createBrowserClient } from '@supabase/ssr';
import { AuthError, User, AuthResponse } from '@supabase/supabase-js';
import UserAuthDetails from '@/interfaces/user-auth';

export interface AuthResult {
  user: User | null;
  error?: string;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function signInWithPassword(payload: UserAuthDetails): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) throw error;

    return { user: data.user };
  } catch (error) {
    const authError = error as AuthError;
    console.error("Sign-in error:", authError.message);
    return {
      user: null,
      error: authError.message
    };
  }
}

export async function userSignUp(payload: UserAuthDetails): Promise<AuthResult> {
  try {
    // Get the current origin for the redirect URL
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          email: payload.email,
        }
      }
    });

    if (error) throw error;

    // Check if email confirmation is required
    const needsEmailConfirmation = !data.session;

    return { 
      user: data.user,
      error: needsEmailConfirmation ? 'Please check your email to confirm your registration.' : undefined
    };
  } catch (error) {
    const authError = error as AuthError;
    console.error("Signup error:", authError.message);
    return {
      user: null,
      error: authError.message
    };
  }
}

export async function signOut(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return {};
  } catch (error) {
    const authError = error as AuthError;
    console.error("Sign-out error:", authError.message);
    return { error: authError.message };
  }
}

export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

export async function resetPassword(email: string): Promise<{ error?: string }> {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) throw error;
    return {};
  } catch (error) {
    const authError = error as AuthError;
    console.error("Reset password error:", authError.message);
    return { error: authError.message };
  }
}

// Check if the current URL has an access token (useful after email confirmation)
export async function handleAuthRedirect(): Promise<{ error?: string }> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (session) {
      // Session exists, user is authenticated
      return {};
    } else {
      return { error: 'No active session found' };
    }
  } catch (error) {
    const authError = error as AuthError;
    console.error("Auth redirect error:", authError.message);
    return { error: authError.message };
  }
}

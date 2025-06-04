import { AuthError, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User | null
    session?: any
  }
}

/**
 * Validates user credentials before making auth requests
 */
const validateCredentials = (credentials: AuthCredentials): string | null => {
  const { email, password } = credentials
  
  if (!email || !email.includes('@')) {
    return 'Please provide a valid email address'
  }
  
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters long'
  }
  
  return null
}

export const authService = {
  /**
   * Register a new user with Supabase Auth
   */
  async signUp({ email, password }: AuthCredentials): Promise<AuthResponse> {
    try {
      // Validate input
      const validationError = validateCredentials({ email, password })
      if (validationError) {
        return { success: false, message: validationError }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email: email,
          }
        }
      })

      if (error) throw error

      return {
        success: true,
        message: data.session ? 'Registration successful!' : 'Please check your email to confirm your registration.',
        data: {
          user: data.user,
          session: data.session
        }
      }
    } catch (error) {
      const authError = error as AuthError
      console.error('Registration error:', authError)
      return {
        success: false,
        message: authError.message || 'Registration failed. Please try again.'
      }
    }
  },

  /**
   * Sign in an existing user with Supabase Auth
   */
  async signIn({ email, password }: AuthCredentials): Promise<AuthResponse> {
    try {
      // Validate input
      const validationError = validateCredentials({ email, password })
      if (validationError) {
        return { success: false, message: validationError }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (!data.session) {
        throw new Error('No session created after login')
      }

      return {
        success: true,
        message: 'Login successful!',
        data: {
          user: data.user,
          session: data.session
        }
      }
    } catch (error) {
      const authError = error as AuthError
      console.error('Login error:', authError)
      return {
        success: false,
        message: authError.message || 'Login failed. Please check your credentials.'
      }
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      return {
        success: true,
        message: 'Logged out successfully'
      }
    } catch (error) {
      const authError = error as AuthError
      console.error('Logout error:', authError)
      return {
        success: false,
        message: authError.message || 'Logout failed. Please try again.'
      }
    }
  },

  /**
   * Get the current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Session error:', error)
      return null
    }
  },

  /**
   * Reset password for an email address
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      return {
        success: true,
        message: 'Password reset instructions sent to your email.'
      }
    } catch (error) {
      const authError = error as AuthError
      console.error('Password reset error:', authError)
      return {
        success: false,
        message: authError.message || 'Failed to send reset instructions.'
      }
    }
  }
}

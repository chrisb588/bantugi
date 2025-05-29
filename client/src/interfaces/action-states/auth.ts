import type User from '@/interfaces/user'; // Assuming User interface exists

// AuthResponse can be used for the raw response from API if needed,
// but the state should hold the actual user data or null.
// export interface AuthResponse {
//   success: true,
//   message: string,
//   feedback: string, // jwt token or user object
// }

export interface AuthState {
  user: User | null; // Changed from data: AuthResponse | null
  loading: boolean;
  error: string | null;
  initialAuthCheckComplete: boolean; // Added for tracking initial auth status
}


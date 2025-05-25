export interface AuthResponse {
  success: true,
  message: string,
  feedback: string, // jwt token
}

export interface AuthState {
  data: AuthResponse | null,
  loading: boolean,
  error: string | null,
}


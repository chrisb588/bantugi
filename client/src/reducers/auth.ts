import { AuthState } from '@/interfaces/action-states/auth';
import AuthAction from '@/types/actions/auth';

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH/INITIAL_AUTH_CHECK_START":
      return { ...state, loading: true, error: null, initialAuthCheckComplete: false };
    case "AUTH/LOGIN_REQUEST":
    case "AUTH/SIGNUP_REQUEST":
      return { ...state, loading: true, user: null, error: null }; // Changed data to user
    
    case "AUTH/LOGIN_SUCCESS":
    case "AUTH/SIGNUP_SUCCESS": // Both login and signup success now directly receive User
      return { ...state, loading: false, user: action.payload, error: null, initialAuthCheckComplete: true }; // Changed data to user

    case "AUTH/LOGIN_FAILURE":
    case "AUTH/SIGNUP_FAILURE":
      return { ...state, loading: false, user: null, error: action.payload, initialAuthCheckComplete: true }; // Changed data to user
    
    case "AUTH/LOGOUT_SUCCESS":
      return { ...state, loading: false, user: null, error: null, initialAuthCheckComplete: true }; // Changed data to user
    
    case "AUTH/NO_ACTIVE_SESSION":
      return { ...state, loading: false, user: null, error: null, initialAuthCheckComplete: true }; // Changed data to user

    default:
      return state;
  }
}

export default authReducer;
import { AuthState } from '@/interfaces/action-states/auth';
import AuthAction from '@/types/actions/auth';

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH/SIGNUP_SUCCESS":
      return { ...state, loading: false, data: action.payload, error: null };
    case "AUTH/SIGNUP_FAILURE":
      return { ...state, loading: false, data: null, error: action.payload };
    case "AUTH/SIGNUP_REQUEST":
      return { ...state, loading: true, data: null, error: null };
    case "AUTH/LOGIN_SUCCESS":
      return { ...state, loading: false, data: action.payload, error: null };
    case "AUTH/LOGIN_FAILURE":
      return { ...state, loading: false, data: null, error: action.payload };
    case "AUTH/LOGIN_REQUEST":
      return { ...state, loading: true, data: null, error: null };
    default:
      return state;
  }
}

export default authReducer;
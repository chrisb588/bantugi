import type User from '@/interfaces/user'; // Assuming User interface exists

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

export default AuthAction;
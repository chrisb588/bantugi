import { SignupResponse } from "@/interfaces/action-states/auth";

type AuthAction = 
  | { type: "AUTH/SIGNUP_SUCCESS", payload: SignupResponse }
  | { type: "AUTH/SIGNUP_FAILURE", payload: string }
  | { type: "AUTH/SIGNUP_REQUEST" }
  | { type: "AUTH/LOGIN_SUCCESS", payload: SignupResponse }
  | { type: "AUTH/LOGIN_FAILURE", payload: string }
  | { type: "AUTH/LOGIN_REQUEST" };

export default AuthAction;
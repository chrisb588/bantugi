import axios from 'axios';

import { useAuthContext } from '@/context/auth-context';

const url = process.env.URL;

export const useSignup = () => {
  const { dispatch } = useAuthContext();

  const signup = async () => {
    dispatch({ type: "AUTH/SIGNUP_REQUEST" });

    try {
      const response = await axios.post(`${url}/auth/signup`,)

      dispatch({ type: "AUTH/SIGNUP_SUCCESS", payload: response.data });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        dispatch({ type: "AUTH/SIGNUP_FAILURE", payload: error.response.data.error });
      } else {
        dispatch({ type: "AUTH/SIGNUP_FAILURE", payload: (error as Error).message });
      }
    }
  }

  return signup;
}

export const useLogin = () => {
  const { dispatch } = useAuthContext();

  const login = async () => {
    dispatch({ type: "AUTH/LOGIN_REQUEST" });

    try {
      const response = await axios.post(`${url}/auth/login`,)

      dispatch({ type: "AUTH/LOGIN_SUCCESS", payload: response.data });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        dispatch({ type: "AUTH/LOGIN_FAILURE", payload: error.response.data.error });
      } else {
        dispatch({ type: "AUTH/LOGIN_FAILURE", payload: (error as Error).message });
      }
    }
  }

  return login;
}
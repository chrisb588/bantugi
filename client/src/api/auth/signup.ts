import axios from 'axios';

import { useAuthContext } from '@/context/auth-context';

const url = '';

const useSignup = () => {
  const { dispatch } = useAuthContext();

  const signup = async () => {
    dispatch({ type: "AUTH/SIGNUP_REQUEST" });

    try {
        const response = await axios.post(`${url}/auth/signup`);

        dispatch({ type: "AUTH/SIGNUP_SUCCESS", payload: response.data });
    } catch (error) {
        // Narrow the type of error
        if (axios.isAxiosError(error)) {
            // Handle Axios-specific error
            dispatch({ type: "AUTH/SIGNUP_FAILURE", payload: error.response ? error.response.data.error : error.message });
        } else {
            // Handle non-Axios errors
            dispatch({ type: "AUTH/SIGNUP_FAILURE", payload: String(error) });
        }
    }
};

  return signup;
}

export default useSignup;
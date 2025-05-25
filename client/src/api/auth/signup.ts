import axios from 'axios';

import { useAuthContext } from '@/context/auth-context';

const url = '';

const useSignup = () => {
  const { dispatch } = useAuthContext();

  const signup = async () => {
    dispatch({ type: "AUTH/SIGNUP_REQUEST" });

    try {
      const response = await axios.post(`${url}/auth/signup`,)

      dispatch({ type: "AUTH/SIGNUP_SUCCESS", payload: response.data });
    } catch (error) {
      dispatch({ type: "AUTH/SIGNUP_FAILURE", payload: error.response ? error.response.data.error : error.message });
    }
  }

  return signup;
}

export default useSignup;
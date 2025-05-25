import axios from 'axios';

const url = '';

const useSignup = () => {
  const { dispatch } = useSignupContext();

  const signup = async () => {
    dispatch({ type: "SIGNUP_LOADING" });

    try {
      const response = await axios.post(`${url}/auth/signup`,)

      dispatch({ type: "SIGNUP_SUCCESS", payload: response.data });
    } catch (error) {
      dispatch({ type: "SIGNUP_FAILURE", payload: error.response ? error.response.data.error : error.message });
    }
  }

  return signup;
}

export default useSignup;
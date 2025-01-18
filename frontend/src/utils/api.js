import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Include credentials in cross-origin requests
});

console.log('API URL:', process.env.REACT_APP_API_URL);
axios.interceptors.response.use(
  (response) => {
    // Return the response data directly (as you're expecting data from the server)
    return response.data;
  },
  (error) => {
    // If the error is due to unauthorized access (401), handle the logout
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login'; // Redirect user to login page
    }

    // Extract error message from the response data if present, or default to 'Something went wrong'
    const errorMessage = error.response?.data?.message || 'Something went wrong';

    // Reject with the error message
    return Promise.reject(errorMessage);
  }
);

export const signUpUser = async (credentials) => {
 return api.post('/signup', credentials);
};


export const getUserProfile = async () => {
  // Get the auth token from localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    // If no token, redirect to login
    window.location.href = '/login';
    return;
  }

  // Make the request with Authorization header
  try {
    const response = await api.get('/user', {
      headers: {
        'Authorization': `Bearer ${token}`, // Pass the token in Authorization header
      },
    });

    // Return the response data (user profile)
    return response;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};




export default api;

import axios from 'axios';

// Replace with your actual deployed Vercel URL
const BASE_URL = 'https://catatboros.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for cookie-based sessions
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Response interceptor for handling 401s (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Session expired or unauthorized');
      // In a real app, you might trigger a global log-out action here
    }
    return Promise.reject(error);
  }
);

export default api;

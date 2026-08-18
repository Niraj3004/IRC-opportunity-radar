import axios from 'axios';

// The base URL should be configured via environment variables
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // Necessary if sending cookies
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 and Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        // The backend should read the HTTPOnly refresh token cookie
        const res = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
          withCredentials: true 
        });

        const newToken = res.data.data?.accessToken;
        
        if (newToken) {
          localStorage.setItem('token', newToken);
          // Update the failed request with the new token and retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed (e.g. refresh token expired)
        console.error('Session expired. Logging out.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on the login page to avoid loops
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

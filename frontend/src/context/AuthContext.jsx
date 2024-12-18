import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create separate axios instances for different servers
const authAxios = axios.create({
  baseURL: 'http://localhost:4000', // Authentication server
  withCredentials: true
});

const mainAxios = axios.create({
  baseURL: 'http://localhost:3000', // Main application server
  withCredentials: true
});

// Create the AuthContext first
const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Function to fetch the current user on page load
  const initializeUser = async () => {
    try {
      const response = await authAxios.post('/auth/session');
      setUser(response.data.id);
      setAccessToken(response.data.access_token);
      localStorage.setItem('accessToken', response.data.access_token);
    } catch (error) {
      console.error('Failed to initialize user session:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  // Function to login
  const login = async (credentials) => {
    try {
      const response = await authAxios.post('/auth/login', credentials);
      setUser(response.data.id);
      setAccessToken(response.data.access_token);
      localStorage.setItem('accessToken', response.data.access_token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Function to signup
  const signup = async (credentials) => {
    try {
      const response = await authAxios.post('/auth/register', credentials);
      setUser(response.data.id);
      setAccessToken(response.data.access_token);
      localStorage.setItem('accessToken', response.data.access_token);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  // Function to logout
  const logout = async () => {
    try {
      await authAxios.delete('/auth/logout');
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Axios interceptor to add access token to requests and handle token expiration
  useEffect(() => {
    const requestInterceptor = mainAxios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          config.headers['Authorization'] = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = mainAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle token expiration
        if (error.response?.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshResponse = await authAxios.post('/auth/refreshToken');
            const newAccessToken = refreshResponse.data.access_token;

            setAccessToken(newAccessToken);
            localStorage.setItem('accessToken', newAccessToken); // Update the token in localStorage

            // Retry the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return mainAxios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      mainAxios.interceptors.request.eject(requestInterceptor);
      mainAxios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

  // Value to be passed to the context
  const value = {
    user,
    login,
    logout,
    signup,
    isAuthenticated: !!user,
    // Expose axios instances for components that might need them
    authAxios,
    mainAxios
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the axios instances for direct use if needed
export { authAxios, mainAxios };

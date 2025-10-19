import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import useSocket from '../hooks/useSocket.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  // Initialize socket with user ID
  useSocket(window.location.origin, user?.id);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  // Setup interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const response = await axios.post('/api/auth/refresh', { refreshToken });
            const { token: newToken, refreshToken: newRefreshToken } = response.data;
            
            // Update tokens in state and localStorage
            setToken(newToken);
            setRefreshToken(newRefreshToken);
            localStorage.setItem('token', newToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // Update axios default header
            axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            
            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // If refresh fails, logout the user
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptor
    return () => axios.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      // Call logout endpoint if we have a token
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      // Ignore errors during logout
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  const value = useMemo(() => ({ token, refreshToken, user, login, logout }), [token, refreshToken, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isGuest, setIsGuest] = useState(false);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const guestUser = localStorage.getItem('guestUser');
      
      if (token) {
        try {
          const response = await axios.get(`${API}/me`);
          setUser(response.data);
          setIsGuest(false);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          // Check for guest user fallback
          if (guestUser) {
            setUser(JSON.parse(guestUser));
            setIsGuest(true);
          }
        }
      } else if (guestUser) {
        setUser(JSON.parse(guestUser));
        setIsGuest(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const loginAsGuest = async (username) => {
    try {
      const guestUser = {
        id: 'guest-' + Date.now(),
        username: username,
        email: `${username}@guest.local`,
        avatar: '🦸‍♂️',
        level: 'Beginner',
        total_projects: 0,
        completed_projects: 0,
        badges: [],
        is_guest: true,
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem('guestUser', JSON.stringify(guestUser));
      setUser(guestUser);
      setIsGuest(true);
      
      return { success: true, user: guestUser };
    } catch (error) {
      console.error('Guest login failed:', error);
      return { 
        success: false, 
        error: 'Failed to create guest account' 
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/login`, { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      setIsGuest(false);
      
      // Clear guest data if exists
      localStorage.removeItem('guestUser');
      localStorage.removeItem('guestProjects');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password, avatar = '🦸‍♂️') => {
    try {
      const response = await axios.post(`${API}/register`, {
        username,
        email,
        password,
        avatar
      });
      
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guestUser');
    localStorage.removeItem('guestProjects');
    setToken(null);
    setUser(null);
    setIsGuest(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const upgradeToRegistered = async (email, password) => {
    if (!isGuest) return { success: false, error: 'Not a guest user' };
    
    try {
      const response = await axios.post(`${API}/register`, {
        username: user.username,
        email,
        password,
        avatar: user.avatar
      });
      
      // If successful, login with new account
      const loginResult = await login(email, password);
      
      if (loginResult.success) {
        // Transfer guest data to registered account
        const guestProjects = JSON.parse(localStorage.getItem('guestProjects') || '[]');
        // Here you would typically transfer the guest projects to the backend
        
        localStorage.removeItem('guestUser');
        localStorage.removeItem('guestProjects');
        
        return { success: true, user: loginResult.user };
      }
      
      return loginResult;
    } catch (error) {
      console.error('Upgrade to registered failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Upgrade failed' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    loginAsGuest,
    logout,
    upgradeToRegistered,
    loading,
    isAuthenticated: !!user,
    isGuest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
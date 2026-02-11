import { createContext, useContext, useState, useEffect } from 'react';
import socketService from '../services/socketService';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Connect socket when user is authenticated
    if (user?.user_id) {
      socketService.connect(user.user_id);
    }
    
    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API}/auth/me`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Connect socket immediately on login
    socketService.connect(userData.user_id);
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      socketService.disconnect();
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

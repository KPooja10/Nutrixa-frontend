import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authenticate current storage details
  useEffect(() => {
    const savedToken = localStorage.getItem('ponis_token');
    const savedUser = localStorage.getItem('ponis_user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Invalid token or user values logged.', err);
        localStorage.removeItem('ponis_token');
        localStorage.removeItem('ponis_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await api.auth.login(username, password);
      localStorage.setItem('ponis_token', data.token);
      localStorage.setItem('ponis_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ponis_token');
    localStorage.removeItem('ponis_user');
    setUser(null);
  };

  const register = async (username, password, role) => {
    setLoading(true);
    try {
      return await api.auth.register(username, password, role);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isDoctor: user?.role === 'doctor'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be executed within an AuthProvider.');
  }
  return context;
}

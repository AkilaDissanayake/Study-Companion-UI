// src/context/AuthContext.jsx
/**
 * @file AuthContext.jsx
 * @description Global state manager for user authentication. 
 * Wraps the application to provide user ID, name, and login/logout methods 
 * without needing to pass props down through multiple components.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
export function AuthProvider({ children }) {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');
  const [isLoading, setIsLoading] = useState(true); // Helps prevent flashing the login screen

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await api.checkAuthSession();
        setUserId(data.user_id);
      } catch (err) {
        console.log("No active session found.");
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  /**
   * Updates the global state after a successful Google login.
   * @param {string} id - The unique user ID from the backend.
   * @param {string} name - The user's display name from Google.
   */
  const login = (id, name) => {
    setUserId(id);
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  const logout = async () => {
    try {
      await api.logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setUserId('');
    setUserName('User');
    localStorage.removeItem('userName');
  };

  // The data and functions we want to make globally available
  const value = {
    userId,
    userName,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Create a Custom Hook for easy access
/**
 * Custom Hook: useAuth
 * @description A shortcut hook so components don't have to import useContext and AuthContext separately.
 * @example const { userName, logout } = useAuth();
 */
export function useAuth() {
  return useContext(AuthContext);
}
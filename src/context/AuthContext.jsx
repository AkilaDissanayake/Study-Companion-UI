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
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Helps prevent flashing the login screen

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await api.checkAuthSession();
        setUserId(data.user_id);
        if (data.email) setUserEmail(data.email);
        if (data.name) {
          setUserName(data.name);
          localStorage.setItem('userName', data.name);
        }
      } catch (err) {

        console.log("No active session found.");
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  /**
   * Updates the global state after a successful login (Google or email/password).
   * @param {string} id - The unique user ID from the backend.
   * @param {string} name - The user's display name.
   * @param {string} [email] - The user's email address, when available.
   */
  const login = (id, name, email = '') => {
    setUserId(id);
    setUserName(name);
    setUserEmail(email);
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
    setUserEmail('');
    localStorage.removeItem('userName');
  };

  /**
   * Purely-local session reset, used when the backend has already told us
   * the session is dead (401/403) — unlike logout(), this never calls the
   * backend, avoiding a redundant (and itself 401-prone) network round-trip.
   */
  const clearSession = () => {
    setUserId('');
    setUserName('User');
    setUserEmail('');
    localStorage.removeItem('userName');
  };

  // The data and functions we want to make globally available
  const value = {
    userId,
    userName,
    userEmail,
    isLoading,
    login,
    logout,
    clearSession
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
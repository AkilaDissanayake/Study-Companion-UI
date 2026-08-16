// src/components/ProtectedRoute.jsx
/**
 * @file ProtectedRoute.jsx
 * @description Route guard for authenticated-only pages (/setup, /dashboard).
 * Redirects to /login while the session check is resolving would flash the
 * login screen, so it waits for AuthContext's isLoading to settle first.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { userId, isLoading } = useAuth();

  if (isLoading) {
    return <div className="center-wrapper">Loading...</div>;
  }

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

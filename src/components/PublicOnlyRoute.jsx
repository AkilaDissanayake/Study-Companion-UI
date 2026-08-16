// src/components/PublicOnlyRoute.jsx
/**
 * @file PublicOnlyRoute.jsx
 * @description Wraps unauthenticated-only pages (/login, /signup, ...) so an
 * already-logged-in user is redirected straight to /dashboard instead of
 * seeing the login/signup form again.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicOnlyRoute({ children }) {
  const { userId, isLoading } = useAuth();

  if (isLoading) {
    return <div className="center-wrapper">Loading...</div>;
  }

  if (userId) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

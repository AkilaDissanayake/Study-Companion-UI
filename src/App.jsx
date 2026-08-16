/**
 * @file App.jsx
 * @description Root application component. Responsible ONLY for:
 *  1. Declaring the route table (public auth pages vs protected pages)
 *  2. Wiring the api.js 401/403 bridge into the notification + auth context
 *
 * All auth business logic (Google callback, email/password login, signup,
 * verification, password reset) lives in the relevant page component.
 */

import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { useAuth } from './context/AuthContext';
import { useNotify } from './context/NotificationContext';
import * as api from './services/api';

function App() {
  const { userId, clearSession } = useAuth();
  const notify = useNotify();

  // Dedupes a burst of concurrent 401s (from several in-flight requests) down
  // to a single "session expired" toast, instead of one per request.
  const hasHandledExpiryRef = useRef(false);

  // A fresh login re-arms the 401 guard so a later session expiry can toast again.
  useEffect(() => {
    if (userId) hasHandledExpiryRef.current = false;
  }, [userId]);

  // One-time bridge: api.js is a plain module with no React context access,
  // so it calls back into this handler (registered once here) whenever any
  // request comes back 401/403.
  useEffect(() => {
    api.registerApiHandlers({
      onUnauthorized: () => {
        if (hasHandledExpiryRef.current) return;
        hasHandledExpiryRef.current = true;
        notify.warning('Session expired. Please log in again.');
        clearSession();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
      {/* Verify-email must work whether or not the user happens to be logged in elsewhere. */}
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

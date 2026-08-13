/**
 * @file App.jsx
 * @description Root application component. Responsible ONLY for:
 *  1. Reading auth state from context
 *  2. Routing between Login, Setup, and Dashboard views
 *  3. Handling the Google OAuth callback
 *
 * All business logic (file management, settings, chat) lives in the relevant
 * page/component or custom hook.
 */

import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import { useAuth } from './context/AuthContext';
import * as api from './services/api';

/** Decodes the name claim from a Google JWT without any library. */
function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return { name: 'User' };
  }
}

function App() {
  const { userId, isLoading, login } = useAuth();

  const [view, setView] = useState('login');
  const [showPopup, setShowPopup] = useState(false);

  // Redirect to dashboard once the auth context resolves a session
  useEffect(() => {
    if (userId) {
      setView('dashboard');
    } else if (!isLoading) {
      setView('login');
    }
  }, [userId, isLoading]);

  const handleGoogleSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;
    const decodedName = decodeJwt(googleToken).name || 'User';

    try {
      const payload = await api.loginWithGoogle(googleToken);

      login(payload.user_id, decodedName);

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);

      if (!payload.config?.language) {
        setView('setup');
      } else {
        document.documentElement.setAttribute('data-theme', payload.config.theme || 'light');
        setView('dashboard');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('Failed to log in. Please try again.');
    }
  };

  // Prevent flashing the login screen while the session check is in-flight
  if (isLoading) {
    return <div className="center-wrapper">Loading...</div>;
  }

  if (view === 'login') {
    return <Login onLoginSuccess={handleGoogleSuccess} />;
  }

  if (view === 'setup') {
    return (
      <Setup
        showPopup={showPopup}
        onSetupComplete={() => setView('dashboard')}
      />
    );
  }

  return <Dashboard showPopup={showPopup} />;
}

export default App;
/**
 * @file Login.jsx
 * @description The unauthenticated landing page. 
 * Houses the Google Sign-In button and handles the Google OAuth provider wrapper.
 */
import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function Login({ onLoginSuccess }) {
  // Grab the client ID safely from your environment file
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="center-wrapper">
      <div className="card">
        <h2>Study Companion</h2>
        <p>Please sign in to continue.</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleLogin onSuccess={onLoginSuccess} />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
}
/**
 * @file Login.jsx
 * @description The unauthenticated landing page. Owns both sign-in paths:
 * the Google Sign-In button and an email/password form, plus links to
 * signup and the forgot-password flow.
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import heroImage from '../assets/hero.png';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';
import * as api from '../services/api';

/** Decodes the name claim from a Google JWT without any library. */
function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return { name: 'User' };
  }
}

export default function Login() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const navigate = useNavigate();
  const { login } = useAuth();
  const notify = useNotify();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Both login paths land here: onboarding (Setup) if the account has no
  // saved language preference yet, otherwise straight to the dashboard.
  const goToNextScreen = (config) => {
    const target = config?.language ? '/dashboard' : '/setup';
    navigate(target, { replace: true, state: { showPopup: true } });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;
    const decodedName = decodeJwt(googleToken).name || 'User';

    try {
      const payload = await api.loginWithGoogle(googleToken);
      login(payload.user_id, payload.name || decodedName, payload.email);
      goToNextScreen(payload.config);
    } catch (error) {
      console.error('Login Error:', error);
      notify.error(error.message || 'Failed to log in. Please try again.');
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = await api.loginWithPassword({ email, password });
      login(payload.user_id, payload.name, payload.email);
      goToNextScreen(payload.config);
    } catch (error) {
      notify.error(error.message || 'Failed to log in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-branding">
        <div className="auth-branding-glow" />
        <img src={heroImage} alt="" className="auth-branding-hero" />
        <div className="auth-branding-copy">
          <h1 style={{ color: '#ffffff', fontSize: 'var(--font-size-h1)' }}>Study Companion</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '320px', margin: 'var(--space-2) auto 0' }}>
            A calm, focused space to study — AI tutoring, smart quizzes, and all your materials in one place.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="card" style={{ width: '380px' }}>
          <h2>Welcome back</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Sign in to continue to your workspace.
          </p>

          <form onSubmit={handlePasswordLogin} style={{ marginTop: 'var(--space-6)', textAlign: 'left' }}>
            <label style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ marginTop: 'var(--space-1)', marginBottom: 'var(--space-4)' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-primary-500)' }}>
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ marginTop: 'var(--space-1)' }}
            />

            <Button type="submit" fullWidth isLoading={isSubmitting} style={{ marginTop: 'var(--space-5)' }}>
              Sign in
            </Button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: 'var(--space-5) 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-tertiary)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin onSuccess={handleGoogleSuccess} />
            </GoogleOAuthProvider>
          </div>

          <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--color-primary-500)', fontWeight: 600 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

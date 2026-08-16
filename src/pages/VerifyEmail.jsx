/**
 * @file VerifyEmail.jsx
 * @description Confirms an email address using the token from the
 * verification email (?token= in the URL), fired once on mount.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import Button from '../components/ui/Button';
import * as api from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // 'verifying' | 'success' | 'error' — starts as 'error' when there's no
  // token at all, so no setState-in-effect is needed for that branch.
  const [status, setStatus] = useState(token ? 'verifying' : 'error');
  const [errorMessage, setErrorMessage] = useState(token ? '' : 'This verification link is missing its token.');
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!token || hasRunRef.current) return;
    hasRunRef.current = true;

    api
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((error) => {
        setStatus('error');
        setErrorMessage(error.message || 'This verification link is invalid or has expired.');
      });
  }, [token]);

  return (
    <div className="auth-shell">
      <div className="auth-branding">
        <div className="auth-branding-glow" />
        <img src={heroImage} alt="" className="auth-branding-hero" />
        <div className="auth-branding-copy">
          <h1 style={{ color: '#ffffff', fontSize: 'var(--font-size-h1)' }}>Study Companion</h1>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="card" style={{ width: '380px' }}>
          {status === 'verifying' && (
            <>
              <h2>Verifying your email…</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>One moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h2>Email verified</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                Your account is ready. You can now sign in.
              </p>
              <Link to="/login">
                <Button fullWidth style={{ marginTop: 'var(--space-6)' }}>
                  Go to sign in
                </Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h2>Verification failed</h2>
              <p style={{ color: 'var(--color-danger)', marginTop: 'var(--space-2)' }}>{errorMessage}</p>
              <Link to="/login">
                <Button fullWidth style={{ marginTop: 'var(--space-6)' }}>
                  Back to sign in
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

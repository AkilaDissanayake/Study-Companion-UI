/**
 * @file ForgotPassword.jsx
 * @description Requests a password reset email. Always shows the same
 * generic confirmation regardless of whether the email is registered —
 * the backend intentionally never reveals that (see /auth/forgot-password).
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNotify } from '../context/NotificationContext';
import * as api from '../services/api';

export default function ForgotPassword() {
  const notify = useNotify();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.requestPasswordReset(email);
      setSubmitted(true);
    } catch (error) {
      notify.error(error.message || 'Something went wrong. Please try again.');
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
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="card" style={{ width: '380px' }}>
          {submitted ? (
            <>
              <h2>Check your email</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                If an account with that email exists, we've sent a link to reset your password.
              </p>
            </>
          ) : (
            <>
              <h2>Forgot your password?</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                Enter your email and we'll send you a link to reset it.
              </p>

              <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-6)', textAlign: 'left' }}>
                <label style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{ marginTop: 'var(--space-1)' }}
                />

                <Button type="submit" fullWidth isLoading={isSubmitting} style={{ marginTop: 'var(--space-5)' }}>
                  Send reset link
                </Button>
              </form>
            </>
          )}

          <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
            <Link to="/login" style={{ color: 'var(--color-primary-500)', fontWeight: 600 }}>
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

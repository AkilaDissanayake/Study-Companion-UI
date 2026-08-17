/**
 * @file ResetPassword.jsx
 * @description Sets a new password using the single-use token from the
 * password-reset email (?token= in the URL).
 */
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNotify } from '../context/NotificationContext';
import * as api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const notify = useNotify();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      notify.error("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      notify.error('Password must be at least 8 characters.');
      return;
    }
    if (!token) {
      notify.error('This reset link is missing its token.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.resetPassword({ token, newPassword });
      notify.success('Password reset successfully. Please sign in.');
      navigate('/login', { replace: true });
    } catch (error) {
      notify.error(error.message || 'This reset link is invalid or has expired.');
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
          <h1 style={{ color: 'var(--color-on-primary)', fontSize: 'var(--font-size-h1)' }}>Study Companion</h1>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="card" style={{ width: '380px' }}>
          <h2>Choose a new password</h2>

          {!token ? (
            <p style={{ color: 'var(--color-danger)', marginTop: 'var(--space-2)' }}>
              This reset link is missing its token. Please request a new one.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-6)', textAlign: 'left' }}>
              <label style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                New password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                style={{ marginTop: 'var(--space-1)', marginBottom: 'var(--space-4)' }}
              />

              <label style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Confirm new password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                style={{ marginTop: 'var(--space-1)' }}
              />

              <Button type="submit" fullWidth isLoading={isSubmitting} style={{ marginTop: 'var(--space-5)' }}>
                Reset password
              </Button>
            </form>
          )}

          <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
            <Link to="/forgot-password" style={{ color: 'var(--color-primary-500)', fontWeight: 600 }}>
              Request a new link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

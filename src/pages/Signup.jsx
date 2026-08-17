/**
 * @file Signup.jsx
 * @description Email/password account creation. On success the account is
 * NOT logged in yet — the backend requires email verification first — so
 * this shows a "check your email" confirmation instead of redirecting.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import heroImage from '../assets/hero.png';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNotify } from '../context/NotificationContext';
import * as api from '../services/api';

export default function Signup() {
  const notify = useNotify();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      notify.error("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      notify.error('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.signup({ name, email, password });
      setSubmittedEmail(email);
    } catch (error) {
      notify.error(error.message || 'Failed to create account. Please try again.');
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
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '320px', margin: 'var(--space-2) auto 0' }}>
            A calm, focused space to study — AI tutoring, smart quizzes, and all your materials in one place.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="card" style={{ width: '380px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            title="Back to sign in"
            style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)', padding: '6px' }}
          >
            <ArrowLeft size={18} />
          </Button>

          {submittedEmail ? (
            <>
              <h2>Check your email</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                We sent a verification link to <strong>{submittedEmail}</strong>. Click it to activate your
                account, then come back and sign in.
              </p>
              <Link to="/login">
                <Button fullWidth style={{ marginTop: 'var(--space-6)' }}>
                  Back to sign in
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h2>Create your account</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                Start your Study Companion workspace.
              </p>

              <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-6)', textAlign: 'left' }}>
                <label style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  style={{ marginTop: 'var(--space-1)', marginBottom: 'var(--space-4)' }}
                />

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

                <label style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  style={{ marginTop: 'var(--space-1)', marginBottom: 'var(--space-4)' }}
                />

                <label style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Confirm password
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
                  Sign up
                </Button>
              </form>

              <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--color-primary-500)', fontWeight: 600 }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

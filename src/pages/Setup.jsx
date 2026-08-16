/**
 * @file Setup.jsx
 * @description Onboarding screen shown once, right after a new account is created.
 * Owns its own theme/language state via useSettings hook and navigates to
 * /dashboard when the user saves or skips.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Sun, Moon } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import heroImage from '../assets/hero.png';
import Button from '../components/ui/Button';
import OptionCard from '../components/ui/OptionCard';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light Mode', icon: <Sun size={18} /> },
  { value: 'dark', label: 'Dark Mode', icon: <Moon size={18} /> },
];

const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'sinhala', label: 'Sinhala' },
  { value: 'tamil', label: 'Tamil' },
];

export default function Setup() {
  const { theme, setTheme, language, setLanguage, handleSavePreferences } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Briefly shows the "Login Successful" overlay when arriving here right
  // after signing in (see Login.jsx's navigate(..., { state: { showPopup: true } })).
  const [showPopup, setShowPopup] = useState(!!location.state?.showPopup);
  useEffect(() => {
    if (!showPopup) return;
    const timer = setTimeout(() => setShowPopup(false), 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (isSkip) => {
    const success = await handleSavePreferences(isSkip);
    if (success) navigate('/dashboard', { replace: true });
  };

  return (
    <div className="auth-shell">
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">✓ Login Successful!</div>
        </div>
      )}

      <div className="auth-branding">
        <div className="auth-branding-glow" />
        <img src={heroImage} alt="" className="auth-branding-hero" />
        <div className="auth-branding-copy">
          <h1 style={{ color: '#ffffff', fontSize: 'var(--font-size-h1)' }}>Let's set things up</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '320px', margin: 'var(--space-2) auto 0' }}>
            A couple of quick preferences to make Study Companion feel like yours.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="card" style={{ width: '440px', textAlign: 'left' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSave(true)}
            title="Skip Setup"
            style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', padding: '6px' }}
          >
            <X size={18} />
          </Button>

          <h2 style={{ textAlign: 'center' }}>Workspace Setup</h2>
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: 'var(--space-1)' }}>
            Choose your preferences — you can always change these later in Settings.
          </p>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <label style={{ fontWeight: 600, fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
              Theme
            </label>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <OptionCard.Group value={theme} onChange={setTheme} options={THEME_OPTIONS} columns={2} />
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-5)' }}>
            <label style={{ fontWeight: 600, fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
              Language
            </label>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <OptionCard.Group value={language} onChange={setLanguage} options={LANGUAGE_OPTIONS} columns={3} />
            </div>
          </div>

          <Button fullWidth style={{ marginTop: 'var(--space-6)' }} onClick={() => handleSave(false)}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * @file SettingsTab.jsx
 * @description Allows the user to view their profile and update UI preferences
 * like Theme (Light/Dark) and Language.
 */
import React, { useState } from 'react';
import { Sun, Moon, Check, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from './ui/Card';
import Button from './ui/Button';
import OptionCard from './ui/OptionCard';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light Mode', icon: <Sun size={18} /> },
  { value: 'dark', label: 'Dark Mode', icon: <Moon size={18} /> },
];

const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'sinhala', label: 'Sinhala' },
  { value: 'tamil', label: 'Tamil' },
];

export default function SettingsTab({
  theme, setTheme, language, setLanguage, handleSavePreferences
}) {
  const { userName, userId, logout } = useAuth();
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    const success = await handleSavePreferences(false);
    if (success) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }
  };

  return (
    <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2>Account Settings</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Update your workspace preferences.
        </p>
      </div>

      <Card>
        <h3>Profile</h3>
        <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Name</span>
            <span style={{ fontWeight: 600 }}>{userName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>User ID</span>
            <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-tertiary)' }}>{userId}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h3>Preferences</h3>

        <div style={{ marginTop: 'var(--space-4)' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <Button onClick={handleSave}>Save Changes</Button>
          {justSaved && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                color: 'var(--color-success)',
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: 600,
              }}
            >
              <Check size={16} /> Saved
            </span>
          )}
        </div>
      </Card>

      <Card>
        <h3>Account</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)', marginTop: 'var(--space-1)' }}>
          Sign out of Study Companion on this device.
        </p>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Button variant="danger-secondary" iconLeft={<LogOut size={16} />} onClick={logout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}

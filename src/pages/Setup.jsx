/**
 * @file Setup.jsx
 * @description Onboarding screen shown once, right after a new account is created.
 * Owns its own theme/language state via useSettings hook and calls onSetupComplete
 * when the user saves or skips.
 */

import React from 'react';
import { useSettings } from '../hooks/useSettings';

export default function Setup({ showPopup, onSetupComplete }) {
  const { theme, setTheme, language, setLanguage, handleSavePreferences } = useSettings();

  const handleSave = async (isSkip) => {
    await handleSavePreferences(isSkip);
    onSetupComplete();
  };

  return (
    <div className="center-wrapper">
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">✓ Login Successful!</div>
        </div>
      )}

      <div className="card">
        <button className="close-btn" onClick={() => handleSave(true)} title="Skip Setup">
          ✖
        </button>
        <h2>Workspace Setup</h2>
        <p>Choose your preferences.</p>

        <div style={{ textAlign: 'left', marginTop: '15px' }}>
          <label>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>

          <label style={{ display: 'block', marginTop: '15px' }}>Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="english">English</option>
            <option value="sinhala">Sinhala</option>
            <option value="tamil">Tamil</option>
          </select>
        </div>

        <button onClick={() => handleSave(false)} style={{ marginTop: '20px' }}>
          Save Preferences
        </button>
      </div>
    </div>
  );
}
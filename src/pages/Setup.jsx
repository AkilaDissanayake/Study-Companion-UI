/**
 * @file Setup.jsx
 * @description The initial onboarding screen shown to users right after they 
 * create an account for the first time, asking them for basic preferences.
 */
import React from 'react';

export default function Setup({ theme, setTheme, language, setLanguage, onSave, showPopup }) {
  return (
    <div className="center-wrapper">
      {showPopup && <div className="popup-overlay"><div className="popup-card">✓ Login Successful!</div></div>}

      <div className="card">
        <button className="close-btn" onClick={() => onSave(true)} title="Skip Setup">✖</button>
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
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
          </select>
        </div>
        <button onClick={() => onSave(false)} style={{ marginTop: '20px' }}>Save Preferences</button>
      </div>
    </div>
  );
}
/**
 * @file SettingsTab.jsx
 * @description Allows the user to view their profile and update UI preferences 
 * like Theme (Light/Dark) and Language.
 */
import React from 'react';
import { useAuth } from '../context/AuthContext'; // 1. Import the hook

export default function SettingsTab({ 
  theme, setTheme, language, setLanguage, handleSavePreferences 
}) {
  // 2. Grab the user data directly from the global context
  const { userName, userId, logout } = useAuth(); 

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2>Account Settings</h2>
      <p style={{ color: '#666' }}>Update your workspace preferences.</p>
      
      <div style={{ backgroundColor: 'var(--container-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <p><b>Name:</b> {userName}</p>
        <p><b>User ID:</b> <span style={{ fontSize: '0.9em', color: '#666' }}>{userId}</span></p>
        <hr style={{ borderColor: 'var(--border-color)', margin: '20px 0' }}/>
        
        <label style={{ fontWeight: 'bold' }}>Theme:</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ marginBottom: '15px' }}>
          <option value="light">Light Mode</option>
          <option value="dark">Dark Mode</option>
        </select>

        <label style={{ fontWeight: 'bold', display: 'block' }}>Language:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="english">English</option>
          <option value="spanish">Spanish</option>
          <option value="french">French</option>
        </select>
        
        <button onClick={() => { handleSavePreferences(false); alert("Settings updated successfully!"); }} style={{ backgroundColor: 'var(--primary)', marginTop: '20px' }}>
          Save Changes
        </button>

        <hr style={{ borderColor: 'var(--border-color)', margin: '30px 0 20px 0' }}/>
        
        {/* 3. Use the logout function from context */}
        <button onClick={logout} style={{ backgroundColor: '#dc3545', width: 'auto', padding: '10px 30px' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
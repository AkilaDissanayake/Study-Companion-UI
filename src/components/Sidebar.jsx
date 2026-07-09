/**
 * @file Sidebar.jsx
 * @description The main left-hand navigation menu for the dashboard.
 * Controls which tab is currently active and visible to the user.
 */

import React from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="sidebar">
      <h2>Study Companion</h2>
      <ul>
        <li 
          className={activeTab === 'upload' ? 'active' : ''} 
          onClick={() => setActiveTab('upload')}
        >
          File Upload
        </li>
        <li 
          className={activeTab === 'files' ? 'active' : ''} 
          onClick={() => setActiveTab('files')}
        >
          My Files
        </li>
        <li 
          className={activeTab === 'settings' ? 'active' : ''} 
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </li>
      </ul>
    </div>
  );
}
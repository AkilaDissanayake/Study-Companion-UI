/**
 * @file Sidebar.jsx
 * @description The main left-hand navigation menu for the dashboard.
 * Controls which tab is currently active and visible to the user.
 */

import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  return (

    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2>Study Companion</h2>}
        
        <button 
          className="toggle-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '☰' : '☰'} 
        </button>
</div>
    
      <ul>
        <li 
          className={`p-2 rounded cursor-pointer transition-colors ${activeTab === 'chat' ? 'bg-blue-600' : 'hover:bg-gray-800'}`} 
          onClick={() => setActiveTab('chat')}
        >
          AI Tutor
        </li>
        <li 
          className={activeTab === 'files' ? 'active' : ''} 
          onClick={() => setActiveTab('files')}
        >
          {!isCollapsed && 'My Files'}
        </li>
        <li 
          className={activeTab === 'settings' ? 'active' : ''} 
          onClick={() => setActiveTab('settings')}
        >
          {!isCollapsed && 'Settings'}
        </li>
      </ul>
    </div>
  );
}
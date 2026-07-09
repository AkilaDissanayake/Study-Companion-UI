/**
 * @file Topbar.jsx
 * @description The top navigation bar of the application. 
 * Houses the user's avatar and the dropdown menu for logging out.
 */

// src/components/Topbar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Import the custom hook

export default function Topbar({ showProfileMenu, setShowProfileMenu }) {
  // Grab exactly what we need from the global context!
  const { userName, logout } = useAuth(); 

  return (
    <div className="topbar">
      <div style={{ position: "relative" }}>
        
        <div 
          className="avatar" 
          title={`Logged in as ${userName}`}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{ cursor: "pointer" }}
        >
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>

        {showProfileMenu && (
          <div className="dropdown-menu" style={{ /* ... your styles ... */ }}>
            <p>{userName}</p>
            <button onClick={logout}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
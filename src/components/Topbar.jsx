/**
 * @file Topbar.jsx
 * @description The top navigation bar of the application. 
 * Houses the user's avatar and the dropdown menu for logging out.
 */

import React, { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ showProfileMenu, setShowProfileMenu }) {
  const { userName, logout } = useAuth(); 
  
  // 1. Create a reference to the dropdown container
  const menuRef = useRef(null); 

  // 2. Set up the click listener for closing the menu
  useEffect(() => {
    function handleClickOutside(event) {
      // If the menu is open AND the click happened outside the menuRef container...
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false); // ...close the menu!
      }
    }

    // Attach the event listener to the entire document
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowProfileMenu]); 

  return (
    <div className="topbar">
      {/* 3. zIndex: 999 keeps the menu above the ChatTab background */}
      <div style={{ position: "relative", zIndex: 999 }} ref={menuRef}>
        
        <div 
          className="avatar" 
          title={`Logged in as ${userName}`}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{ cursor: "pointer" }}
        >
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>

        {/* 4. Dropdown Menu styled to anchor to the right edge */}
        {showProfileMenu && (
          <div 
            className="dropdown-menu" 
            style={{
              position: 'absolute',
              right: 0,             // Anchors to the right side to prevent off-screen overflow
              top: '100%',          // Starts exactly at the bottom of the avatar container
              marginTop: '12px',    // Adds a nice visual gap below the avatar
              minWidth: '160px',    // Gives enough width for the user's name
              backgroundColor: 'var(--container-bg)', // Adapts to light/dark themes
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <p style={{ 
              margin: '0 0 10px 0', 
              textAlign: 'center', 
              fontWeight: 'bold',
              color: 'var(--text-color)' 
            }}>
              {userName}
            </p>
            <button 
              onClick={logout} 
              style={{ 
                backgroundColor: '#dc3545', 
                color: 'white', 
                width: '100%', 
                padding: '8px 0', 
                border: 'none', 
                cursor: 'pointer',
                borderRadius: '4px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
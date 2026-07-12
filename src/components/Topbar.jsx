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

  // 2. Set up the click listener
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
  }, [setShowProfileMenu]); // Only re-run if this function changes

  return (
    <div className="topbar">
      {/* 3. Attach the ref to this relative wrapper */}
      <div style={{ position: "relative" }} ref={menuRef}>
        
        <div 
          className="avatar" 
          title={`Logged in as ${userName}`}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{ cursor: "pointer" }}
        >
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>

        {showProfileMenu && (
          <div className="dropdown-menu" >
            <p>{userName}</p>
            <button 
              onClick={logout} 
              style={{ 
                backgroundColor: '#dc3545', 
                color: 'white', 
                width: '100%', 
                padding: '8px 0', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
/**
 * @file Topbar.jsx
 * @description The top navigation bar of the application.
 * Shows the current page title and houses the user's avatar / logout menu.
 */

import React, { useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './ui/Avatar';

export default function Topbar({ title, showProfileMenu, setShowProfileMenu }) {
  const { userName, logout } = useAuth();

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowProfileMenu]);

  return (
    <div className="topbar">
      <h1 style={{ fontSize: 'var(--font-size-h2)' }}>{title}</h1>

      <div style={{ position: 'relative', zIndex: 999 }} ref={menuRef}>
        <div onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ cursor: 'pointer' }}>
          <Avatar name={userName} />
        </div>

        {showProfileMenu && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '12px',
              minWidth: '190px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-3)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <p
              style={{
                margin: '0 0 var(--space-3) 0',
                textAlign: 'center',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              {userName}
            </p>
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                width: '100%',
                padding: '8px 0',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: 'var(--font-size-body-sm)',
                fontFamily: 'var(--font-body)',
                margin: 0,
                transition: 'background-color var(--duration-base) var(--ease-standard)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-danger)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)';
                e.currentTarget.style.color = 'var(--color-danger)';
              }}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

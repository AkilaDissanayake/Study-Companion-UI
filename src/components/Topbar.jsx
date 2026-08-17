/**
 * @file Topbar.jsx
 * @description The top navigation bar of the application.
 * Shows the current page title and houses the user's avatar / logout menu.
 * Below 768px also shows a hamburger button that opens the Sidebar drawer.
 */

import React, { useRef, useEffect, useState } from 'react';
import { LogOut, Menu, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './ui/Avatar';
import IconButton from './ui/IconButton';
import * as api from '../services/api';

const buttonReset = { all: 'unset', cursor: 'pointer', boxSizing: 'border-box' };

export default function Topbar({ title, showProfileMenu, setShowProfileMenu, onOpenMobileSidebar }) {
  const { userName, logout } = useAuth();

  const menuRef = useRef(null);

  // Streak chip — the one always-visible glanceable spot for the study
  // streak (deliberately not duplicated in the Sidebar too, to keep the
  // calm side of the UI uncluttered). Silent on failure: this is a small
  // motivational touch, not a critical path.
  const [streak, setStreak] = useState(0);
  // Studied yet today? Drives the amber "about to lapse" tone below — a
  // loss-aversion nudge, not a punishment (the streak itself hasn't broken,
  // see stats_handler.py's yesterday-fallback in _compute_streak).
  const [studiedToday, setStudiedToday] = useState(true);
  useEffect(() => {
    let cancelled = false;
    api
      .getStatsSummary()
      .then((data) => {
        if (cancelled) return;
        setStreak(data.current_streak || 0);
        setStudiedToday(data.studied_today ?? true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const isLapsing = streak > 0 && !studiedToday;

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') setShowProfileMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [setShowProfileMenu]);

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
        {/* IconButton always sets display:flex inline (to center its icon),
            which beats the .mobile-menu-trigger CSS class's display:none —
            inline styles always win over class rules. Toggling visibility on
            this wrapper instead, rather than on IconButton's own element,
            keeps the show/hide behavior in the CSS cascade where it belongs. */}
        <span className="mobile-menu-trigger">
          <IconButton
            variant="ghost"
            aria-label="Open navigation menu"
            onClick={onOpenMobileSidebar}
            icon={<Menu size={20} />}
          />
        </span>
        <h1 style={{ fontSize: 'var(--font-size-h2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {streak > 0 && (
          <span
            title={isLapsing ? `${streak}-day streak — study today to keep it going` : `${streak}-day study streak`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-full)',
              background: isLapsing ? 'var(--color-warning-bg)' : 'var(--color-accent-100)',
              color: isLapsing ? 'var(--color-warning)' : 'var(--color-accent-700)',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              transition: `background-color var(--duration-base) var(--ease-standard), color var(--duration-base) var(--ease-standard)`,
            }}
          >
            <Flame size={14} />
            {streak}
          </span>
        )}

        <div style={{ position: 'relative', zIndex: 999 }} ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-haspopup="menu"
            aria-expanded={showProfileMenu}
            aria-label="Open profile menu"
            style={{ ...buttonReset, display: 'flex', borderRadius: 'var(--radius-full)' }}
          >
            <Avatar name={userName} />
          </button>

        {showProfileMenu && (
          <div
            role="menu"
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
              type="button"
              role="menuitem"
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
                e.currentTarget.style.color = 'var(--color-on-primary)';
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
    </div>
  );
}

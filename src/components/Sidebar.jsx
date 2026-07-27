/**
 * @file Sidebar.jsx
 * @description The main left-hand navigation menu for the dashboard.
 * Controls which tab is currently active and visible to the user.
 */

import React, { useState, useEffect } from 'react';
import { getSidebarChats } from '../services/api';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, activeSessionId, setActiveSessionId }) {
  const [chatHistory, setChatHistory] = useState([]);

  // Fetch the chat list when the user switches to the chat tab, 
  // or when the activeSessionId changes (e.g., a new chat is saved)
  useEffect(() => {
    if (activeTab === 'chat') {
      fetchChats();
    }
  }, [activeTab, activeSessionId]); 

  const fetchChats = async () => {
    try {
      const res = await getSidebarChats();
      if (res.data) {
        setChatHistory(res.data);
      }
    } catch (err) {
      console.error("Failed to load sidebar chats:", err);
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2>Study Companion</h2>}
        
        <button 
          className="toggle-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          ☰
        </button>
      </div>
    
      <ul>
        {/* AI TUTOR TAB */}
        <li 
          className={`p-2 rounded cursor-pointer transition-colors ${activeTab === 'chat' ? 'bg-blue-600' : 'hover:bg-gray-800'}`} 
          onClick={() => setActiveTab('chat')}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>AI Tutor</span>
            {/* Quick button to start a new chat directly from the sidebar */}
            {activeTab === 'chat' && !isCollapsed && (
              <span 
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the <li> click event
                  setActiveSessionId(null); 
                }}
                style={{ fontSize: '1.2rem', padding: '0 8px', color: '#a0aec0' }}
                title="New Chat"
              >
                +
              </span>
            )}
          </div>
        </li>

        {/* CHAT HISTORY SUB-LIST */}
        {activeTab === 'chat' && !isCollapsed && chatHistory.length > 0 && (
          <ul style={{ 
            paddingLeft: '16px', 
            margin: '8px 0 16px 0', 
            fontSize: '0.85em', 
            listStyleType: 'none',
            borderLeft: '1px solid #4a5568',
            marginLeft: '8px'
          }}>
            {chatHistory.map(chat => (
              <li 
                key={chat.session_id}
                onClick={() => setActiveSessionId(chat.session_id)}
                title={chat.title}
                style={{ 
                  padding: '8px 12px', 
                  margin: '4px 0', 
                  cursor: 'pointer', 
                  borderRadius: '6px',
                  backgroundColor: activeSessionId === chat.session_id ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: activeSessionId === chat.session_id ? '#fff' : '#a0aec0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeSessionId !== chat.session_id) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSessionId !== chat.session_id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#a0aec0';
                  }
                }}
              >
                {chat.title}
              </li>
            ))}
          </ul>
        )}

        {/* MY FILES TAB */}
        <li 
          className={activeTab === 'files' ? 'active' : ''} 
          onClick={() => setActiveTab('files')}
          style={{ marginTop: '8px' }}
        >
          {!isCollapsed && 'My Files'}
        </li>
        
        {/* SETTINGS TAB */}
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
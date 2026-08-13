/**
 * @file Sidebar.jsx
 * @description The main left-hand navigation menu for the dashboard.
 * Controls which tab is currently active and manages chat history deletion/actions.
 */

import React, { useState, useEffect } from 'react';
import { getSidebarChats, deleteChatSession, generateChatQuiz } from '../services/api';
import ConfirmDialog from './ConfirmDialog';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  activeSessionId,
  setActiveSessionId,
  setActiveQuizId,
  refreshTrigger,
}) {
  const [chatHistory, setChatHistory] = useState([]);

  // Delete confirmation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  // Dropdown menu
  const [openMenuId, setOpenMenuId] = useState(null);

  // Close dropdown when user clicks elsewhere
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch chat list whenever the chat tab is active or sessions change
  useEffect(() => {
    if (activeTab === 'chat') {
      fetchChats();
    }
  }, [activeTab, activeSessionId, refreshTrigger]);

  const fetchChats = async () => {
    try {
      const res = await getSidebarChats();
      if (res.data) setChatHistory(res.data);
    } catch (err) {
      console.error('Failed to load sidebar chats:', err);
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────

  const toggleMenu = (e, sessionId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === sessionId ? null : sessionId);
  };

  const handleGenerateQuiz = async (e, chat) => {
    e.stopPropagation();
    setOpenMenuId(null);
    try {
      const response = await generateChatQuiz(chat.session_id);
      if (response.status === 'success') {
        if (setActiveQuizId) setActiveQuizId(response.data.quiz_id);
        setActiveTab('quizzes');
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    }
  };

  const handleDeleteClick = (e, chat) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setChatToDelete(chat);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return;
    try {
      await deleteChatSession(chatToDelete.session_id);
      if (activeSessionId === chatToDelete.session_id) {
        setActiveSessionId(null);
      }
      await fetchChats();
    } catch (err) {
      console.error('Failed to delete chat:', err);
    } finally {
      setIsConfirmOpen(false);
      setChatToDelete(null);
    }
  };

  // ── Shared nav item style helpers ─────────────────────────────────────

  const navItemStyle = (tab) => ({
    padding: '15px 20px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    whiteSpace: 'nowrap',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: activeTab === tab ? 'rgba(255,255,255,0.15)' : 'transparent',
    borderLeft: activeTab === tab ? '4px solid #3498db' : '4px solid transparent',
  });

  return (
    <>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this chat? This action cannot be undone."
      />

      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* ── Header ── */}
        <div className="sidebar-header">
          {!isCollapsed && <h2 style={{ margin: 0 }}>Study Companion</h2>}
          <button
            className="toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ width: '24px', height: '24px' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* ── Navigation ── */}
        <ul>
          {/* My Quizzes */}
          <li
            style={navItemStyle('quizzes')}
            onClick={() => {
              setActiveTab('quizzes');
              if (setActiveQuizId) setActiveQuizId(null);
            }}
          >
            {!isCollapsed && <span>My Quizzes</span>}
          </li>

          {/* AI Tutor */}
          <li
            style={navItemStyle('chat')}
            onClick={() => setActiveTab('chat')}
          >
            <span>{!isCollapsed && 'AI Tutor'}</span>
            {activeTab === 'chat' && !isCollapsed && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSessionId(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a0aec0',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title="New Chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  style={{ width: '18px', height: '18px' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
            )}
          </li>

          {/* Chat history sub-list */}
          {activeTab === 'chat' && !isCollapsed && chatHistory.length > 0 && (
            <ul
              style={{
                padding: '0 0 0 8px',
                margin: '8px 0 16px 8px',
                fontSize: '0.85em',
                listStyleType: 'none',
                borderLeft: '1px solid #4a5568',
              }}
            >
              {chatHistory.map((chat) => (
                <li
                  key={chat.session_id}
                  onClick={() => setActiveSessionId(chat.session_id)}
                  title={chat.title || 'Chat Session'}
                  style={{
                    padding: '8px 12px',
                    margin: '4px 0',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    backgroundColor:
                      activeSessionId === chat.session_id
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'transparent',
                    color: '#ffffff',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    gap: '8px',
                    boxSizing: 'border-box',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (activeSessionId !== chat.session_id)
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (activeSessionId !== chat.session_id)
                      e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Title */}
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: activeSessionId === chat.session_id ? '600' : 'normal',
                    }}
                  >
                    {chat.title?.trim() ? chat.title : 'New Chat'}
                  </div>

                  {/* Three-dot menu */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                      onClick={(e) => toggleMenu(e, chat.session_id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#a0aec0',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#a0aec0')}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        style={{ width: '20px', height: '20px' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                        />
                      </svg>
                    </button>

                    {/* Dropdown */}
                    {openMenuId === chat.session_id && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '100%',
                          marginTop: '4px',
                          backgroundColor: '#2d3748',
                          borderRadius: '6px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                          minWidth: '150px',
                          zIndex: 100,
                          overflow: 'hidden',
                          border: '1px solid #4a5568',
                        }}
                      >
                        <div
                          onClick={(e) => handleGenerateQuiz(e, chat)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            color: '#e2e8f0',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#4a5568')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'transparent')
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            style={{ width: '16px', height: '16px', marginRight: '8px' }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                          Generate Quiz
                        </div>

                        <div
                          onClick={(e) => handleDeleteClick(e, chat)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            color: '#fc8181',
                            borderTop: '1px solid #4a5568',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#4a5568')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'transparent')
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            style={{ width: '16px', height: '16px', marginRight: '8px' }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                          Delete
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* My Files */}
          <li
            style={navItemStyle('files')}
            onClick={() => setActiveTab('files')}
          >
            {!isCollapsed && <span>My Files</span>}
          </li>

          {/* Settings */}
          <li
            style={navItemStyle('settings')}
            onClick={() => setActiveTab('settings')}
          >
            {!isCollapsed && <span>Settings</span>}
          </li>
        </ul>
      </div>
    </>
  );
}
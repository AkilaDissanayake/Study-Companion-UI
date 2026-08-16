/**
 * @file Sidebar.jsx
 * @description The main left-hand navigation menu for the dashboard.
 * Controls which tab is currently active and manages chat history deletion/actions.
 */

import React, { useState, useEffect } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
  MessageSquare,
  FolderOpen,
  Settings as SettingsIcon,
  SquarePen,
  MoreVertical,
  Wand2,
  Trash2,
} from 'lucide-react';
import { getSidebarChats, deleteChatSession, generateChatQuiz } from '../services/api';
import { useNotify } from '../context/NotificationContext';
import ConfirmDialog from './ConfirmDialog';
import IconButton from './ui/IconButton';

const NAV_ITEMS = [
  { tab: 'quizzes', label: 'My Quizzes', icon: ClipboardList },
  { tab: 'chat', label: 'AI Tutor', icon: MessageSquare },
  { tab: 'files', label: 'My Files', icon: FolderOpen },
  { tab: 'settings', label: 'Settings', icon: SettingsIcon },
];

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
  const notify = useNotify();
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
      notify.error(err.message || 'Could not load your chat history.', { retry: fetchChats });
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
      notify.error(error.message || 'Failed to generate quiz. Please try again.', {
        retry: () => handleGenerateQuiz(e, chat),
      });
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
      notify.error(err.message || 'Failed to delete chat. Please try again.');
    } finally {
      setIsConfirmOpen(false);
      setChatToDelete(null);
    }
  };

  // ── Shared nav item style helper ────────────────────────────────────

  const navItemStyle = (tab) => ({
    padding: isCollapsed ? '12px 0' : '10px 16px',
    margin: '2px 8px',
    cursor: 'pointer',
    borderRadius: 'var(--radius-md)',
    transition: `background-color var(--duration-base) var(--ease-standard)`,
    whiteSpace: 'nowrap',
    display: 'flex',
    justifyContent: isCollapsed ? 'center' : 'space-between',
    alignItems: 'center',
    gap: 'var(--space-3)',
    backgroundColor: activeTab === tab ? 'var(--color-sidebar-surface-hover)' : 'transparent',
    color: activeTab === tab ? 'var(--color-sidebar-text)' : 'var(--color-sidebar-text-muted)',
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
          {!isCollapsed && <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--color-sidebar-text)' }}>Study Companion</h2>}
          <IconButton
            variant="sidebar"
            aria-label="Toggle sidebar"
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          />
        </div>

        {/* ── Navigation ── */}
        <ul style={{ padding: '8px 0' }}>
          {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
            <React.Fragment key={tab}>
              <li
                style={navItemStyle(tab)}
                title={isCollapsed ? label : undefined}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'quizzes' && setActiveQuizId) setActiveQuizId(null);
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', overflow: 'hidden' }}>
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!isCollapsed && <span>{label}</span>}
                </span>

                {tab === 'chat' && activeTab === 'chat' && !isCollapsed && (
                  <IconButton
                    variant="sidebar"
                    size={28}
                    title="New Chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSessionId(null);
                    }}
                    icon={<SquarePen size={16} />}
                  />
                )}
              </li>

              {/* Chat history sub-list — rendered directly under the AI Tutor item */}
              {tab === 'chat' && activeTab === 'chat' && !isCollapsed && chatHistory.length > 0 && (
                <ul
                  style={{
                    padding: '0 0 0 8px',
                    margin: '8px 8px 16px 20px',
                    fontSize: 'var(--font-size-body-sm)',
                    listStyleType: 'none',
                    borderLeft: '1px solid var(--color-sidebar-border)',
                  }}
                >
                  {chatHistory.map((chat) => (
                    <li
                      key={chat.session_id}
                      onClick={() => setActiveSessionId(chat.session_id)}
                      title={chat.title || 'Chat Session'}
                      style={{
                        padding: '8px 8px 8px 12px',
                        margin: '2px 0',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor:
                          activeSessionId === chat.session_id
                            ? 'var(--color-sidebar-surface-hover)'
                            : 'transparent',
                        color: 'var(--color-sidebar-text)',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        boxSizing: 'border-box',
                        textAlign: 'left',
                        transition: `background-color var(--duration-base) var(--ease-standard)`,
                      }}
                      onMouseEnter={(e) => {
                        if (activeSessionId !== chat.session_id)
                          e.currentTarget.style.backgroundColor = 'var(--color-sidebar-surface-hover)';
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
                        <IconButton
                          variant="sidebar"
                          size={26}
                          onClick={(e) => toggleMenu(e, chat.session_id)}
                          icon={<MoreVertical size={16} />}
                        />

                        {/* Dropdown */}
                        {openMenuId === chat.session_id && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              marginTop: '4px',
                              backgroundColor: 'var(--color-surface)',
                              borderRadius: 'var(--radius-md)',
                              boxShadow: 'var(--shadow-md)',
                              minWidth: '170px',
                              zIndex: 100,
                              overflow: 'hidden',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            <div
                              onClick={(e) => handleGenerateQuiz(e, chat)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px 12px',
                                cursor: 'pointer',
                                color: 'var(--color-text-primary)',
                                transition: 'background-color var(--duration-base) var(--ease-standard)',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <Wand2 size={16} style={{ marginRight: '8px' }} />
                              Generate Quiz
                            </div>

                            <div
                              onClick={(e) => handleDeleteClick(e, chat)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px 12px',
                                cursor: 'pointer',
                                color: 'var(--color-danger)',
                                borderTop: '1px solid var(--color-border)',
                                transition: 'background-color var(--duration-base) var(--ease-standard)',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <Trash2 size={16} style={{ marginRight: '8px' }} />
                              Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </>
  );
}

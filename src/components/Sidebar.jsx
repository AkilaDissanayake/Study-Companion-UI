/**
 * @file Sidebar.jsx
 * @description The main left-hand navigation menu for the dashboard.
 * Controls which tab is currently active and manages chat history deletion/actions.
 * Below 768px it becomes an off-canvas drawer (see `isMobileOpen`/`onCloseMobile`).
 */

import React, { useState, useEffect } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  FolderOpen,
  Layers,
  Settings as SettingsIcon,
  SquarePen,
  MoreVertical,
  Wand2,
  Trash2,
  Search,
} from 'lucide-react';
import { getSidebarChats, deleteChatSession, generateChatQuiz, getDueFlashcards } from '../services/api';
import { useNotify } from '../context/NotificationContext';
import ConfirmDialog from './ConfirmDialog';
import IconButton from './ui/IconButton';
import { Input } from './ui/Input';

const NAV_ITEMS = [
  { tab: 'overview', label: 'Overview', icon: LayoutDashboard },
  { tab: 'quizzes', label: 'My Quizzes', icon: ClipboardList },
  { tab: 'flashcards', label: 'Flashcards', icon: Layers },
  { tab: 'chat', label: 'AI Tutor', icon: MessageSquare },
  { tab: 'files', label: 'My Files', icon: FolderOpen },
  { tab: 'settings', label: 'Settings', icon: SettingsIcon },
];

// Resets a native <button> to look unstyled, so it can carry arbitrary
// visual styles (nav rows, chat-row titles) without browser button chrome.
// `all: 'unset'` must stay the first key — later keys in the same object
// still override it, same as CSS cascade within one declaration block.
const buttonReset = { all: 'unset', cursor: 'pointer', boxSizing: 'border-box' };

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  activeSessionId,
  setActiveSessionId,
  setActiveQuizId,
  refreshTrigger,
  isMobileOpen,
  onCloseMobile,
}) {
  const notify = useNotify();
  const [chatHistory, setChatHistory] = useState([]);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Due-flashcard count badge — fetched once on mount, same pattern as
  // Topbar's streak chip. Silent on failure: a glanceable nudge, not a
  // critical path.
  const [dueFlashcardCount, setDueFlashcardCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getDueFlashcards()
      .then((res) => {
        if (!cancelled) setDueFlashcardCount((res.data || []).length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Delete confirmation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  // Dropdown menu
  const [openMenuId, setOpenMenuId] = useState(null);

  // Close dropdown when user clicks elsewhere, or presses Escape
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
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

  // Search chats by title (matches the same "New Chat" fallback shown for
  // untitled sessions, so searching that phrase finds them too).
  const filteredChatHistory = chatHistory.filter((chat) => {
    const title = chat.title?.trim() ? chat.title : 'New Chat';
    return title.toLowerCase().includes(chatSearchQuery.trim().toLowerCase());
  });

  const handleNavSelect = (tab) => {
    setActiveTab(tab);
    if (tab === 'quizzes' && setActiveQuizId) setActiveQuizId(null);
    // Auto-close the off-canvas drawer on mobile so picking a destination
    // doesn't leave the drawer covering the content it just navigated to.
    if (onCloseMobile) onCloseMobile();
  };

  // ── Shared nav row style helper (now applied to the wrapping div, since
  // the clickable label itself is a real <button> — see buttonReset above) ──

  const navRowStyle = (tab) => ({
    margin: '2px 8px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'space-between',
    transition: `background-color var(--duration-base) var(--ease-standard)`,
    backgroundColor: activeTab === tab ? 'var(--color-sidebar-surface-hover)' : 'transparent',
  });

  const navButtonStyle = (tab) => ({
    ...buttonReset,
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    gap: 'var(--space-3)',
    padding: isCollapsed ? '12px 0' : '10px 16px',
    fontSize: 'var(--font-size-body-sm)',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
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

      {/* Mobile-only backdrop — CSS keeps this inert (display:none) above
          768px regardless of state, so it can never strand an overlay. */}
      {isMobileOpen && <div className="sidebar-scrim" onClick={onCloseMobile} />}

      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* ── Header ── */}
        <div className="sidebar-header">
          {!isCollapsed && <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--color-sidebar-text)' }}>Study Companion</h2>}
          <IconButton
            variant="sidebar"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          />
        </div>

        {/* ── Navigation ── */}
        <ul style={{ padding: '8px 0' }}>
          {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
            <React.Fragment key={tab}>
              <li style={navRowStyle(tab)}>
                <button
                  type="button"
                  style={navButtonStyle(tab)}
                  title={isCollapsed ? label : undefined}
                  aria-current={activeTab === tab ? 'page' : undefined}
                  onClick={() => handleNavSelect(tab)}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!isCollapsed && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                      {tab === 'flashcards' && dueFlashcardCount > 0 && (
                        <span
                          title={`${dueFlashcardCount} card${dueFlashcardCount === 1 ? '' : 's'} due for review`}
                          style={{
                            flexShrink: 0,
                            minWidth: 18,
                            height: 18,
                            padding: '0 5px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-primary-500)',
                            color: 'var(--color-on-primary)',
                            fontSize: 'var(--font-size-caption)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {dueFlashcardCount}
                        </span>
                      )}
                    </span>
                  )}
                </button>

                {tab === 'chat' && activeTab === 'chat' && !isCollapsed && (
                  <IconButton
                    variant="sidebar"
                    size={28}
                    title="New Chat"
                    aria-label="Start a new chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSessionId(null);
                    }}
                    icon={<SquarePen size={16} />}
                    style={{ marginRight: 'var(--space-2)' }}
                  />
                )}
              </li>

              {/* Chat history sub-list — rendered directly under the AI Tutor item */}
              {tab === 'chat' && activeTab === 'chat' && !isCollapsed && chatHistory.length > 0 && (
                <div style={{ margin: '8px 8px 16px 20px' }}>
                  <div style={{ padding: '0 0 0 8px' }}>
                    <Input
                      iconLeft={<Search size={14} />}
                      placeholder="Search chats..."
                      aria-label="Search chats by title"
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      style={{
                        padding: '6px 10px 6px 30px',
                        fontSize: 'var(--font-size-body-sm)',
                        background: 'var(--color-sidebar-surface-hover)',
                        borderColor: 'var(--color-sidebar-border)',
                        color: 'var(--color-sidebar-text)',
                      }}
                    />
                  </div>

                  {filteredChatHistory.length === 0 ? (
                    <p
                      style={{
                        padding: '10px 8px 0 12px',
                        margin: 0,
                        fontSize: 'var(--font-size-body-sm)',
                        color: 'var(--color-sidebar-text-muted)',
                      }}
                    >
                      No matching chats.
                    </p>
                  ) : (
                    <ul
                      style={{
                        padding: '0 0 0 8px',
                        margin: '8px 0 0',
                        fontSize: 'var(--font-size-body-sm)',
                        listStyleType: 'none',
                        borderLeft: '1px solid var(--color-sidebar-border)',
                      }}
                    >
                      {filteredChatHistory.map((chat) => {
                        const chatTitle = chat.title?.trim() ? chat.title : 'New Chat';
                        const isActive = activeSessionId === chat.session_id;
                        return (
                          <li
                            key={chat.session_id}
                            style={{
                              margin: '2px 0',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: isActive ? 'var(--color-sidebar-surface-hover)' : 'transparent',
                              display: 'grid',
                              gridTemplateColumns: '1fr auto',
                              alignItems: 'center',
                              transition: `background-color var(--duration-base) var(--ease-standard)`,
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-sidebar-surface-hover)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSessionId(chat.session_id);
                                if (onCloseMobile) onCloseMobile();
                              }}
                              title={chatTitle}
                              aria-current={isActive ? 'true' : undefined}
                              style={{
                                ...buttonReset,
                                padding: '8px 8px 8px 12px',
                                minWidth: 0,
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                color: 'var(--color-sidebar-text)',
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--font-size-body-sm)',
                                fontWeight: isActive ? 600 : 400,
                              }}
                            >
                              {chatTitle}
                            </button>

                            {/* Three-dot menu — sibling of the select button, never nested inside it */}
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <IconButton
                                variant="sidebar"
                                size={26}
                                aria-label={`More options for ${chatTitle}`}
                                aria-haspopup="menu"
                                aria-expanded={openMenuId === chat.session_id}
                                onClick={(e) => toggleMenu(e, chat.session_id)}
                                icon={<MoreVertical size={16} />}
                              />

                              {/* Dropdown */}
                              {openMenuId === chat.session_id && (
                                <div
                                  role="menu"
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
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={(e) => handleGenerateQuiz(e, chat)}
                                    style={{
                                      ...buttonReset,
                                      display: 'flex',
                                      alignItems: 'center',
                                      width: '100%',
                                      padding: '10px 12px',
                                      color: 'var(--color-text-primary)',
                                      fontFamily: 'var(--font-body)',
                                      fontSize: 'var(--font-size-body-sm)',
                                      transition: 'background-color var(--duration-base) var(--ease-standard)',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                  >
                                    <Wand2 size={16} style={{ marginRight: '8px' }} />
                                    Generate Quiz
                                  </button>

                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={(e) => handleDeleteClick(e, chat)}
                                    style={{
                                      ...buttonReset,
                                      display: 'flex',
                                      alignItems: 'center',
                                      width: '100%',
                                      padding: '10px 12px',
                                      color: 'var(--color-danger)',
                                      fontFamily: 'var(--font-body)',
                                      fontSize: 'var(--font-size-body-sm)',
                                      borderTop: '1px solid var(--color-border)',
                                      transition: 'background-color var(--duration-base) var(--ease-standard)',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                  >
                                    <Trash2 size={16} style={{ marginRight: '8px' }} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </>
  );
}

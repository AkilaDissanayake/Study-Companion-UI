import React, { useState, useRef, useEffect } from 'react';
import { SquarePen, Send, MessageSquareX } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { sendChatMessage, getChatHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from './ui/EmptyState';

export default function ChatTab({ activeSessionId, setActiveSessionId, setRefreshSidebarTrigger }) {
  const { userName, isLoading: isAuthLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(activeSessionId || null);
  const [chatNotFound, setChatNotFound] = useState(false);

  // 🚀 Smart scroll control: allows manual scrolling up without getting yanked down
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Load chat history when session changes
  useEffect(() => {
    setChatNotFound(false);

    const loadSelectedChat = async () => {
        if (!activeSessionId) return;

        setIsLoading(true);
        try {
            const response = await getChatHistory(activeSessionId);
            if (response.data && response.data.chat_state) {
                setMessages(response.data.chat_state);
                setAutoScrollEnabled(true);
            }
        } catch (error) {
            if (error.status === 404) {
                setChatNotFound(true);
            } else {
                console.error("Failed to load chat history:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    loadSelectedChat();
  }, [activeSessionId]);

  // ==========================================
  // 🚀 BULLETPROOF SMART SCROLL ENGINE
  // ==========================================
  const scrollToBottom = (behavior = "smooth") => {
    if (!autoScrollEnabled) return;

    requestAnimationFrame(() => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
      }, 50);
    });
  };

  // Trigger auto-scroll only if enabled
  useEffect(() => {
    if (autoScrollEnabled) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Detect manual user scrolling
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // If user scrolls up more than 80px from the bottom, lock auto-scroll off
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    setAutoScrollEnabled(isAtBottom);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setAutoScrollEnabled(true);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const msgId = `msg-${Date.now()}`;
    const userMsg = { id: msgId, role: "user", text: input };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Force auto-scroll when user sends a message
    setAutoScrollEnabled(true);
    scrollToBottom("smooth");

    if (textareaRef.current) {
      textareaRef.current.style.height = '54px';
    }

    try {
      const response = await sendChatMessage(userMsg.text, sessionId);

      if (response.status === "success") {
        setMessages(prev => [...prev, { id: `bot-${Date.now()}`, role: "bot", text: response.data.response }]);

        if (!sessionId && response.data.session_id) {
          setSessionId(response.data.session_id);
        }

        // 🚀 Trigger sidebar to auto-update chat list without manual page refresh
        if (setRefreshSidebarTrigger) {
          setRefreshSidebarTrigger(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "bot",
          text: `⚠️ **System Error:** Connection failed.\n\n*Details: ${error.message}*`,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
      setAutoScrollEnabled(true);
      scrollToBottom("smooth");
    }
  };

  const scrollToMessage = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setAutoScrollEnabled(false); // Stop auto-scrolling when navigating history
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 114)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const userQuestions = messages.filter(m => m.role === 'user');

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--color-bg)',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>

      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        overflow: 'hidden',
        minHeight: 0
      }}>

        {/* Scrollable Chat Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="chat-scroll-area"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: 'var(--space-5) var(--space-8) var(--space-5) var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            scrollBehavior: 'smooth'
          }}
        >

          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              style={{
                alignSelf: 'flex-end',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: '8px 16px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: 500,
                margin: 0,
                marginBottom: 'var(--space-6)',
                width: 'auto',
                transition: `all var(--duration-base) var(--ease-standard)`,
                boxShadow: 'var(--shadow-xs)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'var(--color-primary-500)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <SquarePen size={15} />
              New Chat
            </button>
          )}

          {chatNotFound ? (
            <div style={{ margin: 'auto' }}>
              <EmptyState
                icon={<MessageSquareX size={22} />}
                title="This chat no longer exists"
                description="It may have been deleted. Start a new chat from the sidebar."
              />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto' }}>
              <h2 style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'var(--font-size-display)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
              }}>
                {getGreeting()}
                {isAuthLoading ? (
                  <span
                    className="skeleton-pulse"
                    style={{ width: '140px', height: '0.8em' }}
                    aria-label="Loading your name"
                  />
                ) : (
                  <span>, {userName.split(' ')[0]}</span>
                )}
              </h2>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} id={msg.id} style={{ width: '100%' }}>
                <ChatMessage role={msg.role} text={msg.text} isError={msg.isError} />
              </div>
            ))
          )}

          {isLoading && (
            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
              Thinking...
            </div>
          )}

          <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
        </div>

        {/* Quick jump menu for user questions */}
        {userQuestions.length > 0 && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 10
          }}>
            {userQuestions.map((msg, idx) => {
              const isLast = idx === userQuestions.length - 1;
              return (
                <div
                  key={msg.id}
                  onClick={() => scrollToMessage(msg.id)}
                  title={msg.text}
                  style={{
                    width: '16px',
                    height: '3px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isLast ? 'var(--color-primary-500)' : 'var(--color-text-tertiary)',
                    cursor: 'pointer',
                    opacity: isLast ? 1 : 0.4,
                    transition: `all var(--duration-base) var(--ease-standard)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
                    e.currentTarget.style.transform = 'scaleY(1.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = isLast ? '1' : '0.4';
                    e.currentTarget.style.backgroundColor = isLast ? 'var(--color-primary-500)' : 'var(--color-text-tertiary)';
                    e.currentTarget.style.transform = 'scaleY(1)';
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Input Bar Area */}
        <div style={{ flexShrink: 0, padding: 'var(--space-5)', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', width: '100%' }}>

            <textarea
              ref={textareaRef}
              className="hide-scrollbar"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything you need..."
              rows={1}
              style={{
                width: '100%',
                margin: 0,
                minHeight: '54px',
                height: '54px',
                padding: '16px 55px 16px 20px',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: '16px',
                fontFamily: 'var(--font-body)',
                lineHeight: '1.4',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: 'var(--shadow-xs)',
                resize: 'none',
                overflowY: 'auto'
              }}
            />

            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                position: 'absolute',
                right: '8px',
                bottom: '8px',
                width: '38px',
                height: '38px',
                margin: 0,
                padding: 0,
                borderRadius: 'var(--radius-full)',
                backgroundColor: (isLoading || !input.trim()) ? 'transparent' : 'var(--color-primary-500)',
                color: (isLoading || !input.trim()) ? 'var(--color-text-tertiary)' : 'white',
                border: 'none',
                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: `all var(--duration-base) var(--ease-standard)`
              }}
            >
              <Send size={17} />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

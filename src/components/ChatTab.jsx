import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { sendChatMessage, getChatHistory } from '../services/api';

export default function ChatTab({ userName, activeSessionId, setActiveSessionId, setRefreshSidebarTrigger }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(activeSessionId || null);
  
  // 🚀 Smart scroll control: allows manual scrolling up without getting yanked down
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null); 

  // Load chat history when session changes
  useEffect(() => {
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
            console.error("Failed to load chat history:", error);
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
      backgroundColor: 'var(--bg-color)',
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
            padding: '20px 40px 20px 20px', 
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
                marginBottom: '24px',
                padding: '8px 16px',
                backgroundColor: 'var(--container-bg)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--container-bg)';
                e.currentTarget.style.color = 'var(--text-color)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              + New Chat
            </button>
          )}

          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', margin: 'auto' }}>
              <h2 style={{ 
                color: 'var(--text-color)', 
                fontFamily: "'Dancing Script', 'Caveat', 'Brush Script MT', 'Lucida Handwriting'",
                fontWeight: '600',
                fontSize: '3rem',
                letterSpacing: '0.5px'
              }}>
                {getGreeting()}{userName ? `, ${userName.split(' ')[0]}` : '!'}
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
            <div style={{ padding: '16px', color: '#888', fontStyle: 'italic' }}>
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
                    borderRadius: '2px',
                    backgroundColor: isLast ? 'var(--text-color)' : '#888',
                    cursor: 'pointer',
                    opacity: isLast ? 1 : 0.4,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.backgroundColor = 'var(--text-color)';
                    e.currentTarget.style.transform = 'scaleY(1.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = isLast ? '1' : '0.4';
                    e.currentTarget.style.backgroundColor = isLast ? 'var(--text-color)' : '#888';
                    e.currentTarget.style.transform = 'scaleY(1)';
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Input Bar Area */}
        <div style={{ flexShrink: 0, padding: '20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
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
                borderRadius: '24px', 
                border: '1px solid var(--border-color)', 
                backgroundColor: 'var(--container-bg)', 
                color: 'var(--text-color)', 
                fontSize: '16px', 
                lineHeight: '1.4',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
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
                borderRadius: '50%', 
                backgroundColor: (isLoading || !input.trim()) ? 'transparent' : 'var(--primary)',
                color: (isLoading || !input.trim()) ? '#aaa' : 'white',
                border: 'none',
                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px', marginLeft: '-2px', marginTop: '2px' }}>
                <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
              </svg>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
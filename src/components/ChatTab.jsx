import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { sendChatMessage, getChatHistory } from '../services/api';
export default function ChatTab({ userName , activeSessionId, setActiveSessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(activeSessionId || null)
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); 

  // Add this inside ChatTab.jsx
useEffect(() => {
    const loadSelectedChat = async () => {
        if (!activeSessionId) return; // If null, it's a new chat, do nothing
        
        setIsLoading(true);
        try {
            const response = await getChatHistory(activeSessionId);
            // Assuming your backend JSONB maps perfectly to your frontend message format
            if (response.data && response.data.chat_state) {
                setMessages(response.data.chat_state);
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    loadSelectedChat();
}, [activeSessionId]); // This runs every time the user clicks a different chat in the sidebar
  // Auto-scroll to bottom only when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // --- NEW: Reset the chat state to start fresh ---
  const handleNewChat = () => {
    setSessionId(null);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const msgId = `msg-${Date.now()}`;
    const userMsg = { id: msgId, role: "user", text: input };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = '54px';
    }

    try {
      // --- UPDATED: Pass the sessionId to the backend ---
      const response = await sendChatMessage(userMsg.text, sessionId);
      
      if (response.status === "success") {
        setMessages(prev => [...prev, { id: `bot-${Date.now()}`, role: "bot", text: response.data.response }]);
        
        // --- NEW: Save the session ID if the backend just created a new chat ---
        if (!sessionId && response.data.session_id) {
          setSessionId(response.data.session_id);
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: "bot", text: `⚠️ Connection Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToMessage = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        
        {/* Messages Scroll Area */}
        <div className="chat-scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '20px 40px 20px 20px', display: 'flex', flexDirection: 'column' }}>
          
          {/* --- NEW: Floating New Chat Button --- */}
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
              <div key={msg.id} id={msg.id}>
                <ChatMessage role={msg.role} text={msg.text} />
              </div>
            ))
          )}
          
          {isLoading && (
            <div style={{ padding: '16px', color: '#888', fontStyle: 'italic' }}>
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Minimap Navigation Bars */}
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
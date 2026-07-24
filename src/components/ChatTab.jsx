import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { sendChatMessage } from '../services/api';

export default function ChatTab({ userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); // Reference to control the textarea height

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


  const handleSend = async () => {
    if (!input.trim()) return;

    const msgId = `msg-${Date.now()}`;
    const userMsg = { id: msgId, role: "user", text: input };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Reset textarea height back to a single line after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = '54px';
    }

    try {
      const response = await sendChatMessage(userMsg.text);
      if (response.status === "success") {
        setMessages(prev => [...prev, { id: `bot-${Date.now()}`, role: "bot", text: response.data.response }]);
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

  // --- NEW: Auto-resize logic for the textarea ---
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      // Reset height momentarily to get the true scrollHeight
      textareaRef.current.style.height = 'auto';
      // Max height of ~114px is about 4-5 lines of text. 
      // If it exceeds this, it will become scrollable.
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 114)}px`;
    }
  };

  // --- NEW: Enter to send, Shift+Enter for new line ---
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevents adding a new line
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
          {/* Changed alignItems from 'center' to 'flex-end' so the send button stays at the bottom when the text area grows */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', width: '100%' }}>
            
            {/* SWAPPED <input> FOR <textarea> */}
            <textarea 
              ref={textareaRef}
              className="hide-scrollbar" // <--- ADD THIS CLASS
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
                overflowY: 'auto' // Keeps the ability to scroll, but the CSS hides the bar
              }}
            />

            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{ 
                position: 'absolute',
                right: '8px', 
                bottom: '8px', // Pinned to the bottom right so it stays aligned as textarea grows
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
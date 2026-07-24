import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { sendChatMessage } from '../services/api';

export default function ChatTab() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMsg.text);
      if (response.status === "success") {
        setMessages(prev => [...prev, { role: "bot", text: response.data.response }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: "bot", text: `⚠️ Connection Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 1. Because .content-area is a flex container, flex: 1 makes this perfectly fill the screen
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%',
      backgroundColor: 'var(--bg-color)'
    }}>
      
      {/* 2. Inner wrapper to keep the chat centered on wide monitors */}
      <div style={{
         display: 'flex',
         flexDirection: 'column',
         flex: 1,
         width: '100%',
         maxWidth: '900px',
         margin: '0 auto',
         overflow: 'hidden' 
      }}>
        
        {/* 3. Messages Scroll Area */}
        <div style={{ 
          flex: 1,           
          overflowY: 'auto', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', margin: 'auto' }}>
              <h2 style={{ color: 'var(--text-color)' }}>Welcome to your AI Tutor</h2>
              <p>Ask a question about any document in your library!</p>
            </div>
          ) : (
            messages.map((msg, idx) => <ChatMessage key={idx} role={msg.role} text={msg.text} />)
          )}
          
          {isLoading && (
            <div style={{ padding: '16px', color: '#888', fontStyle: 'italic' }}>
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 4. Input Bar Area */}
        <div style={{ 
          flexShrink: 0, 
          padding: '20px', 
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-color)'
        }}>
          {/* Relative wrapper allows us to absolutely position the button inside the input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
            
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your Study Companion..."
              style={{ 
                width: '100%',            // Overrides index.css
                margin: 0,                // Overrides index.css
                height: '54px',         
                padding: '0 55px 0 20px', // Extra 55px on the right so text doesn't hide under the button!
                borderRadius: '27px', 
                border: '1px solid var(--border-color)', 
                backgroundColor: 'var(--container-bg)', 
                color: 'var(--text-color)', 
                fontSize: '16px', 
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
              }}
            />

            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{ 
                position: 'absolute',
                right: '8px',             // Pins it inside the right edge of the input box
                width: '38px',            // Overrides index.css 100% width
                height: '38px',           
                margin: 0,                // Overrides index.css margin
                padding: 0, 
                borderRadius: '50%', 
                // Button turns primary blue when active, invisible/gray when empty
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
              {/* Classic Solid Paper Plane SVG */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  // Shifted slightly down and left to optically center the angled shape
                  marginLeft: '-2px', 
                  marginTop: '2px' 
                }}
              >
                <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
              </svg>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import { downloadFileBlob } from '../services/api';

// ==========================================
// 1. BULLETPROOF MARKDOWN ERROR BOUNDARY
// ==========================================
class SafeMarkdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    console.warn("Markdown parsing error gracefully caught:", error);
    return { hasError: true };
  }
  
  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.rawText !== this.props.rawText) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.65' }}>{this.props.rawText}</div>;
    }
    
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkMath]} 
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]} 
        urlTransform={(value) => value} 
        {...this.props.mdProps}
      >
        {this.props.rawText}
      </ReactMarkdown>
    );
  }
}

// ---------------------------------------------------------
// INLINE SVG ICON COMPONENTS
// ---------------------------------------------------------
const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '2px' }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------
export default function ChatMessage({ role, text, isError, currentSubject = "General" }) {
  if (!text && text !== "") return null; 

  const isBot = role === 'bot' || role === 'ai';
  let rawContent = typeof text === 'string' ? text : String(text || "");

  // Scrub common LLM syntax hallucinations for Math
  rawContent = rawContent
    .replace(/\\-/g, '-')
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$');

  const handleFileClick = async (e, filename) => {
    e.preventDefault(); 
    try {
      const blob = await downloadFileBlob(filename, currentSubject);
      const fileUrl = window.URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(fileUrl), 10000);
    } catch (error) {
      console.error("Failed to open file:", error);
      alert(`Could not load ${filename}. It may have been deleted.`);
    }
  };

  return (
    <div style={{
      display: 'flex', width: '100%', marginBottom: '16px',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
    }}>
      <div style={{
        maxWidth: '85%', padding: '16px 20px', borderRadius: '12px',
        backgroundColor: isBot ? (isError ? 'rgba(231, 76, 60, 0.05)' : 'var(--container-bg)') : 'var(--primary)',
        color: isBot ? (isError ? '#e74c3c' : 'var(--text-color)') : '#ffffff',
        border: isBot ? (isError ? '1px solid rgba(231, 76, 60, 0.3)' : '1px solid var(--border-color)') : 'none',
        borderBottomLeftRadius: isBot ? '0' : '12px',
        borderBottomRightRadius: '12px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        lineHeight: '1.6',
        overflowX: 'auto',
      }}>
        {isBot ? (
          <div className="bot-message-container" style={{ width: '100%' }}>
            <SafeMarkdown 
              rawText={rawContent}
              mdProps={{
                // 🚀 REMOVED 'prose' CLASS TO PREVENT CSS/IMAGE CONFLICTS
                components: {
                  p({ node, children }) { return <p style={{ margin: '0 0 10px 0', lineHeight: '1.65', wordBreak: 'break-word' }}>{children}</p>; },
                  ul({ node, children }) { return <ul style={{ margin: '0 0 10px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</ul>; },
                  ol({ node, children }) { return <ol style={{ margin: '0 0 10px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</ol>; },
                  li({ node, children }) { return <li style={{ margin: 0, lineHeight: '1.5' }}>{children}</li>; },
                  h3({ node, children }) { return <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '14px 0 6px 0' }}>{children}</h3>; },
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ borderRadius: '8px', margin: '10px 0', fontSize: '0.9em' }} {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code style={{ backgroundColor: 'rgba(128,128,128,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em', wordBreak: 'break-all' }} {...props}>
                        {children}
                      </code>
                    );
                  },
                  a(props) {
                    const { href, children } = props;
                    if (href && href.startsWith('file://')) {
                      const filename = href.replace('file://', '');
                      return (
                        <button 
                          onClick={(e) => handleFileClick(e, filename)}
                          style={{
                            background: 'rgba(52, 152, 219, 0.12)', border: '1px solid rgba(52, 152, 219, 0.4)', borderRadius: '5px',
                            color: '#3498db', cursor: 'pointer', padding: '2px 8px', font: 'inherit', margin: '0 4px',
                            display: 'inline-flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s ease-in-out'
                          }}
                          title={`Click to securely view ${filename}`}
                        >
                          <FileIcon /><span>{children}</span>
                        </button>
                      );
                    }
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', textDecoration: 'underline', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '3px', wordBreak: 'break-word'}}>
                        <span>{children}</span><ExternalLinkIcon />
                      </a>
                    );
                  },
                  // 🚀 ISOLATED, BULLETPROOF IMAGE RENDERER
                  img(props) {
                    const { src, alt } = props;
                    return (
                      <div style={{ margin: '16px 0', textAlign: 'center', width: '100%' }}>
                        <img 
                          src={src} 
                          alt={alt || "Generated graph"} 
                          style={{ 
                            width: '100%',
                            maxWidth: '450px', 
                            height: 'auto', 
                            display: 'block',
                            margin: '0 auto',
                            borderRadius: '8px', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: '#ffffff'
                          }} 
                          loading="lazy" 
                          onError={(e) => console.error("Failed to load image in DOM:", src)}
                        />
                        {alt && (
                          <span style={{ display: 'block', marginTop: '8px', fontSize: '0.85em', color: 'var(--text-color)', opacity: 0.8 }}>
                            {alt}
                          </span>
                        )}
                      </div>
                    );
                  }
                }
              }}
            />
          </div>
        ) : (
          <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.65', wordBreak: 'break-word' }}>{rawContent}</p>
        )}
      </div>
    </div>
  );
}
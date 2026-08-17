import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileText, ExternalLink } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { downloadFileBlob } from '../services/api';
import { useNotify } from '../context/NotificationContext';

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
// MAIN COMPONENT
// ---------------------------------------------------------
export default function ChatMessage({ role, text, isError, currentSubject = "General" }) {
  const notify = useNotify();

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
      notify.error(error.message || `Could not load ${filename}. It may have been deleted.`);
    }
  };

  return (
    <div style={{
      display: 'flex', width: '100%', marginBottom: 'var(--space-4)',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
    }}>
      <div style={{
        maxWidth: '85%', padding: '16px 20px', borderRadius: 'var(--radius-lg)',
        backgroundColor: isBot ? (isError ? 'var(--color-danger-bg)' : 'var(--color-surface)') : 'var(--color-primary-500)',
        color: isBot ? (isError ? 'var(--color-danger)' : 'var(--color-text-primary)') : 'var(--color-on-primary)',
        border: isBot ? (isError ? '1px solid var(--color-danger)' : '1px solid var(--color-border)') : 'none',
        borderBottomLeftRadius: isBot ? '0' : 'var(--radius-lg)',
        borderBottomRightRadius: isBot ? 'var(--radius-lg)' : '0',
        boxShadow: 'var(--shadow-xs)',
        lineHeight: '1.6',
        overflowX: 'auto',
      }}>
        {isBot ? (
          <div className="bot-message-container" style={{ width: '100%' }}>
            <SafeMarkdown
              rawText={rawContent}
              mdProps={{
                components: {
                  p({ node, children }) { return <p style={{ margin: '0 0 10px 0', lineHeight: '1.65', wordBreak: 'break-word' }}>{children}</p>; },
                  ul({ node, children }) { return <ul style={{ margin: '0 0 10px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</ul>; },
                  ol({ node, children }) { return <ol style={{ margin: '0 0 10px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</ol>; },
                  li({ node, children }) { return <li style={{ margin: 0, lineHeight: '1.5' }}>{children}</li>; },
                  h3({ node, children }) { return <h3 style={{ fontSize: '1.1rem', margin: '14px 0 6px 0' }}>{children}</h3>; },
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ borderRadius: 'var(--radius-md)', margin: '10px 0', fontSize: '0.9em' }} {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code style={{ backgroundColor: 'var(--color-surface-hover)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontSize: '0.9em', wordBreak: 'break-all' }} {...props}>
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
                            background: 'var(--color-info-bg)', border: '1px solid var(--color-primary-200)', borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-primary-600)', cursor: 'pointer', padding: '2px 8px', font: 'inherit', margin: '0 4px',
                            width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px', transition: `all var(--duration-base) var(--ease-standard)`
                          }}
                          title={`Click to securely view ${filename}`}
                        >
                          <FileText size={14} /><span>{children}</span>
                        </button>
                      );
                    }
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-500)', textDecoration: 'underline', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '3px', wordBreak: 'break-word'}}>
                        <span>{children}</span><ExternalLink size={13} />
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
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-sm)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-on-primary)' /* generated charts often bake in a white background; keep it consistent regardless of theme */
                          }}
                          loading="lazy"
                          onError={(e) => console.error("Failed to load image in DOM:", src)}
                        />
                        {alt && (
                          <span style={{ display: 'block', marginTop: '8px', fontSize: '0.85em', color: 'var(--color-text-secondary)' }}>
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

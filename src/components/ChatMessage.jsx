/**
 * @file ChatMessage.jsx
 * @description Renders individual chat bubbles, handling Markdown, Code, and LaTeX equations.
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

export default function ChatMessage({ role, text }) {
  const isBot = role === 'bot';

  return (
    <div style={{
      display: 'flex', width: '100%', marginBottom: '16px',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
    }}>
      <div style={{
        maxWidth: '85%', padding: '16px', borderRadius: '12px',
        backgroundColor: isBot ? 'var(--container-bg)' : 'var(--primary)',
        color: isBot ? 'var(--text-color)' : '#ffffff',
        border: isBot ? '1px solid var(--border-color)' : 'none',
        borderBottomLeftRadius: isBot ? '0' : '12px',
        borderBottomRightRadius: isBot ? '12px' : '0',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        lineHeight: '1.6'
      }}>
        {isBot ? (
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ borderRadius: '8px', margin: '10px 0', fontSize: '0.9em' }} {...props}>
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code style={{ backgroundColor: 'rgba(128,128,128,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em' }} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {text}
          </ReactMarkdown>
        ) : (
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{text}</p>
        )}
      </div>
    </div>
  );
}
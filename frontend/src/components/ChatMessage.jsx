import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw 
} from 'lucide-react';

export default function ChatMessage({ message, isLast, isStreaming, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [liked, setLiked] = useState(null);

  const isAssistant = message.role === 'assistant';

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        window.speechSynthesis.cancel(); // clear previous queue
        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.rate = 1.0;
        utterance.pitch = 1.05; // cheerful tone for Enstine!
        
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      padding: '20px 24px',
      backgroundColor: isAssistant ? 'rgba(22, 27, 38, 0.4)' : 'transparent',
      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      width: '100%'
    }} className="animate-fade-in">
      {/* Avatar */}
      <div style={{ flexShrink: 0 }}>
        {isAssistant ? (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)'
          }}>
            <Sparkles size={20} color="#ffffff" />
          </div>
        ) : (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} color="var(--text-muted)" />
          </div>
        )}
      </div>

      {/* Message Content Container */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name Header & Timestamp */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px'
        }}>
          <span style={{
            fontWeight: 600,
            fontSize: '0.88rem',
            color: isAssistant ? '#fbbf24' : 'var(--text-main)',
            fontFamily: 'var(--font-heading)'
          }}>
            {isAssistant ? 'Enstine' : 'You'}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>

        {/* Text Body / Markdown */}
        <div className="markdown-body">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');

                if (!inline && match) {
                  return (
                    <CodeBlock language={match[1]} code={codeString} />
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Action Toolbar for Assistant Messages */}
        {isAssistant && !isStreaming && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.03)'
          }}>
            <button
              onClick={handleCopyText}
              title="Copy Message"
              style={{
                background: 'none',
                border: 'none',
                color: copied ? '#10b981' : 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleToggleSpeak}
              title={isPlayingAudio ? "Stop Voice" : "Listen to Enstine"}
              style={{
                background: 'none',
                border: 'none',
                color: isPlayingAudio ? '#fbbf24' : 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem'
              }}
            >
              {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isPlayingAudio ? 'Speaking...' : 'Listen'}</span>
            </button>

            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                title="Regenerate Response"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem'
                }}
              >
                <RefreshCw size={13} />
                <span>Retry</span>
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
              <button
                onClick={() => setLiked(liked === 'up' ? null : 'up')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: liked === 'up' ? '#10b981' : 'var(--text-dim)',
                  cursor: 'pointer'
                }}
              >
                <ThumbsUp size={13} />
              </button>
              <button
                onClick={() => setLiked(liked === 'down' ? null : 'down')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: liked === 'down' ? '#ef4444' : 'var(--text-dim)',
                  cursor: 'pointer'
                }}
              >
                <ThumbsDown size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Code Block Component with header and copy button
function CodeBlock({ language, code }) {
  const [codeCopied, setCodeCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span>{language || 'code'}</span>
        <button
          onClick={copyCode}
          style={{
            background: 'none',
            border: 'none',
            color: codeCopied ? '#10b981' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem'
          }}
        >
          {codeCopied ? <Check size={13} /> : <Copy size={13} />}
          <span>{codeCopied ? 'Copied' : 'Copy code'}</span>
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

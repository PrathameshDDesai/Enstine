import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Mic, MicOff, Sparkles, Lightbulb, Code2, Heart, HelpCircle } from 'lucide-react';

const SUGGESTIONS = [
  { icon: Lightbulb, title: 'Explain Quantum Physics', prompt: 'Can you explain quantum entanglement in simple, friendly terms with real-world analogies?' },
  { icon: Code2, title: 'Build a React Hook', prompt: 'Write a custom React hook for handling local storage with error handling and full TypeScript comments.' },
  { icon: Heart, title: 'Positive Motivation', prompt: 'Give me a warm, inspiring pep talk to start my day with positive energy!' },
  { icon: HelpCircle, title: 'Brainstorm Ideas', prompt: 'Help me brainstorm 5 unique web application ideas powered by AI.' },
];

export default function ChatInput({ onSendMessage, isStreaming, onStopStream, hasMessages }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea based on input content length
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;

    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '820px',
      margin: '0 auto',
      padding: '0 20px 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Quick Suggestion Chips if no conversation started */}
      {!hasMessages && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          marginBottom: '8px'
        }} className="animate-fade-in">
          {SUGGESTIONS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <button
                key={idx}
                onClick={() => onSendMessage(s.prompt)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-gold)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} color="#fbbf24" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.title}</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {s.prompt.slice(0, 55)}...
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Input Box */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-secondary)',
          border: isListening ? '1px solid #ef4444' : '1px solid var(--border-color)',
          boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.2s ease'
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Enstine anything..."
          rows={1}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            maxHeight: '180px',
            lineHeight: '1.5'
          }}
        />

        {/* Speech Recognition Button */}
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          title={isListening ? "Stop Voice Input" : "Speak to Enstine"}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: isListening ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
            color: isListening ? '#ef4444' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Send / Stop Streaming Button */}
        {isStreaming ? (
          <button
            type="button"
            onClick={onStopStream}
            title="Stop generating"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Square size={16} fill="#fff" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            title="Send Message"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              background: input.trim() 
                ? 'linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)' 
                : 'rgba(255, 255, 255, 0.05)',
              color: input.trim() ? '#fff' : 'var(--text-dim)',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: input.trim() ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none'
            }}
          >
            <Send size={16} />
          </button>
        )}
      </form>

      <p style={{
        textAlign: 'center',
        fontSize: '0.72rem',
        color: 'var(--text-dim)'
      }}>
        Enstine is powered by Gemini 2.5 Flash. Designed with friendly AI companionship in mind.
      </p>
    </div>
  );
}

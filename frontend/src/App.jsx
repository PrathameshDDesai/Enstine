import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import PersonaModal from './components/PersonaModal';
import ModelSelector from './components/ModelSelector';
import ComparisonGrid from './components/ComparisonGrid';
import { Sparkles, Menu, Plus } from 'lucide-react';

export default function App() {
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPersona, setCurrentPersona] = useState('friendly');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('enstine_sidebar_collapsed') === 'true';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [healthInfo, setHealthInfo] = useState(null);

  // Multi-AI Model & Compare Mode States
  const [availableModels, setAvailableModels] = useState([
    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'gemini', badge: '🌟 Google Gemini' },
    { id: 'gpt-4o', name: 'ChatGPT GPT-4o', provider: 'openai', badge: '🤖 OpenAI ChatGPT' },
    { id: 'gpt-4o-mini', name: 'ChatGPT 4o Mini', provider: 'openai', badge: '⚡ OpenAI ChatGPT' },
    { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'deepseek', badge: '🧠 DeepSeek AI' },
    { id: 'deepseek-reasoner', name: 'DeepSeek R1', provider: 'deepseek', badge: '🔬 DeepSeek AI' }
  ]);
  const [selectedModelId, setSelectedModelId] = useState('gemini-3.6-flash');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedCompareModels, setSelectedCompareModels] = useState(['gemini-3.6-flash', 'gpt-4o', 'deepseek-chat']);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  
  const messagesEndRef = useRef(null);

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('enstine_sidebar_collapsed', next.toString());
      return next;
    });
  };

  // Fetch initial threads, health, and available models
  useEffect(() => {
    fetchThreads();
    fetchHealth();
    fetchModels();
  }, []);

  // Fetch messages whenever active thread changes
  useEffect(() => {
    if (activeThreadId) {
      fetchThreadMessages(activeThreadId);
    } else {
      setMessages([]);
    }
  }, [activeThreadId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, comparisonResult]);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthInfo(data);
      }
    } catch (e) {
      console.warn("Health check failed:", e);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
        }
      }
    } catch (e) {
      console.warn("Failed to load models list:", e);
    }
  };

  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
        if (data.threads && data.threads.length > 0 && !activeThreadId) {
          setActiveThreadId(data.threads[0].threadId);
        }
      }
    } catch (e) {
      console.error("Failed to load chats:", e);
    }
  };

  const fetchThreadMessages = async (threadId) => {
    try {
      const res = await fetch(`/api/chats/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.thread) {
          setMessages(data.thread.messages || []);
          if (data.thread.persona) {
            setCurrentPersona(data.thread.persona);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch messages:", e);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: currentPersona })
      });
      if (res.ok) {
        const data = await res.json();
        setThreads(prev => [data.thread, ...prev]);
        setActiveThreadId(data.thread.threadId);
        setMessages([]);
        setComparisonResult(null);
        setIsSidebarOpen(false);
      }
    } catch (e) {
      console.error("Error creating chat:", e);
    }
  };

  const handleDeleteThread = async (threadId) => {
    try {
      await fetch(`/api/chats/${threadId}`, { method: 'DELETE' });
      setThreads(prev => prev.filter(t => t.threadId !== threadId));
      if (activeThreadId === threadId) {
        const remaining = threads.filter(t => t.threadId !== threadId);
        if (remaining.length > 0) {
          setActiveThreadId(remaining[0].threadId);
        } else {
          setActiveThreadId(null);
          setMessages([]);
        }
      }
    } catch (e) {
      console.error("Failed to delete thread:", e);
    }
  };

  const handleRenameThread = async (threadId, newTitle) => {
    try {
      const res = await fetch(`/api/chats/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) {
        setThreads(prev => prev.map(t => t.threadId === threadId ? { ...t, title: newTitle } : t));
      }
    } catch (e) {
      console.error("Failed to rename thread:", e);
    }
  };

  const handleToggleCompareModel = (modelId) => {
    setSelectedCompareModels(prev => {
      if (prev.includes(modelId)) {
        if (prev.length <= 1) return prev; // Keep at least 1 model
        return prev.filter(id => id !== modelId);
      } else {
        if (prev.length >= 3) return [...prev.slice(1), modelId]; // Max 3 models
        return [...prev, modelId];
      }
    });
  };

  const handleSendMessage = async (userPrompt) => {
    if (!userPrompt.trim()) return;

    // Handle Compare Mode Submission
    if (isCompareMode) {
      setIsComparing(true);
      setComparisonResult({ prompt: userPrompt, results: [] });
      try {
        const res = await fetch('/api/chat/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userPrompt,
            modelIds: selectedCompareModels,
            persona: currentPersona,
            messages: messages
          })
        });

        if (res.ok) {
          const data = await res.json();
          setComparisonResult(data);
        } else {
          const errData = await res.json();
          console.error("Comparison Error:", errData);
        }
      } catch (err) {
        console.error("Compare Request failed:", err);
      } finally {
        setIsComparing(false);
      }
      return;
    }

    // Single AI Chat Mode
    const userMsg = { role: 'user', content: userPrompt, timestamp: new Date().toISOString() };
    const tempAssistantMsg = { role: 'assistant', content: '', timestamp: new Date().toISOString() };

    setMessages(prev => [...prev, userMsg, tempAssistantMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          threadId: activeThreadId,
          persona: currentPersona,
          modelId: selectedModelId
        })
      });

      if (!response.ok) {
        throw new Error("API streaming error");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));

              if (data.type === 'threadId' && !activeThreadId) {
                setActiveThreadId(data.threadId);
              } else if (data.type === 'chunk') {
                assistantText += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: assistantText
                  };
                  return updated;
                });
              } else if (data.type === 'done') {
                assistantText = data.text;
              } else if (data.type === 'error') {
                assistantText = `⚠️ Error: ${data.error || 'Failed to generate response.'}`;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: assistantText
                  };
                  return updated;
                });
              }
            } catch (err) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      fetchThreads();

    } catch (error) {
      console.error("Stream error:", error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: "I'm sorry, I encountered an issue connecting to the selected AI model. Please try again!",
          timestamp: new Date().toISOString()
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      setMessages(prev => prev.slice(0, -1));
      handleSendMessage(lastUserMsg.content);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => { setActiveThreadId(id); setIsSidebarOpen(false); }}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        onRenameThread={handleRenameThread}
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {/* Top Header Navigation */}
        <header style={{
          height: '60px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          backgroundColor: 'rgba(14, 17, 23, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(!isSidebarOpen);
                } else {
                  handleToggleCollapse();
                }
              }}
              title="Toggle Sidebar"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Menu size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#fbbf24',
                boxShadow: '0 0 8px #fbbf24'
              }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem', color: '#fff' }}>
                Enstine Multi-AI
              </span>
            </div>
          </div>

          {/* Model Switcher & Compare Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ModelSelector
              availableModels={availableModels}
              selectedModelId={selectedModelId}
              onSelectModel={setSelectedModelId}
              isCompareMode={isCompareMode}
              onToggleCompareMode={() => setIsCompareMode(!isCompareMode)}
              selectedCompareModels={selectedCompareModels}
              onToggleCompareModel={handleToggleCompareModel}
            />

            <button
              onClick={handleNewChat}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </header>

        {/* Content Body: Compare Mode vs Single Chat */}
        {isCompareMode ? (
          <ComparisonGrid
            comparisonResult={comparisonResult}
            isLoading={isComparing}
            selectedCompareModels={selectedCompareModels}
            availableModels={availableModels}
          />
        ) : (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {messages.length === 0 ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center',
                maxWidth: '600px'
              }} className="animate-fade-in">
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)'
                }} className="pulse-glow">
                  <Sparkles size={38} color="#ffffff" />
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: '10px',
                  letterSpacing: '-0.02em'
                }}>
                  Hello, I'm Enstine!
                </h2>

                <p style={{
                  fontSize: '1rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '30px'
                }}>
                  Select your preferred AI engine (Gemini, ChatGPT, or DeepSeek) or switch to Compare Mode to test multiple models side-by-side!
                </p>
              </div>
            ) : (
              <div style={{ width: '100%', maxWidth: '880px' }}>
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={index}
                    message={msg}
                    isLast={index === messages.length - 1}
                    isStreaming={isStreaming && index === messages.length - 1}
                    onRegenerate={handleRegenerate}
                  />
                ))}

                {isStreaming && messages[messages.length - 1]?.content === '' && (
                  <div style={{ padding: '20px 24px', display: 'flex', gap: '14px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Sparkles size={20} color="#ffffff" />
                    </div>
                    <div className="typing-dots">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming || isComparing}
          currentPersona={currentPersona}
        />
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <PersonaModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentPersona={currentPersona}
          onSelectPersona={setCurrentPersona}
          healthInfo={healthInfo}
          onKeysUpdated={fetchModels}
        />
      )}

    </div>
  );
}

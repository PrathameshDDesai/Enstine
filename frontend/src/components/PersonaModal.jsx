import React, { useState, useEffect } from 'react';
import { X, Sparkles, Smile, Cpu, Code2, Palette, ShieldCheck, Database, Key, Eye, EyeOff, CheckCircle2, AlertCircle, Save, Bot, Brain, Zap } from 'lucide-react';

const PERSONAS = [
  { id: 'friendly', name: 'Friendly Companion', icon: Smile, desc: 'Warm, cheerful, empathetic & encouraging' },
  { id: 'genius', name: 'Genius Mentor', icon: Cpu, desc: 'Deep insights, clear explanations & structured logic' },
  { id: 'coder', name: 'Coding Expert', icon: Code2, desc: 'Clean, full-stack software development & architecture' },
  { id: 'creative', name: 'Creative Partner', icon: Palette, desc: 'Storytelling, rich brainstorming & ideation' },
];

const PROVIDERS = [
  { key: 'gemini', name: 'Google Gemini', icon: Sparkles, color: '#fbbf24', envName: 'GEMINI_API_KEY', placeholder: 'AIzaSy...' },
  { key: 'openai', name: 'OpenAI ChatGPT', icon: Bot, color: '#10b981', envName: 'OPENAI_API_KEY', placeholder: 'sk-proj-...' },
  { key: 'deepseek', name: 'DeepSeek AI', icon: Brain, color: '#8b5cf6', envName: 'DEEPSEEK_API_KEY', placeholder: 'sk-...' },
  { key: 'groq', name: 'Groq AI', icon: Zap, color: '#f97316', envName: 'GROQ_API_KEY', placeholder: 'gsk_...' }
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function PersonaModal({ isOpen, onClose, currentPersona, onSelectPersona, healthInfo, onKeysUpdated }) {
  const [activeTab, setActiveTab] = useState('keys'); // 'keys' | 'persona'
  const [keys, setKeys] = useState({ gemini: '', openai: '', deepseek: '', groq: '' });
  const [keyStatus, setKeyStatus] = useState({ gemini: false, openai: false, deepseek: false, groq: false });
  const [showKey, setShowKey] = useState({ gemini: false, openai: false, deepseek: false, groq: false });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchKeys();
    }
  }, [isOpen]);

  const fetchKeys = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings/keys`);
      if (res.ok) {
        const data = await res.json();
        if (data.keys) setKeys(data.keys);
        if (data.keyStatus) setKeyStatus(data.keyStatus);
      }
    } catch (err) {
      console.warn("Failed to fetch keys:", err);
    }
  };

  const handleSaveKeys = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/settings/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys)
      });

      const data = await res.json();
      if (res.ok) {
        setKeyStatus(data.keyStatus || {});
        setSaveMessage({ type: 'success', text: '✅ API keys saved! Available AI tools updated.' });
        if (onKeysUpdated) onKeysUpdated();
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save API keys.' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Connection error saving keys.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', margin: 0 }}>
                Settings & AI Configuration
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                Configure API Keys for AI Tools & Personality Mode
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-tertiary)'
        }}>
          <button
            onClick={() => setActiveTab('keys')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'keys' ? '2px solid #fbbf24' : '2px solid transparent',
              color: activeTab === 'keys' ? '#fbbf24' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <Key size={16} />
            <span>AI Tool API Keys</span>
          </button>

          <button
            onClick={() => setActiveTab('persona')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'persona' ? '2px solid #fbbf24' : '2px solid transparent',
              color: activeTab === 'persona' ? '#fbbf24' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <Smile size={16} />
            <span>Agent Persona</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* TAB 1: API KEYS CONFIGURATION */}
          {activeTab === 'keys' && (
            <>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Enter your API keys for each AI provider. Configuring an API key automatically enables its tools and models for model selection and side-by-side comparison!
              </div>

              {saveMessage && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: saveMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: saveMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: saveMessage.type === 'success' ? '#10b981' : '#ef4444'
                }}>
                  {saveMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{saveMessage.text}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {PROVIDERS.map((provider) => {
                  const Icon = provider.icon;
                  const isConnected = !!keyStatus[provider.key];
                  const isVisible = showKey[provider.key];

                  return (
                    <div
                      key={provider.key}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon size={18} color={provider.color} />
                          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>
                            {provider.name}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                            {provider.envName}
                          </span>
                        </div>

                        {isConnected ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '3px 8px', borderRadius: '12px' }}>
                            <CheckCircle2 size={12} /> Connected
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(245, 158, 11, 0.12)', padding: '3px 8px', borderRadius: '12px' }}>
                            <AlertCircle size={12} /> Key Required
                          </span>
                        )}
                      </div>

                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type={isVisible ? 'text' : 'password'}
                          value={keys[provider.key] || ''}
                          onChange={(e) => setKeys({ ...keys, [provider.key]: e.target.value })}
                          placeholder={provider.placeholder}
                          style={{
                            width: '100%',
                            padding: '9px 40px 9px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-primary)',
                            color: '#fff',
                            fontSize: '0.82rem',
                            fontFamily: 'monospace',
                            outline: 'none',
                            transition: 'border 0.15s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />

                        <button
                          type="button"
                          onClick={() => setShowKey({ ...showKey, [provider.key]: !isVisible })}
                          title={isVisible ? "Hide key" : "Show key"}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* TAB 2: PERSONA SELECTION */}
          {activeTab === 'persona' && (
            <>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Choose the behavior, tone, and intelligence style for Enstine AI assistant.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PERSONAS.map(p => {
                  const Icon = p.icon;
                  const isSelected = currentPersona === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectPersona(p.id)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)'
                      }}>
                        <Icon size={20} color={isSelected ? '#fbbf24' : 'var(--text-muted)'} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isSelected ? '#fbbf24' : '#fff' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {p.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* System Status Info */}
              <div style={{
                marginTop: '10px',
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={15} color="#10b981" /> Backend Engine Status
                  </span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database size={15} color="#06b6d4" /> Thread Storage Mode
                  </span>
                  <span style={{ color: '#06b6d4', fontWeight: 600 }}>
                    {healthInfo?.database || 'Active'}
                  </span>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}>
          {activeTab === 'keys' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveKeys}
                disabled={isSaving}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isSaving ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save & Apply Keys'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              style={{
                marginLeft: 'auto',
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

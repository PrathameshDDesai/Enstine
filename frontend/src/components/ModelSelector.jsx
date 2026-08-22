import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Brain, Zap, Columns, Check, ChevronDown, Key } from 'lucide-react';

export default function ModelSelector({
  availableModels = [],
  selectedModelId,
  onSelectModel,
  isCompareMode,
  onToggleCompareMode,
  selectedCompareModels = [],
  onToggleCompareModel
}) {
  const [isOpen, setIsOpen] = useState(false);

  const currentModel = availableModels.find(m => m.id === selectedModelId) || availableModels[0] || {
    name: 'Gemini 3.6 Flash',
    badge: '🌟 Google Gemini'
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'openai': return <Bot size={15} color="#10b981" />;
      case 'deepseek': return <Brain size={15} color="#8b5cf6" />;
      case 'groq': return <Zap size={15} color="#f97316" />;
      default: return <Sparkles size={15} color="#fbbf24" />;
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Mode Toggle Button: Single vs Compare */}
      <button
        onClick={onToggleCompareMode}
        title={isCompareMode ? "Switch to Single AI Chat" : "Switch to Side-by-Side Model Comparison"}
        style={{
          padding: '6px 12px',
          borderRadius: '20px',
          border: isCompareMode ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
          background: isCompareMode ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
          color: isCompareMode ? '#38bdf8' : 'var(--text-muted)',
          fontSize: '0.78rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isCompareMode ? '0 0 12px rgba(6, 182, 212, 0.2)' : 'none'
        }}
      >
        <Columns size={15} color={isCompareMode ? '#38bdf8' : 'var(--text-muted)'} />
        <span>{isCompareMode ? "Compare Mode Active" : "Compare Models"}</span>
      </button>

      {/* Single Mode Model Dropdown */}
      {!isCompareMode ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid var(--border-highlight)',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {getProviderIcon(currentModel.provider)}
            <span>{currentModel.name}</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {isOpen && (
            <>
              <div 
                onClick={() => setIsOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
              />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '260px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '6px',
                zIndex: 100,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(16px)'
              }}>
                <div style={{ padding: '6px 10px', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Select AI Engine
                </div>
                {availableModels.map((m) => {
                  const isSelected = selectedModelId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        onSelectModel(m.id);
                        setIsOpen(false);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        marginBottom: '2px'
                      }}
                      onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                      onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getProviderIcon(m.provider)}
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{m.name}</span>
                            {m.hasKey === false && (
                              <span style={{ fontSize: '0.62rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '1px 5px', borderRadius: '4px' }}>
                                Key Needed
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {m.badge}
                          </div>
                        </div>
                      </div>

                      {isSelected && <Check size={16} color="#fbbf24" />}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

      ) : (
        /* Compare Mode Multi-Model Selection Pills */
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {availableModels.map((m) => {
            const isChecked = selectedCompareModels.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => onToggleCompareModel(m.id)}
                title={`Toggle ${m.name} in comparison`}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: isChecked ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  background: isChecked ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-tertiary)',
                  color: isChecked ? '#fbbf24' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {getProviderIcon(m.provider)}
                <span>{m.name.split(' ')[0]}</span>
                {isChecked && <Check size={12} color="#fbbf24" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Sparkles, Bot, Brain, Zap, Copy, Check, Clock, AlertTriangle } from 'lucide-react';

export default function ComparisonGrid({
  comparisonResult,
  isLoading,
  selectedCompareModels = [],
  availableModels = []
}) {
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'openai': return <Bot size={18} color="#10b981" />;
      case 'deepseek': return <Brain size={18} color="#8b5cf6" />;
      case 'groq': return <Zap size={18} color="#f97316" />;
      default: return <Sparkles size={18} color="#fbbf24" />;
    }
  };


  if (!comparisonResult && !isLoading) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(6, 182, 212, 0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          border: '1px solid var(--border-highlight)'
        }}>
          <Sparkles size={28} color="#fbbf24" />
        </div>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>
          Side-by-Side Model Comparison
        </h3>
        <p style={{ maxWidth: '420px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Send any prompt below to query multiple AI models simultaneously (Google Gemini, OpenAI ChatGPT, DeepSeek) and compare their responses!
        </p>
      </div>
    );
  }

  const results = comparisonResult?.results || selectedCompareModels.map(id => {
    const meta = availableModels.find(m => m.id === id) || { id, name: id, provider: 'gemini', badge: id };
    return {
      modelId: id,
      name: meta.name,
      provider: meta.provider,
      badge: meta.badge,
      status: isLoading ? 'loading' : 'idle',
      text: ''
    };
  });

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Prompt Banner */}
      {comparisonResult?.prompt && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase' }}>
            Comparing Prompt:
          </span>
          <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500 }}>
            "{comparisonResult.prompt}"
          </span>
          {comparisonResult.totalTimeMs && (
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {comparisonResult.totalTimeMs}ms
            </span>
          )}
        </div>
      )}

      {/* Columns Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(1, results.length)}, 1fr)`,
        gap: '16px',
        flex: 1,
        minHeight: '0'
      }}>
        {results.map((res) => {
          const isPending = isLoading && !res.text;
          const isError = res.status === 'error';

          return (
            <div
              key={res.modelId}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Card Header */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getProviderIcon(res.provider)}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                      {res.name}
                    </h4>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      {res.badge}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {res.latencyMs && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12} /> {res.latencyMs}ms
                    </span>
                  )}

                  {res.text && (
                    <button
                      onClick={() => handleCopy(res.text, res.modelId)}
                      title="Copy Response"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    >
                      {copiedId === res.modelId ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body Content */}
              <div style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                color: 'var(--text-main)',
                whiteSpace: 'pre-wrap'
              }}>
                {isPending ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px 0' }}>
                    <div style={{ height: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', width: '80%', animation: 'pulseGlow 1.5s infinite' }} />
                    <div style={{ height: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', width: '95%', animation: 'pulseGlow 1.5s infinite' }} />
                    <div style={{ height: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', width: '60%', animation: 'pulseGlow 1.5s infinite' }} />
                  </div>
                ) : isError ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{res.error || 'Failed to generate response.'}</span>
                  </div>
                ) : (
                  res.text
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

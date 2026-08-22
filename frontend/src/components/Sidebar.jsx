import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Sparkles, 
  Search, 
  Settings, 
  Smile, 
  Cpu, 
  Code2, 
  Palette,
  X,
  Edit2,
  Check,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const PERSONAS = [
  { id: 'friendly', name: 'Friendly Companion', icon: Smile, desc: 'Warm, empathetic & encouraging' },
  { id: 'genius', name: 'Genius Mentor', icon: Cpu, desc: 'Insightful, deep & analytical' },
  { id: 'coder', name: 'Coding Expert', icon: Code2, desc: 'Clean code & full-stack wizard' },
  { id: 'creative', name: 'Creative Partner', icon: Palette, desc: 'Imaginative & storytelling' },
];

export default function Sidebar({ 
  threads, 
  activeThreadId, 
  onSelectThread, 
  onNewChat, 
  onDeleteThread, 
  onRenameThread,
  currentPersona, 
  onSelectPersona,
  isOpen,
  onCloseMobile,
  onOpenSettings,
  isCollapsed,
  onToggleCollapse
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Dynamic width state with persistent local storage
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('enstine_sidebar_width');
    return saved ? parseInt(saved, 10) : 280;
  });

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      // Clamp sidebar width between 200px and 480px
      const newWidth = Math.min(Math.max(e.clientX, 200), 480);
      setSidebarWidth(newWidth);
      localStorage.setItem('enstine_sidebar_width', newWidth.toString());
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing]);

  const filteredThreads = threads.filter(t => 
    t.title ? t.title.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const startRename = (e, thread) => {
    e.stopPropagation();
    setEditingId(thread.threadId);
    setEditTitle(thread.title);
  };

  const saveRename = (e, threadId) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameThread(threadId, editTitle.trim());
    }
    setEditingId(null);
  };

  const currentWidth = isCollapsed ? 68 : sidebarWidth;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 40,
            backdropFilter: 'blur(4px)'
          }}
          className="md:hidden"
        />
      )}

      <aside 
        ref={sidebarRef}
        className={`sidebar-container ${isOpen ? 'mobile-open' : ''}`}
        style={{
          width: `${currentWidth}px`,
          height: '100vh',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          left: 0,
          top: 0,
          zIndex: 50,
          transition: isResizing ? 'none' : 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease',
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        {/* Header Branding */}
        <div style={{
          padding: isCollapsed ? '16px 10px' : '18px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div 
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
                flexShrink: 0,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={22} color="#ffffff" />
            </div>
            {!isCollapsed && (
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <h1 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.2
                }}>
                  Enstine <span style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>AI v2.5</span>
                </h1>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Friendly AI Companion
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {!isCollapsed && onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Collapse Sidebar"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <PanelLeftClose size={18} />
              </button>
            )}
            <button 
              onClick={onCloseMobile}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              className="md:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div style={{ padding: isCollapsed ? '12px 10px' : '12px 16px' }}>
          <button
            onClick={onNewChat}
            title="Start New Chat"
            style={{
              width: '100%',
              padding: isCollapsed ? '10px 0' : '10px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(6, 182, 212, 0.15))',
              border: '1px solid var(--border-highlight)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(6, 182, 212, 0.25))'}
            onMouseOut={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(6, 182, 212, 0.15))'}
          >
            <Plus size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Persona Switcher Section */}
        <div style={{ padding: isCollapsed ? '0 10px 12px 10px' : '0 16px 12px 16px' }}>
          {!isCollapsed && (
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 600 }}>
              Enstine Persona
            </p>
          )}
          <div style={{
            display: isCollapsed ? 'flex' : 'grid',
            flexDirection: isCollapsed ? 'column' : 'row',
            gridTemplateColumns: isCollapsed ? 'none' : '1fr 1fr',
            gap: '6px'
          }}>
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              const isSelected = currentPersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPersona(p.id)}
                  title={`${p.name} - ${p.desc}`}
                  style={{
                    padding: isCollapsed ? '8px' : '6px 8px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-tertiary)',
                    color: isSelected ? '#fbbf24' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} color={isSelected ? '#fbbf24' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                  {!isCollapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name.split(' ')[0]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar (Only when expanded) */}
        {!isCollapsed && (
          <div style={{ padding: '0 16px 8px 16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}>
              <Search size={14} color="var(--text-dim)" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  width: '100%'
                }}
              />
            </div>
          </div>
        )}

        {/* Threads List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: isCollapsed ? '0 8px 12px 8px' : '0 12px 12px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {!isCollapsed && (
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', margin: '8px 4px 4px 4px', fontWeight: 600 }}>
              Recent History
            </p>
          )}

          {filteredThreads.length === 0 ? (
            !isCollapsed && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                No chats found
              </div>
            )
          ) : (
            filteredThreads.map((t) => {
              const isActive = t.threadId === activeThreadId;
              const isEditing = editingId === t.threadId;

              return (
                <div
                  key={t.threadId}
                  onClick={() => onSelectThread(t.threadId)}
                  title={t.title || 'New Chat'}
                  style={{
                    padding: isCollapsed ? '8px 0' : '8px 10px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                    border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                    <MessageSquare size={15} color={isActive ? '#fbbf24' : 'var(--text-dim)'} style={{ flexShrink: 0 }} />
                    {!isCollapsed && (
                      isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveRename(e, t.threadId); }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--accent-gold)',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '0.8rem',
                            padding: '2px 4px',
                            width: '100%',
                            outline: 'none'
                          }}
                        />
                      ) : (
                        <span style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: isActive ? 600 : 400
                        }}>
                          {t.title || 'New Chat'}
                        </span>
                      )
                    )}
                  </div>

                  {!isCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isEditing ? (
                        <button
                          onClick={(e) => saveRename(e, t.threadId)}
                          style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '2px' }}
                        >
                          <Check size={14} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => startRename(e, t)}
                            title="Rename Chat"
                            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', opacity: isActive ? 1 : 0.6 }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteThread(t.threadId);
                            }}
                            title="Delete Chat"
                            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', opacity: isActive ? 1 : 0.6 }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Profile / Settings */}
        <div style={{
          padding: isCollapsed ? '12px 8px' : '12px 16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}>
          {!isCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enstine Active</span>
            </div>
          ) : (
            <div 
              title="Enstine Active"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }} 
            />
          )}

          <button
            onClick={onOpenSettings}
            title="Settings"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem'
            }}
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Dynamic Drag Handle (Right edge resizer bar) */}
        {!isCollapsed && (
          <div
            onMouseDown={startResizing}
            title="Drag to resize sidebar width"
            style={{
              position: 'absolute',
              top: 0,
              right: -3,
              width: '6px',
              height: '100%',
              cursor: 'col-resize',
              zIndex: 60,
              backgroundColor: isResizing ? 'var(--accent-gold)' : 'transparent',
              transition: 'background-color 0.15s ease'
            }}
            onMouseOver={(e) => {
              if (!isResizing) e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.4)';
            }}
            onMouseOut={(e) => {
              if (!isResizing) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          />
        )}
      </aside>
    </>
  );
}

'use client';

/**
 * NOVA AI Coach - Premium Mobile Chat
 * Fixed: scroll conflict, clipped messages, polished UX
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UsageStats {
  messageCount: number;
  remaining: number;
  limit: number;
  isUnlimited?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

function getPreferredName(name?: string | null, email?: string | null) {
  if (name && name.trim()) return name.trim().split(' ')[0]
  if (email) {
    const base = email.split('@')[0].split('.')[0]
    return base.charAt(0).toUpperCase() + base.slice(1)
  }
  return 'ahí'
}

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // controls actual render visibility
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inputRows, setInputRows] = useState(1);
  const [displayName, setDisplayName] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showConversationsMobile, setShowConversationsMobile] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const quickActions = [
    'Plan de 30 días para disciplina',
    'Rutina para ganar energía',
    'Mejora tu carisma hoy',
    'Vencer la procrastinación',
  ];

  // Dynamic Island open/close
  const openNova = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsOpen(true);
    // mount chat immediately, animate in
    setTimeout(() => setIsVisible(true), 10);
    setTimeout(() => setIsAnimating(false), 600);
    if (navigator.vibrate) navigator.vibrate(8);
  }, [isAnimating]);

  const closeNova = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsVisible(false);
    // wait for exit animation, then unmount chat
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 450);
    if (navigator.vibrate) navigator.vibrate(5);
  }, [isAnimating]);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.maxWidth = '100%';
      document.body.style.maxWidth = '100%';
      document.body.style.width = '100%';
      document.documentElement.style.width = '100%';
      document.body.style.touchAction = 'pan-y';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflowX = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflowX = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // VisualViewport: keyboard height tracking (iOS + Android)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const handleViewport = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = vv.height;
      const offsetTop = vv.offsetTop ?? 0;
      // keyboard height = how much the viewport has shrunk from the bottom
      const kb = Math.max(0, windowHeight - viewportHeight - offsetTop);
      setKeyboardHeight(kb);
      // Auto-scroll messages to bottom when keyboard appears
      if (kb > 0) {
        setTimeout(() => {
          messagesContainerRef.current?.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }, 50);
      }
    };

    vv.addEventListener('resize', handleViewport);
    vv.addEventListener('scroll', handleViewport);

    return () => {
      vv.removeEventListener('resize', handleViewport);
      vv.removeEventListener('scroll', handleViewport);
    };
  }, []);

  // Scroll to bottom within messages container only
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const lines = e.target.value.split('\n').length;
    setInputRows(Math.min(lines, 4));
  };

  const createConversation = useCallback(async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const res = await fetch('/api/ai/conversations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Nueva conversación' }),
    });
    if (res.ok) {
      const data = await res.json();
      const convo = data.conversation as Conversation;
      setConversations(prev => [convo, ...prev]);
      setActiveConversationId(convo.id);
      setMessages([]);
      setShowConversationsMobile(false);
      return convo.id;
    }
    return null;
  }, [supabase]);

  const loadHistory = useCallback(async (conversationId?: string | null) => {
    try {
      if (!conversationId) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch(`/api/ai/history?conversation_id=${conversationId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        })));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, [supabase]);

  const loadUsage = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch('/api/ai/usage', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  }, [supabase]);

  useEffect(() => {
    if (isOpen) {
      loadUsage();
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const email = user.email ?? '';
        const profileRes = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        const waitlistRes = await supabase
          .from('waitlist')
          .select('name')
          .eq('email', email)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        const name = waitlistRes.data?.name || profileRes.data?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '';
        setDisplayName(getPreferredName(name, email));

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const convoRes = await fetch('/api/ai/conversations', {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        if (convoRes.ok) {
          const convoData = await convoRes.json();
          const list: Conversation[] = convoData.conversations || [];
          setConversations(list);
          const first = list[0];
          if (first?.id) {
            setActiveConversationId(first.id);
            loadHistory(first.id);
          } else {
            await createConversation();
          }
        }
      })();
    }
  }, [isOpen, loadHistory, loadUsage, createConversation, supabase]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let convoId = activeConversationId;
    if (!convoId) {
      convoId = await createConversation();
      if (!convoId) return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Update conversation title on first user message
    if (convoId) {
      const convo = conversations.find(c => c.id === convoId);
      if (convo && (convo.title === 'Nueva conversación' || convo.title === 'New conversation')) {
        // Auto-title: first 50 chars of message, cut at word boundary
        const raw = userMessage.content.trim();
        const autoTitle = raw.length > 50
          ? raw.slice(0, raw.lastIndexOf(' ', 50) || 50) + '…'
          : raw;
        updateConversationTitle(convoId, autoTitle);
      }
      // Move active conversation to top
      setConversations(prev => {
        const updated = prev.map(c => c.id === convoId ? { ...c, updated_at: new Date().toISOString() } : c);
        return updated.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
      });
    }
    setInput('');
    setInputRows(1);
    setIsLoading(true);

    // Optimistic update — decrement counter immediately
    setUsage(prev => prev && !prev.isUnlimited ? {
      ...prev,
      remaining: Math.max(0, prev.remaining - 1),
      messageCount: prev.messageCount + 1,
    } : prev);

    // Haptic
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(8);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: userMessage.content, conversationId: convoId, conversationHistory }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        if (response.status === 429) {
          const hoursLeft = errorPayload?.resetIn ?? '??';
          throw new Error(
            errorPayload?.message ||
            `Has alcanzado tu límite diario de 10 mensajes. Se restablece en ${hoursLeft}h. 💪`
          );
        }
        throw new Error(errorPayload?.detail || errorPayload?.error || 'Error al conectar con NOVA');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage.content += parsed.content;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { ...assistantMessage };
                    return newMessages;
                  });
                }
              } catch (e) {}
            }
          }
        }
      }

      // Success haptic
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([5, 30, 5]);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Lo siento, hubo un error. Inténtalo de nuevo.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (text: string) => {
    setInput(text);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const selectConversation = async (id: string) => {
    setActiveConversationId(id);
    await loadHistory(id);
    setShowConversationsMobile(false);
  };

  const startRename = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setRenameValue(currentTitle);
  };

  const commitRename = async (id: string) => {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;
    await updateConversationTitle(id, title);
  };

  const deleteConversation = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch(`/api/ai/conversations/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    }
  };

  const updateConversationTitle = async (id: string, title: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const cleanTitle = title.trim().slice(0, 60) || 'Nueva conversación';
    const res = await fetch(`/api/ai/conversations/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: cleanTitle }),
    });
    if (res.ok) {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: cleanTitle } : c));
    }
  };

  const clearHistory = async () => {
    if (!activeConversationId) return;
    if (!confirm('¿Seguro que quieres borrar todo el historial?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch(`/api/ai/history?conversation_id=${activeConversationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (response.ok) setMessages([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  // ── CLOSED STATE ──────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <>
        {/* ── MOBILE dock pill ── */}
        <button
          onClick={openNova}
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
              backdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid rgba(255,200,87,0.18)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,200,87,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {/* Glow top edge */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

            <div className="flex items-center gap-3 px-4 py-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl p-[1.5px]" style={{ background: 'linear-gradient(135deg, #FFC857, #FF9632)' }}>
                  <div className="w-full h-full rounded-[10px] bg-black/70 flex items-center justify-center overflow-hidden">
                    <Image src="/novamejor.png" alt="NOVA" width={32} height={32} className="rounded-lg" />
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
              </div>

              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-white leading-none mb-0.5">NOVA™ AI Coach</p>
                <p className="text-xs text-white/40 truncate">Tu mentor de transformación →</p>
              </div>

              {/* Animated dots in gold */}
              <div className="flex gap-1 flex-shrink-0 items-center">
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#FFC857', animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#FFAD3B', animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#FF9632', animationDelay: '300ms' }} />
              </div>
            </div>

            {/* Gold shimmer line at bottom */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
          </div>
        </button>

        {/* ── DESKTOP pill (premium glassmorphism) ── */}
        <button
          onClick={openNova}
          className="fixed bottom-8 right-8 z-50 hidden md:block group"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
            style={{ background: 'linear-gradient(135deg, rgba(255,200,87,0.4), rgba(255,150,50,0.3))' }}
          />

          <div
            className="relative rounded-2xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 60%, rgba(255,200,87,0.04) 100%)',
              backdropFilter: 'blur(32px) saturate(200%)',
              border: '1px solid rgba(255,200,87,0.2)',
              boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,200,87,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Shimmer top edge */}
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent" />

            <div className="flex items-center gap-3 px-5 py-3.5">
              {/* Avatar with gold ring */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-xl p-[1.5px]" style={{ background: 'linear-gradient(135deg, #FFC857, #FF9632)' }}>
                  <div className="w-full h-full rounded-[10px] bg-black/75 overflow-hidden">
                    <Image src="/novamejor.png" alt="NOVA" width={44} height={44} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-white">NOVA™</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: '#FFC857', background: 'rgba(255,200,87,0.1)', border: '1px solid rgba(255,200,87,0.2)' }}>AI Coach</span>
                </div>
                <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Habla con tu mentor →</p>
              </div>

              {/* Arrow icon */}
              <div className="ml-2 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, rgba(255,200,87,0.2), rgba(255,150,50,0.15))', border: '1px solid rgba(255,200,87,0.2)' }}>
                <svg className="w-4 h-4" style={{ color: '#FFC857' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>

            {/* Gold shimmer line at bottom */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-yellow-400/25 to-transparent" />
          </div>
        </button>
      </>
    );
  }

  // ── OPEN STATE ────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Full-screen overlay - captures all touch/scroll events */}
      <div className="fixed inset-0 z-50" style={{ touchAction: 'auto', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Backdrop blur for desktop */}
        <div
          className="absolute inset-0 md:backdrop-blur-sm"
          onClick={closeNova}
          style={{
            background: isVisible ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
            transition: 'background 0.35s ease',
          }}
        />

        {/* Chat panel - mobile: full screen, desktop: floating or fullscreen */}
        <div
          className={`absolute flex overflow-hidden ${
            isFullscreen
              ? 'inset-0 md:inset-0 md:rounded-none'
              : 'inset-0 md:inset-auto md:bottom-8 md:right-8 md:w-[460px] md:h-[700px] md:rounded-3xl'
          }`}
          style={{
            minWidth: 0,
            background: 'linear-gradient(160deg, rgba(12,12,16,0.98) 0%, rgba(8,8,12,0.99) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,200,87,0.1)',
            left: isMobile ? 0 : undefined,
            right: isMobile ? 0 : undefined,
            width: isMobile ? '100%' : undefined,
            maxWidth: isMobile ? '100%' : undefined,
            height: isMobile ? '100%' : undefined,
            overflowX: 'hidden',
            boxSizing: 'border-box',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)',
            opacity: isVisible ? 1 : 0,
            transform: isMobile
              ? 'none'
              : (isVisible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)'),
            transition: isMobile
              ? 'opacity 0.2s ease'
              : (isVisible ? 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.34,1.26,0.64,1)' : 'opacity 0.3s cubic-bezier(0.4,0,1,1), transform 0.35s cubic-bezier(0.4,0,1,1)'),
            transformOrigin: isMobile ? 'center' : 'bottom right',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile conversations overlay */}
          {showConversationsMobile && (
            <div className="absolute inset-0 z-20 md:hidden" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="absolute inset-y-0 left-0 w-[85%] max-w-[340px] p-4"
                style={{
                  background: 'linear-gradient(180deg, rgba(12,12,18,0.98) 0%, rgba(8,8,12,0.99) 100%)',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  paddingBottom: 'env(safe-area-inset-bottom)'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white text-sm font-semibold">Conversaciones</h4>
                  <button onClick={() => setShowConversationsMobile(false)} className="p-2 rounded-lg text-white/40 hover:text-white">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <button onClick={createConversation} className="w-full mb-3 px-3 py-2 rounded-lg text-xs text-white/80" style={{ background: 'rgba(255,200,87,0.12)', border: '1px solid rgba(255,200,87,0.2)' }}>+ Nueva conversación</button>
                <div className="space-y-1 overflow-y-auto" style={{ maxHeight: '62vh' }}>
                  {conversations.map(c => (
                    <div key={c.id} className="relative">
                      {renamingId === c.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') commitRename(c.id); if (e.key === 'Escape') setRenamingId(null); }}
                          onBlur={() => commitRename(c.id)}
                          className="w-full px-3 py-2 rounded-xl text-xs text-white bg-white/10 border border-white/20 outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          <button onClick={() => selectConversation(c.id)} className={`flex-1 text-left px-3 py-2 rounded-lg text-xs truncate ${activeConversationId === c.id ? 'text-white' : 'text-white/60'}`} style={{ background: activeConversationId === c.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {c.title}
                          </button>
                          <button onClick={() => startRename(c.id, c.title)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 flex-shrink-0">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          <button onClick={() => deleteConversation(c.id)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={`flex-1 flex ${isFullscreen ? 'md:flex-row' : ''} overflow-hidden`}>
            {/* Sidebar (desktop fullscreen) */}
            {isFullscreen && (
              <aside
                className="hidden md:flex flex-col border-r relative"
                style={{
                  width: sidebarExpanded ? '320px' : '64px',
                  flexShrink: 0,
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: 'rgba(0,0,0,0.35)',
                  transition: 'width 0.4s cubic-bezier(0.34,1.26,0.64,1)',
                  overflow: 'hidden',
                }}
              >
                <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-white text-sm font-semibold">
                      {sidebarExpanded ? 'Conversaciones' : ''}
                    </h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSidebarExpanded(p => !p)}
                        className="p-1.5 rounded-full text-white/50 hover:text-white transition-all"
                        title={sidebarExpanded ? 'Contraer' : 'Expandir'}
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {sidebarExpanded ? (
                            <polyline points="15 18 9 12 15 6" />
                          ) : (
                            <polyline points="9 18 15 12 9 6" />
                          )}
                        </svg>
                      </button>
                      {sidebarExpanded ? (
                        <button onClick={createConversation} className="px-2 py-1 text-[11px] rounded-lg" style={{ background: 'rgba(255,200,87,0.12)', border: '1px solid rgba(255,200,87,0.2)', color: '#FFC857' }}>+ Nueva</button>
                      ) : (
                        <button onClick={createConversation} className="p-1.5 rounded-full text-[#FFC857]" style={{ background: 'rgba(255,200,87,0.12)', border: '1px solid rgba(255,200,87,0.2)' }} title="Nueva conversación">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`flex-1 overflow-y-auto ${sidebarExpanded ? 'p-3 space-y-1' : 'py-3 px-2 space-y-2'}`}>
                  {conversations.map(c => (
                    <div key={c.id} className="group relative">
                      {renamingId === c.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') commitRename(c.id); if (e.key === 'Escape') setRenamingId(null); }}
                          onBlur={() => commitRename(c.id)}
                          className="w-full px-3 py-2 rounded-xl text-xs text-white bg-white/10 border border-white/20 outline-none"
                        />
                      ) : (
                        <button onClick={() => selectConversation(c.id)} className={`w-full ${sidebarExpanded ? 'text-left px-3 py-2.5 rounded-xl text-xs truncate pr-16' : 'flex items-center justify-center w-10 h-10 rounded-full'} ${activeConversationId === c.id ? 'text-white' : 'text-white/55'}`} style={{ background: activeConversationId === c.id ? 'rgba(255,255,255,0.10)' : 'transparent', border: '1px solid ' + (activeConversationId === c.id ? 'rgba(255,255,255,0.12)' : 'transparent') }}>
                          {sidebarExpanded ? c.title : <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.55)' }} />}
                        </button>
                      )}
                      {renamingId !== c.id && sidebarExpanded && (
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-0.5">
                          <button onClick={() => startRename(c.id, c.title)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          <button onClick={() => deleteConversation(c.id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </aside>
            )}

            <div className="flex-1 flex flex-col min-w-0">


          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div
            className="flex-shrink-0 relative px-4 pt-3 pb-3"
            style={{
              background: 'linear-gradient(180deg, rgba(255,200,87,0.08) 0%, transparent 100%)',
              borderBottom: '1px solid rgba(255,200,87,0.08)',
            }}
          >
            {/* Shimmer top edge */}
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

            {/* Mobile grabber */}
            <div className="md:hidden flex justify-center mb-1">
              <div className="h-1 w-10 rounded-full bg-white/15" />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Avatar with gold ring */}
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl p-[1.5px]" style={{ background: 'linear-gradient(135deg, #FFC857, #FF9632)' }}>
                    <div className="w-full h-full rounded-[10px] bg-black/70 overflow-hidden">
                      <Image src="/novamejor.png" alt="NOVA" width={36} height={36} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm">NOVA™</h3>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: '#FFC857', background: 'rgba(255,200,87,0.1)', border: '1px solid rgba(255,200,87,0.2)' }}>online</span>
                    {displayName && !isMobile && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full max-w-[90px] truncate" style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Hola, {displayName}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/40 truncate">Tu coach de élite personal</p>
                </div>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setShowConversationsMobile(v => !v)}
                  className="md:hidden p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
                  title="Conversaciones"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
                  </svg>
                </button>
                {usage && (
                  <div
                    className="text-[11px] px-2.5 py-1 rounded-full transition-all duration-500"
                    style={usage.isUnlimited
                      ? { color: '#FFC857', background: 'rgba(255,200,87,0.08)', border: '1px solid rgba(255,200,87,0.2)' }
                      : usage.remaining <= 2
                      ? { color: '#FF6B6B', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }
                      : usage.remaining <= 5
                      ? { color: '#FFAD3B', background: 'rgba(255,173,59,0.08)', border: '1px solid rgba(255,173,59,0.2)' }
                      : { color: 'rgba(255,255,255,0.4)', background: 'rgba(255,200,87,0.06)', border: '1px solid rgba(255,200,87,0.12)' }
                    }
                  >
                    {usage.isUnlimited ? '∞ mensajes' : `${usage.remaining}/${usage.limit} 💬`}
                  </div>
                )}

                {/* Fullscreen toggle - desktop only */}
                <button
                  onClick={() => setIsFullscreen(f => !f)}
                  className="hidden md:flex p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                  title={isFullscreen ? 'Ventana flotante' : 'Pantalla completa'}
                >
                  {isFullscreen ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={clearHistory}
                  className="p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                  title="Limpiar historial"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={closeNova}
                  className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── MESSAGES ───────────────────────────────────────────────── */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={{
              touchAction: 'pan-y',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              padding: '12px 16px',
            }}
          >
            {/* Empty state */}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 space-y-6">
                {/* NOVA avatar grande */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl p-[2px]" style={{ background: 'linear-gradient(135deg, #FFC857, #FF9632)' }}>
                    <div className="w-full h-full rounded-[22px] bg-black/80 overflow-hidden">
                      <Image src="/novamejor.png" alt="NOVA" width={80} height={80} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-black flex items-center justify-center text-xs">
                    ✓
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-bold text-xl mb-1">Hola{displayName ? `, ${displayName}` : ''}. Soy NOVA™</h3>
                  <p className="text-white/40 text-sm max-w-[260px] mx-auto leading-relaxed">
                    Tu coach de élite personal. Pregúntame sobre disciplina, carisma, energía, mentalidad o productividad.
                  </p>
                </div>

                {/* Quick actions en empty state */}
                <div className="w-full space-y-2">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleQuickAction(action)}
                      className="w-full text-left px-4 py-3 rounded-2xl text-sm text-white/70 hover:text-white transition-all active:scale-[0.98]"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <span className="mr-2">⚡</span>{action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                  style={{
                    animation: 'msgIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
                    animationDelay: `${Math.min(idx * 20, 200)}ms`,
                  }}
                >
                  {/* NOVA avatar on messages */}
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-xl p-[1px] mb-0.5" style={{ background: 'linear-gradient(135deg, #FFC857, #FF9632)' }}>
                      <div className="w-full h-full rounded-[10px] bg-black/70 overflow-hidden">
                        <Image src="/novamejor.png" alt="N" width={28} height={28} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-br-md max-w-[78%]'
                        : 'rounded-bl-md max-w-[85%]'
                    }`}
                    style={msg.role === 'user' ? {
                      background: 'linear-gradient(135deg, rgba(255,200,87,0.25) 0%, rgba(255,150,50,0.2) 100%)',
                      border: '1px solid rgba(255,200,87,0.25)',
                      color: 'rgba(255,255,255,0.95)',
                    } : {
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: 'rgba(255,255,255,0.88)',
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 text-white/85 leading-relaxed nova-chunk">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                            em: ({ children }) => <em className="italic text-white/70">{children}</em>,
                            ul: ({ children }) => <ul className="list-none mb-3 space-y-1.5 nova-chunk">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1.5 nova-chunk">{children}</ol>,
                            li: ({ children }) => (
                              <li className="flex gap-2 text-white/80">
                                <span className="mt-0.5 flex-shrink-0" style={{ color: '#FFC857' }}>▸</span>
                                <span>{children}</span>
                              </li>
                            ),
                            h1: ({ children }) => <h1 className="text-base font-bold text-white mb-2 mt-3 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-sm font-bold text-white/90 mb-2 mt-3 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold text-white/80 mb-1.5 mt-2 first:mt-0">{children}</h3>,
                            code: ({ children }) => <code className="bg-white/10 px-1.5 py-0.5 rounded-md text-xs font-mono" style={{ color: '#FFC857' }}>{children}</code>,
                            pre: ({ children }) => <pre className="bg-white/5 p-3 rounded-xl overflow-x-auto mb-2 border border-white/10">{children}</pre>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 pl-3 my-2 text-white/60 italic" style={{ borderColor: 'rgba(255,200,87,0.5)' }}>
                                {children}
                              </blockquote>
                            ),
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                                {children}
                              </a>
                            ),
                            hr: () => <hr className="border-white/10 my-3" />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-end gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-xl p-[1px]" style={{ background: 'linear-gradient(135deg, #FFC857, #FF9632)' }}>
                    <div className="w-full h-full rounded-[10px] bg-black/70 overflow-hidden">
                      <Image src="/novamejor.png" alt="N" width={28} height={28} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-md"
                    style={{
                      background: 'rgba(255,200,87,0.05)',
                      border: '1px solid rgba(255,200,87,0.12)',
                    }}
                  >
                    <div className="flex gap-1.5 items-center h-4">
                      <div className="w-2 h-2 rounded-full" style={{ background: '#FFC857', opacity: 0.8, animation: 'typingDot 1.2s ease-in-out infinite' }} />
                      <div className="w-2 h-2 rounded-full" style={{ background: '#FFAD3B', opacity: 0.8, animation: 'typingDot 1.2s ease-in-out 0.2s infinite' }} />
                      <div className="w-2 h-2 rounded-full" style={{ background: '#FF9632', opacity: 0.8, animation: 'typingDot 1.2s ease-in-out 0.4s infinite' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* ── INPUT BAR ──────────────────────────────────────────────── */}
          <div
            className="flex-shrink-0 px-3 pt-3"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(20px)',
              // Keyboard-aware padding: sube con el teclado en iOS/Android
              paddingBottom: keyboardHeight > 0
                ? `${keyboardHeight + 12}px`
                : 'calc(12px + env(safe-area-inset-bottom))',
              transition: 'padding-bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Quick actions (when there are messages) */}
            {messages.length > 0 && messages.length < 3 && (
              <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-0.5"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="flex-shrink-0 text-xs text-white/50 hover:text-white/80 px-3 py-1.5 rounded-full transition-all active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            <div
              className="flex items-end gap-2 rounded-2xl px-3 py-2"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  // Scroll to bottom cuando el teclado aparece
                  setTimeout(() => {
                    messagesContainerRef.current?.scrollTo({
                      top: messagesContainerRef.current.scrollHeight,
                      behavior: 'smooth',
                    });
                  }, 300);
                }}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-transparent text-white text-[16px] md:text-sm placeholder:text-white/30 resize-none outline-none py-1 leading-relaxed"
                rows={inputRows}
                disabled={isLoading}
                inputMode="text"
                enterKeyHint="send"
                autoComplete="off"
                autoCorrect="on"
                spellCheck={false}
                style={{
                  maxHeight: '96px',
                  touchAction: 'pan-y',
                }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                style={{
                  background: input.trim() && !isLoading
                    ? 'linear-gradient(135deg, #FFC857, #FF9632)'
                    : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: '1px',
                }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
                ) : (
                  <svg className={`w-4 h-4 transition-colors ${input.trim() ? 'text-black' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>

            {/* Safe area handled by paddingBottom above */}
          </div>

          </div>{/* flex-1 flex flex-col */}
        </div>{/* flex-1 flex (isFullscreen row) */}
      </div>{/* chat panel absolute */}
    </div>{/* fixed inset-0 z-50 */}

      <style jsx>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        /* Fade-in suave para cada párrafo/elemento de NOVA durante streaming */
        @keyframes novaChunkIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nova-chunk {
          animation: novaChunkIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}

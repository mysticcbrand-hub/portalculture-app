'use client';

/**
 * NOVA AI Coach - Fullscreen Chat Experience
 * Desktop: full-width ChatGPT-style layout
 * Mobile: immersive modal with polished UX
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/utils/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface UsageStats {
  messageCount: number;
  remaining: number;
  limit: number;
  isUnlimited?: boolean;
}

const DEFAULT_TITLE = 'Nueva conversación';

function formatTime(date: Date) {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const quickActions = useMemo(
    () => [
      'Plan de 30 días para disciplina',
      'Rutina para energía y enfoque',
      'Mejora tu carisma hoy',
      'Vencer la procrastinación',
    ],
    []
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fetchUsage = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return;

      const response = await fetch('/api/ai/usage', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      setUsage(data);
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  }, [supabase]);




  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return;

      const response = await fetch(`/api/ai/history?conversation_id=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      const incoming = (data.messages ?? []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
      })) as Message[];
      setMessages(incoming);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [supabase]);

  const createConversation = useCallback(async (title?: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return null;

      const response = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title || DEFAULT_TITLE }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      const convo = data.conversation as Conversation;
      setConversations((prev) => [convo, ...prev]);
      return convo;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  }, [supabase]);

  const fetchConversations = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return;

      const response = await fetch('/api/ai/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;
      const data = await response.json();
      const list = (data.conversations ?? []) as Conversation[];
      setConversations(list);

      if (!list.length) {
        const newConversation = await createConversation();
        if (newConversation) {
          setActiveConversationId(newConversation.id);
          await fetchMessages(newConversation.id);
        }
      } else if (!activeConversationId) {
        setActiveConversationId(list[0].id);
        await fetchMessages(list[0].id);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, [supabase, activeConversationId, createConversation, fetchMessages]);

  const renameConversation = useCallback(async (id: string, title: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return;

      const response = await fetch('/api/ai/conversations', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title }),
      });

      if (!response.ok) return;
      const data = await response.json();
      const updated = data.conversation as Conversation;
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: updated.title } : c)));
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  }, [supabase]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return;

      const response = await fetch(`/api/ai/conversations?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length) {
          setActiveConversationId(remaining[0].id);
          await fetchMessages(remaining[0].id);
        } else {
          const newConvo = await createConversation();
          if (newConvo) {
            setActiveConversationId(newConvo.id);
            setMessages([]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }, [supabase, activeConversationId, conversations, fetchMessages, createConversation]);

  const handleConversationClick = useCallback(async (conversation: Conversation) => {
    setActiveConversationId(conversation.id);
    setMobileSidebarOpen(false);
    await fetchMessages(conversation.id);
  }, [fetchMessages]);

  const handleNewChat = useCallback(async () => {
    const convo = await createConversation();
    if (!convo) return;
    setActiveConversationId(convo.id);
    setMessages([]);
    setMobileSidebarOpen(false);
  }, [createConversation]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    if (!activeConversationId) return;

    const messageText = input.trim();
    setInput('');
    setIsLoading(true);

    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error('Missing session');

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          conversationId: activeConversationId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.replace('data: ', '').trim();
          if (payload === '[DONE]') break;
          const data = JSON.parse(payload);
          assistantMessage += data.content;
          setMessages((prev) => {
            const existing = prev.find((m) => m.id === 'assistant-temp');
            if (existing) {
              return prev.map((m) => (m.id === 'assistant-temp' ? { ...m, content: assistantMessage } : m));
            }
            return [
              ...prev,
              {
                id: 'assistant-temp',
                role: 'assistant',
                content: assistantMessage,
                timestamp: new Date(),
              },
            ];
          });
        }
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === 'assistant-temp' ? { ...m, id: `assistant-${Date.now()}` } : m))
      );

      await fetchUsage();

      const activeConversation = conversations.find((c) => c.id === activeConversationId);
      if (activeConversation && activeConversation.title === DEFAULT_TITLE && messages.length === 0) {
        await fetch('/api/ai/conversations/title', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conversationId: activeConversationId, firstMessage: messageText }),
        });
        await fetchConversations();
      }
    } catch (error) {
      console.error('Chat send error:', error);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [input, isLoading, activeConversationId, supabase, messages, fetchUsage, conversations, fetchConversations, scrollToBottom]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  useEffect(() => {
    fetchUsage();
    fetchConversations();
  }, [fetchUsage, fetchConversations]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNewChat]);

  useEffect(() => {
    if (!mobileOpen) {
      setMobileSidebarOpen(false);
    }
  }, [mobileOpen]);

  const inputRows = Math.min(5, Math.max(1, input.split('\n').length));

  const renderConversationItem = (conversation: Conversation) => {
    const isActive = conversation.id === activeConversationId;
    const isEditing = conversation.id === editingId;

    return (
      <div
        key={conversation.id}
        className={`group flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer ${
          isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
        }`}
        onClick={() => handleConversationClick(conversation)}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Image src="/ai.png" alt="NOVA" width={16} height={16} />
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              autoFocus
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => {
                setEditingId(null);
                if (editingTitle.trim()) renameConversation(conversation.id, editingTitle.trim());
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              className="w-full bg-transparent text-sm text-white outline-none border-b border-white/20"
            />
          ) : (
            <p
              className="text-sm text-white/80 truncate"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingId(conversation.id);
                setEditingTitle(conversation.title);
              }}
            >
              {conversation.title}
            </p>
          )}
          <p className="text-[11px] text-white/30">{new Date(conversation.updated_at).toLocaleDateString()}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('¿Eliminar conversación?')) deleteConversation(conversation.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M9 6v12m6-12v12M10 6l1-2h2l1 2" />
          </svg>
        </button>
      </div>
    );
  };

  const chatBody = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Image src="/novamejor.png" alt="NOVA" width={20} height={20} />
          </div>
          <div>
            <p className="text-sm text-white font-semibold">NOVA AI Coach</p>
            <p className="text-xs text-white/40">Tu mentor estratégico personal</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-xs text-white/30">
          {usage && (
            <span className="px-2 py-1 rounded-full"
              style={{
                background: usage.isUnlimited
                  ? 'rgba(59,130,246,0.2)'
                  : usage.remaining <= 2
                    ? 'rgba(239,68,68,0.2)'
                    : usage.remaining <= 5
                      ? 'rgba(245,158,11,0.2)'
                      : 'rgba(34,197,94,0.2)',
              }}
            >
              {usage.isUnlimited ? '∞ mensajes' : `${usage.remaining}/${usage.limit} mensajes`}
            </span>
          )}
          <button
            onClick={handleNewChat}
            className="px-3 py-1.5 rounded-full text-white/60 hover:text-white/90 transition"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            + Nueva conversación
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <div className="mx-auto w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Image src="/novamejor.png" alt="NOVA" width={28} height={28} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Empieza una conversación poderosa</h3>
            <p className="text-sm text-white/35 max-w-sm mx-auto">
              NOVA te guía con claridad, estrategia y disciplina para transformar tu vida.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => setInput(action)}
                  className="text-xs px-3 py-1.5 rounded-full text-white/60 hover:text-white/90 transition"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-white text-black'
                  : 'text-white'
              }`}
              style={
                message.role === 'assistant'
                  ? {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }
                  : {}
              }
            >
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
              <p className={`mt-2 text-[10px] ${message.role === 'user' ? 'text-black/50' : 'text-white/30'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            NOVA está pensando...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/10 px-4 py-3" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-end gap-2 rounded-2xl px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={inputRows}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 resize-none outline-none"
            style={{ maxHeight: '140px' }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition active:scale-95"
            style={{
              background: input.trim() && !isLoading
                ? 'linear-gradient(135deg, #FFC857, #FF9632)'
                : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className={`w-4 h-4 ${input.trim() ? 'text-black' : 'text-white/30'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[11px] text-white/20 mt-2">Tip: Enter para enviar · Shift+Enter para salto de línea</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fullscreen */}
      <section className="hidden md:flex w-full mt-10 rounded-3xl overflow-hidden border border-white/10"
        style={{ background: 'rgba(8,8,12,0.95)', minHeight: '70vh', height: 'calc(100vh - 180px)' }}
      >
        <aside className="w-72 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <button
              onClick={handleNewChat}
              className="w-full px-3 py-2 rounded-xl text-sm text-white/80 hover:text-white transition"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              + Nueva conversación
            </button>
            <p className="text-[11px] text-white/30 mt-3">Ctrl + N para nuevo chat</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {conversations.map(renderConversationItem)}
          </div>
        </aside>
        <div className="flex-1 flex flex-col">
          {chatBody}
        </div>
      </section>

      {/* Mobile Floating Entry */}
      <div className="md:hidden fixed bottom-5 right-4 z-40">
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="px-4 py-2 rounded-full text-sm text-white/80 flex items-center gap-2"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <Image src="/novamejor.png" alt="NOVA" width={18} height={18} />
            Abrir NOVA
          </button>
        )}
      </div>

      {/* Mobile Modal */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xl">
          <div className="absolute inset-0" onClick={() => setMobileOpen(false)} />
          <div
            className="absolute inset-x-3 bottom-4 top-12 rounded-3xl overflow-hidden border border-white/10 flex"
            style={{ background: 'rgba(8,8,12,0.97)' }}
          >
            <div className={`absolute inset-y-0 left-0 w-64 bg-black/90 border-r border-white/10 transform transition-transform ${
              mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <p className="text-sm text-white">Chats</p>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-white/50">✕</button>
              </div>
              <div className="p-3 space-y-1 overflow-y-auto h-full">
                {conversations.map(renderConversationItem)}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="text-white/60 text-sm"
                >
                  ☰ Chats
                </button>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-white/60 text-sm"
                >
                  Cerrar
                </button>
              </div>
              {chatBody}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

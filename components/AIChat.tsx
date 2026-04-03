'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Bot, User, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STARTERS = [
  'What should I wear to a black-tie event?',
  'Find me a casual everyday outfit',
  'I need a power look for work',
  'What\'s trending in streetwear right now?',
];

export default function AIChat() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi, I'm **ARIA** — your AI fashion assistant powered by Claude. I know the entire LUMIS catalog and I'm here to help you find your perfect look. What are you shopping for today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

    try {
      const history = messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) throw new Error('Network error');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full } : m));
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: "I'm sorry, I couldn't connect right now. Please check your API key and try again." }
          : m
      ));
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  const reset = () => setMessages([{
    id: '0', role: 'assistant',
    content: "Hi, I'm **ARIA** — your AI fashion assistant. What are you shopping for today?",
    timestamp: new Date(),
  }]);

  // Simple markdown-ish rendering: bold
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="text-lumis-violet-bright">{p.slice(2, -2)}</strong>
        : <span key={i}>{p}</span>
    );
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={open ? {} : { boxShadow: ['0 0 20px rgba(139,92,246,0.4)', '0 0 40px rgba(139,92,246,0.7)', '0 0 20px rgba(139,92,246,0.4)'] }}
        transition={{ repeat: open ? 0 : Infinity, duration: 2 }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><MessageCircle size={22} className="text-white" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Badge on button */}
      {!open && (
        <div className="fixed bottom-16 right-6 z-50 pointer-events-none">
          <div className="text-xs font-medium px-2 py-1 rounded-full text-white whitespace-nowrap"
            style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(139,92,246,0.4)' }}>
            AI Stylist
          </div>
        </div>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{ height: '520px', background: '#0d0d1a', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(139,92,246,0.15)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(6,182,212,0.1) 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm text-lumis-text">ARIA</p>
                <p className="text-xs text-lumis-cyan">AI Fashion Stylist · Powered by Claude</p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-lumis-muted">Online</span>
              </div>
              <button onClick={reset} className="p-1.5 rounded-lg text-lumis-dim hover:text-lumis-muted hover:bg-lumis-surface transition-all" title="New conversation">
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 message-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-lumis-violet to-lumis-cyan'
                      : 'bg-lumis-surface border border-lumis-border'
                  }`}>
                    {msg.role === 'assistant'
                      ? <Bot size={14} className="text-white" />
                      : <User size={14} className="text-lumis-muted" />
                    }
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-tr-sm'
                        : 'text-lumis-text rounded-tl-sm'
                    }`}
                    style={msg.role === 'user'
                      ? { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    {msg.content
                      ? renderContent(msg.content)
                      : <span className="inline-flex gap-1 items-center py-1">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-1.5 h-1.5 rounded-full bg-lumis-violet animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </span>
                    }
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Starters (only shown before user messages) */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {STARTERS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="text-xs px-2.5 py-1.5 rounded-full text-lumis-muted hover:text-lumis-text transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="Ask ARIA anything…"
                  disabled={loading}
                  className="input-lumis text-sm py-2.5 flex-1"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send size={16} className="text-white" />
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

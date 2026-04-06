'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDopamindStore } from '@/store/useDopamindStore';
import { ArrowLeft, Send, Zap } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function getOpeningMessage(userName: string | null, streakDays: number): string {
  const hour = new Date().getHours();
  const name = userName || 'Warrior';
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (streakDays === 0) {
    return `${timeGreeting}, ${name}. It takes courage to start. I'm here with you on day one. What's on your mind right now?`;
  }
  if (streakDays < 7) {
    return `${timeGreeting}, ${name}. Day ${streakDays} — you're in the hardest stretch and you're still here. That matters. How are you holding up?`;
  }
  if (streakDays < 30) {
    return `${timeGreeting}, ${name}. Day ${streakDays} — your brain is genuinely rewiring right now. Neuroplasticity is working in your favor. How can I support you today?`;
  }
  return `${timeGreeting}, ${name}. Day ${streakDays} — you've become someone different. How does it feel?`;
}

export default function CoachPage() {
  const router = useRouter();
  const { userName, streakDays, habitType, motivations } = useDopamindStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'quick' | 'deep'>('quick');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: getOpeningMessage(userName, streakDays),
      },
    ]);
  }, [userName, streakDays]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    if (mode === 'quick' && messages.filter(m => m.role === 'user').length >= 3) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userContext: {
            name: userName || 'User',
            streakDays,
            habitType: habitType || 'unspecified',
            motivations,
            recentJournal: '',
          },
        }),
      });

      if (!res.ok) throw new Error('API error');
      if (!res.body) throw new Error('No body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.delta?.text || parsed.choices?.[0]?.delta?.content || '';
              accumulated += text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: accumulated };
                return updated;
              });
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: "I'm having trouble connecting right now. But I want you to know: the urge you're feeling is temporary. You are permanent. Your choice to be here is evidence of your strength.",
        };
        return updated;
      });
    }

    setLoading(false);
  }

  const quickModeMessageCount = messages.filter(m => m.role === 'user').length;
  const quickModeLimit = mode === 'quick' && quickModeMessageCount >= 3;

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col pb-16">
      {/* Header */}
      <div className="bg-[#060912] border-b border-[#1E2A3A] px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-white">AI Recovery Coach</h1>
          <p className="text-gray-500 text-xs">Science-based · Empathetic · Always available</p>
        </div>
        {/* Mode toggle */}
        <div className="flex bg-[#111827] border border-[#1E2A3A] rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode('quick')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${mode === 'quick' ? 'bg-[#00D4FF] text-[#0A0E1A]' : 'text-gray-400'}`}
          >
            Quick
          </button>
          <button
            onClick={() => setMode('deep')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${mode === 'deep' ? 'bg-[#00D4FF] text-[#0A0E1A]' : 'text-gray-400'}`}
          >
            Deep
          </button>
        </div>
      </div>

      {mode === 'quick' && (
        <div className="bg-[#111827]/50 border-b border-[#1E2A3A] px-4 py-2">
          <p className="text-gray-500 text-xs text-center">
            Quick Support: {3 - quickModeMessageCount} messages remaining ·
            <button onClick={() => setMode('deep')} className="text-[#00D4FF] ml-1">Switch to Deep Coach →</button>
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <span className="text-[#00D4FF] text-xs font-black">U</span>
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#00D4FF] text-[#0A0E1A] font-medium rounded-tr-sm'
                  : 'bg-[#111827] border border-[#1E2A3A] text-gray-100 rounded-tl-sm'
              }`}
            >
              {msg.content || (loading && idx === messages.length - 1 ? (
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#060912] border-t border-[#1E2A3A] px-4 py-4">
        {quickModeLimit ? (
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-3">Quick Support limit reached</p>
            <button
              onClick={() => setMode('deep')}
              className="bg-[#00D4FF] text-[#0A0E1A] font-bold px-6 py-2 rounded-xl text-sm flex items-center gap-2 mx-auto hover:bg-[#00B8E0] transition-all"
            >
              <Zap size={16} /> Unlock Deep Coach
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder="Talk to your coach..."
              rows={1}
              className="flex-1 bg-[#111827] border border-[#1E2A3A] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D4FF] text-sm resize-none max-h-32"
              style={{ lineHeight: '1.5' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-[#00D4FF] flex items-center justify-center text-[#0A0E1A] hover:bg-[#00B8E0] transition-all disabled:opacity-50 flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        )}
        <p className="text-center text-xs text-gray-700 mt-2">
          Not a substitute for professional therapy. If in crisis, call 988.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

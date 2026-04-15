'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw } from 'lucide-react';

interface Message {
  role:      'user' | 'assistant';
  content:   string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  "What's my biggest money leak?",
  "How much could I save in 10 years if I invested my surplus?",
  "How do I negotiate my subscription bills?",
  "What's the best ETF for a beginner?",
];

function fmt(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-keeper-green animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

export default function ChatPage() {
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [input,       setInput]       = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [
      ...prev,
      { role: 'user',      content: trimmed, timestamp: new Date() },
      { role: 'assistant', content: '',      timestamp: new Date() },
    ]);
    setInput('');
    setIsStreaming(true);

    if (inputRef.current) inputRef.current.style.height = 'auto';

    try {
      const res = await fetch('/api/oracle/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: trimmed, history }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader  = res.body?.getReader();
      if (!reader) throw new Error('No body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith('data:')) continue;
          const dataStr = trimmedLine.slice(5).trim();
          if (dataStr === '[DONE]') { setIsStreaming(false); return; }
          try {
            const parsed = JSON.parse(dataStr) as Record<string, unknown>;
            const chunk  = (parsed.content ?? parsed.text ?? parsed.delta ?? '') as string;
            if (chunk) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') updated[updated.length - 1] = { ...last, content: last.content + chunk };
                return updated;
              });
            }
          } catch { /* non-JSON SSE line */ }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant' && last.content === '') {
          updated[updated.length - 1] = { ...last, content: "I'm having trouble connecting. Make sure ANTHROPIC_API_KEY is set in .env.local." };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -my-8 -mx-8">

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-keeper-border bg-keeper-base/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-keeper-green/10 border border-keeper-green/25 flex items-center justify-center">
            <span className="text-keeper-green font-black text-sm">K</span>
          </div>
          <div>
            <h1 className="font-bold text-keeper-bright">Ask Keeper AI</h1>
            <p className="text-keeper-muted text-xs">Powered by Claude · financial context included</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => !isStreaming && setMessages([])} className="keeper-btn-ghost flex items-center gap-2 text-xs px-3 py-2">
            <RotateCcw size={12} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-8 pb-12">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-keeper-green/10 border border-keeper-green/25 flex items-center justify-center mx-auto">
                <span className="text-keeper-green font-black text-2xl">K</span>
              </div>
              <h2 className="text-xl font-bold text-keeper-bright">Your financial AI</h2>
              <p className="text-keeper-text text-sm max-w-sm">Ask anything about your money, subscriptions, or investments.</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-md">
              <p className="keeper-label text-center mb-1">SUGGESTED</p>
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="keeper-card px-4 py-3 text-left flex items-center justify-between gap-3 hover:border-keeper-green/30 transition-colors"
                >
                  <span className="text-keeper-text text-sm">{p}</span>
                  <span className="text-keeper-green text-xs shrink-0">↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isUser    = msg.role === 'user';
              const isLast    = i === messages.length - 1;
              const showDots  = !isUser && isLast && isStreaming && msg.content === '';
              return (
                <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-keeper-green/10 border border-keeper-green/25 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-keeper-green font-black text-xs">K</span>
                    </div>
                  )}
                  <div className={`max-w-[75%] space-y-1 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-keeper-green/10 border border-keeper-green/25 text-keeper-bright'
                        : 'bg-keeper-card border border-keeper-border text-keeper-text'
                    }`}>
                      {showDots ? <TypingDots /> : msg.content.split('\n').map((line, j, arr) => (
                        <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                      ))}
                      {!isUser && isLast && isStreaming && msg.content !== '' && <TypingDots />}
                    </div>
                    <span className="text-keeper-muted text-xs px-1">{fmt(msg.timestamp)}</span>
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-keeper-border/60 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-xs text-keeper-text">Y</span>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-keeper-border bg-keeper-base/80 backdrop-blur-sm px-8 py-4">
        {isStreaming && (
          <div className="flex items-center gap-2 mb-2 text-xs text-keeper-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-keeper-green animate-pulse" />
            Keeper is thinking…
          </div>
        )}
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            disabled={isStreaming}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = `${Math.min(t.scrollHeight, 140)}px`; }}
            placeholder="Ask Keeper anything…"
            className="keeper-input flex-1 resize-none min-h-[48px] max-h-36 leading-relaxed focus:border-keeper-green/50 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="keeper-btn-primary flex items-center gap-2 py-3 px-5 shrink-0 disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

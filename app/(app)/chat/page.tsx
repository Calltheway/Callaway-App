'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RotateCcw } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Constants ─────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  'Why am I always tired on Mondays?',
  'Am I getting closer to my goals?',
  'What patterns do you see in my relationships?',
  'Is my spending trending worse or better?',
];

// ── Helpers ───────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ── Sub-components ────────────────────────────────────────────────

function StreamingCursor() {
  return (
    <span className="inline-flex items-center ml-1 gap-0.5" aria-label="Oracle is responding">
      <span
        className="w-1.5 h-1.5 rounded-full bg-oracle-teal animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-oracle-teal animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-oracle-teal animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </span>
  );
}

interface MessageBubbleProps {
  message: Message;
  isStreaming: boolean;
  isLast: boolean;
}

function MessageBubble({ message, isStreaming, isLast }: MessageBubbleProps) {
  const showCursor = message.role === 'assistant' && isLast && isStreaming;
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-oracle-teal/10 border border-oracle-teal/20 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-3.5 h-3.5 text-oracle-teal" />
        </div>
      )}

      <div
        className={`max-w-[75%] space-y-1 flex flex-col ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-oracle-teal/10 border border-oracle-teal/20 text-white'
              : 'bg-oracle-card border border-oracle-border text-oracle-text'
          }`}
        >
          {message.content
            ? message.content.split('\n').map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))
            : null}
          {showCursor && <StreamingCursor />}
        </div>

        {/* Timestamp */}
        <span className="text-oracle-muted text-xs px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-oracle-border/60 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-xs font-mono text-oracle-text">Y</span>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send / Stream ───────────────────────────────────────────────

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    const userMessage: Message = {
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    // Append user message + empty assistant placeholder
    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: 'assistant', content: '', timestamp: new Date() },
    ]);
    setInput('');
    setIsStreaming(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/oracle/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

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
          if (dataStr === '[DONE]') {
            setIsStreaming(false);
            return;
          }

          try {
            const parsed = JSON.parse(dataStr) as Record<string, unknown>;
            const chunk =
              (parsed.content as string | undefined) ??
              (parsed.text as string | undefined) ??
              (parsed.delta as string | undefined) ??
              '';

            if (chunk) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + chunk,
                  };
                }
                return updated;
              });
            }
          } catch {
            // Non-JSON SSE data line — ignore
          }
        }
      }
    } catch (err) {
      console.error('Oracle chat error:', err);
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant' && last.content === '') {
          updated[updated.length - 1] = {
            ...last,
            content:
              "I'm having trouble connecting right now. Please try again in a moment.",
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    if (!isStreaming) setMessages([]);
  };

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -my-8 -mx-8">

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-oracle-border bg-oracle-base/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-oracle-teal/10 border border-oracle-teal/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-oracle-teal" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-oracle-bright">
              Oracle Chat
            </h1>
            <p className="text-oracle-muted text-xs">
              Ask Oracle anything about your life
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              disabled={isStreaming}
              className="flex items-center gap-2 oracle-btn-ghost text-sm px-4 py-2 disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
          <span className="flex items-center gap-1.5 text-xs font-mono text-oracle-teal">
            <span className="w-1.5 h-1.5 rounded-full bg-oracle-teal animate-pulse-slow" />
            ORACLE ACTIVE
          </span>
        </div>
      </div>

      {/* ── Messages area ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          /* ── Empty state: suggested prompts ─────────────────── */
          <div className="flex flex-col items-center justify-center h-full gap-8 text-center pb-12">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-oracle-teal/10 border border-oracle-teal/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 text-oracle-teal" />
              </div>
              <h2 className="font-display text-2xl font-bold text-oracle-bright">
                What would you like to explore?
              </h2>
              <p className="text-oracle-muted text-sm max-w-md">
                Oracle has deep context about your life patterns, goals, and
                behaviours. Ask anything.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-5 py-2.5 rounded-full border border-oracle-border bg-oracle-card
                             text-oracle-text text-sm
                             hover:border-oracle-teal/40 hover:text-oracle-bright hover:bg-oracle-teal/5
                             transition-all duration-200 text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Message list ────────────────────────────────────── */
          <>
            {messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                message={msg}
                isStreaming={isStreaming}
                isLast={idx === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Input area ───────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-oracle-border bg-oracle-base/80 backdrop-blur-sm px-8 py-4">
        {/* "Oracle is thinking…" indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 mb-3 text-xs text-oracle-muted font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-oracle-teal animate-pulse" />
            Oracle is thinking...
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = `${Math.min(t.scrollHeight, 160)}px`;
              }}
              placeholder="Ask Oracle anything about your life, patterns, or goals…"
              rows={1}
              disabled={isStreaming}
              className="w-full resize-none bg-oracle-card border border-oracle-border rounded-2xl
                         px-4 py-3 text-oracle-text text-sm placeholder:text-oracle-muted/60
                         focus:outline-none focus:border-oracle-teal/40 focus:ring-1 focus:ring-oracle-teal/20
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-200 min-h-[48px] max-h-40 leading-relaxed"
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="oracle-btn-primary flex items-center gap-2 py-3 px-5 flex-shrink-0
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-oracle-teal"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>

        <p className="text-oracle-muted/50 text-xs mt-2 text-center">
          Press{' '}
          <kbd className="font-mono bg-oracle-border px-1 rounded text-oracle-muted">
            Enter
          </kbd>{' '}
          to send ·{' '}
          <kbd className="font-mono bg-oracle-border px-1 rounded text-oracle-muted">
            Shift+Enter
          </kbd>{' '}
          for new line
        </p>
      </div>
    </div>
  );
}

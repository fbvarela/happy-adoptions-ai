'use client';

import { useState, useRef, useEffect } from 'react';
import { SUGGESTED_QUESTIONS } from '@/lib/chat-config';

function pickSuggestions(n = 4) {
  return [...SUGGESTED_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, n);
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [suggestions] = useState(() => pickSuggestions(4));
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    if (!text.trim() || streaming) return;
    const history = messages.slice(-10);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '' },
    ]);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      if (!res.ok || !res.body) throw new Error('Chat request failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk.startsWith('\x00ERROR:')) throw new Error(chunk.slice(7));
        full += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: full };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Sorry, an error occurred. Please try again.',
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      <div
        style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.25rem' }}
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              Ask me anything about dog adoption:
            </p>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    textAlign: 'left',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.8125rem',
                    border: '1px solid var(--line)',
                    borderRadius: '0.5rem',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    lineHeight: 1.4,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                borderRadius:
                  msg.role === 'user'
                    ? '1rem 1rem 0.2rem 1rem'
                    : '1rem 1rem 1rem 0.2rem',
                background: msg.role === 'user' ? 'var(--bark)' : 'var(--surface)',
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                border: msg.role === 'assistant' ? '1px solid var(--line)' : 'none',
              }}
            >
              {!msg.content && streaming ? (
                <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Thinking…</span>
              ) : (
                <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        style={{ display: 'flex', gap: '0.5rem' }}
        noValidate
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about dog adoption…"
          disabled={streaming}
          aria-label="Chat message"
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            border: '1px solid var(--line)',
            borderRadius: '0.5rem',
            background: 'var(--surface)',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          aria-label="Send message"
          style={{
            padding: '0.75rem 1.25rem',
            background: 'var(--bark)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            opacity: streaming || !input.trim() ? 0.4 : 1,
            fontWeight: 600,
            minWidth: 44,
            minHeight: 44,
          }}
        >
          {streaming ? '…' : 'Send'}
        </button>
      </form>
    </div>
  );
}

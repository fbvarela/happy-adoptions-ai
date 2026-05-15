'use client';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPageClient() {
  return (
    <div
      style={{
        padding: '1.5rem',
        height: 'calc(100dvh - 112px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          marginBottom: '1rem',
          color: 'var(--text)',
        }}
      >
        Adoptions AI
      </h1>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ChatInterface />
      </div>
    </div>
  );
}

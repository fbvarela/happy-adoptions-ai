import { Suspense } from 'react';
import ChatPageClient from './ChatPageClient';

export const metadata = { title: 'Adoptions AI' };

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageClient />
    </Suspense>
  );
}

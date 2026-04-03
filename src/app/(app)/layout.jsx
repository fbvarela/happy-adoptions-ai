import { NavBar } from '@/components/NavBar';
import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({ children }) {
  return (
    <div className="app">
      <NavBar />
      <main>{children}</main>
      <BottomNav />
    </div>
  );
}

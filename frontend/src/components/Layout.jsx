import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <TopBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

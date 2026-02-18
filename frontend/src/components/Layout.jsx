import { Outlet, useLocation } from 'react-router-dom';
import TopBar from './TopBar';

export default function Layout() {
  const location = useLocation();
  const showTopBar = location.pathname === '/projects';

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {showTopBar && <TopBar />}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

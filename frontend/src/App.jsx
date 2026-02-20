import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './graphql/client';
import { AppProvider, useApp } from './context/AppContext';
import { unlockAudio } from './services/notificationSoundService';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/Toast';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ProjectManagement from './pages/ProjectManagement';
import ProfilePage from './pages/ProfilePage';
import ComingSoonPage from './pages/ComingSoonPage';
import { t } from './services/i18n';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-cyan-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-200 animate-pulse">
          <span className="text-2xl text-white font-black">{t('app.logo_letter')}</span>
        </div>
        <p className="text-sm text-slate-500 mt-4">{t('common.loading')}</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { state } = useApp();
  if (!state.isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { state } = useApp();

  if (state.loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={state.isLoggedIn ? <Navigate to="/projects" replace /> : <LoginPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/projects" element={<ProjectManagement />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function AudioUnlock() {
  useEffect(() => {
    const unlock = () => unlockAudio();
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);
  return null;
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ToastProvider>
        <BrowserRouter>
          <AppProvider>
            <AudioUnlock />
            <AppRoutes />
            <ToastContainer />
          </AppProvider>
        </BrowserRouter>
      </ToastProvider>
    </ApolloProvider>
  );
}

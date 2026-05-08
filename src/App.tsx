import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { EditorPage } from './pages/EditorPage';
import { DetailPage } from './pages/DetailPage';
import { TagsPage } from './pages/TagsPage';
import { ThemePage } from './pages/ThemePage';
import { StatsPage } from './pages/StatsPage';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { getTheme } from './utils/storage';

function AppRoutes() {
  const { user, authResolved } = useAuth();

  // Apply theme on app load
  useEffect(() => {
    const theme = getTheme();
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-primary-light', theme.primaryColor);
    root.style.setProperty('--theme-primary-dark', adjustColor(theme.primaryColor, -20));
    root.style.setProperty('--theme-primary-10', hexToRgba(theme.primaryColor, 0.1));
    root.style.setProperty('--theme-primary-20', hexToRgba(theme.primaryColor, 0.2));
    root.style.setProperty('--theme-primary-40', hexToRgba(theme.primaryColor, 0.4));

    // Apply font family
    let fontClass = 'font-sans';
    switch (theme.fontFamily) {
      case 'system':
        fontClass = 'font-sans';
        break;
      case 'serif':
        fontClass = 'font-serif';
        break;
      case 'mono':
        fontClass = 'font-mono';
        break;
    }
    document.body.className = `bg-gray-50 text-gray-900 antialiased ${fontClass}`;
  }, []);

  if (!authResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPasswordPage /> : <Navigate to="/" />} />
      <Route
        path="/*"
        element={
          user ? (
            <Layout />
          ) : (
            <Navigate to="/auth" />
          )
        }
      >
        <Route index element={<HomePage />} />
        <Route path="new" element={<EditorPage />} />
        <Route path="edit/:id" element={<EditorPage />} />
        <Route path="diary/:id" element={<DetailPage />} />
        <Route path="tags" element={<TagsPage />} />
        <Route path="theme" element={<ThemePage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="profile" element={<ProfileSettingsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

// Helper functions for theme colors
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x00FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default App;

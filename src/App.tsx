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
import { applyTheme } from './utils/theme';

function AppRoutes() {
  const { user, authResolved, isPasswordRecovery } = useAuth();

  useEffect(() => {
    applyTheme(getTheme());
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
      <Route path="/forgot-password" element={!user || isPasswordRecovery ? <ForgotPasswordPage /> : <Navigate to="/" />} />
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

export default App;

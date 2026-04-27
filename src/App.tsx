import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { EditorPage } from './pages/EditorPage';
import { DetailPage } from './pages/DetailPage';
import { TagsPage } from './pages/TagsPage';
import { ThemePage } from './pages/ThemePage';
import { StatsPage } from './pages/StatsPage';
import { getTheme } from './utils/storage';

function App() {
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="new" element={<EditorPage />} />
          <Route path="edit/:id" element={<EditorPage />} />
          <Route path="diary/:id" element={<DetailPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="theme" element={<ThemePage />} />
          <Route path="stats" element={<StatsPage />} />
        </Route>
      </Routes>
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

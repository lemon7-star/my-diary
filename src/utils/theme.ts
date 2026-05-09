import type { ThemeSettings } from '../types';

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const adjustColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export const applyTheme = (theme: ThemeSettings) => {
  const root = document.documentElement;
  const primaryLight = adjustColor(theme.primaryColor, 28);
  const primaryMid = adjustColor(theme.primaryColor, 12);
  const primaryDark = adjustColor(theme.primaryColor, -24);

  root.style.setProperty('--theme-primary', theme.primaryColor);
  root.style.setProperty('--theme-primary-light', primaryLight);
  root.style.setProperty('--theme-primary-mid', primaryMid);
  root.style.setProperty('--theme-primary-dark', primaryDark);
  root.style.setProperty('--theme-primary-10', hexToRgba(theme.primaryColor, 0.1));
  root.style.setProperty('--theme-primary-20', hexToRgba(theme.primaryColor, 0.2));
  root.style.setProperty('--theme-primary-40', hexToRgba(theme.primaryColor, 0.4));
  root.style.setProperty('--theme-page-bg', hexToRgba(theme.primaryColor, 0.05));
  root.style.setProperty('--theme-shell-bg', hexToRgba(theme.primaryColor, 0.08));
  root.style.setProperty('--theme-surface-bg', hexToRgba(theme.primaryColor, 0.1));
  root.style.setProperty('--theme-surface-bg-strong', hexToRgba(theme.primaryColor, 0.16));
  root.style.setProperty('--theme-border-soft', hexToRgba(theme.primaryColor, 0.14));
  root.style.setProperty('--theme-border-strong', hexToRgba(theme.primaryColor, 0.24));
  root.style.setProperty('--theme-shadow-soft', hexToRgba(theme.primaryColor, 0.08));
  root.style.setProperty('--theme-shadow-medium', hexToRgba(theme.primaryColor, 0.18));
  root.style.setProperty('--theme-shadow-strong', hexToRgba(theme.primaryColor, 0.28));

  let fontClass = 'font-sans';
  switch (theme.fontFamily) {
    case 'serif':
      fontClass = 'font-serif';
      break;
    case 'mono':
      fontClass = 'font-mono';
      break;
  }

  document.body.className = `bg-gray-50 text-gray-900 antialiased ${fontClass}`;
};

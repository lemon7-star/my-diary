import type { DiaryEntry, Tag, ThemeSettings, CustomMood, MoodOption, CustomSticker } from '../types';
import { PRESET_MOOD_OPTIONS } from '../types';

const STORAGE_KEYS = {
  diaries: 'my-diary-entries',
  tags: 'my-diary-tags',
  theme: 'my-diary-theme',
  customMoods: 'my-diary-custom-moods',
  stickers: 'my-diary-custom-stickers',
};

const DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#8b5cf6',
  borderRadius: 'medium',
  fontFamily: 'system',
};

// Diary Entry Storage
export const getDiaries = (): DiaryEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.diaries);
  return data ? JSON.parse(data) : [];
};

export const saveDiary = (diary: DiaryEntry): void => {
  const diaries = getDiaries();
  const existingIndex = diaries.findIndex(d => d.id === diary.id);

  if (existingIndex >= 0) {
    diaries[existingIndex] = diary;
  } else {
    diaries.push(diary);
  }

  localStorage.setItem(STORAGE_KEYS.diaries, JSON.stringify(diaries));
};

export const deleteDiary = (id: string): void => {
  const diaries = getDiaries().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEYS.diaries, JSON.stringify(diaries));
};

export const getDiaryById = (id: string): DiaryEntry | undefined => {
  return getDiaries().find(d => d.id === id);
};

// Tag Storage
export const getTags = (): Tag[] => {
  const data = localStorage.getItem(STORAGE_KEYS.tags);
  return data ? JSON.parse(data) : [];
};

export const saveTag = (tag: Tag): void => {
  const tags = getTags();
  const existingIndex = tags.findIndex(t => t.id === tag.id);

  if (existingIndex >= 0) {
    tags[existingIndex] = tag;
  } else {
    tags.push(tag);
  }

  localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(tags));
};

export const deleteTag = (id: string): void => {
  const tags = getTags().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(tags));
};

export const getTagById = (id: string): Tag | undefined => {
  return getTags().find(t => t.id === id);
};

// Theme Storage
export const getTheme = (): ThemeSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.theme);
  return data ? { ...DEFAULT_THEME, ...JSON.parse(data) } : DEFAULT_THEME;
};

export const saveTheme = (theme: ThemeSettings): void => {
  localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
};

// Generate ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format date
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
};

// Group diaries by month
export const groupDiariesByMonth = (diaries: DiaryEntry[]): Map<string, DiaryEntry[]> => {
  const groups = new Map<string, DiaryEntry[]>();

  diaries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .forEach(diary => {
      const date = new Date(diary.date);
      const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(diary);
    });

  return groups;
};

// Custom Moods Storage
export const getCustomMoods = (): CustomMood[] => {
  const data = localStorage.getItem(STORAGE_KEYS.customMoods);
  return data ? JSON.parse(data) : [];
};

export const saveCustomMood = (mood: CustomMood): void => {
  const moods = getCustomMoods();
  const existingIndex = moods.findIndex(m => m.id === mood.id);

  if (existingIndex >= 0) {
    moods[existingIndex] = mood;
  } else {
    moods.push(mood);
  }

  localStorage.setItem(STORAGE_KEYS.customMoods, JSON.stringify(moods));
};

export const deleteCustomMood = (id: string): void => {
  const moods = getCustomMoods().filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.customMoods, JSON.stringify(moods));
};

export const getAllMoodOptions = (): MoodOption[] => {
  const customMoods = getCustomMoods();
  const customOptions: MoodOption[] = customMoods.map(m => ({
    value: m.id,
    label: m.label,
    emoji: m.emoji,
    isCustom: true,
  }));
  return [...PRESET_MOOD_OPTIONS, ...customOptions];
};

// Custom Stickers Storage
export const getCustomStickers = (): CustomSticker[] => {
  const data = localStorage.getItem(STORAGE_KEYS.stickers);
  return data ? JSON.parse(data) : [];
};

export const saveCustomSticker = (sticker: CustomSticker): void => {
  const stickers = getCustomStickers();
  const existingIndex = stickers.findIndex(s => s.id === sticker.id);

  if (existingIndex >= 0) {
    stickers[existingIndex] = sticker;
  } else {
    stickers.push(sticker);
  }

  localStorage.setItem(STORAGE_KEYS.stickers, JSON.stringify(stickers));
};

export const deleteCustomSticker = (id: string): void => {
  const stickers = getCustomStickers().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.stickers, JSON.stringify(stickers));
};

import type { DiaryEntry, Tag, ThemeSettings, CustomMood, MoodOption, CustomSticker } from '../types';
import { PRESET_MOOD_OPTIONS } from '../types';
import { supabase } from '../lib/supabase';

const STORAGE_KEYS = {
  theme: 'my-diary-theme',
};

const DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#8b5cf6',
  borderRadius: 'medium',
  fontFamily: 'system',
};

// Generate ID (UUID format for Supabase compatibility)
export const generateId = (): string => {
  return crypto.randomUUID();
};

// ============================================
// Diary Entry Storage (Supabase)
// ============================================

export const getDiaries = async (): Promise<DiaryEntry[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching diaries:', error);
    return [];
  }

  return data.map(mapDiaryFromDB);
};

export const saveDiary = async (diary: DiaryEntry): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const diaryDB = {
    id: diary.id,
    user_id: user.id,
    title: diary.title,
    content: diary.content,
    mood: diary.mood,
    tags: diary.tags,
    images: diary.images,
    stickers: diary.stickers,
    location: diary.location,
    weather: diary.weather,
  };

  const { error } = await supabase
    .from('diary_entries')
    .upsert(diaryDB, { onConflict: 'id' });

  if (error) {
    console.error('Error saving diary:', error);
    throw error;
  }
};

export const deleteDiary = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('diary_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting diary:', error);
    throw error;
  }
};

export const getDiaryById = async (id: string): Promise<DiaryEntry | undefined> => {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching diary:', error);
    return undefined;
  }

  return data ? mapDiaryFromDB(data) : undefined;
};

// Helper to map DB diary to local format
const mapDiaryFromDB = (data: any): DiaryEntry => ({
  id: data.id,
  title: data.title,
  content: data.content,
  date: data.created_at.split('T')[0],
  mood: data.mood,
  tags: data.tags || [],
  images: data.images || [],
  stickers: data.stickers || [],
  location: data.location,
  weather: data.weather,
  createdAt: new Date(data.created_at).getTime(),
  updatedAt: new Date(data.updated_at).getTime(),
});

// ============================================
// Tag Storage (extracted from diary entries)
// ============================================

export const getTags = async (): Promise<Tag[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('diary_entries')
    .select('tags')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  // Extract unique tags from all diaries
  const tagMap = new Map<string, Tag>();
  data.forEach((diary: any) => {
    if (diary.tags && Array.isArray(diary.tags)) {
      diary.tags.forEach((tag: string, index: number) => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, {
            id: generateId(),
            name: tag,
            color: TAG_COLORS[index % TAG_COLORS.length].value,
            createdAt: Date.now(),
          });
        }
      });
    }
  });

  return Array.from(tagMap.values());
};

// For backward compatibility, tags are stored within diary entries
// These functions are kept for consistency but may not be needed
export const saveTag = async (_tag: Tag): Promise<void> => {
  // Tags are managed within diary entries
};

export const deleteTag = async (_id: string): Promise<void> => {
  // Tags are managed within diary entries
};

export const getTagById = async (_id: string): Promise<Tag | undefined> => {
  return undefined;
};

// ============================================
// Theme Storage (localStorage - local preference)
// ============================================

export const getTheme = (): ThemeSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.theme);
  return data ? { ...DEFAULT_THEME, ...JSON.parse(data) } : DEFAULT_THEME;
};

export const saveTheme = (theme: ThemeSettings): void => {
  localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
};

// ============================================
// Format date helpers
// ============================================

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

// ============================================
// Custom Moods Storage (Supabase)
// ============================================

export const getCustomMoods = async (): Promise<CustomMood[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('custom_moods')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching custom moods:', error);
    return [];
  }

  return data.map((m: any) => ({
    id: m.id,
    label: m.name,
    emoji: m.emoji,
    createdAt: new Date(m.created_at).getTime(),
  }));
};

export const saveCustomMood = async (mood: CustomMood): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('custom_moods')
    .upsert({
      id: mood.id,
      user_id: user.id,
      name: mood.label,
      emoji: mood.emoji,
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error saving custom mood:', error);
    throw error;
  }
};

export const deleteCustomMood = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('custom_moods')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting custom mood:', error);
    throw error;
  }
};

export const getAllMoodOptions = async (): Promise<MoodOption[]> => {
  const customMoods = await getCustomMoods();
  const customOptions: MoodOption[] = customMoods.map(m => ({
    value: m.id,
    label: m.label,
    emoji: m.emoji,
    isCustom: true,
  }));
  return [...PRESET_MOOD_OPTIONS, ...customOptions];
};

// ============================================
// Custom Stickers Storage (Supabase)
// ============================================

export const getCustomStickers = async (): Promise<CustomSticker[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('custom_stickers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching custom stickers:', error);
    return [];
  }

  return data.map((s: any) => ({
    id: s.id,
    name: s.name,
    url: s.data,
    createdAt: new Date(s.created_at).getTime(),
  }));
};

export const saveCustomSticker = async (sticker: CustomSticker): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('custom_stickers')
    .upsert({
      id: sticker.id,
      user_id: user.id,
      name: sticker.name,
      data: sticker.url,
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error saving custom sticker:', error);
    throw error;
  }
};

export const deleteCustomSticker = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('custom_stickers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting custom sticker:', error);
    throw error;
  }
};

// ============================================
// Tag Colors
// ============================================

export const TAG_COLORS = [
  { name: '红色', value: '#ef4444', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  { name: '橙色', value: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  { name: '黄色', value: '#eab308', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  { name: '绿色', value: '#22c55e', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  { name: '青色', value: '#06b6d4', bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  { name: '蓝色', value: '#3b82f6', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { name: '紫色', value: '#8b5cf6', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { name: '粉色', value: '#ec4899', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { name: '灰色', value: '#6b7280', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
];

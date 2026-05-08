import type { DiaryEntry, Tag, ThemeSettings, CustomMood, MoodOption, CustomSticker } from '../types';
import { PRESET_MOOD_OPTIONS } from '../types';
import { supabase, type DiaryEntryDB, type CustomMoodDB, type CustomStickerDB } from '../lib/supabase';

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

type DiarySummaryDB = Pick<DiaryEntryDB, 'id' | 'title' | 'content' | 'mood' | 'tags' | 'created_at' | 'updated_at'>;
type CustomMoodSummaryDB = Pick<CustomMoodDB, 'id' | 'name' | 'emoji' | 'created_at'>;

const DIARY_SUMMARY_SELECT = 'id, title, content, mood, tags, created_at, updated_at';

// ============================================
// Diary Entry Storage (Supabase)
// ============================================

export const getDiarySummaries = async (userId: string): Promise<DiaryEntry[]> => {
  const { data, error } = await supabase
    .from('diary_entries')
    .select(DIARY_SUMMARY_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching diary summaries:', error);
    return [];
  }

  return data.map((entry) => mapDiarySummaryFromDB(entry as DiarySummaryDB));
};

export const getDiaries = async (userId: string): Promise<DiaryEntry[]> => {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching diaries:', error);
    return [];
  }

  return data.map((entry) => mapDiaryFromDB(entry as DiaryEntryDB));
};

export const saveDiary = async (userId: string, diary: DiaryEntry): Promise<void> => {
  const diaryDB = {
    id: diary.id,
    user_id: userId,
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

  return data ? mapDiaryFromDB(data as DiaryEntryDB) : undefined;
};

const mapDiaryBase = (data: DiarySummaryDB) => ({
  id: data.id,
  title: data.title,
  content: data.content,
  date: data.created_at.split('T')[0],
  mood: data.mood,
  tags: data.tags || [],
  createdAt: new Date(data.created_at).getTime(),
  updatedAt: new Date(data.updated_at).getTime(),
});

const mapDiarySummaryFromDB = (data: DiarySummaryDB): DiaryEntry => ({
  ...mapDiaryBase(data),
  images: [],
  stickers: [],
  location: undefined,
  weather: undefined,
});

// Helper to map DB diary to local format
const mapDiaryFromDB = (data: DiaryEntryDB): DiaryEntry => ({
  ...mapDiaryBase(data),
  images: data.images || [],
  stickers: data.stickers || [],
  location: data.location,
  weather: data.weather as DiaryEntry['weather'],
});

// ============================================
// Tag Storage (extracted from diary entries)
// ============================================

export const deriveTagsFromDiaries = (diaries: Pick<DiaryEntry, 'tags'>[]): Tag[] => {
  const tagMap = new Map<string, Tag>();
  let colorIndex = 0;

  diaries.forEach((diary) => {
    diary.tags.forEach((rawTag) => {
      const tagName = rawTag.trim();
      if (!tagName || tagMap.has(tagName)) {
        return;
      }

      tagMap.set(tagName, {
        id: tagName,
        name: tagName,
        color: TAG_COLORS[colorIndex % TAG_COLORS.length].value,
        createdAt: Date.now(),
      });
      colorIndex += 1;
    });
  });

  return Array.from(tagMap.values());
};

export const deriveTagCountsFromDiaries = (diaries: Pick<DiaryEntry, 'tags'>[]): Map<string, number> => {
  const countMap = new Map<string, number>();

  diaries.forEach((diary) => {
    diary.tags.forEach((rawTag) => {
      const tagName = rawTag.trim();
      if (!tagName) {
        return;
      }

      countMap.set(tagName, (countMap.get(tagName) || 0) + 1);
    });
  });

  return countMap;
};

export const getTags = async (userId: string): Promise<Tag[]> => {
  const diaries = await getDiarySummaries(userId);
  return deriveTagsFromDiaries(diaries);
};

// For backward compatibility, tags are stored within diary entries
// These functions are kept for consistency but may not be needed
export const saveTag = async (tag: Tag): Promise<void> => {
  void tag;
};

export const deleteTag = async (id: string): Promise<void> => {
  void id;
};

export const getTagById = async (id: string): Promise<Tag | undefined> => {
  void id;
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

export const getCustomMoods = async (userId: string): Promise<CustomMood[]> => {
  const { data, error } = await supabase
    .from('custom_moods')
    .select('id, name, emoji, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching custom moods:', error);
    return [];
  }

  return data.map((mood) => {
    const entry = mood as CustomMoodSummaryDB;
    return {
      id: entry.id,
      label: entry.name,
      emoji: entry.emoji,
      createdAt: new Date(entry.created_at).getTime(),
    };
  });
};

export const saveCustomMood = async (userId: string, mood: CustomMood): Promise<void> => {
  const { error } = await supabase
    .from('custom_moods')
    .upsert({
      id: mood.id,
      user_id: userId,
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

export const getAllMoodOptions = async (userId: string): Promise<MoodOption[]> => {
  const customMoods = await getCustomMoods(userId);
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

export const getCustomStickers = async (userId: string): Promise<CustomSticker[]> => {
  const { data, error } = await supabase
    .from('custom_stickers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching custom stickers:', error);
    return [];
  }

  return data.map((sticker) => {
    const entry = sticker as CustomStickerDB;
    return {
      id: entry.id,
      name: entry.name,
      url: entry.data,
      createdAt: new Date(entry.created_at).getTime(),
    };
  });
};

export const saveCustomSticker = async (userId: string, sticker: CustomSticker): Promise<void> => {
  const { error } = await supabase
    .from('custom_stickers')
    .upsert({
      id: sticker.id,
      user_id: userId,
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

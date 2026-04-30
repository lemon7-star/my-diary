import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ryjgwkcuankgapzzujam.supabase.co';
const supabaseAnonKey = 'sb_publishable_QTWf74c_XEEPx5PP49LpZg_9VM3c5-A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface DiaryEntryDB {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  images: {
    id: string;
    url: string;
    caption?: string;
  }[];
  stickers: {
    id: string;
    name: string;
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  location?: string;
  weather?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomMoodDB {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  created_at: string;
}

export interface CustomStickerDB {
  id: string;
  user_id: string;
  name: string;
  data: string;
  created_at: string;
}

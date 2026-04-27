export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface DiaryImage {
  id: string;
  url: string;
  caption?: string;
}

export interface DiarySticker {
  id: string;
  name: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: Mood;
  tags: string[];
  images: DiaryImage[];
  stickers: DiarySticker[];
  location?: string;
  weather?: Weather;
  createdAt: number;
  updatedAt: number;
}

export type PresetMood = 'happy' | 'calm' | 'sad' | 'angry' | 'love';
export type Mood = PresetMood | string;
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

export interface MoodOption {
  value: string;
  label: string;
  emoji: string;
  isCustom?: boolean;
}

export const PRESET_MOOD_OPTIONS: MoodOption[] = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'calm', label: '平静', emoji: '😌' },
  { value: 'sad', label: '难过', emoji: '😔' },
  { value: 'angry', label: '烦躁', emoji: '😤' },
  { value: 'love', label: '幸福', emoji: '🥰' },
];

// 常用 emoji 列表供选择（基础表情）
export const COMMON_EMOJIS = [
  // 开心类
  '😊', '😃', '😄', '😁', '🙂', '😆', '🤣', '😂', '🥰', '😍',
  // 平静/中性
  '😌', '😉', '🤔', '😐', '😶', '😏', '🙄', '😪', '😴', '🥱',
  // 难过/负面
  '😔', '😟', '😕', '☹️', '🙁', '😣', '😫', '😩', '🥺', '😢',
  '😭', '😓', '😥', '😰', '😨', '😱', '😪', '😵', '😷', '🤒',
  // 生气/烦躁
  '😤', '😠', '😡', '🤬', '😒', '😖', '😞', '😩', '😫',
  // 爱心类
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
  // 星星/闪光
  '✨', '🌟', '💫', '⭐', '🌙', '☀️', '🌞', '🔥', '💥', '🌈',
  // 自然/天气
  '☁️', '⛅', '🌧️', '⛈️', '☀️', '🌤️', '❄️', '☃️', '⛄', '🌊',
  '🌵', '🌲', '🌳', '🌴', '🌻', '🌹', '🌷', '🌼', '🌸', '💐',
  // 动物
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤',
  // 食物
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑',
  '🍍', '🥝', '🍅', '🥑', '🍆', '🥔', '🥕', '🌽', '🥦', '🍄',
  '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🍳', '🥘', '🍜', '🍰',
  '☕', '🍵', '🥛', '🍺', '🍷', '🥤', '🧃', '🍽️',
  // 运动/活动
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
  '🎮', '🎲', '🎯', '🎨', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺',
  // 物品
  '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽',
  '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️',
  '⏰', '⌚', '📚', '📖', '🔖', '📎', '📐', '✂️', '🖊️', '🖋️',
  '✏️', '📝', '🔍', '🔎', '🔒', '🔓', '🔑', '🗝️', '🔨', '🪓',
  '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🔫', '🏹', '🛡️', '🔧', '🪛',
  '🔩', '🦯', '🔗', '⛓️', '🪝', '🧰', '🧲', '🪜', '🚬', '⚰️',
  '🪦', '⚱️', '🗿', '🪧', '🚰', '🚿', '🛁', '🛀', '🧴', '🧷',
  '🧹', '🧺', '🧻', '🧼', '🧽', '🧯', '🛒', '🚽', '🚰', '🚿',
  // 音乐/艺术
  '🎵', '🎶', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻',
  // 交通
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
  '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🚨', '🚥', '🚦',
  '✈️', '🛩️', '🛫', '🛬', '🚁', '🚀', '🛸', '🚢', '⛵', '🛶',
  '🚤', '🛳️', '⛴️', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏',
  // 办公
  '💼', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘',
  '👙', '👚', '👛', '👜', '👝', '🛍️', '🎒', '👞', '👟', '🥾',
  '👠', '👡', '🩰', '👢', '👑', '👒', '🎩', '🎓', '🧢', '🪖',
  '⛑️', '📿', '💄', '💍', '💎', '🔇', '🔈', '🔉', '🔊', '📢',
  '📣', '📯', '🔔', '🔕', '🎐', '🎑', '🧧', '🎀', '🎁', '🎗️',
  '🎟️', '🎫', '🎖️', '🏆', '🏅', '🥇', '🥈', '🥉', '🍻', '🍾',
  // 其他
  '💡', '🔦', '🔌', '🔋', '🪫', '🔍', '🕯️', '💸', '💵', '💴',
  '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🧲',
];

export interface CustomMood {
  id: string;
  label: string;
  emoji: string;
  createdAt: number;
}

// 内置贴纸
export const BUILTIN_STICKERS = [
  { id: 'star', name: '星星', emoji: '⭐' },
  { id: 'heart', name: '爱心', emoji: '💖' },
  { id: 'sparkle', name: '闪光', emoji: '✨' },
  { id: 'flower', name: '樱花', emoji: '🌸' },
  { id: 'rose', name: '玫瑰', emoji: '🌹' },
  { id: 'sunflower', name: '向日葵', emoji: '🌻' },
  { id: 'rainbow', name: '彩虹', emoji: '🌈' },
  { id: 'sun', name: '太阳', emoji: '🌞' },
  { id: 'moon', name: '月亮', emoji: '🌙' },
  { id: 'cloud', name: '云朵', emoji: '⛅' },
  { id: 'fire', name: '火焰', emoji: '🔥' },
  { id: 'crown', name: '皇冠', emoji: '👑' },
  { id: 'gift', name: '礼物', emoji: '🎁' },
  { id: 'balloon', name: '气球', emoji: '🎈' },
  { id: 'party', name: '庆祝', emoji: '🎉' },
  { id: 'music', name: '音符', emoji: '🎵' },
  { id: 'camera', name: '相机', emoji: '📷' },
  { id: 'book', name: '书籍', emoji: '📚' },
  { id: 'coffee', name: '咖啡', emoji: '☕' },
  { id: 'cake', name: '蛋糕', emoji: '🎂' },
  { id: 'cat', name: '猫咪', emoji: '🐱' },
  { id: 'dog', name: '小狗', emoji: '🐶' },
  { id: 'rabbit', name: '兔子', emoji: '🐰' },
  { id: 'bear', name: '小熊', emoji: '🐻' },
];

export interface CustomSticker {
  id: string;
  name: string;
  url: string;
  createdAt: number;
}

export const WEATHER_OPTIONS = [
  { value: 'sunny' as Weather, label: '晴天', emoji: '☀️' },
  { value: 'cloudy' as Weather, label: '阴天', emoji: '☁️' },
  { value: 'rainy' as Weather, label: '雨天', emoji: '🌧️' },
  { value: 'snowy' as Weather, label: '雪天', emoji: '🌨️' },
];

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

export interface ThemeSettings {
  primaryColor: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  fontFamily: 'system' | 'serif' | 'mono';
}

export const THEME_COLORS = [
  { name: '紫色', value: '#8b5cf6', class: 'bg-purple-500' },
  { name: '蓝色', value: '#3b82f6', class: 'bg-blue-500' },
  { name: '绿色', value: '#22c55e', class: 'bg-green-500' },
  { name: '粉色', value: '#ec4899', class: 'bg-pink-500' },
  { name: '橙色', value: '#f97316', class: 'bg-orange-500' },
  { name: '红色', value: '#ef4444', class: 'bg-red-500' },
];

export const BORDER_RADIUS_OPTIONS = [
  { value: 'none' as const, label: '直角', class: 'rounded-none' },
  { value: 'small' as const, label: '小圆角', class: 'rounded-md' },
  { value: 'medium' as const, label: '中圆角', class: 'rounded-xl' },
  { value: 'large' as const, label: '大圆角', class: 'rounded-3xl' },
];

export const FONT_OPTIONS = [
  { value: 'system' as const, label: '系统字体', class: 'font-sans' },
  { value: 'serif' as const, label: '衬线字体', class: 'font-serif' },
  { value: 'mono' as const, label: '等宽字体', class: 'font-mono' },
];

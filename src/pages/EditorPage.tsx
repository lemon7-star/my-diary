import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  ImagePlus,
  X,
  Plus,
  MapPin,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Smile,
} from 'lucide-react';
import { getDiaryById, saveDiary, getTags, saveTag, generateId, getAllMoodOptions, saveCustomMood, getCustomStickers, saveCustomSticker } from '../utils/storage';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { WEATHER_OPTIONS, TAG_COLORS, COMMON_EMOJIS, BUILTIN_STICKERS, type DiaryEntry, type DiaryImage, type DiarySticker, type Tag, type Weather, type Mood, type MoodOption, type CustomSticker } from '../types';

const isEmoji = (str: string) => {
  const emojiRegex = /^(?:[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[☀-⚿]|[✀-➿]|[⭐💖🌞⛅🌸🌹🌻🌈🌙🔥👑🎁🎈🎉🎵📷📚☕🎂🐱🐶🐰🐻✨])$/u;
  return emojiRegex.test(str);
};

interface StickerItemProps {
  sticker: DiarySticker;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onUpdate: (updates: Partial<DiarySticker>) => void;
  onDraggingChange: (dragging: boolean) => void;
}

function StickerItem({ sticker, isSelected, onSelect, onDeselect, onUpdate, onDraggingChange }: StickerItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, stickerX: 0, stickerY: 0, moved: false });
  const isEmojiSticker = isEmoji(sticker.url);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    onDraggingChange(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      stickerX: sticker.x,
      stickerY: sticker.y,
      moved: false,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    onDraggingChange(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      stickerX: sticker.x,
      stickerY: sticker.y,
      moved: false,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        dragStartRef.current.moved = true;
      }
      onUpdate({
        x: dragStartRef.current.stickerX + deltaX,
        y: dragStartRef.current.stickerY + deltaY,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        dragStartRef.current.moved = true;
      }
      onUpdate({
        x: dragStartRef.current.stickerX + deltaX,
        y: dragStartRef.current.stickerY + deltaY,
      });
    };

    const handleEnd = () => {
      setIsDragging(false);
      onDraggingChange(false);
      if (!dragStartRef.current.moved) {
        if (isSelected) {
          onDeselect();
        } else {
          onSelect();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, onUpdate, onSelect, onDeselect, isSelected, onDraggingChange]);

  return (
    <div
      className={`sticker-item absolute cursor-move select-none ${isDragging ? 'z-50' : 'z-10'} ${isSelected ? 'ring-2 ring-theme ring-offset-2' : ''}`}
      style={{
        left: sticker.x,
        top: sticker.y,
        width: sticker.width,
        height: sticker.height,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {isEmojiSticker ? (
        <div className="w-full h-full flex items-center justify-center select-none" style={{ fontSize: '48px', lineHeight: 1 }}>
          {sticker.url}
        </div>
      ) : (
        <img
          src={sticker.url}
          alt={sticker.name}
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      )}
    </div>
  );
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<DiaryImage[]>([]);
  const [stickers, setStickers] = useState<DiarySticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [isAnyStickerDragging, setIsAnyStickerDragging] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<Weather | undefined>();
  const [showWeatherPicker, setShowWeatherPicker] = useState(false);
  const [moodOptions, setMoodOptions] = useState<MoodOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);

  const [showMoodModal, setShowMoodModal] = useState(false);
  const [newMoodLabel, setNewMoodLabel] = useState('');
  const [newMoodEmoji, setNewMoodEmoji] = useState('😊');

  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [activeStickerTab, setActiveStickerTab] = useState<'builtin' | 'custom' | 'handdraw'>('builtin');
  const [customStickers, setCustomStickers] = useState<CustomSticker[]>([]);

  const today = new Date();
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 · ${weekDays[today.getDay()]}`;

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    const [tagsData, moodsData, stickersData] = await Promise.all([
      getTags(),
      getAllMoodOptions(),
      getCustomStickers(),
    ]);
    setTags(tagsData);
    setMoodOptions(moodsData);
    setCustomStickers(stickersData);

    if (id) {
      const diary = await getDiaryById(id);
      if (diary) {
        setTitle(diary.title);
        setContent(diary.content);
        setMood(diary.mood);
        setSelectedTags(diary.tags);
        setImages(diary.images);
        setStickers(diary.stickers || []);
        setLocation(diary.location || '');
        setWeather(diary.weather);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.sticker-item')) {
        setSelectedStickerId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    let createdAt = Date.now();
    if (id) {
      const existingDiary = await getDiaryById(id);
      if (existingDiary) {
        createdAt = existingDiary.createdAt;
      }
    }

    const diary: DiaryEntry = {
      id: id || generateId(),
      title: title.trim(),
      content: content.trim(),
      date: today.toISOString().split('T')[0],
      mood,
      tags: selectedTags,
      images,
      stickers,
      location: location || undefined,
      weather,
      createdAt,
      updatedAt: Date.now(),
    };

    await saveDiary(diary);
    navigate('/');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: DiaryImage = {
          id: generateId(),
          url: event.target?.result as string,
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const newSticker = {
        id: generateId(),
        name: file.name.split('.')[0],
        url: event.target?.result as string,
        createdAt: Date.now(),
      };
      await saveCustomSticker(newSticker);
      const stickers = await getCustomStickers();
      setCustomStickers(stickers);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addStickerToCanvas = (stickerUrl: string, stickerName: string) => {
    const container = editorRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2 - 40;
    const centerY = rect.height / 2 - 40;

    const newSticker: DiarySticker = {
      id: generateId(),
      name: stickerName,
      url: stickerUrl,
      x: Math.max(0, centerX),
      y: Math.max(0, centerY),
      width: 80,
      height: 80,
    };

    setStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    setShowStickerModal(false);
  };

  const handleHandDrawSave = (dataUrl: string) => {
    addStickerToCanvas(dataUrl, `手绘-${Date.now()}`);
  };

  const updateSticker = (id: string, updates: Partial<DiarySticker>) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
    setSelectedStickerId(null);
  };

  const removeImage = (imageId: string) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    const newTag: Tag = {
      id: generateId(),
      name: newTagName.trim(),
      color: newTagColor,
      createdAt: Date.now(),
    };

    await saveTag(newTag);
    const updatedTags = await getTags();
    setTags(updatedTags);
    setSelectedTags([...selectedTags, newTag.id]);
    setNewTagName('');
    setShowTagModal(false);
  };

  const handleCreateMood = async () => {
    if (!newMoodLabel.trim()) return;

    const customMood = {
      id: `custom-${generateId()}`,
      label: newMoodLabel.trim(),
      emoji: newMoodEmoji,
      createdAt: Date.now(),
    };

    await saveCustomMood(customMood);
    const updatedMoods = await getAllMoodOptions();
    setMoodOptions(updatedMoods);
    setMood(customMood.id);
    setNewMoodLabel('');
    setNewMoodEmoji('😊');
    setShowMoodModal(false);
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('您的浏览器不支持定位功能');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=zh-CN`,
            {
              headers: {
                'User-Agent': 'MyDiaryApp/1.0',
              },
            }
          );

          if (!response.ok) {
            throw new Error('获取位置信息失败');
          }

          const data = await response.json();
          const address = data.address;

          let city = address.city || address.town || address.county || '';
          const district = address.district || address.suburb || address.borough || '';
          const street = address.road || address.street || address.road_reference || '';

          const isWeirdContent = (str: string) => {
            if (!str) return true;
            if (/\d{3,}/.test(str)) return true;
            if (str.length <= 1) return true;
            if (/村民委员会|居民委员会|村委会|居委会/.test(str)) return true;
            return false;
          };

          if (city) {
            city = city.replace(/市$/, '');
          }

          let locationString = '';

          if (city && district) {
            locationString = `${city} · ${district}`;
          } else if (city && street && !isWeirdContent(street)) {
            locationString = `${city} · ${street}`;
          } else if (city) {
            locationString = city;
          } else if (district) {
            locationString = district;
          } else {
            const displayName = data.display_name || '';
            const firstPart = displayName.split(',')[0];
            locationString = firstPart || '当前位置';
          }

          setLocation(locationString);
          setIsLocating(false);
          setShowLocationModal(false);
        } catch (error) {
          console.error('获取位置失败:', error);
          setLocationError('定位失败，请手动输入');
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('定位错误:', error);
        setLocationError('定位失败，请手动输入');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const getWeatherIcon = (w: Weather) => {
    switch (w) {
      case 'sunny': return <Sun className="w-5 h-5" />;
      case 'cloudy': return <Cloud className="w-5 h-5" />;
      case 'rainy': return <CloudRain className="w-5 h-5" />;
      case 'snowy': return <CloudSnow className="w-5 h-5" />;
    }
  };

  const getCurrentMood = () => moodOptions.find(m => m.value === mood);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <h1 className="text-lg font-semibold text-gray-900">写日记</h1>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-lg font-medium hover:bg-theme-hover transition-colors"
        >
          <Save className="w-4 h-4" />
          保存
        </button>
      </div>

      {/* Editor Form */}
      <div ref={editorRef} className="relative bg-white rounded-2xl border border-gray-200 p-6 space-y-6 min-h-[500px]">
        {stickers.map(sticker => (
          <StickerItem
            key={sticker.id}
            sticker={sticker}
            isSelected={selectedStickerId === sticker.id}
            onSelect={() => setSelectedStickerId(sticker.id)}
            onDeselect={() => setSelectedStickerId(null)}
            onUpdate={(updates) => updateSticker(sticker.id, updates)}
            onDraggingChange={setIsAnyStickerDragging}
          />
        ))}

        {!isAnyStickerDragging && stickers.map(sticker => (
          selectedStickerId === sticker.id && (
            <div
              key={`delete-${sticker.id}`}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                deleteSticker(sticker.id);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                deleteSticker(sticker.id);
              }}
              style={{
                position: 'absolute',
                left: sticker.x + sticker.width - 10,
                top: sticker.y - 10,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'red',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10000,
                fontSize: 14,
                userSelect: 'none',
              }}
            >
              ×
            </div>
          )
        ))}

        <div className="relative z-0">
          {/* Date */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">{dateStr}</p>
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="给今天起个标题…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold placeholder-gray-400 border-none focus:outline-none focus:ring-0 p-0 text-center bg-transparent"
            />
          </div>

          {/* Content */}
          <div>
            <textarea
              placeholder="记录今天发生的事…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full resize-none placeholder-gray-400 border-none p-0 focus:outline-none focus:ring-0 text-gray-700 leading-relaxed bg-transparent"
            />
          </div>

          {/* Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((image) => (
                <div key={image.id} className="relative group aspect-square">
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Mood Selection */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              今天的心情
            </label>
            <div className="flex flex-wrap justify-center gap-3">
              {moodOptions.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? undefined : m.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    mood === m.value
                      ? 'bg-theme-light ring-2 ring-theme'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className={`text-xs ${mood === m.value ? 'text-theme font-medium' : 'text-gray-500'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
              <button
                onClick={() => setShowMoodModal(true)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:bg-gray-50 border-2 border-dashed border-gray-300"
              >
                <span className="text-2xl">+</span>
                <span className="text-xs text-gray-500">添加</span>
              </button>
            </div>
            {getCurrentMood()?.isCustom && (
              <p className="text-center text-xs text-gray-400 mt-2">自定义心情</p>
            )}
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedTags.map((tagId) => {
                const tag = tags.find(t => t.id === tagId);
                if (!tag) return null;
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      borderColor: `${tag.color}40`,
                    }}
                  >
                    # {tag.name}
                    <button
                      onClick={() => toggleTag(tagId)}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={() => setShowTagModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加标签
              </button>
            </div>
          </div>

          {/* Location & Weather Display */}
          {(location || weather) && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location}
                </span>
              )}
              {weather && (
                <span className="flex items-center gap-1">
                  {getWeatherIcon(weather)}
                  {WEATHER_OPTIONS.find(w => w.value === weather)?.label}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-around">
          <label className="flex flex-col items-center gap-1 text-gray-600 cursor-pointer hover:text-theme transition-colors">
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs">图片</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowStickerModal(true)}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-theme transition-colors"
          >
            <Smile className="w-6 h-6" />
            <span className="text-xs">贴纸</span>
          </button>

          <button
            onClick={() => setShowLocationModal(true)}
            className={`flex flex-col items-center gap-1 transition-colors ${location ? 'text-theme' : 'text-gray-600 hover:text-theme'}`}
          >
            <MapPin className="w-6 h-6" />
            <span className="text-xs">位置</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowWeatherPicker(!showWeatherPicker)}
              className={`flex flex-col items-center gap-1 transition-colors ${weather ? 'text-theme' : 'text-gray-600 hover:text-theme'}`}
            >
              <Cloud className="w-6 h-6" />
              <span className="text-xs">天气</span>
            </button>

            {showWeatherPicker && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex gap-1">
                {WEATHER_OPTIONS.map((w) => (
                  <button
                    key={w.value}
                    onClick={() => {
                      setWeather(w.value);
                      setShowWeatherPicker(false);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      weather === w.value ? 'bg-theme-light' : 'hover:bg-gray-50'
                    }`}
                    title={w.label}
                  >
                    <span className="text-xl">{w.emoji}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">添加标签</h3>

            {tags.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择已有标签
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        toggleTag(tag.id);
                        if (!selectedTags.includes(tag.id)) {
                          setShowTagModal(false);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        selectedTags.includes(tag.id)
                          ? 'ring-2 ring-theme opacity-50'
                          : ''
                      }`}
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderColor: `${tag.color}40`,
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                创建新标签
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="标签名称"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme mb-3"
              />
              <div className="grid grid-cols-5 gap-2 mb-4">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewTagColor(color.value)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      newTagColor === color.value
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTagModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="flex-1 px-4 py-2 bg-theme text-white rounded-lg hover:bg-theme-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Mood Modal */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">添加自定义心情</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  心情名称
                </label>
                <input
                  type="text"
                  value={newMoodLabel}
                  onChange={(e) => setNewMoodLabel(e.target.value)}
                  placeholder="例如：焦虑"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择图标
                </label>
                <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewMoodEmoji(emoji)}
                      className={`text-2xl p-1 rounded transition-all ${
                        newMoodEmoji === emoji
                          ? 'bg-theme-light ring-2 ring-theme scale-110'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">预览</p>
                <span className="text-4xl">{newMoodEmoji}</span>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  {newMoodLabel || '心情名称'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMoodModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateMood}
                disabled={!newMoodLabel.trim()}
                className="flex-1 px-4 py-2 bg-theme text-white rounded-lg hover:bg-theme-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">添加位置</h3>

            <div className="space-y-4">
              <button
                onClick={handleGetLocation}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-theme text-white rounded-xl hover:bg-theme-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MapPin className="w-5 h-5" />
                {isLocating ? '定位中...' : '📍 获取当前位置'}
              </button>

              {locationError && (
                <p className="text-sm text-red-500 text-center">{locationError}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  或手动输入
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="例如：北京市朝阳区"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme"
                />
              </div>

              {location && (
                <button
                  onClick={() => setLocation('')}
                  className="w-full text-sm text-red-500 hover:text-red-600 py-2"
                >
                  清除位置
                </button>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setLocationError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setLocationError('');
                }}
                className="flex-1 px-4 py-2 bg-theme text-white rounded-lg hover:bg-theme-hover transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticker Modal */}
      {showStickerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[650px] h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">添加贴纸</h3>
              <button
                onClick={() => setShowStickerModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveStickerTab('builtin')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeStickerTab === 'builtin'
                    ? 'text-theme border-b-2 border-theme'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                内置贴纸
              </button>
              <button
                onClick={() => setActiveStickerTab('custom')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeStickerTab === 'custom'
                    ? 'text-theme border-b-2 border-theme'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                我的贴纸
              </button>
              <button
                onClick={() => setActiveStickerTab('handdraw')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeStickerTab === 'handdraw'
                    ? 'text-theme border-b-2 border-theme'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                手绘
              </button>
            </div>

            <div className={`flex-1 p-4 ${activeStickerTab === 'handdraw' ? 'overflow-y-auto flex flex-col' : 'overflow-y-auto'}`}>
              {activeStickerTab === 'builtin' && (
                <div className="grid grid-cols-4 gap-3">
                  {BUILTIN_STICKERS.map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => addStickerToCanvas(sticker.emoji, sticker.name)}
                      className="aspect-square flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gray-100 transition-colors"
                      title={sticker.name}
                    >
                      <span className="text-4xl mb-1">{sticker.emoji}</span>
                      <span className="text-xs text-gray-500">{sticker.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {activeStickerTab === 'custom' && (
                <div>
                  {customStickers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">还没有自定义贴纸</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-lg cursor-pointer hover:bg-theme-hover transition-colors">
                        <Plus className="w-4 h-4" />
                        上传贴纸
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleStickerUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {customStickers.map((sticker) => (
                          <button
                            key={sticker.id}
                            onClick={() => addStickerToCanvas(sticker.url, sticker.name)}
                            className="aspect-square rounded-xl overflow-hidden hover:ring-2 hover:ring-theme transition-all"
                          >
                            <img
                              src={sticker.url}
                              alt={sticker.name}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      <label className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-theme hover:text-theme cursor-pointer transition-colors">
                        <Plus className="w-5 h-5" />
                        添加更多贴纸
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleStickerUpload}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </div>
              )}
              {activeStickerTab === 'handdraw' && (
                <div className="flex-1 min-h-0">
                  <DrawingCanvas
                    onSave={handleHandDrawSave}
                    onCancel={() => setShowStickerModal(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

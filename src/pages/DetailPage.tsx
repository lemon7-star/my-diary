import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  Tag as TagIcon,
  Clock,
  MapPin,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
} from 'lucide-react';
import { getDiaryById, deleteDiary, getTags, formatDate, getAllMoodOptions } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { WEATHER_OPTIONS, type Tag, type Weather, type DiarySticker, type DiaryEntry, type MoodOption } from '../types';

interface FloatingStickerViewProps {
  sticker: DiarySticker;
}

const isEmoji = (str: string) => {
  const emojiRegex = /^(?:[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[☀-⚿]|[✀-➿]|[⭐💖🌞⛅🌸🌹🌻🌈🌙🔥👑🎁🎈🎉🎵📷📚☕🎂🐱🐶🐰🐻✨])$/u;
  return emojiRegex.test(str);
};

function FloatingStickerView({ sticker }: FloatingStickerViewProps) {
  const isEmojiSticker = isEmoji(sticker.url);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: sticker.x,
        top: sticker.y,
        width: sticker.width,
        height: sticker.height,
      }}
    >
      {isEmojiSticker ? (
        <div className="w-full h-full flex items-center justify-center select-none" style={{ fontSize: '48px', lineHeight: 1 }}>
          {sticker.url}
        </div>
      ) : (
        <img
          src={sticker.url}
          alt={sticker.name}
          className="w-full h-full object-contain"
          draggable={false}
        />
      )}
    </div>
  );
}

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [diary, setDiary] = useState<DiaryEntry | undefined>(undefined);
  const [tags, setTags] = useState<Tag[]>([]);
  const [moodOptions, setMoodOptions] = useState<MoodOption[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user?.id) {
      void loadData();
    }
  }, [id, user?.id, navigate]);

  const loadData = async () => {
    if (!id || !user?.id) {
      return;
    }

    setLoading(true);
    const [diaryData, tagsData, moodsData] = await Promise.all([
      getDiaryById(id),
      getTags(user.id),
      getAllMoodOptions(user.id),
    ]);

    if (!diaryData) {
      navigate('/');
      return;
    }

    setDiary(diaryData);
    setTags(tagsData);
    setMoodOptions(moodsData);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (id) {
      await deleteDiary(id);
      navigate('/');
    }
  };

  const getWeatherIcon = (w: Weather) => {
    switch (w) {
      case 'sunny': return <Sun className="w-4 h-4" />;
      case 'cloudy': return <Cloud className="w-4 h-4" />;
      case 'rainy': return <CloudRain className="w-4 h-4" />;
      case 'snowy': return <CloudSnow className="w-4 h-4" />;
      default: return <Cloud className="w-4 h-4" />;
    }
  };

  if (loading || !diary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  const moodOption = moodOptions.find((m) => m.value === diary.mood);
  const diaryTags = diary.tags
    .map((tagId) => tags.find((t) => t.id === tagId))
    .filter(Boolean) as Tag[];
  const weatherOption = diary.weather ? WEATHER_OPTIONS.find((w) => w.value === diary.weather) : null;
  const stickers = diary.stickers || [];

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <Link
          to={`/edit/${diary.id}`}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          编辑
        </Link>
      </div>

      {/* Content Card */}
      <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Stickers */}
        {stickers.map(sticker => (
          <FloatingStickerView key={sticker.id} sticker={sticker} />
        ))}

        {/* Content */}
        <div className="relative z-0">
          {/* Header Info */}
          <div className="p-6 pb-4">
            {/* Date & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(diary.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(diary.updatedAt).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {diary.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {diary.location}
                </span>
              )}
              {weatherOption && (
                <span className="flex items-center gap-1">
                  {getWeatherIcon(diary.weather!)}
                  {weatherOption.label}
                </span>
              )}
            </div>

            {/* Mood */}
            {moodOption && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">{moodOption.emoji}</span>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {moodOption.label}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{diary.title}</h1>
          </div>

          {/* Images */}
          {diary.images.length > 0 && (
            <div className="px-6 mb-6">
              <div className={`grid gap-3 ${diary.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {diary.images.map((image) => (
                  <div key={image.id} className={`${diary.images.length === 1 ? 'aspect-video' : 'aspect-square'}`}>
                    <img
                      src={image.url}
                      alt=""
                      className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => window.open(image.url, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 pb-6">
            <div className="prose prose-gray max-w-none">
              {diary.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Tags */}
          {diaryTags.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <TagIcon className="w-4 h-4 text-gray-400" />
                {diaryTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 rounded-lg text-sm font-medium border"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      borderColor: `${tag.color}40`,
                    }}
                  >
                    # {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-6 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          删除日记
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除?</h3>
              <p className="text-gray-500">
                删除后将无法恢复，确定要删除这篇日记吗？
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

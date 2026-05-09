import { useState, useEffect } from 'react';
import {
  Palette,
  Check,
  RefreshCcw,
  Type,
  BoxSelect,
  Smile,
  Trash2,
} from 'lucide-react';
import { getTheme, saveTheme, getCustomMoods, deleteCustomMood } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { applyTheme } from '../utils/theme';
import { THEME_COLORS, BORDER_RADIUS_OPTIONS, FONT_OPTIONS, type ThemeSettings, type CustomMood } from '../types';

export function ThemePage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<ThemeSettings>(getTheme());
  const [saved, setSaved] = useState(false);
  const [customMoods, setCustomMoods] = useState<CustomMood[]>([]);
  const [moodToDelete, setMoodToDelete] = useState<CustomMood | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      void (async () => {
        if (!user?.id) {
          if (cancelled) return;
          setCustomMoods([]);
          return;
        }

        const nextCustomMoods = await getCustomMoods(user.id);
        if (cancelled) return;
        setCustomMoods(nextCustomMoods);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [user?.id]);

  const handleDeleteMood = async (mood: CustomMood) => {
    await deleteCustomMood(mood.id);

    if (!user?.id) {
      setCustomMoods([]);
    } else {
      setCustomMoods(await getCustomMoods(user.id));
    }

    setMoodToDelete(null);
  };

  const handleSave = () => {
    saveTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaultTheme: ThemeSettings = {
      primaryColor: '#8b5cf6',
      borderRadius: 'medium',
      fontFamily: 'system',
    };
    setTheme(defaultTheme);
    saveTheme(defaultTheme);
    applyTheme(defaultTheme);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">主题设置</h1>
          <p className="text-gray-500 mt-1">自定义你的日记应用外观</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            恢复默认
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-theme text-white hover:bg-theme-hover'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                已保存
              </>
            ) : (
              <>
                <Palette className="w-4 h-4" />
                保存设置
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-6">
        {/* Primary Color */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-theme" />
            <h2 className="text-lg font-semibold text-gray-900">主题色</h2>
          </div>
          <p className="text-gray-500 mb-4">选择你喜欢的主题颜色</p>

          <div className="flex flex-wrap gap-3">
            {THEME_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setTheme({ ...theme, primaryColor: color.value })}
                className={`w-14 h-14 rounded-xl transition-all ${
                  theme.primaryColor === color.value
                    ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                    : 'hover:scale-105'
                } ${color.class}`}
                title={color.name}
              >
                {theme.primaryColor === color.value && (
                  <Check className="w-6 h-6 text-white mx-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BoxSelect className="w-5 h-5 text-theme" />
            <h2 className="text-lg font-semibold text-gray-900">圆角设置</h2>
          </div>
          <p className="text-gray-500 mb-4">调整界面元素的圆角大小</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BORDER_RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme({ ...theme, borderRadius: option.value })}
                className={`p-4 border-2 rounded-xl transition-all ${
                  theme.borderRadius === option.value
                    ? 'border-theme bg-theme-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-full h-12 bg-theme mb-3 ${option.class}`}
                  style={{ opacity: 0.3 }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-theme" />
            <h2 className="text-lg font-semibold text-gray-900">字体设置</h2>
          </div>
          <p className="text-gray-500 mb-4">选择你喜欢的字体风格</p>

          <div className="space-y-3">
            {FONT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme({ ...theme, fontFamily: option.value })}
                className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                  theme.fontFamily === option.value
                    ? 'border-theme bg-theme-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`text-lg ${option.class}`}>
                  {option.label}
                </span>
                <span className={`block text-gray-500 mt-1 ${option.class}`}>
                  Aa 这是一段示例文字
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Moods Management */}
        {customMoods.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Smile className="w-5 h-5 text-theme" />
              <h2 className="text-lg font-semibold text-gray-900">自定义心情</h2>
            </div>
            <p className="text-gray-500 mb-4">管理你添加的自定义心情</p>

            <div className="flex flex-wrap gap-3">
              {customMoods.map((mood) => (
                <div
                  key={mood.id}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl"
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{mood.label}</span>
                  <button
                    onClick={() => setMoodToDelete(mood)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Delete Mood Confirmation Modal */}
      {moodToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">删除自定义心情?</h3>
              <p className="text-gray-500">
                确定要删除 "{moodToDelete.emoji} {moodToDelete.label}" 吗？此操作无法撤销。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMoodToDelete(null)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteMood(moodToDelete)}
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

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Flame, Smile, Tag as TagIcon, TrendingUp } from 'lucide-react';
import { getDiaries, getTags, getAllMoodOptions } from '../utils/storage';
import type { DiaryEntry, Tag, MoodOption } from '../types';

interface StatsData {
  totalDays: number;
  streakDays: number;
  topMood: { emoji: string; label: string; count: number } | null;
  topTag: { name: string; color: string; count: number } | null;
  last7Days: { date: string; count: number; chars: number }[];
  moodDistribution: { emoji: string; label: string; value: string; count: number; color: string }[];
}

export function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [diaries, allTags, allMoods] = await Promise.all([
      getDiaries(),
      getTags(),
      getAllMoodOptions(),
    ]);
    setStats(calculateStats(diaries, allTags, allMoods));
    setLoading(false);
  };

  const calculateStats = (diaries: DiaryEntry[], allTags: Tag[], allMoods: MoodOption[]): StatsData => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 本月记录天数
    const thisMonthDiaries = diaries.filter(d => {
      const dDate = new Date(d.date);
      return dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
    });
    const totalDays = new Set(thisMonthDiaries.map(d => d.date)).size;

    // 连续打卡天数
    const streakDays = calculateStreak(diaries);

    // 最常见心情
    const moodCounts: Record<string, number> = {};
    diaries.forEach(d => {
      if (d.mood) {
        moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1;
      }
    });
    const topMoodEntry = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    const topMoodOption = topMoodEntry ? allMoods.find(m => m.value === topMoodEntry[0]) : null;
    const topMood = topMoodEntry && topMoodOption
      ? {
          emoji: topMoodOption.emoji,
          label: topMoodOption.label,
          count: topMoodEntry[1],
        }
      : null;

    // 最常用标签
    const tagCounts: Record<string, number> = {};
    diaries.forEach(d => {
      d.tags.forEach(tagId => {
        tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
      });
    });
    const topTagEntry = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    const topTag = topTagEntry
      ? {
          name: allTags.find(t => t.id === topTagEntry[0])?.name || '',
          color: allTags.find(t => t.id === topTagEntry[0])?.color || '#888',
          count: topTagEntry[1],
        }
      : null;

    // 近7天记录量
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayDiaries = diaries.filter(d => d.date === dateStr);
      const totalChars = dayDiaries.reduce((sum, d) => sum + d.content.length, 0);
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count: dayDiaries.length,
        chars: totalChars,
      };
    });

    // 心情分布
    const moodColors: Record<string, string> = {
      happy: '#FCD34D',
      calm: '#6EE7B7',
      sad: '#93C5FD',
      angry: '#FCA5A5',
      love: '#F9A8D4',
    };
    const moodDistribution = allMoods.map(m => ({
      ...m,
      count: moodCounts[m.value] || 0,
      color: moodColors[m.value] || '#A78BFA',
    }));

    return {
      totalDays,
      streakDays,
      topMood,
      topTag,
      last7Days,
      moodDistribution,
    };
  };

  const calculateStreak = (diaries: DiaryEntry[]): number => {
    if (diaries.length === 0) return 0;

    const sortedDates = [...new Set(diaries.map(d => d.date))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i - 1]);
      const prev = new Date(sortedDates[i]);
      const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  }, []);

  const maxCount = stats ? Math.max(...stats.last7Days.map(d => d.count), 1) : 1;
  const maxMoodCount = stats ? Math.max(...stats.moodDistribution.map(m => m.count), 1) : 1;

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

  if (!stats) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">统计回顾</h1>
        <p className="text-gray-500 mt-1">{currentMonthStr}</p>
      </div>

      {stats.totalDays === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有数据</h3>
          <p className="text-gray-500">开始写日记，生成你的专属统计</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Days */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-theme-light rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-theme" />
                </div>
                <span className="text-sm text-gray-500">本月记录</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDays}<span className="text-sm font-normal text-gray-500 ml-1">天</span></p>
            </div>

            {/* Streak */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-sm text-gray-500">连续打卡</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.streakDays}<span className="text-sm font-normal text-gray-500 ml-1">天</span></p>
            </div>

            {/* Top Mood */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Smile className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-sm text-gray-500">最常见心情</span>
              </div>
              {stats.topMood ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{stats.topMood.emoji}</span>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{stats.topMood.label}</p>
                    <p className="text-xs text-gray-500">{stats.topMood.count} 次</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">暂无数据</p>
              )}
            </div>

            {/* Top Tag */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TagIcon className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-gray-500">最常用标签</span>
              </div>
              {stats.topTag ? (
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-medium border"
                    style={{
                      backgroundColor: `${stats.topTag.color}20`,
                      color: stats.topTag.color,
                      borderColor: `${stats.topTag.color}40`,
                    }}
                  >
                    # {stats.topTag.name}
                  </span>
                  <span className="text-xs text-gray-500">{stats.topTag.count} 次</span>
                </div>
              ) : (
                <p className="text-gray-400">暂无数据</p>
              )}
            </div>
          </div>

          {/* Last 7 Days Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">近7天记录量</h3>
            <div className="flex items-end justify-between h-40 gap-2">
              {stats.last7Days.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: '120px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-theme transition-all duration-500 rounded-t-lg"
                      style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">{day.date}</p>
                    <p className="text-xs font-medium text-gray-700">{day.count}篇</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">本月心情分布</h3>
            <div className="space-y-4">
              {stats.moodDistribution.map((mood) => (
                <div key={mood.value} className="flex items-center gap-4">
                  <span className="text-2xl w-8">{mood.emoji}</span>
                  <span className="text-sm text-gray-600 w-12">{mood.label}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${(mood.count / maxMoodCount) * 100}%`,
                        backgroundColor: mood.color,
                        minWidth: mood.count > 0 ? '8px' : '0',
                      }}
                    >
                      {mood.count > 0 && (
                        <span className="text-xs font-medium text-gray-700">{mood.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

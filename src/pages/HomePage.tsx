import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Plus,
  Search,
  Calendar,
  Trash2,
  Sparkles,
  ArrowRight,
  X,
  BookHeart,
} from 'lucide-react';
import { deleteDiary, groupDiariesByMonth, formatDate, getAllMoodOptions } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import type { MoodOption } from '../types';
import type { DiaryIndexOutletContext } from '../components/Layout';

export function HomePage() {
  const { user } = useAuth();
  const { diaries, tags, loading, refresh } = useOutletContext<DiaryIndexOutletContext>();
  const [moodOptions, setMoodOptions] = useState<MoodOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      void (async () => {
        if (!user?.id) return;

        const nextMoodOptions = await getAllMoodOptions(user.id);
        if (cancelled) return;
        setMoodOptions(nextMoodOptions);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    await deleteDiary(id);
    setDeleteConfirmId(null);
    await refresh();
  };

  const filteredDiaries = diaries.filter((diary) => {
    const matchesSearch = diary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diary.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? diary.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const groupedDiaries = groupDiariesByMonth(filteredDiaries);
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedTag !== null;

  const getMoodEmoji = (mood: string | undefined) => {
    if (!mood) return null;
    return moodOptions.find((m) => m.value === mood)?.emoji ?? null;
  };

  const getTagById = (tagId: string) => tags.find((t) => t.id === tagId);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
  };

  if (!loading && diaries.length === 0) {
    return (
      <div className="space-y-6">
        <section className="bg-theme-gradient border-theme-soft shadow-theme-strong overflow-hidden rounded-[28px] border px-6 py-7 text-white sm:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              从今天开始，留下你的生活片段
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">我的日记</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              这里会慢慢长成属于你的时间线，记录情绪、灵感和每一个值得保存的瞬间。
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-gray-200 bg-white px-6 py-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:px-10 sm:py-14">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-theme-light">
            <BookHeart className="h-10 w-10 text-theme" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">还没有日记</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
            从第一篇开始就好。写下今天的感受、一个瞬间、或一件想在以后回看的小事，这里会帮你把它们串成清晰的时间线。
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/new"
              className="bg-theme-gradient bg-theme-gradient-hover shadow-theme-strong inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              写第一篇日记
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">我的日记</h1>
        <Link
          to="/new"
          className="bg-theme-gradient bg-theme-gradient-hover shadow-theme-strong inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" />
          新建日记
        </Link>
      </section>

      <section className="rounded-[24px] border border-gray-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索标题或正文内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!!loading}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 disabled:cursor-wait disabled:opacity-70 focus:border-theme focus:bg-white"
            />
          </div>

          {!loading && tags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                  selectedTag === null
                    ? 'bg-theme-surface-strong text-theme-strong border-theme-soft-strong border'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                全部
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                    selectedTag === tag.id
                      ? 'bg-theme-surface-strong text-theme-strong border-theme-soft-strong border'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}

          {!loading && hasActiveFilters && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-sm text-gray-500">显示 {filteredDiaries.length} / {diaries.length} 篇</p>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
                清除筛选
              </button>
            </div>
          )}
        </div>
      </section>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center rounded-[24px] border border-gray-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-theme border-t-transparent" />
            <p className="text-sm text-gray-500">内容加载中...</p>
          </div>
        </div>
      ) : filteredDiaries.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.04)] sm:px-10">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-gray-100">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-gray-900">没有找到匹配的日记</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
            可以尝试换一个关键词，或在上方筛选区清空条件后重新浏览全部内容。
          </p>
        </section>
      ) : (
        <div className="space-y-10">
          {Array.from(groupedDiaries.entries()).map(([month, monthDiaries]) => (
            <section key={month} className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-theme-light">
                    <Calendar className="h-5 w-5 text-theme" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{month}</h3>
                    <p className="text-sm text-gray-500">把这个月记录下来的片段重新读一遍</p>
                  </div>
                </div>
                <span className="inline-flex w-fit rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 ring-1 ring-gray-200">
                  {monthDiaries.length} 篇记录
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {monthDiaries.map((diary) => {
                  const moodEmoji = getMoodEmoji(diary.mood);

                  return (
                  <article
                    key={diary.id}
                    className="group hover:border-theme-soft-strong hover:shadow-theme-medium rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {moodEmoji && (
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 text-2xl ring-1 ring-gray-100">
                            {moodEmoji}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-700">{formatDate(diary.date)}</p>
                          <p className="text-xs text-gray-500">记录下当时的情绪与想法</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setDeleteConfirmId(diary.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <Link to={`/diary/${diary.id}`} className="block space-y-3">
                      <div>
                        <h4 className="text-lg font-semibold leading-7 text-gray-900 transition-colors group-hover:text-theme line-clamp-1">
                          {diary.title}
                        </h4>
                        <p className="mt-3 text-sm leading-7 text-gray-600 line-clamp-3">
                          {diary.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex min-w-0 items-center gap-2 flex-wrap">
                          {diary.tags.length > 0 ? (
                            diary.tags.map((tagId) => {
                              const tag = getTagById(tagId);
                              if (!tag) return null;
                              return (
                                <span
                                  key={tagId}
                                  className="inline-flex rounded-full border px-3 py-1 text-xs font-medium"
                                  style={{
                                    backgroundColor: `${tag.color}20`,
                                    color: tag.color,
                                    borderColor: `${tag.color}40`,
                                  }}
                                >
                                  {tag.name}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-gray-400">暂无标签</span>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-sm font-medium text-theme">
                          查看详情
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-7 shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-gray-900">确认删除这篇日记？</h3>
            <p className="mt-3 text-sm leading-7 text-gray-500 sm:text-base">
              删除后将无法恢复，这篇记录里的文字、心情和标签都会一起移除。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

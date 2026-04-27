import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, Tag as TagIcon, Trash2 } from 'lucide-react';
import { getDiaries, getTags, deleteDiary, groupDiariesByMonth, formatDate, getAllMoodOptions } from '../utils/storage';
import type { DiaryEntry, Tag } from '../types';

export function HomePage() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setDiaries(getDiaries());
    setTags(getTags());
  };

  const handleDelete = (id: string) => {
    deleteDiary(id);
    setDeleteConfirmId(null);
    loadData();
  };

  const filteredDiaries = diaries.filter(diary => {
    const matchesSearch = diary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         diary.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? diary.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const groupedDiaries = groupDiariesByMonth(filteredDiaries);

  const getMoodEmoji = (mood: string | undefined) => {
    if (!mood) return '😐';
    return getAllMoodOptions().find(m => m.value === mood)?.emoji || '😐';
  };

  const getTagById = (tagId: string) => tags.find(t => t.id === tagId);

  if (diaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-theme-light rounded-full flex items-center justify-center mb-6">
          <Calendar className="w-12 h-12 text-theme" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          还没有日记
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          开始记录你的第一篇日记吧！写下今天的想法、感受，或者任何你想记住的事情。
        </p>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-theme text-white rounded-xl font-medium hover:bg-theme-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          写第一篇日记
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的日记</h1>
          <p className="text-gray-500 mt-1">共 {diaries.length} 篇日记</p>
        </div>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-lg font-medium hover:bg-theme-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建日记
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索日记..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
          />
        </div>
        {tags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTag === null
                  ? 'bg-theme-light text-theme'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedTag === tag.id
                    ? 'bg-theme-light text-theme'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Diary List */}
      <div className="space-y-8">
        {Array.from(groupedDiaries.entries()).map(([month, monthDiaries]) => (
          <div key={month}>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-theme" />
              {month}
              <span className="text-sm font-normal text-gray-500">({monthDiaries.length} 篇)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monthDiaries.map(diary => (
                <div
                  key={diary.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {diary.mood && (
                        <span className="text-2xl" title={getAllMoodOptions().find(m => m.value === diary.mood)?.label}>
                          {getMoodEmoji(diary.mood)}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatDate(diary.date)}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={() => setDeleteConfirmId(diary.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Link to={`/diary/${diary.id}`} className="block">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {diary.title}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                      {diary.content}
                    </p>
                  </Link>

                  {diary.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <TagIcon className="w-4 h-4 text-gray-400" />
                      {diary.tags.map(tagId => {
                        const tag = getTagById(tagId);
                        if (!tag) return null;
                        return (
                          <span
                            key={tagId}
                            className="px-2 py-0.5 text-xs rounded-md border"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                              borderColor: `${tag.color}40`,
                            }}
                          >
                            {tag.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除?</h3>
            <p className="text-gray-500 mb-4">删除后将无法恢复，确定要删除这篇日记吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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

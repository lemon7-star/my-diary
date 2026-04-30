import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Tag,
} from 'lucide-react';
import { getTags, saveTag, deleteTag, getDiaries } from '../utils/storage';
import { TAG_COLORS, type Tag as TagType } from '../types';

export function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [diaryCountByTag, setDiaryCountByTag] = useState<Map<string, number>>(new Map());
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState(TAG_COLORS[0].value);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [allTags, diaries] = await Promise.all([
      getTags(),
      getDiaries(),
    ]);
    setTags(allTags);

    const countMap = new Map<string, number>();
    allTags.forEach((tag) => {
      const count = diaries.filter((d) => d.tags.includes(tag.id)).length;
      countMap.set(tag.id, count);
    });
    setDiaryCountByTag(countMap);
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingTag(null);
    setTagName('');
    setTagColor(TAG_COLORS[0].value);
    setShowModal(true);
  };

  const openEditModal = (tag: TagType) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!tagName.trim()) return;

    const tag: TagType = {
      id: editingTag?.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: tagName.trim(),
      color: tagColor,
      createdAt: editingTag?.createdAt || Date.now(),
    };

    await saveTag(tag);
    setShowModal(false);
    await loadData();
  };

  const handleDelete = async (tagId: string) => {
    await deleteTag(tagId);
    setDeleteConfirmId(null);
    await loadData();
  };

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
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">标签管理</h1>
          <p className="text-gray-500 mt-1">管理你的日记标签</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-lg font-medium hover:bg-theme-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建标签
        </button>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-theme-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-theme" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有标签</h3>
          <p className="text-gray-500 mb-4">创建标签来分类你的日记</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-theme text-white rounded-lg font-medium hover:bg-theme-hover transition-colors"
          >
            创建第一个标签
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tags.map((tag) => {
            const diaryCount = diaryCountByTag.get(tag.id) || 0;
            return (
              <div
                key={tag.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                      <p className="text-sm text-gray-500">
                        {diaryCount} 篇日记
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(tag)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(tag.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-4">
                  <span
                    className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium border"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      borderColor: `${tag.color}40`,
                    }}
                  >
                    {tag.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTag ? '编辑标签' : '新建标签'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签名称
                </label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="例如：旅行"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签颜色
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setTagColor(color.value)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        tagColor === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-400'
                          : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预览
                </label>
                <span
                  className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium border"
                  style={{
                    backgroundColor: `${tagColor}20`,
                    color: tagColor,
                    borderColor: `${tagColor}40`,
                  }}
                >
                  {tagName || '标签预览'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!tagName.trim()}
                className="flex-1 px-4 py-2 bg-theme text-white rounded-lg hover:bg-theme-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              确认删除标签?
            </h3>
            <p className="text-gray-500 mb-4">
              删除标签后，相关日记将不再显示此标签。
            </p>
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

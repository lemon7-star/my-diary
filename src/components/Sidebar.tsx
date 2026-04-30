import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Plus,
  Tag,
  Palette,
  BookHeart,
  BarChart3,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { getDiaries, getTags } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [stats, setStats] = useState({
    totalDiaries: 0,
    totalTags: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    loadData();
  }, [location.pathname]);

  const loadData = async () => {
    const [diaries, tags] = await Promise.all([
      getDiaries(),
      getTags(),
    ]);

    const now = new Date();
    const thisMonthCount = diaries.filter(d => {
      const dDate = new Date(d.date);
      return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
    }).length;

    setStats({
      totalDiaries: diaries.length,
      totalTags: tags.length,
      thisMonth: thisMonthCount,
    });
  };

  const handleSignOut = async () => {
    if (confirm('确定要退出登录吗？')) {
      await signOut();
    }
  };

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/new', icon: Plus, label: '写日记' },
    { path: '/tags', icon: Tag, label: '标签管理' },
    { path: '/stats', icon: BarChart3, label: '统计' },
    { path: '/theme', icon: Palette, label: '主题设置' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-theme rounded-xl flex items-center justify-center">
            <BookHeart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">我的手账</h1>
            <p className="text-xs text-gray-500">记录每一天的美好</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {/* Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${isActive
                        ? 'bg-theme-light text-theme font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Panels */}
        <div className="shrink-0">
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">统计概览</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-theme">{stats.totalDiaries}</p>
                  <p className="text-xs text-gray-500">总日记数</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
                  <p className="text-xs text-gray-500">本月</p>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">标签总数</span>
                  <span className="font-medium text-gray-900">{stats.totalTags} 个</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-theme-light rounded-full flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-theme" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                  {profile?.username || '用户'}
                </p>
                <p className="text-xs text-gray-500">已登录</p>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                to="/profile"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                <Settings className="w-5 h-5" />
                <span>个人设置</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

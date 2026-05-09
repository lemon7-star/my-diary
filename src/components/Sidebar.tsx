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
import type { DiaryEntry, Tag as TagItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  diaries: DiaryEntry[];
  tags: TagItem[];
  loading: boolean;
}

export function Sidebar({ diaries, tags, loading }: SidebarProps) {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    if (confirm('确定要退出登录吗？')) {
      await signOut();
    }
  };

  const primaryAction = { path: '/new', icon: Plus, label: '写日记' };
  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/tags', icon: Tag, label: '标签' },
    { path: '/stats', icon: BarChart3, label: '统计' },
    { path: '/theme', icon: Palette, label: '主题' },
  ];

  const now = new Date();
  const thisMonthCount = diaries.filter((diary) => {
    const diaryDate = new Date(diary.date);
    return diaryDate.getMonth() === now.getMonth() && diaryDate.getFullYear() === now.getFullYear();
  }).length;

  const statItems = [
    { label: '总日记', value: loading ? '—' : diaries.length },
    { label: '本月', value: loading ? '—' : thisMonthCount },
  ];

  return (
    <aside className="bg-theme-page fixed left-0 top-0 h-full w-[18rem] px-3 py-4">
      <div className="shadow-theme-soft border-theme-soft flex h-full flex-col overflow-hidden rounded-[26px] border bg-white">
        <div className="px-5 pb-4 pt-5">
          <Link to="/" className="flex items-center gap-3 text-[#241b43] transition-opacity hover:opacity-85">
            <div className="bg-theme-surface flex h-12 w-12 items-center justify-center rounded-2xl">
              <BookHeart className="text-theme h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold text-[#241b43]">我的手账</h1>
              <p className="truncate text-[12px] text-[#a09ab8]">记录每一天的美好</p>
            </div>
          </Link>
        </div>

        <div className="bg-theme-surface mx-5 h-px" />

        <div className="flex min-h-0 flex-1 flex-col">
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <Link
              to={primaryAction.path}
              className={`bg-theme-gradient bg-theme-gradient-hover flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-white transition-all ${
                location.pathname === primaryAction.path
                  ? 'shadow-theme-strong'
                  : 'shadow-theme-medium hover:-translate-y-0.5'
              }`}
            >
              <primaryAction.icon className="h-5 w-5" />
              <span className="font-medium">{primaryAction.label}</span>
            </Link>

            <div className="px-1 pb-2 pt-4 text-[11px] font-medium tracking-[0.08em] text-[#b0aac4]">
              菜单
            </div>

            <ul className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] transition-colors ${
                        isActive
                          ? 'bg-theme-surface-strong text-theme-strong'
                          : 'text-[#6c6781] hover:bg-theme-surface hover:text-[#241b43]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {statItems.map((item) => (
                <div
                  key={item.label}
                  className="border-theme-soft rounded-2xl border bg-white px-4 py-3 text-center shadow-[0_6px_18px_var(--theme-shadow-soft)]"
                >
                  <div className="text-theme text-[28px] font-semibold leading-none tabular-nums">
                    {item.value}
                  </div>
                  <div className="mt-2 text-[11px] text-[#b1aac7]">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="border-theme-soft mt-4 rounded-2xl border bg-white px-4 py-3 shadow-[0_6px_18px_var(--theme-shadow-soft)]">
              <div className="flex items-center gap-3">
                <div className="bg-theme-surface flex h-11 w-11 items-center justify-center overflow-hidden rounded-full">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="text-theme h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-[#241b43]">
                    {profile?.username || '用户'}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[#77c16f]">
                    <span className="h-2 w-2 rounded-full bg-[#4dd266]" />
                    <span>已登录</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="border-theme-soft border-t px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/profile"
                className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-[14px] transition-colors ${
                  location.pathname === '/profile'
                    ? 'border-theme-soft-strong bg-theme-surface-strong text-theme-strong'
                    : 'border-theme-soft bg-white text-[#77718e] hover:bg-theme-surface hover:text-[#241b43]'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>设置</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="border-theme-soft flex items-center justify-center gap-2 rounded-2xl border bg-white px-3 py-3 text-[14px] text-[#77718e] transition-colors hover:bg-[#fff7f8] hover:text-[#b05b74]"
              >
                <LogOut className="h-4 w-4" />
                <span>退出</span>
              </button>
            </div>

            <p className="mt-3 px-1 text-[11px] text-[#b0aac4]">标签总数 {loading ? '—' : tags.length}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

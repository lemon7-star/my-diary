import { useEffect, useMemo, useState } from 'react';
import { Camera, Check, Lock, Save, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function ProfileSettingsPage() {
  const { user, profile, updateProfile, updatePassword } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setUsername(profile?.username ?? '');
    setAvatarPreview(profile?.avatar_url ?? '');
  }, [profile]);

  useEffect(() => {
    if (!avatarFile) {
      return;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  const displayAvatar = useMemo(() => avatarPreview || profile?.avatar_url || '', [avatarPreview, profile?.avatar_url]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setProfileError('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('头像图片不能超过 5MB');
      return;
    }

    setProfileError('');
    setProfileSuccess(false);
    setAvatarFile(file);
  };

  const handleSaveProfile = async () => {
    if (!user) {
      setProfileError('用户未登录');
      return;
    }

    if (!username.trim()) {
      setProfileError('请输入昵称');
      return;
    }

    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess(false);

    let avatarUrl = profile?.avatar_url ?? null;

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop() || 'png';
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      const uploadResult = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadResult.error) {
        setProfileError(uploadResult.error.message);
        setSavingProfile(false);
        return;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      avatarUrl = data.publicUrl;
    }

    const { error } = await updateProfile({
      username: username.trim(),
      avatar_url: avatarUrl,
    });

    if (error) {
      setProfileError(error);
    } else {
      setAvatarFile(null);
      setProfileSuccess(true);
    }

    setSavingProfile(false);
  };

  const handleSavePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordError('新密码至少 6 位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }

    setSavingPassword(true);
    setPasswordError('');
    setPasswordSuccess(false);

    const { error } = await updatePassword(newPassword);

    if (error) {
      setPasswordError(error.message);
    } else {
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
    }

    setSavingPassword(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">个人信息设置</h1>
          <p className="text-gray-500 mt-1">管理你的昵称、头像和登录密码</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-theme" />
            <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
          </div>
          <p className="text-gray-500 mb-6">修改昵称和头像，保存后会立即同步到侧边栏</p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-theme-light rounded-full flex items-center justify-center overflow-hidden">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={username || '用户头像'} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-theme" />
                )}
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-lg hover:bg-theme-hover transition-colors cursor-pointer">
                <Camera className="w-4 h-4" />
                上传头像
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="请输入昵称"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme focus:border-transparent outline-none transition-all"
              />
            </div>

            {profileError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                基本信息已保存
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-lg hover:bg-theme-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? '保存中...' : '保存基本信息'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-theme" />
            <h2 className="text-lg font-semibold text-gray-900">修改密码</h2>
          </div>
          <p className="text-gray-500 mb-6">更新登录密码，修改后请使用新密码重新登录</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">新密码</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="请输入新密码（至少 6 位）"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="请再次输入新密码"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme focus:border-transparent outline-none transition-all"
              />
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                密码已更新
              </div>
            )}

            <button
              onClick={handleSavePassword}
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-lg hover:bg-theme-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {savingPassword ? '保存中...' : '更新密码'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

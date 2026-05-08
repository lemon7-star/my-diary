import { useState, type ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import { BookHeart, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Sparkles, ShieldCheck, PenLine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type AuthFormSubmitEvent = ComponentProps<'form'>['onSubmit'] extends ((event: infer T) => void) | undefined ? T : never;

export function ForgotPasswordPage() {
  const { resetPasswordForEmail, updatePassword } = useAuth();

  const isRecoveryMode = new URLSearchParams(window.location.search).get('type') === 'recovery';
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendResetEmail = async (e: AuthFormSubmitEvent) => {
    e.preventDefault();
    if (!email) {
      setError('请输入邮箱');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await resetPasswordForEmail(email);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: AuthFormSubmitEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('密码至少6位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    const { error } = await updatePassword(newPassword);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const title = success
    ? (isRecoveryMode ? '密码已更新完成' : '重置邮件已发送')
    : (isRecoveryMode ? '设置一个新的登录密码' : '通过邮箱找回你的手账');

  const subtitle = success
    ? (isRecoveryMode ? '现在可以使用新密码重新登录你的账号。' : '请前往邮箱打开重置链接，继续完成密码修改。')
    : (isRecoveryMode ? '输入并确认新密码，完成后即可返回登录。' : '我们会向你的注册邮箱发送重置链接，帮助你安全地找回账号。');

  return (
    <div className="auth-shell">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-100px] h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="absolute right-[-80px] top-1/3 h-80 w-80 rounded-full bg-fuchsia-200/35 blur-3xl" />
        <div className="absolute bottom-[-140px] left-1/3 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr] xl:gap-8">
          <section className="auth-hero hidden p-8 lg:flex lg:flex-col lg:justify-between xl:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.2),transparent_32%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-white/14 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/18 ring-1 ring-white/30">
                  <BookHeart className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold">我的手账</p>
                  <p className="text-sm text-white/80">把每一天认真写下来</p>
                </div>
              </div>

              <div className="mt-12 max-w-xl space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                  重新连接你的记录空间
                </span>
                <div className="space-y-4">
                  <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
                    忘记密码也没关系，你的内容还在这里等你。
                  </h1>
                  <p className="max-w-lg text-lg leading-8 text-white/80">
                    通过邮箱安全找回账号，继续整理生活、情绪和那些想保留下来的片段。
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/12 p-5 backdrop-blur-sm ring-1 ring-white/20">
                <Mail className="mb-4 h-6 w-6 text-white" />
                <p className="text-base font-medium">邮箱找回</p>
                <p className="mt-2 text-sm leading-6 text-white/75">通过注册邮箱接收重置链接，快速恢复访问。</p>
              </div>
              <div className="rounded-3xl bg-white/12 p-5 backdrop-blur-sm ring-1 ring-white/20">
                <ShieldCheck className="mb-4 h-6 w-6 text-white" />
                <p className="text-base font-medium">安全更新</p>
                <p className="mt-2 text-sm leading-6 text-white/75">新的登录密码将在确认后立即生效。</p>
              </div>
              <div className="rounded-3xl bg-white/12 p-5 backdrop-blur-sm ring-1 ring-white/20">
                <PenLine className="mb-4 h-6 w-6 text-white" />
                <p className="text-base font-medium">继续记录</p>
                <p className="mt-2 text-sm leading-6 text-white/75">回到你的手账时间线，延续正在书写的日常。</p>
              </div>
            </div>
          </section>

          <section className="auth-panel flex flex-col justify-center px-5 py-6 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-white/70">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c5cfc] to-[#a78bfa] shadow-[0_12px_30px_rgba(124,92,252,0.24)]">
                  <BookHeart className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">我的手账</p>
                  <p className="text-sm text-gray-500">找回你的记录空间</p>
                </div>
              </div>
            </div>

            <div className="mb-8 space-y-4">
              {!success && (
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  返回登录
                </Link>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-theme">{isRecoveryMode ? '重置密码' : '找回账号'}</p>
                <h1 className="text-3xl font-semibold text-gray-900 sm:text-[2rem]">{title}</h1>
                <p className="max-w-lg text-sm leading-7 text-gray-500 sm:text-base">{subtitle}</p>
              </div>
            </div>

            {error && (
              <div className="auth-alert-error mb-6">
                {error}
              </div>
            )}

            {!isRecoveryMode && !success && (
              <form onSubmit={handleSendResetEmail} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">邮箱</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入注册邮箱"
                      className="auth-input pl-12 pr-4"
                      required
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    系统会向该邮箱发送一封重置密码邮件，请留意收件箱和垃圾邮件箱。
                  </p>
                </div>

                <button type="submit" disabled={loading} className="auth-primary-btn w-full">
                  {loading ? '发送中...' : '发送重置链接'}
                </button>
              </form>
            )}

            {isRecoveryMode && !success && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">新密码</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="请输入新密码（至少6位）"
                      minLength={6}
                      className="auth-input pl-12 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">确认密码</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="请再次输入新密码"
                      minLength={6}
                      className="auth-input pl-12 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-primary-btn w-full">
                  {loading ? '重置中...' : '确认并更新密码'}
                </button>
              </form>
            )}

            {success && (
              <div className="rounded-[28px] border border-emerald-100 bg-white/75 p-6 text-center shadow-[0_20px_50px_rgba(16,185,129,0.08)]">
                <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle className="h-9 w-9 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {isRecoveryMode ? '密码重置成功' : '邮件已发送'}
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
                  {isRecoveryMode
                    ? '你的密码已经更新完成，现在可以返回登录并继续使用新的密码进入手账。'
                    : `请检查邮箱 ${email}，点击邮件中的链接完成密码重置。`}
                </p>
                <div className="mt-6">
                  <Link to="/auth" className="auth-primary-btn w-full">
                    返回登录
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

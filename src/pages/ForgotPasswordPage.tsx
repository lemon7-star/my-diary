import { useState, type ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import { BookHeart, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Sparkles, ShieldCheck, PenLine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAuthErrorMessage, isPasswordRecoveryUrl } from '../utils/auth';

type AuthFormSubmitEvent = ComponentProps<'form'>['onSubmit'] extends ((event: infer T) => void) | undefined ? T : never;

export function ForgotPasswordPage() {
  const { resetPasswordForEmail, updatePassword, isPasswordRecovery, signOut } = useAuth();

  const [completedRecovery, setCompletedRecovery] = useState(false);
  const isRecoveryMode = completedRecovery || isPasswordRecovery || isPasswordRecoveryUrl();
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
      setError(getAuthErrorMessage(error.message));
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
      setError(getAuthErrorMessage(error.message));
      setLoading(false);
      return;
    }

    setCompletedRecovery(true);
    setNewPassword('');
    setConfirmPassword('');
    await signOut();
    window.history.replaceState({}, document.title, window.location.pathname);
    setSuccess(true);
    setLoading(false);
  };

  const title = success
    ? (isRecoveryMode ? '密码已更新完成' : '重置邮件已发送')
    : (isRecoveryMode ? '设置一个新的登录密码' : '通过邮箱找回你的手账');

  const subtitle = success
    ? (isRecoveryMode ? '现在可以使用新密码重新登录你的账号。' : '请前往邮箱打开重置链接，继续完成密码修改。')
    : (isRecoveryMode ? '输入并确认新密码，完成后即可返回登录。' : '我们会向你的注册邮箱发送重置链接，帮助你安全地找回账号。');

  const heroTitle = isRecoveryMode
    ? '设置好新密码，再回到你的记录时间线。'
    : '忘记密码时，也能从容地找回你的手账。';

  const heroSubtitle = isRecoveryMode
    ? '新的登录密码确认后会立即生效，你可以继续回到手账里整理那些想保留下来的片段。'
    : '通过注册邮箱完成身份确认，用更安全、更清晰的方式重新连接你的账号与日常记录。';

  const successMessage = isRecoveryMode
    ? '你的密码已经更新完成，现在可以返回登录并继续使用新的密码进入手账。'
    : `请检查邮箱 ${email}，点击邮件中的链接完成密码重置。`;

  return (
    <div className="auth-shell">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-100px] h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-primary-20)' }} />
        <div className="absolute right-[-80px] top-1/3 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-primary-10)' }} />
        <div className="absolute bottom-[-140px] left-1/3 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-primary-20)' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div
          className="auth-panel flex w-full max-w-[980px] flex-col overflow-hidden lg:min-w-[800px] lg:h-[620px] lg:flex-row lg:items-stretch"
          style={{ maxHeight: 'calc(100vh - 48px)' }}
        >
          <section
            className="auth-hero hidden h-full flex-1 overflow-hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between"
            style={{ maxHeight: 'calc(100vh - 48px)' }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_32%)]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-white/14 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18 ring-1 ring-white/25">
                  <BookHeart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-semibold">我的手账</p>
                  <p className="text-xs text-white/80">把每一天认真写下来</p>
                </div>
              </div>

              <div className="mt-6 max-w-[360px]">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-medium text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  账号恢复流程
                </span>
                <h1 className="mt-4 text-[28px] font-semibold leading-[1.45] text-white">
                  {heroTitle}
                </h1>
                <p className="mt-3 text-[13px] leading-6 text-white/80">
                  {heroSubtitle}
                </p>
              </div>
            </div>

            <div className="relative z-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm ring-1 ring-white/15">
                <Mail className="mb-3 h-5 w-5 text-white" />
                <p className="text-base font-medium text-white">邮箱验证</p>
                <p className="mt-2 text-[12px] leading-5 text-white/75">通过注册邮箱确认身份，安全拿回访问权限。</p>
              </div>
              <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm ring-1 ring-white/15">
                <ShieldCheck className="mb-3 h-5 w-5 text-white" />
                <p className="text-base font-medium text-white">安全更新</p>
                <p className="mt-2 text-[12px] leading-5 text-white/75">新的登录密码确认后立即生效，流程清晰可靠。</p>
              </div>
              <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm ring-1 ring-white/15">
                <PenLine className="mb-3 h-5 w-5 text-white" />
                <p className="text-base font-medium text-white">继续记录</p>
                <p className="mt-2 text-[12px] leading-5 text-white/75">回到你的手账时间线，把正在书写的日常接上。</p>
              </div>
            </div>
          </section>

          <section
            className="flex w-full flex-col overflow-hidden bg-white px-[40px] py-[48px] lg:w-[380px]"
            style={{ maxHeight: 'calc(100vh - 48px)' }}
          >
            <div className="mb-6 lg:hidden">
              <div className="bg-theme-surface inline-flex items-center gap-3 rounded-2xl px-4 py-3">
                <div className="bg-theme-gradient shadow-theme-medium flex h-10 w-10 items-center justify-center rounded-2xl">
                  <BookHeart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">我的手账</p>
                  <p className="text-xs text-gray-500">安全找回你的记录</p>
                </div>
              </div>
            </div>

            <div className="mb-4 shrink-0">
              {!success && (
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  返回登录
                </Link>
              )}

              <div className={success ? '' : 'mt-4'}>
                <p className="text-sm font-medium text-theme">{isRecoveryMode ? '重置密码' : '找回账号'}</p>
                <h1 className="mt-2 text-[20px] font-semibold leading-tight text-gray-900">{title}</h1>
                <p className="mt-3 text-[13px] leading-6 text-gray-500">{subtitle}</p>
              </div>
            </div>

            {error && (
              <div className="auth-alert-error mb-3 shrink-0">
                {error}
              </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col justify-center">
              {!isRecoveryMode && !success && (
                <form onSubmit={handleSendResetEmail} className="flex min-h-0 flex-1 flex-col">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">邮箱</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="请输入注册邮箱"
                          className="auth-input pl-11 pr-4"
                          required
                        />
                      </div>
                      <p className="mt-2.5 text-[12px] leading-6 text-gray-500">
                        系统会向该邮箱发送一封重置密码邮件，请留意收件箱和垃圾邮件箱。
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 shrink-0">
                    <button type="submit" disabled={loading} className="auth-primary-btn w-full">
                      {loading ? '发送中...' : '发送重置链接'}
                    </button>
                  </div>
                </form>
              )}

              {isRecoveryMode && !success && (
                <form onSubmit={handleResetPassword} className="flex min-h-0 flex-1 flex-col">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">新密码</label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="请输入新密码（至少6位）"
                          minLength={6}
                          className="auth-input pl-11 pr-11"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">确认密码</label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="请再次输入新密码"
                          minLength={6}
                          className="auth-input pl-11 pr-11"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 shrink-0">
                    <button type="submit" disabled={loading} className="auth-primary-btn w-full">
                      {loading ? '重置中...' : '确认并更新密码'}
                    </button>
                  </div>
                </form>
              )}

              {success && (
                <div className="rounded-[24px] border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                    <CheckCircle className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="mt-4 text-[22px] font-semibold text-gray-900">
                    {isRecoveryMode ? '密码重置成功' : '邮件已发送'}
                  </h3>
                  <div className="auth-alert-success mt-4 text-left">
                    {successMessage}
                  </div>
                  <div className="mt-5">
                    <Link to="/auth" className="auth-primary-btn w-full">
                      返回登录
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

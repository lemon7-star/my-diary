import { useState, type ComponentProps } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, PenLine, ShieldCheck, BookHeart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAuthErrorMessage } from '../utils/auth';

type AuthTab = 'login' | 'register';
type AuthFormSubmitEvent = ComponentProps<'form'>['onSubmit'] extends ((event: infer T) => void) | undefined ? T : never;

export function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: AuthFormSubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);

    if (error) {
      setError(getAuthErrorMessage(error.message));
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  const handleRegister = async (e: AuthFormSubmitEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    const { error, needsManualLogin } = await signUp(email, password, username);

    if (error) {
      setError(getAuthErrorMessage(error.message));
      setLoading(false);
    } else if (needsManualLogin) {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setError('');
    setShowPassword(false);
    setLoading(false);
  };

  const handleTabChange = (tab: AuthTab) => {
    setAuthTab(tab);
    resetForm();
  };

  const heading = authTab === 'login' ? '欢迎回来' : '创建账号';
  const subtitle = authTab === 'login'
    ? '登录后继续记录情绪、灵感与生活片段。'
    : '注册后即可开始保存每天的想法、图片与回忆。';

  return (
    <div className="auth-shell">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-primary-20)' }} />
        <div className="absolute right-[-80px] top-1/4 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-primary-10)' }} />
        <div className="absolute bottom-[-140px] left-1/3 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-primary-20)' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div
          className="auth-panel flex w-full max-w-[980px] flex-col overflow-hidden lg:min-w-[800px] lg:flex-row lg:items-stretch lg:h-[620px]"
          style={{ maxHeight: 'calc(100vh - 48px)' }}
        >
          <section
            className="auth-hero hidden h-full flex-1 overflow-hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between"
            style={{ maxHeight: 'calc(100vh - 48px)' }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_32%)]" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-medium text-white">
                <Sparkles className="h-3.5 w-3.5" />
                记录日常，也记录心情
              </span>

              <div className="mt-3 max-w-[360px]">
                <h1 className="text-[26px] font-semibold leading-[1.45] text-white">
                  用更温柔的方式，记录你的生活片段
                </h1>
                <p className="mt-2 text-[13px] leading-6 text-white/80">
                  把每天的情绪、灵感和片刻记下来，留成只属于你的时间线。
                </p>
              </div>
            </div>

            <div className="relative z-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm ring-1 ring-white/15">
                <PenLine className="mb-3 h-5 w-5 text-white" />
                <p className="text-base font-medium text-white">轻松记录</p>
                <p className="mt-2 text-[12px] leading-5 text-white/75">随时写下今天的想法与灵感。</p>
              </div>
              <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm ring-1 ring-white/15">
                <BookHeart className="mb-3 h-5 w-5 text-white" />
                <p className="text-base font-medium text-white">长期收藏</p>
                <p className="mt-2 text-[12px] leading-5 text-white/75">把每一天的内容留在时间线里。</p>
              </div>
              <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm ring-1 ring-white/15">
                <ShieldCheck className="mb-3 h-5 w-5 text-white" />
                <p className="text-base font-medium text-white">专属空间</p>
                <p className="mt-2 text-[12px] leading-5 text-white/75">登录后持续更新你的私人手账。</p>
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
                  <p className="text-xs text-gray-500">记录每一天的美好</p>
                </div>
              </div>
            </div>

            <div className="mb-4 shrink-0">
              <p className="text-sm font-medium text-theme">{authTab === 'login' ? '欢迎回来' : '创建账号'}</p>
              <h2 className="mt-2 text-[20px] font-semibold leading-tight text-gray-900">{heading}</h2>
              <p className="mt-3 text-[13px] leading-6 text-gray-500">{subtitle}</p>
            </div>

            <div className="auth-tab-track mb-3 shrink-0">
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`auth-tab ${authTab === 'login' ? 'auth-tab-active' : ''}`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`auth-tab ${authTab === 'register' ? 'auth-tab-active' : ''}`}
              >
                注册
              </button>
            </div>

            {error && (
              <div className="auth-alert-error mb-3 shrink-0">
                {error}
              </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col">
              {authTab === 'login' && (
                <form onSubmit={handleLogin} className="flex min-h-0 flex-1 flex-col">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">邮箱</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="请输入邮箱"
                          className="auth-input pl-11 pr-4"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">密码</label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="请输入密码"
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
                      <div className="my-1 text-right">
                        <Link to="/forgot-password" className="text-[12px] font-medium text-theme hover:opacity-80">
                          忘记密码?
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 shrink-0">
                    <button type="submit" disabled={loading} className="auth-primary-btn w-full">
                      {loading ? '登录中...' : '登录'}
                    </button>

                    <div className="mt-2.5 text-center text-[12px] text-gray-500">
                      <span>还没有账号？</span>
                      <button
                        type="button"
                        onClick={() => handleTabChange('register')}
                        className="ml-2 font-medium text-theme transition-opacity hover:opacity-80"
                      >
                        立即注册
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {authTab === 'register' && (
                <form onSubmit={handleRegister} className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">邮箱</label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="请输入邮箱"
                            className="auth-input pl-11 pr-4"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">密码</label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="请输入密码（至少6位）"
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
                            placeholder="请再次输入密码"
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
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">用户名</label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="设置一个用户名称（选填）"
                            className="auth-input pl-11 pr-4"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 shrink-0">
                    <button type="submit" disabled={loading} className="auth-primary-btn w-full">
                      {loading ? '注册中...' : '注册'}
                    </button>

                    <div className="mt-2.5 text-center text-[12px] text-gray-500">
                      <span>已经有账号了？</span>
                      <button
                        type="button"
                        onClick={() => handleTabChange('login')}
                        className="ml-2 font-medium text-theme transition-opacity hover:opacity-80"
                      >
                        立即登录
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

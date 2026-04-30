import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookHeart, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ForgotPasswordPage() {
  const { resetPasswordForEmail, updatePassword } = useAuth();

  // Check if we're in recovery mode (from email link)
  const isRecoveryMode = new URLSearchParams(window.location.search).get('type') === 'recovery';

  // Form states
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendResetEmail = async (e: React.FormEvent) => {
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

  const handleResetPassword = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-theme rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
            <BookHeart className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRecoveryMode ? '重置密码' : '找回密码'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isRecoveryMode ? '设置您的新密码' : '通过邮箱重置密码'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-purple-100 overflow-hidden">
          <div className="p-6">
            {/* Back button */}
            {!success && (
              <Link
                to="/auth"
                className="flex items-center text-gray-500 hover:text-gray-700 mb-4 text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回登录
              </Link>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Request Reset Form */}
            {!isRecoveryMode && !success && (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入注册邮箱"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    我们将向您的邮箱发送重置密码链接
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-theme text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                >
                  {loading ? '发送中...' : '发送重置链接'}
                </button>
              </form>
            )}

            {/* Reset Password Form (Recovery Mode) */}
            {isRecoveryMode && !success && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="请输入新密码（至少6位）"
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme focus:border-transparent outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="请再次输入新密码"
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme focus:border-transparent outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-theme text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                >
                  {loading ? '重置中...' : '重置密码'}
                </button>
              </form>
            )}

            {/* Success State */}
            {success && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isRecoveryMode ? '密码重置成功' : '邮件已发送'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isRecoveryMode
                    ? '您的密码已成功重置，请使用新密码登录'
                    : `请检查您的邮箱 ${email}，点击邮件中的链接重置密码`}
                </p>
                <Link
                  to="/auth"
                  className="inline-block w-full py-3 bg-theme text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-200 text-center"
                >
                  返回登录
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

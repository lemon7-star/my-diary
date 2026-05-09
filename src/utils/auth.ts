const AUTH_ERROR_MESSAGE_MAP: Record<string, string> = {
  'User already registered': '该邮箱已注册，请直接登录',
  'Invalid login credentials': '邮箱或密码错误',
  'Email not confirmed': '邮箱尚未完成验证',
  'User not found': '未找到该用户',
  'Error sending recovery email': '重置链接发送失败，请稍后重试',
  'Password should be at least 6 characters.': '密码至少需要 6 位',
  'New password should be different from the old password.': '新密码不能与当前密码相同',
  'Failed to fetch': '网络连接失败，请检查网络后重试',
};

export const getAuthErrorMessage = (message: string) => {
  if (!message) {
    return '操作失败，请稍后重试';
  }

  if (/[一-鿿]/.test(message)) {
    return message;
  }

  const mappedMessage = AUTH_ERROR_MESSAGE_MAP[message];
  if (mappedMessage) {
    return mappedMessage;
  }

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('invalid login credentials')) {
    return '邮箱或密码错误';
  }

  if (lowerMessage.includes('recovery email')) {
    return '重置链接发送失败，请稍后重试';
  }

  if (lowerMessage.includes('failed to fetch') || lowerMessage.includes('fetch')) {
    return '网络连接失败，请检查网络后重试';
  }

  if (lowerMessage.includes('password should be at least')) {
    return '密码至少需要 6 位';
  }

  if (lowerMessage.includes('same as the old password')) {
    return '新密码不能与当前密码相同';
  }

  return '操作失败，请稍后重试';
};

const getCurrentUrl = () => new URL(window.location.href);

const getHashParams = () => {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;

  return new URLSearchParams(hash);
};

export const isPasswordRecoveryUrl = () => {
  const url = getCurrentUrl();
  const hashParams = getHashParams();

  return url.searchParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery';
};

export const getPasswordRecoveryRedirectUrl = () => {
  const url = getCurrentUrl();

  if (url.hostname === '127.0.0.1' || url.hostname === '0.0.0.0' || url.hostname === '::1') {
    url.hostname = 'localhost';
  }

  url.pathname = '/forgot-password';
  url.search = '?type=recovery';
  url.hash = '';

  return url.toString();
};

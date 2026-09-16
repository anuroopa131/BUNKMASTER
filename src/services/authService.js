const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const getTokenPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

export const clearUserSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getValidToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const payload = token && getTokenPayload(token);
  if (!token || !payload || !payload.exp || payload.exp * 1000 <= Date.now()) {
    clearUserSession();
    return null;
  }
  return token;
};

export const saveUserSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const listenToAuthChanges = (callback) => {
  const token = getValidToken();
  const savedUser = localStorage.getItem(USER_KEY);
  if (!token || !savedUser) {
    callback(null);
    return () => {};
  }
  try {
    callback(JSON.parse(savedUser));
  } catch {
    clearUserSession();
    callback(null);
  }
  return () => {};
};

export const authorizedFetch = async (url, options = {}) => {
  const token = getValidToken();
  if (!token) {
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Your session has expired. Please log in again.');
  }
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    clearUserSession();
    window.dispatchEvent(new Event('auth:unauthorized'));
  }
  return response;
};

import {
  clearTokens,
  getAuthJwtToken,
  getAuthRefreshToken,
  refreshJwtToken,
} from './auth';

declare global {
  interface Window {
    _fetch: typeof fetch;
  }
}

(window as typeof window)._fetch = window.fetch;

window.fetch = async (
  url: RequestInfo | URL,
  options: RequestInit = {},
): Promise<Response> => {
  options.headers = options.headers || {};

  let res = await window._fetch(url, options);

  if (
    Object.keys(options.headers).includes('Authorization') &&
    res.status === 401
  ) {
    try {
      const refreshToken = getAuthRefreshToken();

      if (!refreshToken || refreshToken === 'EXPIRED')
        throw new Error('No token');

      localStorage.removeItem('jwtToken');
      localStorage.removeItem('jwtTokenExpiration');

      await refreshJwtToken(refreshToken);
    } catch {
      clearTokens();
      window.location.href = '/login';
      return res;
    }

    (options.headers as Record<string, string>).Authorization =
      `Bearer ${getAuthJwtToken()}`;

    res = await window._fetch(url, options);
  }

  return res;
};

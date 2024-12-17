import { toast } from 'react-toastify';
import {
  clearTokens,
  getAuthJwtToken,
  getAuthRefreshToken,
  refreshJwtToken,
} from './auth';

const _fetch = window.fetch;

window.fetch = async (
  url: RequestInfo | URL,
  options: RequestInit = {},
): Promise<Response> => {
  options.headers = options.headers || {};

  let res = await _fetch(url, options);

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

      if (!url.toString().endsWith('/me')) window.location.replace('/login');
      else
        toast.error('Your session has expired. Please log in again.', {
          type: 'error',
        });

      return res;
    }

    (options.headers as Record<string, string>).Authorization =
      `Bearer ${getAuthJwtToken()}`;

    res = await _fetch(url, options);
  }

  return res;
};

export function getJwtTokenDuration() {
  const tokenExpiration = localStorage.getItem('jwtTokenExpiration');

  if (!tokenExpiration) {
    return -1;
  }

  const expiration = new Date(tokenExpiration).getTime() - Date.now();

  return expiration;
}

export function getRefreshTokenDuration() {
  const tokenExpiration = localStorage.getItem('refreshTokenExpiration');

  if (!tokenExpiration) {
    return -1;
  }

  const expiration = new Date(tokenExpiration).getTime() - Date.now();

  return expiration;
}

export function getAuthJwtToken() {
  const token = localStorage.getItem('jwtToken');

  if (!token) {
    return null;
  }

  const tokenDuration = getJwtTokenDuration();

  if (tokenDuration < 0) {
    return 'EXPIRED';
  }

  return token;
}

export function getAuthRefreshToken() {
  const token = localStorage.getItem('refreshToken');

  if (!token) {
    return null;
  }

  const tokenDuration = getRefreshTokenDuration();

  if (tokenDuration < 0) {
    return 'EXPIRED';
  }

  return token;
}

export function clearTokens() {
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('jwtTokenExpiration');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('refreshTokenExpiration');
}

export function storeJwtToken(token: string) {
  localStorage.setItem('jwtToken', token);
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + 1); // Token valid for 1 hour
  localStorage.setItem('jwtTokenExpiration', expirationTime.toISOString());
}

export async function refreshJwtToken(refreshToken: string) {
  const authData = { refreshToken };

  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authData),
  });

  if (!response.ok) {
    const resData = await response.json();
    throw new Error(resData.message || 'Failed to refresh token');
  }

  const resData = await response.json();
  const newJwtToken = resData?.data?.jwtToken;
  if (newJwtToken) storeJwtToken(newJwtToken);

  return newJwtToken;
}

export async function getCurrentUser() {
  try {
    const jwtToken = getAuthJwtToken();
    const refreshToken = getAuthRefreshToken();

    if (
      (!jwtToken || jwtToken === 'EXPIRED') &&
      (!refreshToken || refreshToken === 'EXPIRED')
    ) {
      throw new Error('No token');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/account/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch user data');

    const resData = await response.json();

    return resData.data;
  } catch {
    return null;
  }
}

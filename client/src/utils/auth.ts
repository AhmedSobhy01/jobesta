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

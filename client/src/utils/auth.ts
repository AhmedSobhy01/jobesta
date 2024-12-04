export function getJwtTokenDuration() {
  const storedExpirationDate = localStorage.getItem('jwtTokenExpiration');
  if (!storedExpirationDate) {
    return -1; // or throw an error if you prefer
  }
  const expirationDate = new Date(storedExpirationDate);
  const now = new Date();
  const duration = expirationDate.getTime() - now.getTime();
  return duration;
}

export function getRefreshTokenDuration() {
  const storedExpirationDate = localStorage.getItem('refreshTokenExpiration');
  if (!storedExpirationDate) {
    return -1;
  }
  const expirationDate = new Date(storedExpirationDate);
  const now = new Date();
  const duration = expirationDate.getTime() - now.getTime();
  return duration;
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

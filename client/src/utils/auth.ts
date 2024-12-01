// export function getTokenDuration() {
//   const storedExpirationDate = localStorage.getItem('jwtTokenExpiration');
//   const expirationDate = new Date(storedExpirationDate);
//   const now = new Date();
//   const duration = expirationDate.getTime() - now.getTime();
//   return duration;
// }

import { redirect } from 'react-router-dom';

export function getAuthJwtToken() {
  const token = localStorage.getItem('jwtToken');

  if (!token) {
    return null;
  }

  //const tokenDuration = getTokenDuration();

  // if (tokenDuration < 0) {
  //   return 'EXPIRED';
  // }

  return token;
}

export function getAuthRefreshToken() {
  const token = localStorage.getItem('refreshToken');

  if (!token) {
    return null;
  }

  //const tokenDuration = getTokenDuration();

  // if (tokenDuration < 0) {
  //   return 'EXPIRED';
  // }

  return token;
}

export function checkAuthLoader() {
  const token = getAuthJwtToken();

  if (!token) {
    return redirect('/auth');
  }

  return true;
}

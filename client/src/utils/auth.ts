import { redirect } from 'react-router-dom';

export function getAuthJwtToken() {
  const token = localStorage.getItem('jwtToken');

  if (!token) {
    return null;
  }

  return token;
}

export function getAuthRefreshToken() {
  const token = localStorage.getItem('refreshToken');

  if (!token) {
    return null;
  }

  return token;
}

export function checkAuthLoader() {
  const token = getAuthJwtToken();

  if (!token) {
    return redirect('/auth');
  }

  return true;
}

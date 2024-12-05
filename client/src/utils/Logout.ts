import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '@/store/userContext';

export function Logout() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwtTokenExpiration');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExpiration');
    const accountId = null;
    const freelancerId = null;
    const balance = null;
    const firstName = null;
    const lastName = null;
    const userName = null;
    const email = null;
    const role = null;
    const isBanned = null;
    const bio = null;
    const profilePicture = null;
    const jwtToken = null;
    const refreshToken = null;

    setUser({
      accountId,
      freelancerId,
      balance,
      firstName,
      lastName,
      userName,
      email,
      role,
      isBanned,
      bio,
      profilePicture,
      jwtToken,
      refreshToken,
    });

    navigate('/');
  }, [setUser, navigate]);

  return null;
}

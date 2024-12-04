import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TokensContext from '@/store/userContext';

export function SetUserPage() {
  const { setUser } = useContext(TokensContext);
  const navigate = useNavigate();

  useEffect(() => {
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
    const jwtToken = localStorage.getItem('jwtToken') || '';
    const refreshToken = localStorage.getItem('refreshToken') || '';

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

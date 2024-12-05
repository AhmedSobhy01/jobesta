import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TokensContext from '@/store/tokensContext';

export function Logout() {
  const { setTokens } = useContext(TokensContext);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    const jwtToken = null;
    const refreshToken = null;

    setTokens({ jwtToken, refreshToken });

    navigate('/');
  }, [setTokens, navigate]);

  return null;
}

import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TokensContext from '@/store/tokensContext';

export function SetTokensPage() {
  const { setTokens } = useContext(TokensContext);
  const navigate = useNavigate();

  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken') || '';
    const refreshToken = localStorage.getItem('refreshToken') || '';

    setTokens({ jwtToken, refreshToken });

    navigate('/');
  }, [setTokens, navigate]);

  return null;
}

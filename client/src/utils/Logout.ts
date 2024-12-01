// interface TokensContextType {
//   jwtToken: string | null;
//   refreshToken: string | null;
//   setTokens: (newTokens: {
//     jwtToken: string | null;
//     refreshToken: string | null;
//   }) => void;
// }

// export function action(appContext: TokensContextType) {
//   return async () => {
//     localStorage.removeItem('jwtToken');
//     localStorage.removeItem('refreshToken');
//     const jwtToken = null;
//     const refreshToken = null;
//     console.log('hi sobhyy');
//     appContext.setTokens({ jwtToken, refreshToken });

//     return new Response(null, {
//       status: 302,
//       headers: { Location: '/' },
//     });
//   };
// }

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

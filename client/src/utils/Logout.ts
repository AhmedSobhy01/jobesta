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
import UserContext from '@/store/userContext';

export function Logout() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwtTokenExpiration');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExpiration');
    const account_id = null;
    const freelancer_id = null;
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
      account_id,
      freelancer_id,
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

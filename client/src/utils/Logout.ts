import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '@/store/userContext';
import FreelancerContext from '@/store/freelancerContext';

export function Logout() {
  const { setUser } = useContext(UserContext);
  const { setFreelancer } = useContext(FreelancerContext);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwtTokenExpiration');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExpiration');

    const accountId = null;
    const firstName = null;
    const lastName = null;
    const username = null;
    const email = null;
    const role = null;
    const isBanned = null;
    const profilePicture = null;

    setFreelancer({
      balance: null,
    });

    setUser({
      accountId,
      firstName,
      lastName,
      username,
      email,
      role,
      isBanned,
      profilePicture,
    });

    navigate('/');
  }, [setUser, navigate, setFreelancer]);

  return null;
}

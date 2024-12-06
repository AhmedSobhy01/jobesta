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
    const freelancerId = undefined;
    const balance = undefined;
    const bio = undefined;
    const previousWork = undefined;
    const skills = undefined;
    const firstName = null;
    const lastName = null;
    const userName = null;
    const email = null;
    const role = null;
    const isBanned = null;
    const profilePicture = null;
    const jwtToken = null;
    const refreshToken = null;

    setFreelancer({
      freelancerId,
      balance,
      bio,
      previousWork,
      skills,
    });

    setUser({
      accountId,
      firstName,
      lastName,
      userName,
      email,
      role,
      isBanned,
      profilePicture,
      jwtToken,
      refreshToken,
    });

    navigate('/');
  }, [setUser, navigate]);

  return null;
}

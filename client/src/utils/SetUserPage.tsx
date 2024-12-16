import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '@/store/userContext';

export function SetUserPage() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const accountId = null;
    const firstName = null;
    const lastName = null;
    const username = null;
    const email = null;
    const role = null;
    const isBanned = null;
    const profilePicture = null;

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

    const redirectTo =
      new URLSearchParams(window.location.search).get('redirect') || '/';

    navigate(redirectTo);
  }, [setUser, navigate]);

  return null;
}

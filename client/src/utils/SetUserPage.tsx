import { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '@/store/userContext';
import { clearTokens, getCurrentUser } from './auth';

export function SetUserPage() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const fetchDataRef = useRef(false);
  useEffect(() => {
    const fetchUserData = async () => {
      let userData: User | null = null;
      setUser({
        isUserLoading: true,
        accountId: null,
        firstName: null,
        lastName: null,
        username: null,
        email: null,
        role: null,
        isBanned: null,
        profilePicture: null,
      });

      try {
        userData = await getCurrentUser();
      } catch {
        clearTokens();
      }

      setUser({
        isUserLoading: false,
        accountId: userData?.accountId || null,
        firstName: userData?.firstName || null,
        lastName: userData?.lastName || null,
        username: userData?.username || null,
        email: userData?.email || null,
        role: userData?.role || null,
        isBanned: userData?.isBanned || null,
        profilePicture: userData?.profilePicture || null,
      });

      const redirectTo =
        new URLSearchParams(window.location.search).get('redirect') || '/';

      fetchDataRef.current = false;

      navigate(redirectTo);
    };

    if (!fetchDataRef.current) {
      fetchDataRef.current = true;
      fetchUserData();
    }
  }, [setUser, navigate]);

  return null;
}

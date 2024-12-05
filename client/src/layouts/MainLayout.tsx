import { Outlet, useLoaderData } from 'react-router-dom';
import MainNavigationBar from '@/components/NavBar/MainNavigationBar';
import { useContext, useEffect, useState } from 'react';
import UserContext from '@/store/userContext';
import { getAuthJwtToken, getAuthRefreshToken } from '@/utils/auth';
import ErrorModule from '@/components/ErrorModule';

function MainLayout() {
  const myUser = useContext(UserContext);
  const [isError, setIsError] = useState(false);
  const userData = useLoaderData();

  const handleCloseError = () => setIsError(false);

  useEffect(() => {
    if (userData?.message) {
      setIsError(true);
    }

    if (userData?.user && userData.user.accountId == myUser.accountId) {
      myUser.setUser({
        accountId: userData.user.id,
        firstName: userData.user.firstName,
        lastName: userData.user.lastName,
        userName: userData.user.username,
        email: userData.user.email,
        role: userData.user.role,
        isBanned: userData.user.isBanned,
        profilePicture: userData.user.profilePicture,
        jwtToken: getAuthJwtToken(),
        refreshToken: getAuthRefreshToken(),
      });
    }
  }, [userData, myUser]);

  return (
    <>
      {isError && (
        <ErrorModule
          errorMessage={userData?.message}
          onClose={handleCloseError}
        />
      )}
      <MainNavigationBar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;

export async function loader() {
  let jwtToken = getAuthJwtToken();
  const refreshToken = getAuthRefreshToken();

  if (refreshToken && refreshToken !== 'EXPIRED') {
    if (!jwtToken || jwtToken === 'EXPIRED') {
      localStorage.removeItem('jwtToken');
      try {
        const authData = {
          refreshToken: refreshToken,
        };

        const response = await fetch(
          import.meta.env.VITE_API_URL + '/auth/refresh',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(authData),
          },
        );

        const resData = await response.json();

        if (!response.ok) {
          return { message: resData.message };
        }

        jwtToken = resData.data.jwtToken;
      } catch {
        return { user: null, message: 'Error refreshing user token' };
      }
    }

    if (jwtToken) {
      localStorage.setItem('jwtToken', jwtToken);

      const jwtTokenExpiration = new Date();
      jwtTokenExpiration.setHours(jwtTokenExpiration.getHours() + 1);
      localStorage.setItem(
        'jwtTokenExpiration',
        jwtTokenExpiration.toISOString(),
      );

      try {
        const response = await fetch(
          import.meta.env.VITE_API_URL + '/account/me',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + jwtToken,
            },
          },
        );
        const resData = await response.json();

        if (!response.ok) {
          return { user: null, message: resData.message };
        }

        return {
          user: resData.data,
        };
      } catch {
        return { user: null, message: 'Error fetching user data' };
      }
    }

    return { user: null, message: 'Error fetching user data' };
  } else if (refreshToken === 'EXPIRED') {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwtTokenExpiration');

    return { user: null };
  }
}

import { Outlet, useLoaderData } from 'react-router-dom';
import MainNavigationBar from '@/components/NavBar/MainNavigationBar';
import { useContext, useEffect, useState } from 'react';
import UserContext from '@/store/userContext';
import { getAuthJwtToken, getAuthRefreshToken } from '@/utils/auth';
import ErrorModule from '@/components/ErrorModule';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MainLayout() {
  const myUser = useContext(UserContext);
  const [isError, setIsError] = useState(false);
  const [dropdownOpen, setDropdownOpenMenu] = useState({
    isDropdownBarOpen: false,
    isDropdownProfileOpen: false,
  });
  const userData = useLoaderData();

  const handleCloseError = () => setIsError(false);

  // Reset dropdowns only when clicking outside of navigation
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    const isNavClick = target.closest('nav');

    const isButtonClick = target.closest('button');

    if (!isNavClick || (isNavClick && !isButtonClick)) {
      setDropdownOpenMenu({
        isDropdownBarOpen: false,
        isDropdownProfileOpen: false,
      });
    }
  };

  useEffect(() => {
    if (userData?.message) {
      setIsError(true);
    }

    if (userData?.user && userData.user.id !== myUser.accountId) {
      const {
        id,
        firstName,
        lastName,
        username,
        email,
        role,
        isBanned,
        profilePicture,
      } = userData.user;
      myUser.setUser({
        accountId: id,
        firstName,
        lastName,
        username: username,
        email,
        role,
        isBanned,
        profilePicture,
        jwtToken: getAuthJwtToken(),
        refreshToken: getAuthRefreshToken(),
      });
    }
  }, [userData, myUser]);

  return (
    <div className="h-screen dark:bg-gray-900 bg-white" onClick={handleClick}>
      <ToastContainer />

      {isError && (
        <ErrorModule
          errorMessage={userData?.message}
          onClose={handleCloseError}
        />
      )}
      <MainNavigationBar
        dropdownOpen={dropdownOpen}
        setDropdownOpenMenu={setDropdownOpenMenu}
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;

MainLayout.loader = async function loader() {
  const jwtToken = getAuthJwtToken();
  const refreshToken = getAuthRefreshToken();

  if (!refreshToken || refreshToken === 'EXPIRED') {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwtTokenExpiration');
    return { user: null };
  }

  try {
    let newJwtToken = jwtToken;

    // Refresh JWT token if expired
    if (!jwtToken || jwtToken === 'EXPIRED') {
      localStorage.removeItem('jwtToken');

      const authData = { refreshToken };
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authData),
        },
      );

      const resData = await response.json();

      if (!response.ok) {
        return { message: resData.message };
      }

      newJwtToken = resData.data.jwtToken;
      if (newJwtToken) localStorage.setItem('jwtToken', newJwtToken);

      const jwtTokenExpiration = new Date();
      jwtTokenExpiration.setHours(jwtTokenExpiration.getHours() + 1);
      localStorage.setItem(
        'jwtTokenExpiration',
        jwtTokenExpiration.toISOString(),
      );
    }

    // Fetch user data with the (refreshed) JWT token
    const userResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/account/me`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newJwtToken}`,
        },
      },
    );

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      return { message: userData.message };
    }

    return {
      user: userData.data,
    };
  } catch {
    return { message: 'An error occurred while fetching user data' };
  }
};

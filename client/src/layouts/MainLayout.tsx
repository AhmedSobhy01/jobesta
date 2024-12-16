import { Outlet } from 'react-router-dom';
import MainNavigationBar from '@/components/NavBar/MainNavigationBar';
import { useContext, useEffect, useRef, useState } from 'react';
import UserContext from '@/store/userContext';
import { clearTokens, getAuthJwtToken, getCurrentUser } from '@/utils/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FreelancerContext from '@/store/freelancerContext';

function MainLayout() {
  const { setUser } = useContext(UserContext);
  const { setFreelancer } = useContext(FreelancerContext);

  const [dropdownOpen, setDropdownOpenMenu] = useState({
    isDropdownBarOpen: false,
    isDropdownProfileOpen: false,
    isDropdownBellOpen: false,
  });
  // Reset dropdowns only when clicking outside of navigation
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    const isNavClick = target.closest('nav');

    const isButtonClick = target.closest('button');

    if (!isNavClick || (isNavClick && !isButtonClick)) {
      setDropdownOpenMenu({
        isDropdownBellOpen: false,
        isDropdownBarOpen: false,
        isDropdownProfileOpen: false,
      });
    }
  };

  const fetchDataRef = useRef(false);
  useEffect(() => {
    const fetchData = async () => {
      let userData: User | null = null;

      try {
        userData = await getCurrentUser();
      } catch {
        clearTokens();
      }

      setUser({
        accountId: userData?.accountId || null,
        firstName: userData?.firstName || null,
        lastName: userData?.lastName || null,
        username: userData?.username || null,
        email: userData?.email || null,
        role: userData?.role || null,
        isBanned: userData?.isBanned || null,
        profilePicture: userData?.profilePicture || null,
      });

      try {
        if (userData && userData.role === 'freelancer') {
          const freelancerBalanceResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/freelancer/balance`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getAuthJwtToken()}`,
              },
            },
          );

          const freelancerBalance = await freelancerBalanceResponse.json();

          if (!freelancerBalanceResponse.ok)
            throw new Error('Failed to fetch freelancer balance');

          setFreelancer({
            balance: freelancerBalance.data.balance,
          });
        }
      } catch {
        toast('Failed to fetch balance', {
          type: 'error',
        });
      }

      fetchDataRef.current = false;
    };

    if (!fetchDataRef.current) {
      fetchDataRef.current = true;
      fetchData();
    }
  }, [setUser, setFreelancer]);

  return (
    <div className="h-screen dark:bg-gray-900 bg-white" onClick={handleClick}>
      <ToastContainer />

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

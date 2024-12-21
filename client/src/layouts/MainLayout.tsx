import { Outlet, useNavigation } from 'react-router-dom';
import MainNavigationBar from '@/components/NavBar/MainNavigationBar';
import { useContext, useEffect, useRef, useState } from 'react';
import UserContext from '@/store/userContext';
import { clearTokens, getAuthJwtToken, getCurrentUser } from '@/utils/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FreelancerContext from '@/store/freelancerContext';
import FullPageLoader from '@/components/FullPageLoader';

function MainLayout() {
  const { state } = useNavigation();

  const { setUser, isUserLoading, role } = useContext(UserContext);
  const { setFreelancer } = useContext(FreelancerContext);

  const [dropdownOpen, setDropdownOpenMenu] = useState({
    isDropdownBarOpen: false,
    isDropdownProfileOpen: false,
  });

  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);

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

  const fetchDataRef = useRef(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let userData: User | null = null;

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
        isBanned: userData?.isBanned as unknown as boolean,
        profilePicture: userData?.profilePicture || null,
      });

      setLoading(false);
      fetchDataRef.current = false;
    };

    if (!fetchDataRef.current) {
      fetchDataRef.current = true;
      fetchData();
    }
  }, [setUser]);

  const fetchBalanceRef = useRef(false);
  useEffect(() => {
    const getBalance = async () => {
      setLoadingBalance(true);
      try {
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
      } catch {
        toast('Failed to fetch balance', {
          type: 'error',
        });
      }
      setLoadingBalance(false);
      fetchBalanceRef.current = false;
    };

    if (
      !fetchBalanceRef.current &&
      role === 'freelancer' &&
      dropdownOpen.isDropdownProfileOpen
    ) {
      fetchBalanceRef.current = true;
      getBalance();
    }
  }, [role, setFreelancer, dropdownOpen.isDropdownProfileOpen]);

  return (
    <div
      className="min-h-screen dark:bg-gray-900 bg-white"
      onClick={handleClick}
    >
      <ToastContainer />

      {(state === 'loading' || isUserLoading) && <FullPageLoader />}

      <MainNavigationBar
        loadingProfile={loading}
        dropdownOpen={dropdownOpen}
        setDropdownOpenMenu={setDropdownOpenMenu}
        loadingBalance={loadingBalance}
      />
      <main>{!isUserLoading && <Outlet />}</main>
    </div>
  );
}

export default MainLayout;

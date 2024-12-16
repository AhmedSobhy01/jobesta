import Sidebar from '@/components/Admin/Layout/Sidebar.tsx';
import UserContext from '@/store/userContext';
import { clearTokens, getCurrentUser } from '@/utils/auth';
import { useContext, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router';
import NavBar from '@/components/Admin/Layout/NavBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLayout = () => {
  const { setUser } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpenMenu] = useState({
    isDropdownProfileOpen: false,
  });

  // Reset dropdowns only when clicking outside of navigation
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    const isNavClick = target.closest('nav');

    const isButtonClick = target.closest('button');

    if (!isNavClick || (isNavClick && !isButtonClick)) {
      setDropdownOpenMenu({
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

      fetchDataRef.current = false;
    };

    if (!fetchDataRef.current) {
      fetchDataRef.current = true;
      fetchData();
    }
  }, [setUser]);

  return (
    <div className="flex h-screen bg-gray-100" onClick={handleClick}>
      <ToastContainer />

      <Sidebar />

      <div className="flex flex-col flex-1">
        <NavBar
          dropdownOpen={dropdownOpen}
          setDropdownOpenMenu={setDropdownOpenMenu}
        />

        <main className="p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

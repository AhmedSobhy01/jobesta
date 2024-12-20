import Sidebar from '@/components/Admin/Layout/Sidebar.tsx';
import UserContext from '@/store/userContext';
import { clearTokens, getCurrentUser } from '@/utils/auth';
import { useContext, useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useNavigation } from 'react-router';
import NavBar from '@/components/Admin/Layout/NavBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FullPageLoader from '@/components/FullPageLoader';

const AdminLayout = () => {
  const { state } = useNavigation();

  const { setUser, role, isUserLoading } = useContext(UserContext);

  const [dropdownOpen, setDropdownOpenMenu] = useState({
    isDropdownProfileOpen: false,
  });

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

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
        isBanned: (userData?.isBanned as unknown as boolean) || null,
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

  if (!isUserLoading && (!role || role !== 'admin'))
    return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-100" onClick={handleClick}>
      <ToastContainer />

      {(state === 'loading' || isUserLoading) && <FullPageLoader />}

      <div
        className={`fixed z-40 inset-0 bg-black bg-opacity-50 md:hidden transition-opacity ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={toggleSidebar}
      ></div>

      <Sidebar
        className={`fixed z-50 inset-y-0 left-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative md:block`}
      />

      <div className="flex flex-col flex-1">
        <NavBar
          loadingProfile={loading}
          dropdownOpen={dropdownOpen}
          setDropdownOpenMenu={setDropdownOpenMenu}
          toggleSidebar={toggleSidebar}
        />

        <main className="p-4 overflow-auto">
          {!isUserLoading && <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

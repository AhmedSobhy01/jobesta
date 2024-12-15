import { faHome, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import jobestaLogo from '@/assets/jobesta-logo.png';
import SidebarButton from '@/components/Admin/Layout/SidebarButton';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white shadow-md border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-screen flex flex-col">
      <div className="p-4 text-xl font-bold text-center text-gray-800 border-b flex items-center justify-center space-x-3">
        <Link
          to="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img className="w-auto h-9" src={jobestaLogo} alt="Jobesta Logo" />
          <span className="font-customFont text-2xl text-green-700 font-semibold dark:text-green-500">
            JOBESTA
          </span>
        </Link>
      </div>

      <nav className="mt-6 space-y-2">
        <SidebarButton icon={faHome} text="Dashboard" route="/admin" />
        <SidebarButton icon={faUser} text="Clients" route="/admin/clients" />
        <SidebarButton icon={faUser} text="Categories" route="/admin/categories" />
      </nav>

      <div className="mt-auto p-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <span>&copy; {new Date().getFullYear()} Jobesta</span>
      </div>
    </div>
  );
};

export default Sidebar;

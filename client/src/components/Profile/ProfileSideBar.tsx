import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightFromBracket,
  faBarsStaggered,
  faBriefcase,
  faCaretDown,
  faMessage,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

interface ProfileSideBarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const ProfileSideBar: React.FC<ProfileSideBarProps> = ({
  isSidebarOpen,
  toggleSidebar,
}) => {
  const [isJobsOpen, setIsJobsOpen] = useState(false);

  const toggleJobs = () => setIsJobsOpen((prev) => !prev);

  return (
    <div>
      <button
        onClick={toggleSidebar}
        className="p-2 mt-2 ms-3 text-gray-500 rounded-lg md:hover:bg-transparenthover:text-green-700 dark:hover:text-green-500 md:hidden hover:bg-gray-100"
        aria-label="Toggle Sidebar"
      >
        <FontAwesomeIcon icon={faBarsStaggered} />
      </button>

      <aside
        className={`fixed top-auto left-0 z-40 w-64 h-screen bg-gray-200 transition-transform duration-300 md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                to="/me"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-transparent hover:text-green-700 dark:hover:text-green-500 hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faUser} />
                <span className="ms-3">My Profile</span>
              </Link>
            </li>

            <li>
              <button
                onClick={toggleJobs}
                className="flex items-center p-2 w-full text-gray-900 rounded-lg hover:bg-transparent hover:text-green-700 dark:hover:text-green-500 hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faBriefcase} />
                <span className="ms-3">Jobs</span>
                <FontAwesomeIcon
                  icon={faCaretDown}
                  className={`ms-auto transition-transform ${
                    isJobsOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
              <ul
                className={`mt-2 space-y-2 ${isJobsOpen ? 'block' : 'hidden'}`}
              >
                <li>
                  <Link
                    to="/jobs"
                    className="block pl-10 p-2 text-gray-900 rounded-lg hover:bg-transparent hover:text-green-700 dark:hover:text-green-500 hover:bg-gray-100"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs"
                    className="block pl-10 p-2 text-gray-900 rounded-lg hover:bg-transparent hover:text-green-700 dark:hover:text-green-500 hover:bg-gray-100"
                  >
                    Billing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs"
                    className="block pl-10 p-2 text-gray-900 rounded-lg hover:bg-transparent hover:text-green-700 dark:hover:text-green-500 hover:bg-gray-100"
                  >
                    Invoice
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <Link
                to="/profile"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-transparent hover:text-green-700 dark:hover:text-green-500 hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faMessage} />
                <span className="ms-3">Messages</span>
                <span className="ml-auto inline-flex items-center justify-center w-4 h-4 p-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                  3
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/logout"
                className="flex items-center p-2 text-gray-900 hover:bg-transparent hover:text-green-700 dark:hover:text-green-500 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                <span className="ms-3">Logout</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default ProfileSideBar;

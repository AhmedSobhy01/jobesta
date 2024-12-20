import UserContext from '@/store/userContext';
import React, { useContext } from 'react';
import NavBarItem from '@/components/NavBar/NavBarItem';
import FreelancerContext from '@/store/freelancerContext';

const ProfileDropdown: React.FC = () => {
  const userData = useContext(UserContext);
  const freelancer = useContext(FreelancerContext);

  return (
    <div className="relative">
      {
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 dark:border-gray-700 border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-green-700">
              {userData.username}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-200">
              {userData.email}
            </p>
            {userData.role === 'freelancer' && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Balance: {freelancer.balance ? freelancer.balance : '0.00'}$
              </p>
            )}
          </div>
          <div className="border-t dark:border-gray-700 border-gray-200"></div>
          <ul className="py-1">
            {userData.role === 'admin' && (
              <li>
                <NavBarItem className="" page="/admin">
                  Admin Dashboard
                </NavBarItem>
              </li>
            )}
            <li>
              <NavBarItem className="" page={`/users/${userData.username}`}>
                Profile
              </NavBarItem>
            </li>
            {userData.role === 'freelancer' && (
              <li>
                <NavBarItem className="" page="/withdrawals">
                  Withdrawals
                </NavBarItem>
              </li>
            )}
            <li>
              <NavBarItem className="" page="/logout">
                Logout
              </NavBarItem>
            </li>
          </ul>
        </div>
      }
    </div>
  );
};

export default ProfileDropdown;

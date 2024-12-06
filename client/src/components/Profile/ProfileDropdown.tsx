import UserContext from '@/store/userContext';
import React, { useContext } from 'react';
import NavBarItem from '@/components/NavBar/NavBarItem';

const ProfileDropdown: React.FC = () => {
  const user = useContext(UserContext);

  return (
    <div className="relative">
      {
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-green-700">
              {user.userName}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="border-t border-gray-200"></div>
          <ul className="py-1">
            <li>
              <NavBarItem className="!text-gray-800" page={'/me'}>
                Profile
              </NavBarItem>
            </li>
            <li>
              <NavBarItem className="!text-gray-800" page={'/logout'}>
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

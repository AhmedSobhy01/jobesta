import { NavLink } from 'react-router';
import React from 'react';

const NavBarItem: React.FC<{
  page: string;
  className?: string;
  children: React.ReactNode;
}> = (props) => {
  const activeCss =
    'block w-full text-left dark:text-green-600 px-4 py-2 text-sm text-green-700 md:bg-transparent whitespace-nowrap';

  const notActiveCss =
    'block w-full text-left px-4 py-2 text-sm text-gray-500 dark:text-gray-200 dark:hover:text-green-600 hover:text-green-600 whitespace-nowrap';

  return (
    <>
      <NavLink
        to={props.page}
        className={({ isActive }) =>
          (isActive ? activeCss : notActiveCss) + ' ' + (props.className ?? '')
        }
        aria-current="page"
      >
        {props.children}
      </NavLink>
    </>
  );
};

export default NavBarItem;

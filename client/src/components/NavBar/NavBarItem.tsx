import { NavLink } from 'react-router';
import React from 'react';

const NavBarItem: React.FC<{ page: string; children: React.ReactNode }> = (
  props,
) => {
  const activeCss =
    'block w-full text-left px-4 py-2 text-sm text-green-700 md:bg-transparent ';

  const notActiveCss =
    'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-green-700';

  return (
    <>
      <NavLink
        to={props.page}
        className={({ isActive }) => (isActive ? activeCss : notActiveCss)}
        aria-current="page"
      >
        {props.children}
      </NavLink>
    </>
  );
};

export default NavBarItem;

//block py-2 px-3 md:p-0 text-white bg-green-700 rounded md:bg-transparent md:text-green-700 md:dark:text-green-500
//block py-2 px-3 md:p-0 text-gray-900 rounded hover:text-white hover:bg-green-700 md:hover:bg-transparent md:hover:text-green-700 md:dark:hover:text-green-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700

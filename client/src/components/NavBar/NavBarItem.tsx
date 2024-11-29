import { NavLink } from 'react-router';
import React from 'react';

const NavBarItem: React.FC<{ page: string; children: React.ReactNode }> = (
  props,
) => {
  const activeCss =
    'block py-2 px-3 md:p-0 text-white bg-green-700 rounded md:bg-transparent md:text-green-700 md:dark:text-green-500';
  const notActiveCss =
    'block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-green-700 md:dark:hover:text-green-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700';

  return (
    <>
      <li>
        <NavLink
          to={props.page}
          className={({ isActive }) => (isActive ? activeCss : notActiveCss)}
          aria-current="page"
        >
          {props.children}
        </NavLink>
      </li>
    </>
  );
};

export default NavBarItem;

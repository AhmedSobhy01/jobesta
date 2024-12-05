import { NavLink } from 'react-router';
import React from 'react';

const NavBarItem: React.FC<{ page: string; children: React.ReactNode }> = (
  props,
) => {
  const activeCss =
    'block w-full text-center px-4 py-2 text-sm text-green-700 md:bg-transparent whitespace-nowrap';

  const notActiveCss =
    'block w-full text-center px-4 py-2 text-sm text-gray-200 hover:text-green-700 whitespace-nowrap';

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

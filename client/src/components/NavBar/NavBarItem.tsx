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

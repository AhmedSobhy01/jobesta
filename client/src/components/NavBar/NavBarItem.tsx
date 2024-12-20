import { NavLink } from 'react-router';
import React from 'react';
import { HashLink } from 'react-router-hash-link';

const NavBarItem: React.FC<{
  page: string;
  className?: string;
  children: React.ReactNode;
  hashLink?: boolean;
}> = (props) => {
  const hashLink = props.hashLink ?? false;

  const activeCss =
    'block w-full text-left dark:text-green-600 px-4 py-2 text-sm text-green-700 md:bg-transparent whitespace-nowrap';

  const notActiveCss =
    'block w-full text-left px-4 py-2 text-sm text-gray-500 dark:text-gray-200 dark:hover:text-green-600 hover:text-green-600 whitespace-nowrap';

  if (hashLink)
    return (
      <HashLink
        to={props.page}
        className={`${notActiveCss} ${props.className ?? ''}`}
        aria-current="page"
        smooth
      >
        {props.children}
      </HashLink>
    );

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

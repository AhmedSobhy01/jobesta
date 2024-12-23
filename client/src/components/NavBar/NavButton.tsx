import React from 'react';

const NavButton: React.FC<{
  handleClick: () => void;
  focus: boolean;
  wideHidden: boolean;
  children: React.ReactNode;
}> = (props) => {
  let Css =
    'leading-4 inline-flex items-center w-12 h-12 justify-center text-lg text-gray-500 rounded-full hover:text-green-700 hover:bg-transparent  dark:text-gray-400 dark:hover:text-green-500 dark:hover:bg-transparent ';

  if (props.wideHidden) {
    Css = Css.concat(' md:hidden');
  }

  if (props.focus) {
    Css = Css.concat(
      ' focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600',
    );
  }

  return (
    <button
      data-collapse-toggle="navbar-cta"
      type="button"
      className={Css}
      aria-controls="navbar-cta"
      aria-expanded="false"
      onClick={props.handleClick}
    >
      <span className="sr-only">Open main menu</span>
      {props.children}
    </button>
  );
};

export default NavButton;

import React from 'react';

const NavButton: React.FC<{
  wideHidden: boolean;
  children: React.ReactNode;
}> = (props) => {
  let Css =
    'inline-flex items-center mx-7 p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:text-green-700 hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:text-green-500 dark:hover:bg-transparent dark:focus:ring-gray-600';

  if (props.wideHidden) {
    Css = Css.concat(' md:hidden');
    console.log(Css);
  }

  return (
    <button
      data-collapse-toggle="navbar-cta"
      type="button"
      className={Css}
      aria-controls="navbar-cta"
      aria-expanded="false"
    >
      <span className="sr-only">Open main menu</span>
      {props.children}
    </button>
  );
};

export default NavButton;

import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faBell, faCircleUser } from '@fortawesome/free-regular-svg-icons';
import NavBarItem from '@/components/NavBar/NavBarItem';
import NavButton from '@/components/NavBar/NavButton';
import jobestaLogo from '@/assets/jobesta-logo.png';
import { useContext, useState } from 'react';
import UserContext from '@/store/userContext';
import ProfileDropdown from '@/components/Profile/ProfileDropdown';

function MainNavigationBar() {
  const { refreshToken, role } = useContext(UserContext);
  const [isDropdownBarOpen, setIsDropdownBarMenu] = useState(false);
  const [isDropdownProfileOpen, setIsDropdownProfileMenu] = useState(false);

  function handleBarClick() {
    setIsDropdownBarMenu((prevState) => !prevState);
    setIsDropdownProfileMenu(false);
  }
  function handleProfileClick() {
    setIsDropdownProfileMenu((prevState) => !prevState);
    setIsDropdownBarMenu(false);
  }
  function handleBellClick() {
    setIsDropdownProfileMenu(false);
    setIsDropdownBarMenu(false);
  }

  return (
    <>
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link
            to="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img
              className="bg-transparent w-min h-9 align-baseline self-auto"
              src={jobestaLogo}
            />
            <span className="font-customFont self-center text-2xl text-green-700 font-semibold whitespace-nowrap dark:text-green-700">
              JOBESTA
            </span>
          </Link>

          <div className="flex justify-between md:w-auto md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse relative">
            {refreshToken && (
              <>
                <NavButton
                  focus={false}
                  handleClick={handleBellClick}
                  wideHidden={false}
                >
                  <FontAwesomeIcon icon={faBell} />
                </NavButton>
                <div className="relative">
                  <NavButton
                    focus={isDropdownProfileOpen}
                    handleClick={handleProfileClick}
                    wideHidden={false}
                  >
                    <FontAwesomeIcon icon={faCircleUser} />
                  </NavButton>
                  {isDropdownProfileOpen && <ProfileDropdown />}
                </div>
              </>
            )}
            {!refreshToken && (
              <>
                <Link
                  to="/login"
                  className="py-2 -translate-x-5 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-green-700 md:dark:hover:text-green-500 dark:text-white dark:hover:bg-transparent dark:hover:text-green-500 md:dark:hover:bg-transparent dark:border-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-500 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-green-700 dark:hover:bg-green-800 dark:focus:ring-green-800"
                >
                  Sign Up
                </Link>
              </>
            )}
            <NavButton
              focus={isDropdownBarOpen}
              handleClick={handleBarClick}
              wideHidden={true}
            >
              <FontAwesomeIcon icon={faBars} />
            </NavButton>
            {isDropdownBarOpen && (
              <div className="relative">
                <div className="md:hidden absolute right-2 w-min rounded-xl bg-white shadow-lg z-50">
                  <ul className="flex flex-col rounded-3xl font-medium p-4 border-t border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <li
                      className="py-2 border-b hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleBarClick}
                    >
                      <NavBarItem page="/">Home</NavBarItem>
                    </li>
                    <li
                      className="py-2 border-b hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleBarClick}
                    >
                      <NavBarItem page="/about">About</NavBarItem>
                    </li>
                    <li
                      className="py-2 border-b hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleBarClick}
                    >
                      <NavBarItem page="/jobs">Jobs</NavBarItem>
                    </li>
                    <li
                      className="py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleBarClick}
                    >
                      <NavBarItem page="/contacts">Contacts</NavBarItem>
                    </li>
                    {role === 'client' && (
                      <li
                        className="py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleBarClick}
                      >
                        <NavBarItem page="/create-job">Create Job</NavBarItem>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-cta"
          >
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <NavBarItem page="/">Home</NavBarItem>
              <NavBarItem page="/about">About</NavBarItem>
              <NavBarItem page="/jobs">Jobs</NavBarItem>
              <NavBarItem page="/contacts">Contacts</NavBarItem>
              {role === 'client' && (
                <NavBarItem page="/create-job">Create Job</NavBarItem>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default MainNavigationBar;

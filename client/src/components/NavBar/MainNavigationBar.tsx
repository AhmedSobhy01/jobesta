import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import NavBarItem from '@/components/NavBar/NavBarItem';
import NavButton from '@/components/NavBar/NavButton';
import jobestaLogo from '@/assets/jobesta-logo.png';
import { useContext } from 'react';
import UserContext from '@/store/userContext';
import ProfileDropdown from '@/components/Profile/ProfileDropdown';
import NotificationsDropdown from '@/components/Notifications/NotificationsDropdown';
import NavBarProfileSkeleton from '../Skeletons/NavBarProfileSkeleton';
import getProfilePicture from '@/utils/profilePicture';

const MainNavigationBar: React.FC<{
  loadingProfile: boolean;
  dropdownOpen: {
    isDropdownBarOpen: boolean;
    isDropdownProfileOpen: boolean;
  };
  setDropdownOpenMenu: (newFreelancer: {
    isDropdownBarOpen: boolean;
    isDropdownProfileOpen: boolean;
  }) => void;
}> = ({ loadingProfile, dropdownOpen, setDropdownOpenMenu }) => {
  const { username, role, profilePicture } = useContext(UserContext);
  const { isDropdownBarOpen, isDropdownProfileOpen } = dropdownOpen;

  function handleBarClick() {
    setDropdownOpenMenu({
      isDropdownBarOpen: !isDropdownBarOpen,
      isDropdownProfileOpen: false,
    });
  }

  function handleProfileClick() {
    setDropdownOpenMenu({
      isDropdownBarOpen: false,
      isDropdownProfileOpen: !isDropdownProfileOpen,
    });
  }

  return (
    <nav className="sticky top-0 bg-white border-gray-200 dark:bg-gray-900 z-50 ">
      <div className=" max-w-screen-xl flex flex-wrap items-center justify-between mx-auto py-3 px-4">
        <Link
          to="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            className="bg-transparent w-7 h-7 sm:w-min sm:h-9 align-baseline self-auto"
            src={jobestaLogo}
          />
          <span className="font-customFont self-center text-2xl text-green-700 font-semibold whitespace-nowrap dark:text-green-700">
            JOBESTA
          </span>
        </Link>

        <div className="flex justify-between items-center h-12 md:w-auto md:order-2 relative">
          {loadingProfile ? (
            <NavBarProfileSkeleton />
          ) : (
            username && (
              <>
                {role == 'client' && (
                  <Link
                    to="/jobs/create"
                    className="text-white h-10 my-auto bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-500 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-green-700 dark:hover:bg-green-800 dark:focus:ring-green-800 items-center justify-center hidden md:flex"
                  >
                    Create Job
                  </Link>
                )}
                <NotificationsDropdown
                  onOpen={() =>
                    setDropdownOpenMenu({
                      isDropdownBarOpen: false,
                      isDropdownProfileOpen: false,
                    })
                  }
                />
                <div className="relative ml-2">
                  <NavButton
                    focus={isDropdownProfileOpen}
                    handleClick={handleProfileClick}
                    wideHidden={false}
                  >
                    <img
                      src={getProfilePicture(profilePicture ?? '')}
                      className="rounded-full object-cover w-10 h-10 block"
                      alt=""
                    />
                  </NavButton>
                </div>
                {isDropdownProfileOpen && <ProfileDropdown />}
              </>
            )
          )}
          {!username && !loadingProfile && (
            <div className="flex gap-3 h-10">
              <Link
                to="/login"
                className="py-2 px-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-green-700 md:dark:hover:text-green-500 dark:text-white dark:hover:bg-transparent dark:hover:text-green-500 md:dark:hover:bg-transparent dark:border-gray-700"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-500 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-green-700 dark:hover:bg-green-800 dark:focus:ring-green-800 flex items-center justify-center"
              >
                Sign Up
              </Link>
            </div>
          )}
          <div className="relative ml-2">
            <NavButton
              focus={isDropdownBarOpen}
              handleClick={handleBarClick}
              wideHidden={true}
            >
              <FontAwesomeIcon icon={faBars} />
            </NavButton>

            {isDropdownBarOpen && (
              <ul className=" md:hidden absolute top-14 right-2 w-min rounded-xl bg-white shadow-lg z-50 flex flex-col font-medium p-4 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
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
                  <NavBarItem page="/jobs">Jobs</NavBarItem>
                </li>
                <li
                  className={`py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${role === 'client' && 'border-b'}`}
                  onClick={handleBarClick}
                >
                  <NavBarItem page="/#contact-us" hashLink>
                    Contact Us
                  </NavBarItem>
                </li>
                {role === 'client' && (
                  <li
                    className="py-2 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
                    onClick={handleBarClick}
                  >
                    <NavBarItem page="/jobs/create">Create Job</NavBarItem>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-cta"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <NavBarItem page="/">Home</NavBarItem>
            <NavBarItem page="/jobs">Jobs</NavBarItem>
            <NavBarItem page="/#contact-us" hashLink>
              Contact Us
            </NavBarItem>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default MainNavigationBar;

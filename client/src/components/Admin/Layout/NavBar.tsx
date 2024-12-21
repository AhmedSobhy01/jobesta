import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NavButton from '@/components/NavBar/NavButton';
import ProfileDropdown from '@/components/Profile/ProfileDropdown';
import NavBarProfileSkeleton from '@/components/Skeletons/NavBarProfileSkeleton';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import NotificationsDropdown from '@/components/Notifications/NotificationsDropdown';
import UserContext from '@/store/userContext';
import { useContext } from 'react';
import getProfilePicture from '@/utils/profilePicture';

const NavBar: React.FC<{
  loadingProfile: boolean;
  dropdownOpen: {
    isDropdownProfileOpen: boolean;
  };
  setDropdownOpenMenu: (newFreelancer: {
    isDropdownProfileOpen: boolean;
  }) => void;
  toggleSidebar: () => void;
}> = ({ toggleSidebar, loadingProfile, dropdownOpen, setDropdownOpenMenu }) => {
  const { isDropdownProfileOpen } = dropdownOpen;
  const { profilePicture } = useContext(UserContext);

  function handleProfileClick() {
    setDropdownOpenMenu({
      isDropdownProfileOpen: !isDropdownProfileOpen,
    });
  }

  function handleBellClick() {
    setDropdownOpenMenu({
      isDropdownProfileOpen: false,
    });
  }

  return (
    <>
      <nav className="bg-white border-gray-200 dark:bg-gray-900 border-b">
        <div className="flex flex-wrap items-center justify-end mx-auto p-3.5">
          <div className="flex justify-between items-center h-12 md:w-auto md:order-2 relative">
            {loadingProfile ? (
              <NavBarProfileSkeleton />
            ) : (
              <>
                <NotificationsDropdown onOpen={handleBellClick} />

                <div className="relative">
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
                {isDropdownProfileOpen && (
                  <ProfileDropdown loadingBalance={false} />
                )}
                <button
                  className="text-gray-500 mx-2 hover:text-gray-700 md:hidden"
                  onClick={toggleSidebar}
                >
                  <FontAwesomeIcon icon={faBars} size="lg" />{' '}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;

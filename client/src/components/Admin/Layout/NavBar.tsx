import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircleUser } from '@fortawesome/free-regular-svg-icons';
import NavButton from '@/components/NavBar/NavButton';
import ProfileDropdown from '@/components/Profile/ProfileDropdown';

const NavBar: React.FC<{
  dropdownOpen: {
    isDropdownProfileOpen: boolean;
  };
  setDropdownOpenMenu: (newFreelancer: {
    isDropdownProfileOpen: boolean;
  }) => void;
}> = ({ dropdownOpen, setDropdownOpenMenu }) => {
  const { isDropdownProfileOpen } = dropdownOpen;

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
        <div className=" flex flex-wrap items-center justify-end mx-auto p-3.5">
          <div className="flex justify-between md:w-auto md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse relative">
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
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;

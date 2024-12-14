import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

function SidebarButton({
  icon,
  text,
  route,
}: {
  icon: IconDefinition;
  text: string;
  route: string;
}) {
  const currentRoute = window.location.pathname;

  return (
    <Link
      to={route}
      className={`flex items-center p-3 space-x-2 text-gray-700 hover:bg-gray-300 rounded-md transition-all duration-200 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white ${currentRoute == route ? 'bg-gray-300' : ''}`}
    >
      <FontAwesomeIcon icon={icon} className="text-lg" />
      <span className="text-sm font-medium">{text}</span>
    </Link>
  );
}

export default SidebarButton;

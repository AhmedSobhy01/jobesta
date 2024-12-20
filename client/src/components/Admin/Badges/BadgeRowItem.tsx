import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronUp,
  faInfoCircle,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import BadgeModal from '@/components/Admin/Badges/BadgeModal';

const BadgeRowItem: React.FC<{
  badge: Badge;
}> = ({ badge: badge }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

  return (
    <>
      {isEditAccountModalOpen && (
        <BadgeModal
          badge={badge}
          onClose={() => setIsEditAccountModalOpen(false)}
        />
      )}

      <tr className="bg-white border-b hover:bg-gray-50">
        {/* Mobile (sm) */}
        <td className="px-2 py-2 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-sm">{badge.name}</span>
              <span className="text-xs text-gray-500">ID: {badge.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditAccountModalOpen(true)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
              <button
                className="text-gray-500 p-2"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <FontAwesomeIcon
                  icon={isExpanded ? faChevronUp : faChevronDown}
                />
              </button>
            </div>
          </div>
        </td>

        {/* Tablet (sm) and up */}
        <td className="hidden sm:table-cell px-3 py-2 lg:px-4 xl:px-6 text-sm text-gray-900">
          <div className="flex items-center gap-2">
            {badge.id}
            <button
              className="lg:hidden text-gray-500"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </button>
          </div>
        </td>
        <td className="hidden sm:table-cell px-3 py-2 lg:px-4 xl:px-6 text-sm text-gray-900">
          {badge.name}
        </td>
        <td className="hidden lg:table-cell px-3 py-2 lg:px-4 xl:px-6 text-sm text-gray-900">
          {badge.description}
        </td>
        <td className="hidden lg:table-cell px-3 py-2 lg:px-4 xl:px-6 text-sm text-gray-900">
          <img
            className="w-12 xl:w-16 rounded-lg"
            src={import.meta.env.VITE_API_URL + '/' + badge.icon}
            alt={badge.name}
          />
        </td>
        <td className="hidden sm:table-cell px-3 py-2 lg:px-4 xl:px-6 text-sm text-gray-900">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsEditAccountModalOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded content for mobile and tablet */}
      {isExpanded && (
        <tr className="lg:hidden bg-gray-50">
          <td colSpan={5} className="px-3 py-2">
            <div className="space-y-2">
              {/* Show description only on mobile since it's hidden in the main row */}
              <div className="sm:hidden">
                <p className="font-medium text-sm">Name:</p>
                <p className="text-sm text-gray-600">{badge.name}</p>
              </div>
              <div>
                <p className="font-medium text-sm">Description:</p>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
              <div>
                <p className="font-medium text-sm">Icon:</p>
                <img
                  className="w-16 rounded-lg mt-1"
                  src={import.meta.env.VITE_API_URL + '/' + badge.icon}
                  alt={badge.name}
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default BadgeRowItem;

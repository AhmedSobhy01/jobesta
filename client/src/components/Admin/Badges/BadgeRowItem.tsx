import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import BadgeModal from '@/components/Admin/Badges/BadgeModal';

const BadgeRowItem: React.FC<{
  badge: Badge;
}> = ({ badge: badge }) => {
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

  return (
    <>
      {isEditAccountModalOpen && (
        <BadgeModal
          badge={badge}
          onClose={() => setIsEditAccountModalOpen(false)}
        />
      )}

      <tr className="bg-white border-b">
        <th
          scope="row"
          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
        >
          {badge.id}
        </th>
        <td className="px-6 py-4 whitespace-nowrap">{badge.name}</td>
        <td className="px-6 py-4 whitespace-nowrap">{badge.description}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <img
            className="w-16 rounded-lg"
            src={import.meta.env.VITE_API_URL + '/' + badge.icon}
            alt=""
          />
        </td>

        <td className="px-6 py-4 space-x-5 rtl:space-x-reverse whitespace-nowrap">
          <button type="button" onClick={() => setIsEditAccountModalOpen(true)}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        </td>
      </tr>
    </>
  );
};

export default BadgeRowItem;

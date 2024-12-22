import React from 'react';

interface IBadge {
  name?: string;
  description?: string;
  icon?: string;
  earnedAt?: string;
}

const Badge: React.FC<{ badge: IBadge }> = ({ badge }) => {
  return (
    <div className="relative inline-block group max-w-16">
      <div className="cursor-pointer h-16 w-16 ">
        <img
          src={`${import.meta.env.VITE_API_URL}/${badge.icon}`}
          alt="badge Icon"
          className=" rounded-full shadow-md w-full h-full"
        />
      </div>

      {badge.description && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm p-1 transition-opacity duration-300 opacity-0 shadow-lg group-hover:opacity-100 z-10 whitespace-nowrap px-4 py-1 rounded-xl">
          <span>{badge.description}</span>

          {badge.earnedAt && (
            <div className="text-xs text-gray-400 mt-1">
              Earned at: {new Date(badge.earnedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      <div className="text-center text-sm mt-2 font-semibold text-gray-700">
        {badge.name}
      </div>
    </div>
  );
};

export default Badge;

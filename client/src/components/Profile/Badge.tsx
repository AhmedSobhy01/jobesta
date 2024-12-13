import React, { useState } from 'react';
interface IBadge {
  name?: string;
  description?: string;
  icon?: string;
}

const Badge: React.FC<{ badge: IBadge }> = ({ badge }) => {
  const [hoverText, setHoverText] = useState<string | undefined>('');
  const [isClicked, setIsClicked] = useState(false);
  const handleMouseEnter = () => {
    setHoverText(badge.name);
  };

  const handleMouseLeave = () => {
    setHoverText('');
  };

  const handleClick = () => {
    setIsClicked((prev) => !prev);
  };

  return (
    <div className="relative">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <img
          src={badge.icon}
          alt="badge Icon"
          className="w-fit h-8 object-cover cursor-pointer"
        />
      </div>

      {hoverText && (
        <div className="absolute top-0 left-6 bg-gray-800 text-white text-sm p-1 rounded">
          {hoverText}
        </div>
      )}

      {isClicked && (
        <div className="absolute top-12 left-0 bg-green-500 text-white text-sm p-2 rounded shadow-lg">
          {badge.description}
        </div>
      )}
    </div>
  );
};

export default Badge;

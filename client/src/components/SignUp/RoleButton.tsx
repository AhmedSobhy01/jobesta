import React from 'react';
import freelancerIcon from '@/assets/freelancer-icon.png';
import clientIcon from '@/assets/client-icon.png';

const RoleButton: React.FC<{
  onSelect: (sel: string) => unknown;
  type: string;
  selection: string;
  children?: React.ReactNode;
}> = (props) => {
  const icon = props.type === 'freelancer' ? freelancerIcon : clientIcon;
  return (
    <button
      className={`border rounded-lg p-4 min-w-full my-6 flex flex-col md:min-w-min md:w-1/2 w-full items-center transition ${
        props.selection === props.type
          ? 'border-green-700 ring ring-green-500'
          : 'border-gray-300'
      }`}
      onClick={() => props.onSelect(props.type)}
    >
      <img src={icon} alt={props.type} className="w-16 h-16 mb-2" />
      <span className="text-lg font-medium">{props.children}</span>
    </button>
  );
};
export default RoleButton;

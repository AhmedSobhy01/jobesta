import React, { useState } from 'react';
import RoleButton from './RoleButton';

const RoleForm: React.FC<{
  onSelection: (type: string) => unknown;
  children?: React.ReactNode;
}> = (props) => {
  const [selected, setSelected] = useState('');

  const handleSelection = (type: string) => {
    setSelected(type);
  };

  const handleCompleteSignup = (type: string) => {
    props.onSelection(type);
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Choose Your Role</h2>
      <div className=" my-2 md:flex md:gap-4 md:w-96">
        <RoleButton
          type="freelancer"
          selection={selected}
          onSelect={() => handleSelection('freelancer')}
        >
          Freelancer
        </RoleButton>
        <RoleButton
          type="client"
          selection={selected}
          onSelect={() => handleSelection('client')}
        >
          Client
        </RoleButton>
      </div>
      {selected && (
        <div className="mt-4">
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
            onClick={() => handleCompleteSignup(selected)}
          >
            Complete Signup
          </button>
        </div>
      )}
    </>
  );
};

export default RoleForm;

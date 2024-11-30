import { useState } from 'react';
import signinpic from '@/assets/signinpic.png';
import SignUpForm from '@/components/SignUp/SignUpForm';
import RoleForm from '@/components/SignUp/RoleForm';

function SignUp() {
  const [selectRole, setSelectRole] = useState('role');

  function handleUserType(type: string) {
    setSelectRole(type);
  }

  return (
    <div className="justify-items-center">
      <div className="h-screen flex flex-row md:w-4/5">
        <div className="hidden md:basis-1/2 md:w-full md:h-full md:grid content-center justify-items-center">
          <img className="md:w-2/3" src={signinpic} />
          {selectRole !== 'role' ? (
            <h1 className="font-customFont capitalize text-7xl">
              {selectRole}
            </h1>
          ) : undefined}
        </div>
        <div className="-translate-x-3 md:basis-1/2 flex-col flex items-center justify-center">
          {selectRole === 'role' ? (
            <RoleForm onSelection={handleUserType} />
          ) : (
            <SignUpForm role={selectRole} />
          )}
        </div>
      </div>
    </div>
  );
}

export default SignUp;

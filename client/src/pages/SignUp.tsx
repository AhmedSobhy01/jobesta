import { useEffect, useState } from 'react';
import signinpic from '@/assets/signinpic.png';
import SignUpForm from '@/components/SignUp/SignUpForm';
import RoleForm from '@/components/SignUp/RoleForm';
import { useActionData, useNavigate } from 'react-router-dom';
import ErrorModule from '@/components/ErrorModule';

function SignUp() {
  const [selectRole, setSelectRole] = useState('role');
  const errors = useActionData();
  const [isGlobalError, setIsGlobalError] = useState(!!errors?.global);

  useEffect(() => {
    setIsGlobalError(!!errors?.global);
  }, [errors]);

  const handleCloseError = () => setIsGlobalError(false);

  const navigate = useNavigate();

  const redirectTo =
    new URLSearchParams(window.location.search).get('redirect') || '/';

  function handleUserType(type: string) {
    setSelectRole(type);
    navigate(`/signup?role=${type}&redirect=${redirectTo}`);
  }
  return (
    <div className="justify-items-center">
      <div className="h-screen flex items-center justify-center w-full">
        {isGlobalError && (
          <ErrorModule
            errorMessage={errors?.global}
            onClose={handleCloseError}
          />
        )}
        <div className="hidden md:basis-1/2 md:w-full md:h-full md:grid content-center justify-items-center">
          <img className="md:w-2/3" src={signinpic} />
          {selectRole !== 'role' ? (
            <h1 className="font-customFont capitalize text-7xl">
              {selectRole}
            </h1>
          ) : undefined}
        </div>
        <div className="flex-col flex items-center justify-center w-full md:max-w-lg">
          {selectRole === 'role' ? (
            <RoleForm onSelection={handleUserType} />
          ) : (
            <SignUpForm />
          )}
        </div>
      </div>
    </div>
  );
}

export default SignUp;

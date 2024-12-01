import {
  ActionFunctionArgs,
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router';
import signinpic from '@/assets/signinpic.png';
import Input from '@/utils/Input';
import { useEffect, useState } from 'react';
import ErrorModule from '@/components/ErrorModule';

function Login() {
  const navigate = useNavigation();
  const errors = useActionData();
  const [isGlobalError, setIsGlobalError] = useState(
    !errors?.status && !!errors?.global,
  );
  const [isCredentialError, setIsCredentialError] = useState(
    !errors?.status && !!errors?.message,
  );

  useEffect(() => {
    setIsCredentialError(!!errors?.message);
    setIsGlobalError(!!errors?.global);
  }, [errors]);

  const isSubmitting = navigate.state === 'submitting';

  const handleCloseError = () => {
    setIsGlobalError(false);
    setIsCredentialError(false);
  };
  return (
    <div className="justify-items-center">
      <div className="h-screen flex flex-row md:w-4/5">
        {isGlobalError && (
          <ErrorModule
            errorMessage={errors?.global}
            onClose={handleCloseError}
          />
        )}
        {isCredentialError && (
          <ErrorModule
            errorMessage={errors?.message}
            onClose={handleCloseError}
          />
        )}
        <div className="hidden md:basis-1/2 md:w-full md:h-full md:grid content-center justify-items-center">
          <img className="md:w-2/3" src={signinpic} />
        </div>
        <div className="-translate-x-3 md:basis-1/2 flex-col flex items-center justify-center">
          <Link
            to="/"
            className="font-customFont text-5xl basis-20 text-green-700 font-bold mb-6"
          >
            Jobesta
          </Link>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Login to Your Account
          </h2>
          <div className="flex flex-col max-w-md w-full px-8">
            <Form method="post">
              <Input label="email">Email</Input>
              {errors?.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
              <Input minLenght={8} label="password">
                Password
              </Input>
              {errors?.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
              <div className="mb-4 flex items-center justify-between">
                <a href="#" className="text-green-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-500"
              >
                {isSubmitting ? 'Loading' : 'Login'}
              </button>
            </Form>
            <p className="mt-6 text-gray-700 text-center">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green-600 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();

  const authData = {
    email: data.get('email'),
    password: data.get('password'),
  };

  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authData),
    });

    const resData = await response.json();

    if (!response.ok) {
      const authErrors = {
        ...resData.errors,
        message: resData.message,
        status: false,
      };
      return authErrors;
    }

    const jwtToken = resData.data.jwtToken;
    const refreshToken = resData.data.refreshToken;

    //store tokens in local storage
    localStorage.setItem('jwtToken', jwtToken);
    localStorage.setItem('refreshToken', refreshToken);

    const jwtTokenExpiration = new Date();
    jwtTokenExpiration.setHours(jwtTokenExpiration.getHours() + 1);

    //store jwtTokens expirationdate in local storage
    localStorage.setItem(
      'jwtTokenExpiration',
      jwtTokenExpiration.toISOString(),
    );
    const refreshedTokenExpiration = new Date();
    refreshedTokenExpiration.setDate(refreshedTokenExpiration.getDate() + 30);

    //store refreshedToken expirationdate in local storage
    localStorage.setItem(
      'refreshTokenExpiration',
      refreshedTokenExpiration.toISOString(),
    );

    return redirect('/set-tokens');
  } catch {
    return {
      status: false,
      global: 'A network error occurred. Please try again later.',
    };
  }
}

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

  useEffect(() => {
    setIsGlobalError(!!errors?.global);
  }, [errors]);

  const redirectTo =
    new URLSearchParams(window.location.search).get('redirect') || '/';

  const isSubmitting = navigate.state === 'submitting';

  const handleCloseError = () => {
    setIsGlobalError(false);
  };
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
        </div>
        <div className="flex-col flex items-center justify-center w-full md:max-w-lg">
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
            <Form method="post" noValidate>
              <div className="space-y-2.5">
                <Input label="email" type="email" errorMessage={errors?.email}>
                  Email
                </Input>
                <Input
                  minLength={8}
                  label="password"
                  type="password"
                  errorMessage={errors?.password}
                >
                  Password
                </Input>
              </div>

              <div className="my-3 flex items-center justify-between">
                <a href="#" className="text-green-600 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {errors?.message == 'Invalid credentials' && (
                <p className="mb-2 text-md text-red-500">
                  Invalid email or password
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-500"
              >
                {isSubmitting ? 'Loading' : 'Login'}
              </button>
            </Form>
            <p className="mt-6 text-gray-700 text-center">
              Don't have an account?{' '}
              <Link
                to={`/signup?redirect=${redirectTo}`}
                className="text-green-600 hover:underline"
              >
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

Login.action = async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();

  const authData = {
    email: data.get('email'),
    password: data.get('password'),
  };

  try {
    const response = await fetch(import.meta.env.VITE_API_URL + '/auth/login', {
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

    //store jwtTokens expiration date in local storage
    localStorage.setItem(
      'jwtTokenExpiration',
      jwtTokenExpiration.toISOString(),
    );
    const refreshedTokenExpiration = new Date();
    refreshedTokenExpiration.setDate(refreshedTokenExpiration.getDate() + 30);

    //store refreshedToken expiration date in local storage
    localStorage.setItem(
      'refreshTokenExpiration',
      refreshedTokenExpiration.toISOString(),
    );

    const redirectTo =
      new URLSearchParams(window.location.search).get('redirect') || '/';

    return redirect(`/set-user?redirect=${redirectTo}`);
  } catch {
    return {
      status: false,
      global: 'A network error occurred. Please try again later.',
    };
  }
};
